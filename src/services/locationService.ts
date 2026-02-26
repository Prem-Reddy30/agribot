interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  country: string;
  region: string;
}

interface CropSuggestion {
  crop: string;
  season: string;
  reason: string;
  confidence: number;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  season: string;
}

interface LocationSuggestion {
  location: LocationData;
  weather: WeatherData;
  recommendedCrops: CropSuggestion[];
  commonDiseases: string[];
  farmingTips: string[];
}

export class LocationService {
  private static instance: LocationService;
  private currentLocation: LocationData | null = null;
  private suggestions: LocationSuggestion | null = null;

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async setCurrentLocation(location: LocationData | null): Promise<void> {
    this.currentLocation = location;
  }

  async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Get location details from coordinates (using reverse geocoding)
            const locationData = await this.reverseGeocode(latitude, longitude);
            this.currentLocation = locationData;
            resolve(locationData);
          } catch (error) {
            // Fallback to basic location data
            const fallbackLocation: LocationData = {
              latitude,
              longitude,
              city: 'Unknown',
              state: 'Unknown',
              country: 'Unknown',
              region: this.getRegionFromCoordinates(latitude, longitude)
            };
            this.currentLocation = fallbackLocation;
            resolve(fallbackLocation);
          }
        },
        (error) => {
          reject(new Error(`Location access denied: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  private async reverseGeocode(lat: number, lon: number): Promise<LocationData> {
    // Use the new city detection for more accurate results
    const cityData = this.getCityFromCoordinates(lat, lon);
    
    return {
      latitude: lat,
      longitude: lon,
      city: cityData.city,
      state: cityData.state,
      country: 'India',
      region: cityData.region
    };
  }

  private getRegionFromCoordinates(lat: number, lon: number): string {
    // More precise region detection based on coordinates
    if (lat > 28 && lat < 33 && lon > 76 && lon < 81) return 'north';
    if (lat > 8 && lat < 14 && lon > 76 && lon < 80) return 'south';
    if (lat > 21 && lat < 27 && lon > 88 && lon < 93) return 'east';
    if (lat > 18 && lat < 25 && lon > 72 && lon < 78) return 'west';
    if (lat > 20 && lat < 25 && lon > 75 && lon < 79) return 'central';
    return 'south'; // Default to south for Tamil Nadu region
  }

  private getCityFromCoordinates(lat: number, lon: number): { city: string; state: string; region: string } {
    // More precise city detection based on coordinates
    // Madurai coordinates: 9.9252° N, 78.1198° E
    if (Math.abs(lat - 9.9252) < 0.5 && Math.abs(lon - 78.1198) < 0.5) {
      return { city: 'Madurai', state: 'Tamil Nadu', region: 'south' };
    }
    
    // Chennai coordinates: 13.0827° N, 80.2707° E
    if (Math.abs(lat - 13.0827) < 0.5 && Math.abs(lon - 80.2707) < 0.5) {
      return { city: 'Chennai', state: 'Tamil Nadu', region: 'south' };
    }
    
    // Bangalore coordinates: 12.9716° N, 77.5946° E
    if (Math.abs(lat - 12.9716) < 0.5 && Math.abs(lon - 77.5946) < 0.5) {
      return { city: 'Bangalore', state: 'Karnataka', region: 'south' };
    }
    
    // Hyderabad coordinates: 17.3850° N, 78.4867° E
    if (Math.abs(lat - 17.3850) < 0.5 && Math.abs(lon - 78.4867) < 0.5) {
      return { city: 'Hyderabad', state: 'Telangana', region: 'south' };
    }
    
    // Coimbatore coordinates: 11.0168° N, 76.9558° E
    if (Math.abs(lat - 11.0168) < 0.5 && Math.abs(lon - 76.9558) < 0.5) {
      return { city: 'Coimbatore', state: 'Tamil Nadu', region: 'south' };
    }
    
    // Trichy coordinates: 10.7905° N, 78.7047° E
    if (Math.abs(lat - 10.7905) < 0.5 && Math.abs(lon - 78.7047) < 0.5) {
      return { city: 'Tiruchirappalli', state: 'Tamil Nadu', region: 'south' };
    }
    
    // Delhi coordinates: 28.6139° N, 77.2090° E
    if (Math.abs(lat - 28.6139) < 0.5 && Math.abs(lon - 77.2090) < 0.5) {
      return { city: 'Delhi', state: 'Delhi', region: 'north' };
    }
    
    // Mumbai coordinates: 19.0760° N, 72.8777° E
    if (Math.abs(lat - 19.0760) < 0.5 && Math.abs(lon - 72.8777) < 0.5) {
      return { city: 'Mumbai', state: 'Maharashtra', region: 'west' };
    }
    
    // Kolkata coordinates: 22.5726° N, 88.3639° E
    if (Math.abs(lat - 22.5726) < 0.5 && Math.abs(lon - 88.3639) < 0.5) {
      return { city: 'Kolkata', state: 'West Bengal', region: 'east' };
    }
    
    // Default to Chennai if no match (but this should rarely happen)
    return { city: 'Chennai', state: 'Tamil Nadu', region: 'south' };
  }

  async getLocationSuggestions(): Promise<LocationSuggestion> {
    if (!this.currentLocation) {
      await this.getCurrentLocation();
    }

    if (!this.currentLocation) {
      throw new Error('Unable to determine location. Please enable location access or search manually.');
    }

    // Generate suggestions based on location
    const suggestions = this.generateLocationBasedSuggestions(this.currentLocation);
    this.suggestions = suggestions;
    return suggestions;
  }

  private generateLocationBasedSuggestions(location: LocationData): LocationSuggestion {
    const weather = this.getWeatherForLocation(location);
    const recommendedCrops = this.getRecommendedCrops(location, weather);
    const commonDiseases = this.getCommonDiseases(location, weather);
    const farmingTips = this.getFarmingTips(location, weather);

    return {
      location,
      weather,
      recommendedCrops,
      commonDiseases,
      farmingTips
    };
  }

  private getWeatherForLocation(location: LocationData): WeatherData {
    // Simulated weather data based on region and season
    const currentMonth = new Date().getMonth();
    const season = this.getSeason(currentMonth);
    
    const weatherData = {
      north: { temp: { winter: 15, summer: 35, monsoon: 28 }, humidity: 40, rainfall: 200 },
      south: { temp: { winter: 25, summer: 38, monsoon: 30 }, humidity: 60, rainfall: 300 },
      east: { temp: { winter: 20, summer: 37, monsoon: 32 }, humidity: 70, rainfall: 400 },
      west: { temp: { winter: 22, summer: 36, monsoon: 29 }, humidity: 50, rainfall: 250 },
      central: { temp: { winter: 18, summer: 40, monsoon: 31 }, humidity: 35, rainfall: 150 }
    };

    const regionData = weatherData[location.region as keyof typeof weatherData] || weatherData.north;
    let temperature = regionData.temp[season as keyof typeof regionData.temp] || 25;

    return {
      temperature,
      humidity: regionData.humidity,
      rainfall: regionData.rainfall,
      season
    };
  }

  private getSeason(month: number): string {
    if (month >= 2 && month <= 4) return 'summer';
    if (month >= 5 && month <= 8) return 'monsoon';
    if (month >= 9 && month <= 11) return 'winter';
    return 'spring';
  }

  private getRecommendedCrops(location: LocationData, weather: WeatherData): CropSuggestion[] {
    const cropDatabase = {
      north: {
        summer: [
          { crop: 'Rice', season: 'Summer', reason: 'High temperature and irrigation facilities in northern plains', confidence: 0.9 },
          { crop: 'Cotton', season: 'Summer', reason: 'Warm climate suitable for cotton cultivation', confidence: 0.85 },
          { crop: 'Sugarcane', season: 'Summer', reason: 'Long growing season and high temperature', confidence: 0.8 },
          { crop: 'Maize', season: 'Summer', reason: 'Ideal temperature for maize cultivation', confidence: 0.82 }
        ],
        winter: [
          { crop: 'Wheat', season: 'Winter', reason: 'Cooler temperatures ideal for wheat in Indo-Gangetic plains', confidence: 0.95 },
          { crop: 'Mustard', season: 'Winter', reason: 'Winter conditions perfect for mustard cultivation', confidence: 0.88 },
          { crop: 'Potato', season: 'Winter', reason: 'Cool weather suitable for tuber crops', confidence: 0.85 },
          { crop: 'Peas', season: 'Winter', reason: 'Cool season crop perfect for northern winters', confidence: 0.8 }
        ],
        monsoon: [
          { crop: 'Rice', season: 'Monsoon', reason: 'Abundant rainfall for paddy cultivation', confidence: 0.95 },
          { crop: 'Maize', season: 'Monsoon', reason: 'High humidity and rainfall support maize', confidence: 0.82 },
          { crop: 'Soybean', season: 'Monsoon', reason: 'Monsoon conditions ideal for soybean', confidence: 0.78 },
          { crop: 'Pigeon Pea', season: 'Monsoon', reason: 'Well-suited for monsoon conditions', confidence: 0.75 }
        ]
      },
      south: {
        summer: [
          { crop: 'Mango', season: 'Summer', reason: 'Tropical climate perfect for mango cultivation', confidence: 0.92 },
          { crop: 'Coconut', season: 'Summer', reason: 'High humidity and temperature ideal for coconut', confidence: 0.88 },
          { crop: 'Banana', season: 'Summer', reason: 'Warm climate year-round cultivation', confidence: 0.85 },
          { crop: 'Cashew', season: 'Summer', reason: 'Tropical conditions suitable for cashew', confidence: 0.82 }
        ],
        winter: [
          { crop: 'Tomato', season: 'Winter', reason: 'Mild winter temperatures ideal for tomato', confidence: 0.87 },
          { crop: 'Brinjal', season: 'Winter', reason: 'Cooler temperatures reduce pest pressure', confidence: 0.82 },
          { crop: 'Chili', season: 'Winter', reason: 'Optimal temperature for chili cultivation', confidence: 0.8 },
          { crop: 'Onion', season: 'Winter', reason: 'Ideal conditions for bulb formation', confidence: 0.78 }
        ],
        monsoon: [
          { crop: 'Rice', season: 'Monsoon', reason: 'Heavy rainfall suitable for paddy cultivation', confidence: 0.94 },
          { crop: 'Turmeric', season: 'Monsoon', reason: 'High humidity required for turmeric', confidence: 0.86 },
          { crop: 'Ginger', season: 'Monsoon', reason: 'Monsoon conditions ideal for ginger', confidence: 0.84 },
          { crop: 'Black Pepper', season: 'Monsoon', reason: 'Requires high humidity and rainfall', confidence: 0.8 }
        ]
      },
      east: {
        summer: [
          { crop: 'Jute', season: 'Summer', reason: 'Ideal conditions for jute cultivation', confidence: 0.9 },
          { crop: 'Rice', season: 'Summer', reason: 'Suitable for summer rice cultivation', confidence: 0.85 },
          { crop: 'Maize', season: 'Summer', reason: 'Warm climate suitable for maize', confidence: 0.8 }
        ],
        winter: [
          { crop: 'Rice', season: 'Winter', reason: 'Winter rice cultivation in eastern regions', confidence: 0.88 },
          { crop: 'Wheat', season: 'Winter', reason: 'Suitable for wheat in eastern plains', confidence: 0.82 },
          { crop: 'Lentil', season: 'Winter', reason: 'Ideal for winter lentil cultivation', confidence: 0.8 }
        ],
        monsoon: [
          { crop: 'Rice', season: 'Monsoon', reason: 'Heavy rainfall perfect for paddy', confidence: 0.95 },
          { crop: 'Jute', season: 'Monsoon', reason: 'Monsoon conditions ideal for jute', confidence: 0.88 },
          { crop: 'Mesta', season: 'Monsoon', reason: 'Suitable for mesta cultivation', confidence: 0.75 }
        ]
      },
      west: {
        summer: [
          { crop: 'Cotton', season: 'Summer', reason: 'Ideal conditions for cotton in western India', confidence: 0.92 },
          { crop: 'Sugarcane', season: 'Summer', reason: 'Long season suitable for sugarcane', confidence: 0.88 },
          { crop: 'Groundnut', season: 'Summer', reason: 'Warm climate ideal for groundnut', confidence: 0.85 },
          { crop: 'Bajra', season: 'Summer', reason: 'Drought-resistant crop for arid regions', confidence: 0.82 }
        ],
        winter: [
          { crop: 'Wheat', season: 'Winter', reason: 'Suitable for winter wheat cultivation', confidence: 0.85 },
          { crop: 'Gram', season: 'Winter', reason: 'Ideal conditions for gram cultivation', confidence: 0.8 },
          { crop: 'Mustard', season: 'Winter', reason: 'Winter conditions suitable for mustard', confidence: 0.78 }
        ],
        monsoon: [
          { crop: 'Cotton', season: 'Monsoon', reason: 'Monsoon supports cotton cultivation', confidence: 0.88 },
          { crop: 'Soybean', season: 'Monsoon', reason: 'Suitable for soybean in western regions', confidence: 0.82 },
          { crop: 'Tur', season: 'Monsoon', reason: 'Ideal conditions for tur cultivation', confidence: 0.75 }
        ]
      },
      central: {
        summer: [
          { crop: 'Wheat', season: 'Summer', reason: 'Suitable for summer wheat in central India', confidence: 0.85 },
          { crop: 'Soybean', season: 'Summer', reason: 'Warm climate suitable for soybean', confidence: 0.82 },
          { crop: 'Gram', season: 'Summer', reason: 'Ideal conditions for gram cultivation', confidence: 0.8 }
        ],
        winter: [
          { crop: 'Wheat', season: 'Winter', reason: 'Primary wheat growing region', confidence: 0.92 },
          { crop: 'Gram', season: 'Winter', reason: 'Ideal for winter gram cultivation', confidence: 0.88 },
          { crop: 'Mustard', season: 'Winter', reason: 'Suitable for mustard in central regions', confidence: 0.82 }
        ],
        monsoon: [
          { crop: 'Rice', season: 'Monsoon', reason: 'Monsoon rice cultivation possible', confidence: 0.85 },
          { crop: 'Soybean', season: 'Monsoon', reason: 'Ideal for soybean in monsoon', confidence: 0.88 },
          { crop: 'Cotton', season: 'Monsoon', reason: 'Suitable for cotton cultivation', confidence: 0.8 }
        ]
      }
    };

    const regionCrops = cropDatabase[location.region as keyof typeof cropDatabase] || cropDatabase.north;
    const seasonCrops = regionCrops[weather.season as keyof typeof regionCrops] || regionCrops.summer;
    
    return seasonCrops.sort((a, b) => b.confidence - a.confidence).slice(0, 4);
  }

  private getCommonDiseases(location: LocationData, weather: WeatherData): string[] {
    const diseaseDatabase = {
      north: {
        summer: ['Leaf Blight', 'Powdery Mildew', 'Fruit Rot', 'Aphid Attack', 'Thrips'],
        winter: ['Wheat Rust', 'Loose Smut', 'Karnal Bunt', 'Yellow Rust', 'Brown Rust'],
        monsoon: ['Rice Blast', 'Leaf Spot', 'Root Rot', 'Sheath Blight', 'Bacterial Leaf Blight']
      },
      south: {
        summer: ['Mosaic Virus', 'Fruit Borer', 'Wilt', 'Leaf Curl Virus', 'Mites'],
        winter: ['Early Blight', 'Leaf Curl', 'Fruit Spot', 'Powdery Mildew', 'Downy Mildew'],
        monsoon: ['Bacterial Blight', 'Anthracnose', 'Downy Mildew', 'Leaf Spot', 'Root Rot']
      },
      east: {
        summer: ['Jute Stem Rot', 'Powdery Mildew', 'Leaf Spot', 'Aphids', 'Jute Hairy Caterpillar'],
        winter: ['Wheat Brown Rust', 'Lentil Wilt', 'Pea Powdery Mildew', 'Mustard Alternaria', 'Chickpea Wilt'],
        monsoon: ['Rice Blast', 'Sheath Blight', 'Bacterial Leaf Blight', 'Tungro Virus', 'Rice Tungro']
      },
      west: {
        summer: ['Cotton Leaf Curl', 'Boll Rot', 'Powdery Mildew', 'Aphids', 'Whitefly'],
        winter: ['Wheat Rust', 'Gram Blight', 'Mustard White Rust', 'Safflower Rust', 'Groundnut Leaf Spot'],
        monsoon: ['Cotton Wilt', 'Soybean Rust', 'Groundnut Tikka', 'Castor Wilt', 'Sugarcane Red Rot']
      },
      central: {
        summer: ['Wheat Rust', 'Soybean Rust', 'Gram Blight', 'Maize Stunt', 'Sorghum Downy Mildew'],
        winter: ['Wheat Loose Smut', 'Karnal Bunt', 'Gram Wilt', 'Lentil Blight', 'Pea Powdery Mildew'],
        monsoon: ['Rice Blast', 'Soybean Rust', 'Cotton Wilt', 'Maize Downy Mildew', 'Groundnut Leaf Spot']
      }
    };

    const regionDiseases = diseaseDatabase[location.region as keyof typeof diseaseDatabase] || diseaseDatabase.north;
    return regionDiseases[weather.season as keyof typeof regionDiseases] || regionDiseases.summer;
  }

  private getFarmingTips(location: LocationData, weather: WeatherData): string[] {
    const baseTips = [
      `Based on ${weather.season} season in ${location.state}, consider ${weather.season === 'monsoon' ? 'flood-resistant crops and proper drainage' : 'drought-resistant varieties and irrigation planning'}`,
      `Current temperature (${weather.temperature}°C) is ideal for ${weather.temperature > 30 ? 'heat-tolerant crops like cotton, sugarcane, and millets' : 'cool-season vegetables like tomato, brinjal, and chili'}`,
      `Humidity level (${weather.humidity}%) suggests ${weather.humidity > 60 ? 'monitor for fungal diseases and ensure proper air circulation' : 'good conditions for most crops with lower disease pressure'}`,
      `${weather.rainfall > 300 ? 'High rainfall' : 'Moderate rainfall'} in your region requires ${weather.rainfall > 300 ? 'proper drainage systems and raised beds' : 'efficient irrigation planning and water conservation'}`,
      `Soil testing recommended before planting in ${location.region} region to determine nutrient requirements and pH levels`
    ];

    const regionSpecificTips: Record<string, string[]> = {
      north: [
        'Consider crop rotation with wheat-rice-maize cycle for optimal yields',
        'Implement conservation agriculture practices in Indo-Gangetic plains',
        'Use certified seeds and follow recommended sowing times'
      ],
      south: [
        'Utilize organic farming practices for better soil health in tropical regions',
        'Implement integrated pest management for high humidity conditions',
        'Consider intercropping with coconut and banana for better income'
      ],
      east: [
        'Practice system of rice intensification (SRI) for better yields',
        'Implement proper water management in flood-prone areas',
        'Use salt-tolerant varieties in coastal regions'
      ],
      west: [
        'Implement drip irrigation for water conservation in arid regions',
        'Use drought-resistant crop varieties and mulching techniques',
        'Practice watershed management for rainwater harvesting'
      ],
      central: [
        'Follow balanced fertilization for soybean and wheat crops',
        'Implement zero tillage conservation agriculture practices',
        'Use crop residue management for soil moisture conservation'
      ]
    };

    const seasonSpecificTips: Record<string, string[]> = {
      summer: [
        'Provide adequate irrigation during critical growth stages',
        'Use mulching to conserve soil moisture',
        'Monitor for heat stress and provide shade if needed'
      ],
      monsoon: [
        'Ensure proper field drainage to prevent waterlogging',
        'Apply nitrogen fertilizers in split doses',
        'Monitor for pest outbreaks due to high humidity'
      ],
      winter: [
        'Protect crops from frost in northern regions',
        'Apply balanced fertilizers for winter crops',
        'Monitor for temperature fluctuations'
      ],
      spring: [
        'Prepare fields for summer crop planting',
        'Apply organic matter to improve soil fertility',
        'Plan crop rotation for the upcoming season'
      ]
    };

    const allTips = [
      ...baseTips,
      ...(regionSpecificTips[location.region] || []),
      ...(seasonSpecificTips[weather.season] || [])
    ];

    return allTips.slice(0, 6); // Return top 6 tips
  }

  getCurrentSuggestions(): LocationSuggestion | null {
    return this.suggestions;
  }

  async searchLocation(query: string): Promise<LocationData[]> {
    // Simulated location search with more cities including Madurai
    const cities = [
      { name: 'Delhi', lat: 28.6139, lon: 77.2090, state: 'Delhi', country: 'India', region: 'north' },
      { name: 'Mumbai', lat: 19.0760, lon: 72.8777, state: 'Maharashtra', country: 'India', region: 'west' },
      { name: 'Chennai', lat: 13.0827, lon: 80.2707, state: 'Tamil Nadu', country: 'India', region: 'south' },
      { name: 'Kolkata', lat: 22.5726, lon: 88.3639, state: 'West Bengal', country: 'India', region: 'east' },
      { name: 'Bangalore', lat: 12.9716, lon: 77.5946, state: 'Karnataka', country: 'India', region: 'south' },
      { name: 'Hyderabad', lat: 17.3850, lon: 78.4867, state: 'Telangana', country: 'India', region: 'south' },
      { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714, state: 'Gujarat', country: 'India', region: 'west' },
      { name: 'Pune', lat: 18.5204, lon: 73.8567, state: 'Maharashtra', country: 'India', region: 'west' },
      { name: 'Madurai', lat: 9.9252, lon: 78.1198, state: 'Tamil Nadu', country: 'India', region: 'south' },
      { name: 'Coimbatore', lat: 11.0168, lon: 76.9558, state: 'Tamil Nadu', country: 'India', region: 'south' },
      { name: 'Tiruchirappalli', lat: 10.7905, lon: 78.7047, state: 'Tamil Nadu', country: 'India', region: 'south' },
      { name: 'Jaipur', lat: 26.9124, lon: 75.7873, state: 'Rajasthan', country: 'India', region: 'west' },
      { name: 'Lucknow', lat: 26.8467, lon: 80.9462, state: 'Uttar Pradesh', country: 'India', region: 'north' },
      { name: 'Kochi', lat: 9.9312, lon: 76.2673, state: 'Kerala', country: 'India', region: 'south' },
      { name: 'Bhopal', lat: 23.2599, lon: 77.4126, state: 'Madhya Pradesh', country: 'India', region: 'central' }
    ];

    return cities
      .filter(city => city.name.toLowerCase().includes(query.toLowerCase()))
      .map(city => ({
        latitude: city.lat,
        longitude: city.lon,
        city: city.name,
        state: city.state,
        country: city.country,
        region: city.region
      }));
  }
}
