import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Users, MessageSquare, Activity, RefreshCw, LogOut, Shield } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { signOut, auth } from '../lib/firebase';
import { getAdminMetrics } from '../services/api';

type DashboardProps = {
  user: FirebaseUser;
};

type AdminMetrics = {
  users: {
    total: number;
  };
  conversations: {
    total: number;
    uniqueUsers: number;
  };
  usageEvents: {
    total: number;
    uniqueUsers: number;
    byFeature: Record<string, number>;
    byPage: Record<string, number>;
  };
};

export default function Dashboard({ user }: DashboardProps) {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const featureRows = useMemo(() => {
    const entries = Object.entries(metrics?.usageEvents.byFeature || {});
    entries.sort((a, b) => b[1] - a[1]);
    return entries;
  }, [metrics]);

  const pageRows = useMemo(() => {
    const entries = Object.entries(metrics?.usageEvents.byPage || {});
    entries.sort((a, b) => b[1] - a[1]);
    return entries;
  }, [metrics]);

  const load = async () => {
    setIsLoading(true);
    setError('');

    try {
      const data = await getAdminMetrics();
      setMetrics(data);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Failed to load admin metrics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-green-600 p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                  <BarChart3 className="w-8 h-8" />
                  KrishiSahay Admin Dashboard
                </h1>
                <p className="text-green-100 mt-2">Monitor feature usage and user activity</p>
                <div className="mt-3 flex items-center gap-2 text-green-100 text-sm">
                  <Shield className="w-4 h-4" />
                  <span>Logged in as: {user.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={load}
                  disabled={isLoading}
                  className="bg-white/10 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/20 transition-colors disabled:opacity-60 flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-white text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                <Shield className="w-5 h-5 mt-0.5" />
                <div>
                  <div className="font-semibold">Error loading metrics</div>
                  <div className="mt-1">{error}</div>
                  {error.includes('403') && (
                    <div className="mt-2 text-xs">
                      Make sure your email is configured as ADMIN_EMAIL in the backend .env file
                    </div>
                  )}
                </div>
              </div>
            )}

            {!metrics && !error && isLoading && (
              <div className="text-center py-10 text-gray-600">
                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p>Loading metrics...</p>
              </div>
            )}

            {metrics && (
              <>
                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-green-700 font-medium">Total Users</div>
                        <div className="text-2xl font-bold text-green-900">{metrics.users.total}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-blue-700 font-medium">Total Chats</div>
                        <div className="text-2xl font-bold text-blue-900">{metrics.conversations.total}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-purple-700 font-medium">Unique Chat Users</div>
                        <div className="text-2xl font-bold text-purple-900">{metrics.conversations.uniqueUsers}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-orange-600 flex items-center justify-center">
                        <Activity className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-orange-700 font-medium">Usage Events</div>
                        <div className="text-2xl font-bold text-orange-900">{metrics.usageEvents.total}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Usage Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-5 py-4 bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                      <div className="font-semibold text-green-900 flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Usage by Feature
                      </div>
                    </div>
                    <div className="p-5">
                      {featureRows.length === 0 ? (
                        <div className="text-sm text-gray-500 text-center py-8">
                          No feature usage tracked yet
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {featureRows.map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              <div className="text-sm font-medium text-gray-700">{key}</div>
                              <div className="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">{value}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                      <div className="font-semibold text-blue-900 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Usage by Page
                      </div>
                    </div>
                    <div className="p-5">
                      {pageRows.length === 0 ? (
                        <div className="text-sm text-gray-500 text-center py-8">
                          No page usage tracked yet
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {pageRows.map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              <div className="text-sm font-medium text-gray-700">{key}</div>
                              <div className="text-sm font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">{value}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <div className="font-semibold mb-1">About this dashboard</div>
                      <div>This standalone admin dashboard runs on <span className="font-mono bg-blue-100 px-1 rounded">localhost:3001</span> and is completely separate from the main application. Usage counts increase when authenticated users interact with features.</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>KrishiSahay Admin Dashboard v1.0.0</p>
          <p className="mt-1">Running on localhost:3001</p>
        </div>
      </div>
    </div>
  );
}
