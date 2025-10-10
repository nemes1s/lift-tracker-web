import { TrendingUp } from 'lucide-react';

export function ProgressView() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="card p-6 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-600 rounded-2xl shadow-lg">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-700">
                Progress
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">Track your gains over time</p>
            </div>
          </div>
        </div>

        {/* Coming Soon Card */}
        <div className="card p-12 text-center bg-white">
          <div className="bg-primary-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <TrendingUp className="w-12 h-12 text-primary-700" />
          </div>
          <h2 className="text-2xl font-bold text-primary-700 mb-3">
            Progress Tracking
          </h2>
          <p className="text-gray-700 font-medium mb-2">
            Track your strength gains and personal records over time.
          </p>
          <p className="text-sm text-gray-600 bg-white/60 px-4 py-2 rounded-lg inline-block mt-4">
            Coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
