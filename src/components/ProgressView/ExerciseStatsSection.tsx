import { Dumbbell, Award, BarChart3, Calendar, Target } from 'lucide-react';
import { CollapsibleCard } from '../CollapsibleCard';
import type { ExerciseStats } from '../../utils/progressTracking';

interface ExerciseStatsSectionProps {
  stats: ExerciseStats | null;
  consistency: number | null;
}

export function ExerciseStatsSection({ stats, consistency }: ExerciseStatsSectionProps) {
  if (!stats) return null;

  return (
    <CollapsibleCard
      title="Exercise Stats"
      icon={<Dumbbell className="w-6 h-6" />}
      defaultOpen={true}
      badge={stats.workoutCount}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
        {/* Max Weight */}
        <div className="card p-4 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-primary-600" />
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Max Weight
            </span>
          </div>
          <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">{stats.maxWeight}kg</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {stats.maxWeightDate.toLocaleDateString()}
          </p>
        </div>

        {/* Best 1RM */}
        <div className="card p-4 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2 mb-2">
            <Dumbbell className="w-5 h-5 text-green-600" />
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Est. 1RM
            </span>
          </div>
          <p className="text-2xl font-bold text-green-700 dark:text-green-500">
            {Math.round(stats.bestOneRepMax)}kg
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {stats.bestOneRepMaxDate.toLocaleDateString()}
          </p>
        </div>

        {/* Total Volume */}
        <div className="card p-4 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-orange-600" />
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Total Volume
            </span>
          </div>
          <p className="text-2xl font-bold text-orange-700 dark:text-orange-500">
            {(stats.totalVolume / 1000).toFixed(1)}t
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stats.totalSets} sets</p>
        </div>

        {/* Workouts */}
        <div className="card p-4 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              Workouts
            </span>
          </div>
          <p className="text-2xl font-bold text-purple-700 dark:text-purple-500">{stats.workoutCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {stats.firstWorkoutDate.toLocaleDateString()}
          </p>
        </div>

        {/* Consistency Score */}
        {consistency !== null && (
          <div className="card p-4 bg-white dark:bg-slate-900 md:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-teal-600" />
              <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Consistency
              </span>
            </div>
            <p className="text-2xl font-bold text-teal-700 dark:text-teal-500">
              Every {consistency.toFixed(1)} days
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Average frequency</p>
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
}
