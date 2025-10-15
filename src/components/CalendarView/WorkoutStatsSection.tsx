import { Activity, Flame, Zap, Clock } from 'lucide-react';
import { formatVolume, formatRPE, formatDuration } from '../../utils/workoutStats';

interface WorkoutStats {
  totalVolume: number;
  estimatedCalories: number;
  averageRPE: number;
  duration: number;
}

interface WorkoutStatsSectionProps {
  stats: WorkoutStats;
  hasEndTime: boolean;
}

export function WorkoutStatsSection({ stats, hasEndTime }: WorkoutStatsSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-3 mt-5">
      <div className="bg-gradient-to-br from-primary-50 to-white dark:from-primary-900/30 dark:to-slate-800 rounded-xl p-4 border-2 border-primary-100 dark:border-primary-800 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Total Volume</span>
        </div>
        <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">{formatVolume(stats.totalVolume)} kg</p>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/30 dark:to-slate-800 rounded-xl p-4 border-2 border-orange-100 dark:border-orange-800 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Est. Calories</span>
        </div>
        <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">~{stats.estimatedCalories} kcal</p>
      </div>

      {stats.averageRPE > 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/30 dark:to-slate-800 rounded-xl p-4 border-2 border-purple-100 dark:border-purple-800 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Avg. Effort</span>
          </div>
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">RPE {formatRPE(stats.averageRPE)}</p>
        </div>
      )}

      {hasEndTime && (
        <div className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/30 dark:to-slate-800 rounded-xl p-4 border-2 border-blue-100 dark:border-blue-800 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Duration</span>
          </div>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{formatDuration(stats.duration)}</p>
        </div>
      )}
    </div>
  );
}
