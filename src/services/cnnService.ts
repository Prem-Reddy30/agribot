interface CNNPrediction {
  disease: string;
  confidence: number;
  affectedArea: number;
  severity: 'mild' | 'moderate' | 'severe';
  symptoms: string[];
  recommendations: string[];
}

interface PlantValidationResult {
  isPlant: boolean;
  confidence: number;
  reason: string;
}

interface CNNModel {
  predict(imageData: Float32Array): Promise<CNNPrediction>;
  preprocessImage(image: HTMLImageElement): Promise<Float32Array>;
}

// Mock CNN Model Implementation
export class CNNService implements CNNModel {
  private modelLoaded = false;
  private diseaseDatabase: Record<string, {
    patterns: string[];
    confidence: number;
    severity: 'mild' | 'moderate' | 'severe';
    symptoms: string[];
    recommendations: string[];
  }> = {
      'Tomato_Early_Blight': {
        patterns: ['concentric_rings', 'brown_spots', 'yellowing_leaves'],
        confidence: 0.92,
        severity: 'moderate',
        symptoms: ['Brown spots with concentric rings', 'Yellowing of older leaves', 'Target-like lesions'],
        recommendations: ['Apply copper-based fungicides', 'Remove infected leaves', 'Ensure proper air circulation']
      },
      'Tomato_Late_Blight': {
        patterns: ['water_soaked', 'large_brown_patches', 'white_mold'],
        confidence: 0.88,
        severity: 'severe',
        symptoms: ['Water-soaked lesions', 'Large brown patches', 'White cottony growth'],
        recommendations: ['Apply metalaxyl fungicides', 'Destroy infected plants', 'Improve drainage']
      },
      'Tomato_Leaf_Curl_Virus': {
        patterns: ['leaf_curling', 'stunted_growth', 'yellowing'],
        confidence: 0.85,
        severity: 'moderate',
        symptoms: ['Upward curling of leaves', 'Stunted growth', 'Yellowing'],
        recommendations: ['Remove infected plants', 'Control whiteflies', 'Use resistant varieties']
      },
      'Tomato_Bacterial_Spot': {
        patterns: ['small_spots', 'water_soaked', 'necrotic'],
        confidence: 0.79,
        severity: 'mild',
        symptoms: ['Small water-soaked spots', 'Necrotic lesions on fruits'],
        recommendations: ['Apply copper bactericides', 'Avoid working when wet']
      },
      'Powdery_Mildew': {
        patterns: ['white_powder', 'surface_growth', 'spreading'],
        confidence: 0.86,
        severity: 'mild',
        symptoms: ['White powdery growth on leaves', 'Spreads rapidly'],
        recommendations: ['Apply sulfur fungicides', 'Improve air circulation']
      },
      'Rice_Blast': {
        patterns: ['diamond_shaped', 'gray_centers', 'spindle_shaped'],
        confidence: 0.87,
        severity: 'severe',
        symptoms: ['Diamond-shaped lesions', 'Gray centers on lesions'],
        recommendations: ['Apply tricyclazole fungicides', 'Use resistant varieties']
      },
      'Wheat_Rust': {
        patterns: ['reddish_brown', 'pustules', 'leaf_surface'],
        confidence: 0.89,
        severity: 'moderate',
        symptoms: ['Reddish-brown pustules on leaves'],
        recommendations: ['Apply systemic fungicides', 'Monitor disease development']
      }
    };

  async loadModel(): Promise<void> {
    // Simulate model loading
    return new Promise((resolve) => {
      setTimeout(() => {
        this.modelLoaded = true;
        resolve();
      }, 2000);
    });
  }

  async preprocessImage(image: HTMLImageElement): Promise<Float32Array> {
    return new Promise((resolve, reject) => {
      try {
        // Create canvas for image processing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Set canvas size (typical CNN input size)
        canvas.width = 224;
        canvas.height = 224;

        // Draw and resize image
        ctx.drawImage(image, 0, 0, 224, 224);

        // Get image data
        const imageData = ctx.getImageData(0, 0, 224, 224);

        // Convert to normalized array (0-1 range)
        const normalizedData: number[] = [];
        for (let i = 0; i < imageData.data.length; i += 4) {
          // Convert RGB to normalized values
          const r = imageData.data[i] / 255.0;
          const g = imageData.data[i + 1] / 255.0;
          const b = imageData.data[i + 2] / 255.0;

          // Convert to grayscale (common for plant disease detection)
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          normalizedData.push(gray);
        }

        resolve(new Float32Array(normalizedData));
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Validates whether the uploaded image is a plant/vegetable image.
   * STRICT validation — the image must PROVE it contains plant material.
   * Rejects human photos, animals, objects, selfies, etc.
   */
  async validatePlantImage(image: HTMLImageElement): Promise<PlantValidationResult> {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        canvas.width = 224;
        canvas.height = 224;
        ctx.drawImage(image, 0, 0, 224, 224);

        const imgData = ctx.getImageData(0, 0, 224, 224);
        const data = imgData.data;
        const totalPixels = data.length / 4;

        let greenDominantPixels = 0;
        let skinTonePixels = 0;
        let vegetationPixels = 0;
        let redDominantPixels = 0;
        let warmTonePixels = 0;
        let brownPixels = 0;
        let totalR = 0, totalG = 0, totalB = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          totalR += r;
          totalG += g;
          totalB += b;

          // === GREEN / PLANT DETECTION ===
          // Strict green dominance (leaf-like greens)
          if (g > r && g > b && g > 50) {
            greenDominantPixels++;
          }

          // Broad vegetation colors: green, yellow-green, olive, dark-green, diseased-brown-green
          const isVegetation = (
            // Pure greens
            (g > r && g > b && g > 40) ||
            // Yellow-green (common in diseased leaves)
            (g > 60 && r > 50 && r < g * 1.3 && b < g * 0.7) ||
            // Dark green / shadowed leaves
            (g > 30 && g > r && g > b && r < 80 && b < 60) ||
            // Brownish-green (diseased plant tissue)
            (g > 40 && r > 40 && r < g * 1.5 && b < g * 0.8 && g > b)
          );
          if (isVegetation) vegetationPixels++;

          // === SKIN TONE DETECTION (very broad) ===
          const isSkinTone = (
            // Light/fair skin
            (r > 170 && g > 120 && b > 80 && r > g && g > b) ||
            // Medium skin
            (r > 130 && g > 80 && b > 50 && r > g && r > b && r - g > 10) ||
            // Tan / olive skin
            (r > 100 && g > 70 && b > 40 && r > g && r > b && r - b > 20) ||
            // Dark skin
            (r > 60 && g > 40 && b > 20 && r > g && r > b && r - g > 5 && r - b > 10 && r < 180) ||
            // Very light / pale skin
            (r > 200 && g > 170 && b > 150 && r > g && g > b && r - b < 80) ||
            // Warm reddish skin
            (r > 150 && g > 80 && g < 160 && b > 50 && b < 140 && r > g && r - g > 15)
          );
          if (isSkinTone) skinTonePixels++;

          // === RED DOMINANCE (common in humans, not in plants) ===
          if (r > g && r > b && r > 80) {
            redDominantPixels++;
          }

          // Warm tones (face, hair, clothing in human photos)
          if (r > g && r > 100 && b < r * 0.85) {
            warmTonePixels++;
          }

          // Brown tones (hair, skin shadows)
          if (r > 60 && r < 180 && g > 40 && g < 150 && b > 20 && b < 120
            && r > g && r > b && Math.abs(r - g) < 60) {
            brownPixels++;
          }
        }

        const greenRatio = greenDominantPixels / totalPixels;
        const skinRatio = skinTonePixels / totalPixels;
        const vegetationRatio = vegetationPixels / totalPixels;
        const redDominantRatio = redDominantPixels / totalPixels;
        const warmToneRatio = warmTonePixels / totalPixels;
        const brownRatio = brownPixels / totalPixels;
        const avgR = totalR / totalPixels;
        const avgG = totalG / totalPixels;
        const avgB = totalB / totalPixels;

        // Log for debugging (will show in browser console)
        console.log('[Plant Validation]', {
          greenRatio: greenRatio.toFixed(3),
          vegetationRatio: vegetationRatio.toFixed(3),
          skinRatio: skinRatio.toFixed(3),
          redDominantRatio: redDominantRatio.toFixed(3),
          warmToneRatio: warmToneRatio.toFixed(3),
          brownRatio: brownRatio.toFixed(3),
          avgR: avgR.toFixed(1),
          avgG: avgG.toFixed(1),
          avgB: avgB.toFixed(1),
        });

        // ============================================================
        // DECISION LOGIC — Strict: image must PROVE it has plant content
        // ============================================================

        // RULE 1: Any significant skin tone presence → REJECT
        if (skinRatio > 0.25) {
          resolve({
            isPlant: false,
            confidence: 0.92,
            reason: '⚠️ This appears to be a human/person image. Please upload only plant, leaf, or vegetable images for disease prediction.'
          });
          return;
        }

        // RULE 2: High red dominance + low green → REJECT (human/animal)
        if (redDominantRatio > 0.40 && greenRatio < 0.15) {
          resolve({
            isPlant: false,
            confidence: 0.88,
            reason: '⚠️ This image does not appear to contain plant material. Human, animal, or non-plant images cannot be analyzed. Please upload a plant/leaf photo.'
          });
          return;
        }

        // RULE 3: Average red channel is highest → likely not a plant
        if (avgR > avgG && avgR > avgB && greenRatio < 0.12 && vegetationRatio < 0.20) {
          resolve({
            isPlant: false,
            confidence: 0.85,
            reason: '⚠️ This image appears to have non-plant content (warm/red tones detected). Please upload a clear image of a plant leaf or crop.'
          });
          return;
        }

        // RULE 4: High warm tones + low vegetation → REJECT
        if (warmToneRatio > 0.35 && vegetationRatio < 0.15) {
          resolve({
            isPlant: false,
            confidence: 0.85,
            reason: '⚠️ This image contains mostly warm tones typical of non-plant subjects. Please upload a photo of a plant or vegetable.'
          });
          return;
        }

        // RULE 5: Too much skin + warm tones combined → REJECT
        if (skinRatio > 0.15 && warmToneRatio > 0.25 && vegetationRatio < 0.20) {
          resolve({
            isPlant: false,
            confidence: 0.83,
            reason: '⚠️ This image does not appear to be a plant or vegetation. Please upload a clear photo of a crop leaf for disease analysis.'
          });
          return;
        }

        // RULE 6: MINIMUM PLANT REQUIREMENT — must have enough green/vegetation
        if (vegetationRatio < 0.12 && greenRatio < 0.08) {
          resolve({
            isPlant: false,
            confidence: 0.80,
            reason: '⚠️ Not enough plant/vegetation content detected in this image. Please upload a close-up photo of a plant leaf showing disease symptoms.'
          });
          return;
        }

        // RULE 7: High brown (hair/skin shadow) + no significant green → REJECT
        if (brownRatio > 0.30 && greenRatio < 0.10 && vegetationRatio < 0.15) {
          resolve({
            isPlant: false,
            confidence: 0.78,
            reason: '⚠️ This image appears to contain non-plant content. Please upload only plant or vegetable images.'
          });
          return;
        }

        // If we reach here, the image seems to contain sufficient plant material
        // Calculate final plant confidence
        let plantConfidence = 0;
        plantConfidence += Math.min(greenRatio * 2.5, 0.35);
        plantConfidence += Math.min(vegetationRatio * 2, 0.35);
        plantConfidence += Math.max(0, (1 - skinRatio * 3)) * 0.15;
        plantConfidence += Math.max(0, (1 - redDominantRatio * 2)) * 0.15;

        if (avgG > avgR && avgG > avgB) {
          plantConfidence += 0.1;
        }

        plantConfidence = Math.min(plantConfidence, 1);

        // Final safety check
        if (plantConfidence < 0.35) {
          resolve({
            isPlant: false,
            confidence: 1 - plantConfidence,
            reason: '⚠️ Unable to confirm this is a plant image. Please upload a clear, close-up photo of a plant leaf or vegetable.'
          });
          return;
        }

        resolve({
          isPlant: true,
          confidence: plantConfidence,
          reason: '✅ Plant image detected successfully.'
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  async predict(imageData: Float32Array): Promise<CNNPrediction> {
    if (!this.modelLoaded) {
      await this.loadModel();
    }

    // Simulate CNN prediction with pattern matching
    const predictions = this.analyzeImagePatterns(imageData);

    // Sort by confidence and return top prediction
    predictions.sort((a, b) => b.confidence - a.confidence);

    return predictions[0];
  }

  private analyzeImagePatterns(imageData: Float32Array): CNNPrediction[] {
    const predictions: CNNPrediction[] = [];

    // Simulate feature extraction and pattern matching
    Object.entries(this.diseaseDatabase).forEach(([diseaseName, diseaseInfo]) => {
      const confidence = this.calculatePatternMatch(imageData, diseaseInfo.patterns);

      if (confidence > 0.3) { // Threshold for detection
        predictions.push({
          disease: diseaseName.replace(/_/g, ' '),
          confidence: confidence * diseaseInfo.confidence,
          affectedArea: this.calculateAffectedArea(imageData, diseaseInfo.patterns),
          severity: diseaseInfo.severity,
          symptoms: diseaseInfo.symptoms,
          recommendations: diseaseInfo.recommendations
        });
      }
    });

    return predictions;
  }

  private calculatePatternMatch(imageData: Float32Array, patterns: string[]): number {
    // Simulate CNN pattern matching
    // In a real CNN, this would involve actual neural network forward pass
    let matchScore = 0;

    // Simulate edge detection (common in plant diseases)
    const edges = this.detectEdges(imageData);

    // Simulate color analysis
    const colorFeatures = this.analyzeColorFeatures(imageData);

    // Simulate texture analysis
    const textureFeatures = this.analyzeTexture(imageData);

    // Combine features for pattern matching
    if (patterns.includes('concentric_rings') && edges > 0.3) matchScore += 0.4;
    if (patterns.includes('brown_spots') && colorFeatures.brown > 0.4) matchScore += 0.3;
    if (patterns.includes('yellowing') && colorFeatures.yellow > 0.3) matchScore += 0.2;
    if (patterns.includes('white_powder') && textureFeatures.smooth > 0.5) matchScore += 0.3;
    if (patterns.includes('water_soaked') && colorFeatures.dark > 0.5) matchScore += 0.4;
    if (patterns.includes('leaf_curling') && textureFeatures.irregular > 0.4) matchScore += 0.3;

    return Math.max(0, Math.min(1, matchScore));
  }

  private detectEdges(imageData: Float32Array): number {
    // Simple edge detection simulation
    let edgeCount = 0;
    const threshold = 0.1;

    for (let i = 1; i < imageData.length - 224; i++) {
      const current = imageData[i];
      const right = imageData[i + 1];
      const bottom = imageData[i + 224];

      if (Math.abs(current - right) > threshold) edgeCount++;
      if (Math.abs(current - bottom) > threshold) edgeCount++;
    }

    return edgeCount / (imageData.length - 224);
  }

  private analyzeColorFeatures(imageData: Float32Array): any {
    let brown = 0, yellow = 0, white = 0, dark = 0;

    for (let i = 0; i < imageData.length; i++) {
      const value = imageData[i];

      // Simulate color ranges (simplified)
      if (value > 0.3 && value < 0.5) brown++;
      else if (value > 0.5 && value < 0.7) yellow++;
      else if (value > 0.7) white++;
      else dark++;
    }

    const total = imageData.length;
    return {
      brown: brown / total,
      yellow: yellow / total,
      white: white / total,
      dark: dark / total
    };
  }

  private analyzeTexture(imageData: Float32Array): any {
    let smooth = 0;
    let irregular = 0;

    // Simple texture analysis
    for (let i = 1; i < imageData.length - 1; i++) {
      const diff = Math.abs(imageData[i] - imageData[i - 1]);
      if (diff < 0.05) smooth++;
      else if (diff > 0.2) irregular++;
    }

    const total = imageData.length - 1;
    return {
      smooth: smooth / total,
      irregular: irregular / total
    };
  }

  private calculateAffectedArea(imageData: Float32Array, patterns: string[]): number {
    // Simulate affected area calculation
    let affectedPixels = 0;
    const threshold = 0.6; // Threshold for detecting affected areas

    for (let i = 0; i < imageData.length; i++) {
      if (imageData[i] < threshold) affectedPixels++;
    }

    return (affectedPixels / imageData.length) * 100;
  }
}

// CNN Service Singleton
export const cnnService = new CNNService();
