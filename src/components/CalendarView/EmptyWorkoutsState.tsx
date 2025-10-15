import { Dumbbell } from 'lucide-react';

export function EmptyWorkoutsState() {
  return (
    <div className="card p-10 text-center bg-gray-50 dark:bg-slate-800">
      <div className="bg-gray-100 dark:bg-slate-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
        <Dumbbell className="w-10 h-10 text-gray-400" />
      </div>
      <p className="text-gray-600 dark:text-gray-300 font-medium">No workouts yet</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Start your first workout today!</p>
    </div>
  );
}
