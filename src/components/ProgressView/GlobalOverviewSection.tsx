import { Trophy, Zap, Activity, Flame, Calendar, Target } from 'lucide-react';
import { CollapsibleCard } from '../CollapsibleCard';
import { formatVolume, formatDuration } from '../../utils/workoutStats';
import type { GlobalStats } from '../../utils/globalStats';

interface GlobalOverviewSectionProps {
  globalStats: GlobalStats | null;
}

export function GlobalOverviewSection({ globalStats }: GlobalOverviewSectionProps) {
  if (!globalStats || globalStats.totalWorkouts === 0) return null;

  return (
    <CollapsibleCard
      title="Global Overview"
      icon={<Trophy className="w-6 h-6" />}
      defaultOpen={true}
      badge={`${globalStats.totalWorkouts} workouts`}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
        <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-4 border-2 border-primary-100">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-primary-600" />
            <span className="text-xs font-bold text-gray-600 uppercase">Current Streak</span>
          </div>
          <p className="text-2xl font-bold text-primary-700">{globalStats.currentStreak} days</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-4 border-2 border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-green-600" />
            <span className="text-xs font-bold text-gray-600 uppercase">Longest Streak</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{globalStats.longestStreak} days</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl p-4 border-2 border-orange-100">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-orange-600" />
            <span className="text-xs font-bold text-gray-600 uppercase">Total Volume</span>
          </div>
          <p className="text-2xl font-bold text-orange-700">{(globalStats.totalVolume / 1000).toFixed(1)}t</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-white rounded-xl p-4 border-2 border-red-100">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-red-600" />
            <span className="text-xs font-bold text-gray-600 uppercase">Total Calories</span>
          </div>
          <p className="text-2xl font-bold text-red-700">{formatVolume(globalStats.totalCalories)}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border-2 border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-bold text-gray-600 uppercase">Avg Duration</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">{formatDuration(globalStats.averageDuration)}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-4 border-2 border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-purple-600" />
            <span className="text-xs font-bold text-gray-600 uppercase">Days Training</span>
          </div>
          <p className="text-2xl font-bold text-purple-700">{globalStats.daysTraining}</p>
        </div>
      </div>
    </CollapsibleCard>
  );
}
