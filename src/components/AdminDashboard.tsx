import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Users, MessageSquare, Activity, RefreshCw, ShieldAlert } from 'lucide-react';
import { getAdminMetrics } from '../services/api';

type AdminDashboardProps = {
  onBack: () => void;
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

export function AdminDashboard({ onBack }: AdminDashboardProps) {
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

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-green-600 p-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                <BarChart3 className="w-8 h-8" />
                Admin Dashboard
              </h1>
              <p className="text-green-100 mt-2">Monitor feature usage and user activity</p>
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
                onClick={onBack}
                className="bg-white text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors"
              >
                Back
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                <ShieldAlert className="w-5 h-5 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            {!metrics && !error && isLoading && (
              <div className="text-center py-10 text-gray-600 dark:text-gray-300">Loading metrics...</div>
            )}

            {metrics && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-600/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-700 dark:text-green-300" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Total Users</div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">{metrics.users.total}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-600/10 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-green-700 dark:text-green-300" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Total Chats</div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">{metrics.conversations.total}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-600/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-700 dark:text-green-300" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Unique Chat Users</div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">{metrics.conversations.uniqueUsers}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-600/10 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-green-700 dark:text-green-300" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Usage Events</div>
                        <div className="text-xl font-bold text-gray-900 dark:text-white">{metrics.usageEvents.total}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/30 border-b border-gray-200 dark:border-gray-700">
                      <div className="font-semibold text-gray-900 dark:text-white">Usage by Feature</div>
                    </div>
                    <div className="p-4">
                      {featureRows.length === 0 ? (
                        <div className="text-sm text-gray-500 dark:text-gray-400">No feature usage tracked yet.</div>
                      ) : (
                        <div className="space-y-3">
                          {featureRows.map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between">
                              <div className="text-sm text-gray-700 dark:text-gray-200">{key}</div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">{value}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/30 border-b border-gray-200 dark:border-gray-700">
                      <div className="font-semibold text-gray-900 dark:text-white">Usage by Page</div>
                    </div>
                    <div className="p-4">
                      {pageRows.length === 0 ? (
                        <div className="text-sm text-gray-500 dark:text-gray-400">No page usage tracked yet.</div>
                      ) : (
                        <div className="space-y-3">
                          {pageRows.map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between">
                              <div className="text-sm text-gray-700 dark:text-gray-200">{key}</div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">{value}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Tip: these counts increase only when users are signed in and the frontend sends tracking events.
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
