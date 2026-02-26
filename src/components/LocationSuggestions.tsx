import { useState, useEffect } from 'react';
import { MapPin, Cloud, Droplets, Thermometer, AlertTriangle, TrendingUp, CheckCircle, Search } from 'lucide-react';
import { LocationService } from '../services/locationService';
import { useLanguage } from '../contexts/LanguageContext';

interface LocationSuggestion {
  location: {
    city: string;
    state: string;
    country: string;
    region: string;
  };
  weather: {
    temperature: number;
    humidity: number;
    rainfall: number;
    season: string;
  };
  recommendedCrops: Array<{
    crop: string;
    season: string;
    reason: string;
    confidence: number;
  }>;
  commonDiseases: string[];
  farmingTips: string[];
}

export function LocationSuggestions() {
  const { t } = useLanguage();
  const [suggestions, setSuggestions] = useState<LocationSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const locationService = LocationService.getInstance();

  useEffect(() => {
    loadLocationSuggestions();
  }, []);

  const loadLocationSuggestions = async () => {
    setLoading(true);
    setError(null);

    try {
      // Clear any existing location to force fresh detection
      await locationService.setCurrentLocation(null);

      // Get fresh location suggestions
      const locationSuggestions = await locationService.getLocationSuggestions();
      setSuggestions(locationSuggestions);
    } catch (err) {
      setError('Unable to get location suggestions. Please enable location access or search manually.');
      console.error('Location error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await locationService.searchLocation(query);
      console.log('Search results:', results); // Debug log
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    }
  };

  const selectLocation = async (location: any) => {
    console.log('Selected location:', location); // Debug log
    setShowLocationModal(false);
    setSearchQuery('');
    setSearchResults([]);
    setLoading(true);

    try {
      // Use the LocationService to get proper suggestions for the selected location
      const locationData = {
        latitude: location.lat,
        longitude: location.lon,
        city: location.name,
        state: location.state,
        country: location.country,
        region: location.region
      };

      console.log('Setting location data:', locationData); // Debug log

      // Set the location in the service
      await locationService.setCurrentLocation(locationData);

      // Get suggestions for the selected location
      const locationSuggestions = await locationService.getLocationSuggestions();
      console.log('Got suggestions:', locationSuggestions); // Debug log
      setSuggestions(locationSuggestions);
    } catch (err) {
      setError('Failed to load suggestions for selected location');
      console.error('Location selection error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeasonColor = (season: string) => {
    const colors = {
      summer: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      monsoon: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      winter: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      spring: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    };
    return colors[season as keyof typeof colors] || colors.summer;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    if (confidence >= 0.8) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">{t('location.gettingSuggestions')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-2">{t('location.accessRequired')}</h2>
            <p className="text-red-700 dark:text-red-300 mb-6">{error}</p>
            <button
              onClick={() => setShowLocationModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {t('location.searchManually')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!suggestions) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-900 py-8 transition-colors relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-emerald-400/20 dark:bg-emerald-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-50 -z-0"></div>
      <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-teal-400/20 dark:bg-teal-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-50 -z-0"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-[2rem] mb-6 shadow-lg shadow-emerald-500/30 transform rotate-3 hover:rotate-6 transition-transform">
            <MapPin className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 mb-3 drop-shadow-sm">{t('location.title')}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{t('location.subtitle')}</p>
        </div>

        {/* Location Info */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/50 dark:border-slate-800 rounded-3xl shadow-xl p-8 mb-8 hover:shadow-2xl transition-shadow duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {suggestions.location.city}, {suggestions.location.state}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">{suggestions.location.country} • {suggestions.location.region} {t('location.region')}</p>
              </div>
            </div>
            <button
              onClick={() => setShowLocationModal(true)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              {t('location.changeLocation')}
            </button>
          </div>

          {/* Weather Conditions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('location.temperature')}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{suggestions.weather.temperature}°C</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('location.humidity')}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{suggestions.weather.humidity}%</p>
            </div>
            <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Cloud className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('location.rainfall')}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{suggestions.weather.rainfall}mm</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('location.season')}</span>
              </div>
              <p className={`text-lg font-bold px-3 py-1 rounded-full ${getSeasonColor(suggestions.weather.season)}`}>
                {suggestions.weather.season}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recommended Crops */}
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/50 dark:border-slate-800 rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl"></div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              {t('location.recommendedCrops')}
            </h3>
            <div className="space-y-4">
              {suggestions.recommendedCrops.map((crop, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{crop.crop}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{crop.season} season</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(crop.confidence)}`}>
                      {Math.round(crop.confidence * 100)}% {t('location.match')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{crop.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Diseases and Tips */}
          <div className="space-y-6">
            {/* Common Diseases */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/50 dark:border-slate-800 rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl"></div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                {t('location.commonDiseases')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {suggestions.commonDiseases.map((disease, index) => (
                  <span key={index} className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-3 py-1 rounded-full text-sm">
                    {disease}
                  </span>
                ))}
              </div>
            </div>

            {/* Farming Tips */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/50 dark:border-slate-800 rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                {t('location.farmingTips')}
              </h3>
              <ul className="space-y-2">
                {suggestions.farmingTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Location Search Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/20 dark:border-slate-700/50 rounded-3xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.3)] shadow-emerald-500/10 p-8 w-full max-w-md transform scale-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('location.searchLocation')}</h3>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleLocationSearch(e.target.value);
                }}
                placeholder={t('location.searchPlaceholder')}
                className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all shadow-sm hover:shadow-md backdrop-blur-sm"
                autoFocus
              />
            </div>

            {searchResults.length > 0 && (
              <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                {searchResults.map((location, index) => (
                  <button
                    key={index}
                    onClick={() => selectLocation(location)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">{location.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{location.state}, {location.country}</div>
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowLocationModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={loadLocationSuggestions}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all font-semibold shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5"
              >
                {t('location.useCurrent')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
