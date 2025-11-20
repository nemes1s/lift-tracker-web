import { BarChart3 } from 'lucide-react';
import { CollapsibleCard } from '../CollapsibleCard';
import { formatVolume, formatDuration } from '../../utils/workoutStats';
import type { WeeklyComparison } from '../../utils/globalStats';

interface WeeklyComparisonSectionProps {
  weeklyComparison: WeeklyComparison | null;
}

export function WeeklyComparisonSection({ weeklyComparison }: WeeklyComparisonSectionProps) {
  if (!weeklyComparison || weeklyComparison.thisWeekWorkouts === 0) return null;

  return (
    <CollapsibleCard
      title="Weekly Comparison"
      icon={<BarChart3 className="w-6 h-6" />}
      defaultOpen={false}
    >
      <div className="space-y-4 mt-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary-50 dark:bg-primary-900/30 rounded-xl p-4">
            <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">This Week</p>
            <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">{weeklyComparison.thisWeekWorkouts} workouts</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{formatVolume(weeklyComparison.thisWeekVolume)} kg volume</p>
          </div>

          <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
            <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">Last Week</p>
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{weeklyComparison.lastWeekWorkouts} workouts</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{formatVolume(weeklyComparison.lastWeekVolume)} kg volume</p>
          </div>
        </div>

        {weeklyComparison.lastWeekVolume > 0 && (
          <div className={`p-4 rounded-xl ${
            weeklyComparison.change >= 0 ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'
          }`}>
            <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">Volume Change</p>
            <p className={`text-2xl font-bold ${
              weeklyComparison.change >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
            }`}>
              {weeklyComparison.change >= 0 ? '+' : ''}{weeklyComparison.change.toFixed(1)}%
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary-50 dark:bg-primary-900/30 rounded-xl p-4">
            <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">Avg Duration (This Week)</p>
            <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">{formatDuration(weeklyComparison.thisWeekAvgDuration)}</p>
          </div>

          <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
            <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">Avg Duration (Last Week)</p>
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{formatDuration(weeklyComparison.lastWeekAvgDuration)}</p>
          </div>
        </div>

        {weeklyComparison.lastWeekAvgDuration > 0 && (
          <div className={`p-4 rounded-xl ${
            weeklyComparison.durationChange >= 0 ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-orange-50 dark:bg-orange-900/30'
          }`}>
            <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">Duration Change</p>
            <p className={`text-2xl font-bold ${
              weeklyComparison.durationChange >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-orange-700 dark:text-orange-400'
            }`}>
              {weeklyComparison.durationChange >= 0 ? '+' : ''}{weeklyComparison.durationChange.toFixed(1)}%
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary-50 dark:bg-primary-900/30 rounded-xl p-4">
            <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">Volume/Hour (This Week)</p>
            <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">{weeklyComparison.thisWeekVolumePerHour} kg/h</p>
          </div>

          <div className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4">
            <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">Volume/Hour (Last Week)</p>
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{weeklyComparison.lastWeekVolumePerHour} kg/h</p>
          </div>
        </div>

        {weeklyComparison.lastWeekVolumePerHour > 0 && (
          <div className={`p-4 rounded-xl ${
            weeklyComparison.volumePerHourChange >= 0 ? 'bg-purple-50 dark:bg-purple-900/30' : 'bg-amber-50 dark:bg-amber-900/30'
          }`}>
            <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">Volume/Hour Change</p>
            <p className={`text-2xl font-bold ${
              weeklyComparison.volumePerHourChange >= 0 ? 'text-purple-700 dark:text-purple-400' : 'text-amber-700 dark:text-amber-400'
            }`}>
              {weeklyComparison.volumePerHourChange >= 0 ? '+' : ''}{weeklyComparison.volumePerHourChange.toFixed(1)}%
            </p>
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
}
