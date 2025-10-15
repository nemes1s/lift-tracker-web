import { Database, Shield } from 'lucide-react';

interface StorageInfoSectionProps {
  persisted: boolean;
  storageInfo: {
    usageInMB: number;
    quotaInMB: number;
    percentUsed: number;
  } | null;
}

export function StorageInfoSection({ persisted, storageInfo }: StorageInfoSectionProps) {
  return (
    <div className="card p-6 bg-white dark:bg-slate-800">
      <div className="flex items-center gap-2 mb-4">
        <Database className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        <h2 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Storage</h2>
      </div>

      <div className="space-y-4">
        {/* Persistence Status */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border-2 border-gray-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3">
            <Shield className={`w-6 h-6 ${persisted ? 'text-green-600 dark:text-green-500' : 'text-orange-600 dark:text-orange-500'}`} />
            <span className="font-bold text-gray-900 dark:text-gray-100">Persistent Storage</span>
          </div>
          <span className={`text-sm font-bold px-3 py-1.5 rounded-lg ${persisted ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'}`}>
            {persisted ? '✓ Enabled' : 'Not Enabled'}
          </span>
        </div>

        {!persisted && (
          <p className="text-xs text-gray-700 dark:text-gray-300 px-3 bg-orange-50 dark:bg-orange-900/20 py-2 rounded-lg border border-orange-100 dark:border-orange-800">
            Storage may be cleared when device runs low on space. Install the app for guaranteed persistence.
          </p>
        )}

        {/* Storage Usage */}
        {storageInfo && (
          <div className="space-y-3 bg-white/80 dark:bg-slate-900/50 p-4 rounded-xl">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300 font-semibold">Used</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">
                {storageInfo.usageInMB} MB / {storageInfo.quotaInMB} MB
              </span>
            </div>
            <div className="bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className="bg-primary-600 dark:bg-primary-500 h-full transition-all duration-500 shadow-glow"
                style={{ width: `${storageInfo.percentUsed}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              {storageInfo.percentUsed}% of available storage used
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
