import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Bell, MapPin, Calendar, DollarSign, BarChart3, Brain, Target, Clock, ChevronDown, LineChart } from 'lucide-react';
import { marketPriceService } from '../services/marketPriceService';
import { useLanguage } from '../contexts/LanguageContext';

interface MarketPriceData {
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


export function MarketPrices() {
  const { t } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [selectedMandi, setSelectedMandi] = useState('Chennai');
  const [marketPrice, setMarketPrice] = useState<MarketPriceData | null>(null);
  const [priceTrends, setPriceTrends] = useState<PriceTrend[]>([]);
  const [aiRecommendation, setAIRecommendation] = useState<AIRecommendation | null>(null);
  const [availableCrops, setAvailableCrops] = useState<string[]>([]);
  const [availableMandis, setAvailableMandis] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCropDropdown, setShowCropDropdown] = useState(false);
  const [showMandiDropdown, setShowMandiDropdown] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertPrice, setAlertPrice] = useState('');
  const [alertCondition, setAlertCondition] = useState<'above' | 'below'>('above');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedCrop && selectedMandi) {
      loadMarketData();
    }
  }, [selectedCrop, selectedMandi]);

  const loadInitialData = async () => {
    try {
      const crops = await marketPriceService.getAvailableCrops();
      const mandis = await marketPriceService.getAvailableMandis();
      setAvailableCrops(crops);
      setAvailableMandis(mandis);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadMarketData = async () => {
    setLoading(true);
    try {
      // Load current price
      const currentPrice = await marketPriceService.getCurrentPrice(selectedCrop, selectedMandi);
      setMarketPrice(currentPrice);

      // Load price trends
      const trends = await marketPriceService.getPriceTrend(selectedCrop, selectedMandi, 7);
      setPriceTrends(trends);

      // Load AI recommendation
      const recommendation = await marketPriceService.getAIRecommendation(selectedCrop, selectedMandi);
      setAIRecommendation(recommendation);

    } catch (error) {
      console.error('Error loading market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'down': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'sell_now': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'wait': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default: return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    }
  };

  const setPriceAlert = async () => {
    if (!alertPrice || !selectedCrop || !selectedMandi) return;

    try {
      await marketPriceService.setPriceAlert({
        crop: selectedCrop,
        mandi: selectedMandi,
        targetPrice: parseFloat(alertPrice),
        condition: alertCondition,
        isActive: true
      });

      setShowAlertModal(false);
      setAlertPrice('');
      const successMsg = t('market.alertSuccess')
        .replace('{crop}', selectedCrop)
        .replace('{condition}', alertCondition === 'above' ? t('market.notifyAbove').split(' ').pop() || '' : t('market.notifyBelow').split(' ').pop() || '')
        .replace('{price}', alertPrice);
      alert(successMsg);
    } catch (error) {
      console.error('Error setting price alert:', error);
      alert(t('market.alertFailed'));
    }
  };

  if (loading && !marketPrice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">{t('market.loadingMandi')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 py-8 transition-colors relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-400/20 dark:bg-indigo-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-50 -z-0"></div>
      <div className="absolute -bottom-20 left-10 w-[30rem] h-[30rem] bg-purple-400/20 dark:bg-purple-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-50 -z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-[2rem] mb-6 shadow-lg shadow-indigo-500/30 transform rotate-3 hover:rotate-6 transition-transform">
            <DollarSign className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-3 drop-shadow-sm">{t('market.title')}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            {t('market.subtitle')}
          </p>
        </div>

        {/* Selection Controls */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/50 dark:border-slate-800 rounded-3xl shadow-xl p-6 sm:p-8 mb-10 hover:shadow-2xl transition-shadow duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Crop Selection */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🌾 {t('market.selectCrop')}
              </label>
              <button
                onClick={() => setShowCropDropdown(!showCropDropdown)}
                className="w-full px-5 py-3.5 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl flex items-center justify-between text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 hover:shadow-md backdrop-blur-sm transition-all outline-none"
              >
                <span className="text-gray-900 dark:text-white">{selectedCrop}</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {showCropDropdown && (
                <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {availableCrops.map((crop) => (
                    <button
                      key={crop}
                      onClick={() => {
                        setSelectedCrop(crop);
                        setShowCropDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-900 dark:text-white"
                    >
                      {crop}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mandi Selection */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📍 {t('market.selectMandi')}
              </label>
              <button
                onClick={() => setShowMandiDropdown(!showMandiDropdown)}
                className="w-full px-5 py-3.5 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl flex items-center justify-between text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50 hover:shadow-md backdrop-blur-sm transition-all outline-none"
              >
                <span className="text-gray-900 dark:text-white">{selectedMandi}</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {showMandiDropdown && (
                <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {availableMandis.map((mandi) => (
                    <button
                      key={mandi}
                      onClick={() => {
                        setSelectedMandi(mandi);
                        setShowMandiDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-900 dark:text-white"
                    >
                      {mandi}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {marketPrice && (
          <>
            {/* Current Price Card */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/50 dark:border-slate-800 rounded-3xl shadow-xl p-8 mb-8 hover:shadow-2xl transition-shadow duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-purple-500"></div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedCrop} - {selectedMandi}
                  </h2>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <MapPin className="w-4 h-4" />
                    <span>{marketPrice.location.city}, {marketPrice.location.state}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    ₹{marketPrice.pricePerQuintal.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {t('market.perUnit')} {marketPrice.unit} (₹{marketPrice.pricePerKg}/{t('market.kg')})
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    1 {marketPrice.unit} = 100 kg
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getTrendColor(marketPrice.trend)}`}>
                  {getTrendIcon(marketPrice.trend)}
                  <span className="text-sm font-medium">
                    {marketPrice.trend === 'up' ? '+' : ''}{marketPrice.changePercent}%
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{marketPrice.date}</span>
                </div>
              </div>
            </div>

            {/* AI Recommendation */}
            {aiRecommendation && (
              <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 dark:from-indigo-900/20 dark:via-purple-900/10 dark:to-pink-900/20 backdrop-blur-2xl rounded-3xl shadow-xl p-8 mb-8 border border-purple-200/50 dark:border-purple-800/50 hover:shadow-2xl transition-all duration-300">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl"></div>
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t('market.aiRecommendation')}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor(aiRecommendation.recommendation)}`}>
                        {aiRecommendation.recommendation === 'sell_now' ? t('market.sellNow') :
                          aiRecommendation.recommendation === 'wait' ? t('market.wait') : t('market.hold')}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {Math.round(aiRecommendation.confidence * 100)}% {t('location.match')}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">{aiRecommendation.reason}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-300">
                          {t('market.expected')}: ₹{aiRecommendation.expectedPrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-300">{t(`market.timeframe`)}: {aiRecommendation.timeframe}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">{t('market.priceChange')}</div>
                      <div className={`text-lg font-semibold ${aiRecommendation.priceChange > 0 ? 'text-green-600' :
                        aiRecommendation.priceChange < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                        {aiRecommendation.priceChange > 0 ? '+' : ''}₹{aiRecommendation.priceChange.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">{t('market.riskLevel')}</div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(aiRecommendation.riskLevel)}`}>
                        {aiRecommendation.riskLevel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Price Trend Chart */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/50 dark:border-slate-800 rounded-3xl shadow-xl p-8 mb-8 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center gap-2 mb-6">
                <LineChart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t('market.trendTitle')}</h3>
              </div>

              <div className="h-64 mb-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                {priceTrends.length > 0 ? (
                  <div className="relative h-full flex items-end justify-between gap-1">
                    {priceTrends.map((trend, index) => {
                      const maxPrice = Math.max(...priceTrends.map(t => t.price));
                      const minPrice = Math.min(...priceTrends.map(t => t.price));
                      const priceRange = maxPrice - minPrice || 1;
                      const height = ((trend.price - minPrice) / priceRange) * 80; // 80% of container height

                      return (
                        <div key={index} className="flex-1 flex flex-col items-center justify-end">
                          <div className="relative w-full flex flex-col items-center">
                            <div
                              className="w-6 bg-blue-500 dark:bg-blue-400 rounded-t transition-all hover:bg-blue-600 dark:hover:bg-blue-300 cursor-pointer"
                              style={{ height: `${height}%`, minHeight: '10px' }}
                            />
                            <div className="absolute -top-6 text-xs font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                              ₹{trend.price}
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                            <div>{new Date(trend.date).getDate()}</div>
                            <div>{new Date(trend.date).toLocaleDateString('en', { month: 'short' })}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>{t('market.loadingTrends')}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 border-t pt-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>{t('market.dailyPrice')}</span>
                  </div>
                  {priceTrends.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span>{t('market.min')}: ₹{Math.min(...priceTrends.map(t => t.price)).toLocaleString()}</span>
                      <span>{t('market.max')}: ₹{Math.max(...priceTrends.map(t => t.price)).toLocaleString()}</span>
                    </div>
                  )}
                </div>
                {priceTrends.length > 0 && (
                  <div className="text-right">
                    <span className={`font-medium ${priceTrends[priceTrends.length - 1]?.price > priceTrends[0]?.price
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                      }`}>
                      {priceTrends[priceTrends.length - 1]?.price > priceTrends[0]?.price ? '↑' : '↓'}
                      {Math.abs(Math.round(((priceTrends[priceTrends.length - 1]?.price || 0) - (priceTrends[0]?.price || 0)) / (priceTrends[0]?.price || 1) * 100))}%
                    </span>
                    <div className="text-xs">{t('market.change7Day')}</div>
                  </div>
                )}
              </div>
            </div>


            {/* Price Alert */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bell className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t('market.priceAlert')}</h3>
                </div>
                <button
                  onClick={() => setShowAlertModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all"
                >
                  {t('market.setAlert')}
                </button>
              </div>

              <p className="text-gray-600 dark:text-gray-300">
                {t('market.alertDescription').replace('{crop}', selectedCrop)}
              </p>
            </div>
          </>
        )}

        {/* Alert Modal */}
        {showAlertModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/20 dark:border-slate-700/50 rounded-3xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.3)] shadow-orange-500/10 p-8 w-full max-w-md transform scale-100 animate-in fade-in zoom-in-95 duration-200">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('market.priceAlert')}</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('market.targetPrice')}
                  </label>
                  <input
                    type="number"
                    value={alertPrice}
                    onChange={(e) => setAlertPrice(e.target.value)}
                    placeholder={t('market.enterTargetPrice')}
                    className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all shadow-sm hover:shadow-md backdrop-blur-sm"
                  />
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t('market.current')}: ₹{marketPrice?.pricePerQuintal.toLocaleString()}/{t('market.quintal')} (₹{marketPrice?.pricePerKg}/{t('market.kg')})
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('market.alertCondition')}
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="above"
                        checked={alertCondition === 'above'}
                        onChange={(e) => setAlertCondition(e.target.value as 'above' | 'below')}
                        className="mr-2"
                      />
                      <span className="text-gray-900 dark:text-white">{t('market.notifyAbove')}</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="below"
                        checked={alertCondition === 'below'}
                        onChange={(e) => setAlertCondition(e.target.value as 'above' | 'below')}
                        className="mr-2"
                      />
                      <span className="text-gray-900 dark:text-white">{t('market.notifyBelow')}</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAlertModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={setPriceAlert}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all"
                >
                  {t('market.setAlert')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
