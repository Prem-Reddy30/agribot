import { useState } from 'react';
import { Camera, Upload, AlertCircle, Leaf, Droplets, Wind, Sun, Thermometer, CheckCircle, Brain, Activity } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { cnnService } from '../services/cnnService';

interface DiseaseData {
  symptoms: string[];
  environmentalFactors: {
    temperature: string;
    humidity: string;
    rainfall: string;
  };
  cropType: string;
  imageFile?: File;
}

interface PredictionResult {
  disease: string;
  confidence: number;
  description: string;
  treatment: string;
  prevention: string;
  severity: 'mild' | 'moderate' | 'severe';
  affectedArea: number;
  symptoms: string[];
  recommendations: string[];
  analysisType: 'symptom-based' | 'cnn-based' | 'combined';
}

export function DiseasePrediction() {
  const { t } = useLanguage();
  const [diseaseData, setDiseaseData] = useState<DiseaseData>({
    symptoms: [],
    environmentalFactors: {
      temperature: '',
      humidity: '',
      rainfall: ''
    },
    cropType: ''
  });
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const MIN_CONFIDENCE = 0.8;

  const symptoms = [
    'Yellowing leaves',
    'Brown spots',
    'Wilting',
    'Leaf curling',
    'White patches',
    'Black mold',
    'Stunted growth',
    'Fruit spots',
    'Stem lesions',
    'Root rot'
  ];

  const cropTypes = [
    'Tomato',
    'Rice',
    'Wheat',
    'Cotton',
    'Chili',
    'Brinjal',
    'Potato',
    'Mango',
    'Citrus',
    'Grapes'
  ];

  const handleSymptomToggle = (symptom: string) => {
    setDiseaseData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDiseaseData(prev => ({ ...prev, imageFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeDisease = async () => {
    if (!diseaseData.cropType || diseaseData.symptoms.length === 0) {
      alert('Please select crop type and at least one symptom');
      return;
    }

    setIsAnalyzing(true);

    try {
      let finalResult: PredictionResult | null = null;
      let cnnResult: Awaited<ReturnType<typeof cnnService.predict>> | null = null;
      let symptomResult: PredictionResult | null = null;

      // Step 1: CNN Analysis (if image is provided)
      if (diseaseData.imageFile) {
        try {
          // Load CNN model
          await cnnService.loadModel();

          // Process image with CNN
          const imageElement = new Image();
          const imageUrl = URL.createObjectURL(diseaseData.imageFile);

          await new Promise((resolve, reject) => {
            imageElement.onload = resolve;
            imageElement.onerror = reject;
            imageElement.src = imageUrl;
          });

          const imageData = await cnnService.preprocessImage(imageElement);
          cnnResult = await cnnService.predict(imageData);

          if (cnnResult.confidence < MIN_CONFIDENCE) {
            cnnResult = null;
          }

          // Convert CNN result to our format
          if (cnnResult) {
            finalResult = {
              disease: cnnResult.disease,
              confidence: cnnResult.confidence,
              description: `CNN analysis detected ${cnnResult.disease} with ${cnnResult.severity} severity affecting ${cnnResult.affectedArea.toFixed(1)}% of the leaf area.`,
              treatment: cnnResult.recommendations.join('. '),
              prevention: 'Regular monitoring and proper plant care can prevent future infections.',
              severity: cnnResult.severity,
              affectedArea: cnnResult.affectedArea,
              symptoms: cnnResult.symptoms,
              recommendations: cnnResult.recommendations,
              analysisType: 'cnn-based'
            };
          }
        } catch (error) {
          console.error('CNN analysis failed:', error);
        }
      }

      // Step 2: Symptom-based analysis
      const symptomBasedResults = await analyzeSymptoms();
      if (symptomBasedResults) {
        symptomResult = {
          ...symptomBasedResults,
          severity: 'moderate' as const,
          affectedArea: 50,
          symptoms: diseaseData.symptoms,
          recommendations: symptomBasedResults.treatment.split('. '),
          analysisType: 'symptom-based' as const
        };
      }

      // Step 3: Combine results if both are available
      if (cnnResult && symptomResult) {
        // Weighted combination - CNN gets higher weight if confidence is high
        const cnnWeight = cnnResult.confidence > 0.8 ? 0.7 : 0.5;
        const symptomWeight = 1 - cnnWeight;

        finalResult = {
          disease: cnnResult.confidence > 0.8 ? cnnResult.disease : symptomResult.disease,
          confidence: (cnnResult.confidence * cnnWeight) + (symptomResult.confidence * symptomWeight),
          description: `Combined analysis of image and symptoms. CNN detected ${cnnResult.disease} while symptom analysis suggested ${symptomResult.disease}.`,
          treatment: cnnResult.recommendations.join('. '),
          prevention: symptomResult.prevention,
          severity: cnnResult.severity as 'mild' | 'moderate' | 'severe',
          affectedArea: (cnnResult.affectedArea + 50) / 2,
          symptoms: [...new Set([...cnnResult.symptoms, ...diseaseData.symptoms])],
          recommendations: [...new Set([...cnnResult.recommendations, ...symptomResult.recommendations])],
          analysisType: 'combined'
        };
      } else if (symptomResult) {
        finalResult = symptomResult;
      }

      if (finalResult && finalResult.confidence < MIN_CONFIDENCE) {
        if (symptomResult && symptomResult.confidence >= MIN_CONFIDENCE) {
          finalResult = symptomResult;
        } else {
          finalResult = null;
          alert('Prediction confidence is too low. Please upload a clearer image and select accurate symptoms.');
        }
      }

      setPredictionResult(finalResult);
    } catch (error) {
      console.error('Analysis failed:', error);
      // Fallback to symptom analysis only
      const fallbackResult = await analyzeSymptoms();
      if (fallbackResult) {
        setPredictionResult({
          ...fallbackResult,
          severity: 'moderate',
          affectedArea: 50,
          symptoms: diseaseData.symptoms,
          recommendations: fallbackResult.treatment.split('. '),
          analysisType: 'symptom-based'
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeSymptoms = async () => {
    // Use existing symptom-based logic
    const diseaseDatabase = {
      'Tomato': [
        {
          disease: 'Early Blight',
          symptoms: ['Brown spots', 'Yellowing leaves'],
          confidence: 0.92,
          description: 'Early blight is a fungal disease that causes dark brown spots with concentric rings on older leaves. It thrives in warm, humid conditions.',
          treatment: 'Apply copper-based fungicides every 7-10 days. Remove infected leaves. Ensure proper air circulation and avoid overhead irrigation.',
          prevention: 'Use resistant varieties, maintain proper spacing, apply preventive fungicides, and keep foliage dry.'
        },
        // ... other diseases
      ]
    };

    const cropDiseases = diseaseDatabase[diseaseData.cropType as keyof typeof diseaseDatabase] || diseaseDatabase['Tomato'];

    let bestMatch = cropDiseases[0];
    let maxMatch = 0;

    cropDiseases.forEach(disease => {
      const symptomMatches = disease.symptoms.filter(symptom =>
        diseaseData.symptoms.includes(symptom)
      ).length;

      const matchScore = symptomMatches / disease.symptoms.length;

      if (matchScore > maxMatch) {
        maxMatch = matchScore;
        bestMatch = disease;
      }
    });

    return bestMatch;
  };

  const getAnalysisTypeColor = (type: string) => {
    const colors = {
      'cnn-based': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'symptom-based': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'combined': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    };
    return colors[type as keyof typeof colors] || colors['symptom-based'];
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      'mild': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'moderate': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'severe': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[severity as keyof typeof colors] || colors['moderate'];
  };

  const resetForm = () => {
    setDiseaseData({
      symptoms: [],
      environmentalFactors: {
        temperature: '',
        humidity: '',
        rainfall: ''
      },
      cropType: ''
    });
    setPredictionResult(null);
    setImagePreview(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 py-8 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('disease.title')}</h1>
          <p className="text-gray-600">{t('disease.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-600" />
              {t('disease.info')}
            </h2>

            {/* Crop Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('disease.cropType')}</label>
              <select
                value={diseaseData.cropType}
                onChange={(e) => setDiseaseData(prev => ({ ...prev, cropType: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">{t('disease.selectCrop')}</option>
                {cropTypes.map(crop => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </div>

            {/* Symptoms Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('disease.symptoms')}</label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {symptoms.map(symptom => (
                  <label key={symptom} className="flex items-center space-x-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={diseaseData.symptoms.includes(symptom)}
                      onChange={() => handleSymptomToggle(symptom)}
                      className="text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm">{symptom}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Environmental Factors */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('disease.environmentalConditions')}</label>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-orange-500" />
                  <input
                    type="text"
                    placeholder="Temperature"
                    value={diseaseData.environmentalFactors.temperature}
                    onChange={(e) => setDiseaseData(prev => ({
                      ...prev,
                      environmentalFactors: { ...prev.environmentalFactors, temperature: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <input
                    type="text"
                    placeholder="Humidity"
                    value={diseaseData.environmentalFactors.humidity}
                    onChange={(e) => setDiseaseData(prev => ({
                      ...prev,
                      environmentalFactors: { ...prev.environmentalFactors, humidity: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Rainfall"
                    value={diseaseData.environmentalFactors.rainfall}
                    onChange={(e) => setDiseaseData(prev => ({
                      ...prev,
                      environmentalFactors: { ...prev.environmentalFactors, rainfall: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('disease.uploadImage')}</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors">
                {imagePreview ? (
                  <div className="space-y-2">
                    <img src={imagePreview} alt="Plant" className="mx-auto h-32 w-32 object-cover rounded-lg" />
                    <button
                      onClick={() => {
                        setImagePreview(null);
                        setDiseaseData(prev => ({ ...prev, imageFile: undefined }));
                      }}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove image
                    </button>
                  </div>
                ) : (
                  <div>
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <label className="cursor-pointer">
                      <span className="text-sm text-gray-600">Click to upload image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={analyzeDisease}
                disabled={isAnalyzing}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t('disease.analyzing')}
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5" />
                    {t('disease.analyze')}
                  </>
                )}
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                {t('disease.reset')}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {predictionResult && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  {t('disease.results')}
                  {predictionResult.analysisType && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAnalysisTypeColor(predictionResult.analysisType)}`}>
                      {predictionResult.analysisType === 'cnn-based' && '🧠 CNN'}
                      {predictionResult.analysisType === 'symptom-based' && '📋 Symptoms'}
                      {predictionResult.analysisType === 'combined' && '🔀 Combined'}
                    </span>
                  )}
                </h2>

                <div className="space-y-4">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-600 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-red-900 dark:text-red-300">{predictionResult.disease}</h3>
                      <div className="flex items-center gap-2">
                        <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs">
                          {Math.round(predictionResult.confidence * 100)}% {t('disease.confidence')}
                        </span>
                        {predictionResult.severity && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(predictionResult.severity)}`}>
                            {predictionResult.severity}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-red-800 dark:text-red-300 text-sm">{predictionResult.description}</p>
                    {predictionResult.affectedArea && (
                      <p className="text-red-700 dark:text-red-400 text-xs mt-2">
                        Affected Area: {predictionResult.affectedArea.toFixed(1)}%
                      </p>
                    )}
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-red-600 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">{t('disease.treatment')}</h3>
                    <p className="text-blue-800 dark:text-blue-300 text-sm">{predictionResult.treatment}</p>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-600 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">{t('disease.prevention')}</h3>
                    <p className="text-green-800 dark:text-green-300 text-sm">{predictionResult.prevention}</p>
                  </div>

                  {predictionResult.symptoms && predictionResult.symptoms.length > 0 && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-600 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-900 dark:text-orange-300 mb-2">{t('disease.detectedSymptoms')}</h3>
                      <div className="flex flex-wrap gap-1">
                        {predictionResult.symptoms.map((symptom, index) => (
                          <span key={index} className="bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 px-2 py-1 rounded text-xs">
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tips Card */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                <Sun className="w-5 h-5" />
                {t('disease.quickTips')}
              </h3>
              <ul className="text-yellow-800 text-sm space-y-2">
                <li>• Early detection increases treatment success rate</li>
                <li>• Regular monitoring helps prevent disease spread</li>
                <li>• Maintain proper plant nutrition for disease resistance</li>
                <li>• Follow recommended spacing for good air circulation</li>
                <li>• Remove and destroy infected plant material</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
