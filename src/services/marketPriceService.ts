interface MarketPrice {
  crop: string;
  mandi: string;
  location: {
    city: string;
    state: string;
    region: string;
  };
  price: number;
  unit: string;
  date: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  pricePerKg: number;
  pricePerQuintal: number;
}

interface PriceTrend {
  date: string;
  price: number;
  volume: number;
}

interface AIRecommendation {
  recommendation: 'sell_now' | 'wait' | 'hold';
  confidence: number;
  reason: string;
  expectedPrice: number;
  timeframe: string;
  priceChange: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface MarketAlert {
  crop: string;
  mandi: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
}

export class MarketPriceService {
  private static instance: MarketPriceService;
  private alerts: MarketAlert[] = [];

  static getInstance(): MarketPriceService {
    if (!MarketPriceService.instance) {
      MarketPriceService.instance = new MarketPriceService();
    }
    return MarketPriceService.instance;
  }

  async getCurrentPrice(crop: string, mandi: string): Promise<MarketPrice> {
    // Simulated current market price
    const basePrices = {
      'Rice': { base: 1800, unit: 'quintal', volatility: 0.15 },
      'Wheat': { base: 2200, unit: 'quintal', volatility: 0.12 },
      'Tomato': { base: 1800, unit: 'quintal', volatility: 0.25 },
      'Potato': { base: 1200, unit: 'quintal', volatility: 0.18 },
      'Onion': { base: 2500, unit: 'quintal', volatility: 0.30 },
      'Brinjal': { base: 1600, unit: 'quintal', volatility: 0.20 },
      'Chili': { base: 8000, unit: 'quintal', volatility: 0.22 },
      'Cotton': { base: 6000, unit: 'quintal', volatility: 0.15 },
      'Sugarcane': { base: 3000, unit: 'quintal', volatility: 0.10 },
      'Maize': { base: 1500, unit: 'quintal', volatility: 0.18 }
    };

    const cropData = basePrices[crop as keyof typeof basePrices] || basePrices['Rice'];
    
    // Add some randomness for realism
    const randomFactor = 0.95 + Math.random() * 0.1; // ±5% variation
    const currentPrice = Math.round(cropData.base * randomFactor);
    
    // Calculate per kg and per quintal prices
    const pricePerQuintal = currentPrice;
    const pricePerKg = Math.round(currentPrice / 100); // 1 quintal = 100 kg
    
    // Determine trend based on recent data
    const trend = this.calculateTrend(crop, currentPrice);
    
    return {
      crop,
      mandi,
      location: {
        city: mandi,
        state: this.getStateFromMandi(mandi),
        region: this.getRegionFromMandi(mandi)
      },
      price: currentPrice,
      unit: cropData.unit,
      date: new Date().toISOString().split('T')[0],
      trend: trend.direction,
      changePercent: trend.changePercent,
      pricePerKg,
      pricePerQuintal
    };
  }

  async getPriceTrend(crop: string, mandi: string, days: number = 7): Promise<PriceTrend[]> {
    const trends: PriceTrend[] = [];
    const basePrice = await this.getCurrentPrice(crop, mandi);
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simulate historical prices with realistic patterns
      const dayOfWeek = date.getDay();
      const seasonalFactor = this.getSeasonalFactor(crop, date.getMonth());
      const randomFactor = 0.9 + Math.random() * 0.2;
      
      const price = Math.round(basePrice.price * seasonalFactor * randomFactor);
      
      trends.push({
        date: date.toISOString().split('T')[0],
        price,
        volume: Math.floor(1000 + Math.random() * 5000)
      });
    }
    
    return trends;
  }

  async getAIRecommendation(crop: string, mandi: string): Promise<AIRecommendation> {
    const currentPrice = await this.getCurrentPrice(crop, mandi);
    const trends = await this.getPriceTrend(crop, mandi, 7);
    
    // Analyze trends for AI prediction
    const analysis = this.analyzePriceTrends(trends);
    
    // Generate AI recommendation
    const recommendation = this.generateAIRecommendation(crop, currentPrice, analysis);
    
    return recommendation;
  }

  async getNearbyMandis(crop: string, location: { city: string; state: string }): Promise<Array<{ name: string; distance: number; state: string }>> {
    // Simulated nearby mandis
    const mandiDatabase: Record<string, Array<{ name: string; distance: number; state: string }>> = {
      'Tamil Nadu': [
        { name: 'Chennai', distance: 0, state: 'Tamil Nadu' },
        { name: 'Madurai', distance: 120, state: 'Tamil Nadu' },
        { name: 'Coimbatore', distance: 180, state: 'Tamil Nadu' },
        { name: 'Tiruchirappalli', distance: 150, state: 'Tamil Nadu' },
        { name: 'Salem', distance: 200, state: 'Tamil Nadu' }
      ],
      'Maharashtra': [
        { name: 'Mumbai', distance: 0, state: 'Maharashtra' },
        { name: 'Pune', distance: 150, state: 'Maharashtra' },
        { name: 'Nagpur', distance: 250, state: 'Maharashtra' },
        { name: 'Nashik', distance: 200, state: 'Maharashtra' }
      ],
      'Karnataka': [
        { name: 'Bangalore', distance: 0, state: 'Karnataka' },
        { name: 'Mysore', distance: 140, state: 'Karnataka' },
        { name: 'Hubli', distance: 180, state: 'Karnataka' },
        { name: 'Belgaum', distance: 220, state: 'Karnataka' }
      ],
      'Gujarat': [
        { name: 'Ahmedabad', distance: 0, state: 'Gujarat' },
        { name: 'Surat', distance: 160, state: 'Gujarat' },
        { name: 'Vadodara', distance: 110, state: 'Gujarat' },
        { name: 'Rajkot', distance: 200, state: 'Gujarat' }
      ]
    };

    const stateMandis = mandiDatabase[location.state] || mandiDatabase['Tamil Nadu'];
    
    return stateMandis.map(mandi => ({
      ...mandi,
      distance: Math.abs(mandi.distance)
    })).sort((a, b) => a.distance - b.distance);
  }

  async setPriceAlert(alert: MarketAlert): Promise<void> {
    this.alerts.push(alert);
  }

  async checkPriceAlerts(): Promise<MarketAlert[]> {
    const triggeredAlerts: MarketAlert[] = [];
    
    for (const alert of this.alerts) {
      if (!alert.isActive) continue;
      
      try {
        const currentPrice = await this.getCurrentPrice(alert.crop, alert.mandi);
        const shouldTrigger = alert.condition === 'above' 
          ? currentPrice.price >= alert.targetPrice 
          : currentPrice.price <= alert.targetPrice;
        
        if (shouldTrigger) {
          triggeredAlerts.push(alert);
          alert.isActive = false; // Deactivate after triggering
        }
      } catch (error) {
        console.error('Error checking price alert:', error);
      }
    }
    
    return triggeredAlerts;
  }

  private calculateTrend(crop: string, currentPrice: number): { direction: 'up' | 'down' | 'stable'; changePercent: number } {
    // Simulate trend calculation based on recent market behavior
    const randomFactor = Math.random();
    
    if (randomFactor > 0.6) {
      return { direction: 'up', changePercent: 2 + Math.random() * 8 };
    } else if (randomFactor < 0.4) {
      return { direction: 'down', changePercent: -(2 + Math.random() * 8) };
    } else {
      return { direction: 'stable', changePercent: 0 };
    }
  }

  private analyzePriceTrends(trends: PriceTrend[]): {
    slope: number;
    volatility: number;
    avgPrice: number;
    volumeSlope: number;
    currentPrice: number;
    priceHistory: number[];
  } {
    const prices = trends.map(t => t.price);
    const volumes = trends.map(t => t.volume);
    
    // Calculate moving average
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    
    // Calculate trend slope
    let slope = 0;
    for (let i = 1; i < prices.length; i++) {
      slope += (prices[i] - prices[i-1]);
    }
    slope = slope / (prices.length - 1);
    
    // Calculate volatility
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / prices.length;
    const volatility = Math.sqrt(variance);
    
    // Calculate volume trend
    let volumeSlope = 0;
    for (let i = 1; i < volumes.length; i++) {
      volumeSlope += (volumes[i] - volumes[i-1]);
    }
    volumeSlope = volumeSlope / (volumes.length - 1);
    
    return {
      slope,
      volatility,
      avgPrice,
      volumeSlope,
      currentPrice: prices[prices.length - 1],
      priceHistory: prices
    };
  }

  private generateAIRecommendation(crop: string, currentPrice: MarketPrice, analysis: any): AIRecommendation {
    const { slope, volatility, avgPrice, volumeSlope, currentPrice: price } = analysis;
    
    // AI decision logic
    let recommendation: 'sell_now' | 'wait' | 'hold';
    let confidence = 0.5;
    let reason = '';
    let expectedPrice = currentPrice.price;
    let timeframe = '3 days';
    let riskLevel: 'low' | 'medium' | 'high' = 'medium';
    
    // Analyze trend direction
    if (slope > 10) {
      // Strong upward trend
      recommendation = 'wait';
      confidence = 0.85;
      reason = `Strong upward trend detected. ${crop} prices have increased by ${Math.abs(slope).toFixed(1)}% in the last week.`;
      expectedPrice = Math.round(currentPrice.price * (1 + (slope / 100)));
      timeframe = '5-7 days';
      riskLevel = volatility > 50 ? 'high' : 'low';
    } else if (slope < -10) {
      // Strong downward trend
      recommendation = 'sell_now';
      confidence = 0.85;
      reason = `Downward trend detected. ${crop} prices have decreased by ${Math.abs(slope).toFixed(1)}% in the last week.`;
      expectedPrice = Math.round(currentPrice.price * (1 + (slope / 100)));
      timeframe = '2-3 days';
      riskLevel = volatility > 50 ? 'high' : 'low';
    } else {
      // Stable or weak trend
      if (volatility > 30) {
        recommendation = 'hold';
        confidence = 0.6;
        reason = `High market volatility detected. Best to hold position and monitor closely.`;
        expectedPrice = currentPrice.price;
        timeframe = '3-5 days';
        riskLevel = 'high';
      } else {
        recommendation = 'hold';
        confidence = 0.7;
        reason = `Market is relatively stable. Current price is close to weekly average.`;
        expectedPrice = currentPrice.price;
        timeframe = '4-6 days';
        riskLevel = 'low';
      }
    }
    
    // Consider volume trends
    if (volumeSlope > 100) {
      confidence += 0.1;
      reason += ' High trading volume indicates strong market interest.';
    } else if (volumeSlope < -100) {
      confidence -= 0.1;
      reason += ' Low trading volume may indicate weak demand.';
    }
    
    // Cap confidence at 0.95
    confidence = Math.min(confidence, 0.95);
    
    return {
      recommendation,
      confidence: Math.round(confidence * 100) / 100,
      reason,
      expectedPrice,
      timeframe,
      priceChange: Math.round(expectedPrice - currentPrice.price),
      riskLevel
    };
  }

  private getSeasonalFactor(crop: string, month: number): number {
    // Seasonal price adjustments
    const seasonalFactors: Record<string, number[]> = {
      'Rice': [0.9, 0.85, 0.95, 1.0, 1.05, 1.1, 1.15, 1.1, 1.05, 1.0, 0.95],
      'Tomato': [1.2, 1.1, 0.9, 0.8, 0.9, 1.2, 1.4, 1.3, 1.1, 0.9, 0.8],
      'Onion': [1.3, 1.2, 1.1, 0.9, 0.8, 0.9, 1.1, 1.3, 1.4, 1.3, 1.1],
      'Potato': [0.95, 0.9, 0.85, 0.8, 0.85, 1.0, 1.1, 1.05, 1.0, 0.95, 0.9],
      'Wheat': [0.9, 0.85, 0.95, 1.0, 1.05, 1.1, 1.15, 1.1, 1.05, 1.0, 0.95]
    };
    
    const factors = seasonalFactors[crop] || seasonalFactors['Rice'];
    return factors[month] || 1.0;
  }

  private getStateFromMandi(mandi: string): string {
    const stateMapping: Record<string, string> = {
      'Chennai': 'Tamil Nadu',
      'Madurai': 'Tamil Nadu',
      'Coimbatore': 'Tamil Nadu',
      'Tiruchirappalli': 'Tamil Nadu',
      'Mumbai': 'Maharashtra',
      'Pune': 'Maharashtra',
      'Nagpur': 'Maharashtra',
      'Bangalore': 'Karnataka',
      'Mysore': 'Karnataka',
      'Ahmedabad': 'Gujarat',
      'Surat': 'Gujarat',
      'Delhi': 'Delhi',
      'Lucknow': 'Uttar Pradesh',
      'Kolkata': 'West Bengal',
      'Jaipur': 'Rajasthan'
    };
    
    return stateMapping[mandi] || 'Unknown';
  }

  private getRegionFromMandi(mandi: string): string {
    const regionMapping: Record<string, string> = {
      'Chennai': 'south',
      'Madurai': 'south',
      'Coimbatore': 'south',
      'Tiruchirappalli': 'south',
      'Bangalore': 'south',
      'Mysore': 'south',
      'Hyderabad': 'south',
      'Mumbai': 'west',
      'Pune': 'west',
      'Ahmedabad': 'west',
      'Surat': 'west',
      'Delhi': 'north',
      'Lucknow': 'north',
      'Jaipur': 'west',
      'Kolkata': 'east'
    };
    
    return regionMapping[mandi] || 'south';
  }

  async getAvailableCrops(): Promise<string[]> {
    return [
      'Rice', 'Wheat', 'Tomato', 'Potato', 'Onion', 'Brinjal', 
      'Chili', 'Cotton', 'Sugarcane', 'Maize', 'Mustard', 'Gram',
      'Tur', 'Urad', 'Moong', 'Masoor', 'Soybean'
    ];
  }

  async getAvailableMandis(): Promise<string[]> {
    return [
      'Chennai', 'Madurai', 'Coimbatore', 'Tiruchirappalli', 'Salem',
      'Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Ahmedabad', 'Surat',
      'Bangalore', 'Mysore', 'Hubli', 'Belgaum', 'Dharwad',
      'Delhi', 'Lucknow', 'Kanpur', 'Agra', 'Varanasi',
      'Kolkata', 'Asansol', 'Durgapur', 'Siliguri', 'Malda',
      'Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer',
      'Hyderabad', 'Vijayawada', 'Visakhapatnam', 'Warangal', 'Nizamabad'
    ];
  }
}

export const marketPriceService = MarketPriceService.getInstance();
