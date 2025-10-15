import { BarChart3 } from 'lucide-react';
import { CollapsibleCard } from '../CollapsibleCard';
import { formatVolume } from '../../utils/workoutStats';
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
          <div className="bg-primary-50 rounded-xl p-4">
            <p className="text-sm font-bold text-gray-600 mb-1">This Week</p>
            <p className="text-2xl font-bold text-primary-700">{weeklyComparison.thisWeekWorkouts} workouts</p>
            <p className="text-sm text-gray-600 mt-1">{formatVolume(weeklyComparison.thisWeekVolume)} kg volume</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-bold text-gray-600 mb-1">Last Week</p>
            <p className="text-2xl font-bold text-gray-700">{weeklyComparison.lastWeekWorkouts} workouts</p>
            <p className="text-sm text-gray-600 mt-1">{formatVolume(weeklyComparison.lastWeekVolume)} kg volume</p>
          </div>
        </div>

        {weeklyComparison.lastWeekVolume > 0 && (
          <div className={`p-4 rounded-xl ${
            weeklyComparison.change >= 0 ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <p className="text-sm font-bold text-gray-600 mb-1">Volume Change</p>
            <p className={`text-2xl font-bold ${
              weeklyComparison.change >= 0 ? 'text-green-700' : 'text-red-700'
            }`}>
              {weeklyComparison.change >= 0 ? '+' : ''}{weeklyComparison.change.toFixed(1)}%
            </p>
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
}
