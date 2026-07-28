import { Activity, Flame, Zap, Clock, Check, ArrowRight } from 'lucide-react';
import { formatVolume, formatRPE, formatDuration } from '../../utils/workoutStats';
import type { ExerciseInstance, SetRecord } from '../../types/models';
import { getSupersetLabel } from '../../utils/supersets';

interface WorkoutStats {
  totalVolume: number;
  estimatedCalories: number;
  averageRPE: number;
  duration: number;
}

interface WorkoutOverviewSectionProps {
  stats: WorkoutStats;
  exercises: ExerciseInstance[];
  exercisesWithSets: Array<{ sets: SetRecord[] }>;
  currentIndex: number;
  onSelectExercise: (index: number) => void;
}

export function WorkoutOverviewSection({
  stats,
  exercises,
  exercisesWithSets,
  currentIndex,
  onSelectExercise,
}: WorkoutOverviewSectionProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Workout Overview</h4>

      <div className="space-y-1.5">
        {exercises.map((exercise, idx) => {
          const setsLogged = exercisesWithSets[idx]?.sets.length ?? 0;
          const isCurrent = idx === currentIndex;
          const isComplete = exercise.targetSets > 0 && setsLogged >= exercise.targetSets;
          const supersetLabel = getSupersetLabel(exercises, idx);

          return (
            <button
              key={exercise.id}
              onClick={() => onSelectExercise(idx)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                isCurrent
                  ? 'bg-primary-50 dark:bg-primary-900/30 border-2 border-primary-300 dark:border-primary-600'
                  : 'bg-white dark:bg-slate-900 border-2 border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600'
              }`}
            >
              <span className="w-5 shrink-0 flex items-center justify-center">
                {isCurrent ? (
                  <ArrowRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                ) : isComplete ? (
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500">{idx + 1}</span>
                )}
              </span>
              {supersetLabel && (
                <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                  {supersetLabel}
                </span>
              )}
              <span
                className={`flex-1 min-w-0 truncate text-sm ${
                  isCurrent
                    ? 'font-bold text-gray-900 dark:text-gray-100'
                    : 'font-medium text-gray-700 dark:text-gray-300'
                }`}
              >
                {exercise.name}
              </span>
              <span className="shrink-0 text-xs font-semibold text-gray-400 dark:text-gray-500">
                {setsLogged}/{exercise.targetSets}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-3 border-2 border-primary-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-primary-600" />
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Volume</span>
          </div>
          <p className="text-xl font-bold text-primary-700">{formatVolume(stats.totalVolume)} kg</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl p-3 border-2 border-orange-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Calories</span>
          </div>
          <p className="text-xl font-bold text-orange-700">~{stats.estimatedCalories}</p>
        </div>

        {stats.averageRPE > 0 && (
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-3 border-2 border-purple-100 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Avg RPE</span>
            </div>
            <p className="text-xl font-bold text-purple-700">{formatRPE(stats.averageRPE)}</p>
          </div>
        )}

        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-3 border-2 border-blue-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Duration</span>
          </div>
          <p className="text-xl font-bold text-blue-700">{formatDuration(stats.duration)}</p>
        </div>
      </div>
    </div>
  );
}
