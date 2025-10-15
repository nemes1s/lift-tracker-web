import { TrendingUp } from 'lucide-react';

interface EmptyStatesProps {
  hasExercises: boolean;
  hasProgressData: boolean;
  loading: boolean;
}

export function EmptyStates({ hasExercises, hasProgressData, loading }: EmptyStatesProps) {
  if (loading) return null;

  if (hasExercises && !hasProgressData) {
    return (
      <div className="card p-12 text-center bg-white dark:bg-slate-800">
        <div className="bg-gray-100 dark:bg-slate-700 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
          <TrendingUp className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-3">No Data Yet</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Complete workouts to see your progress for this exercise.
        </p>
      </div>
    );
  }

  if (!hasExercises) {
    return (
      <div className="card p-12 text-center bg-white dark:bg-slate-800">
        <div className="bg-primary-100 dark:bg-primary-900/30 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-lg">
          <TrendingUp className="w-12 h-12 text-primary-700 dark:text-primary-400" />
        </div>
        <h2 className="text-2xl font-bold text-primary-700 dark:text-primary-400 mb-3">
          No Workout History
        </h2>
        <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
          Start tracking your workouts to see progress over time.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 bg-white/60 dark:bg-slate-900/60 px-4 py-2 rounded-lg inline-block mt-4">
          Complete your first workout to get started!
        </p>
      </div>
    );
  }

  return null;
}
