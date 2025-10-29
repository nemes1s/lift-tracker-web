import { Trash2 } from 'lucide-react';
import type { Workout } from '../../types/models';

interface SelectedDayWorkoutsSectionProps {
  selectedDate: Date | null;
  workouts: Workout[];
  onWorkoutClick: (workoutId: string) => void;
  onDeleteWorkout: (workoutId: string, e: React.MouseEvent) => void;
}

export function SelectedDayWorkoutsSection({
  selectedDate,
  workouts,
  onWorkoutClick,
  onDeleteWorkout
}: SelectedDayWorkoutsSectionProps) {
  if (!selectedDate) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </h2>
        {workouts.length > 0 && (
          <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-3 py-1.5 rounded-full">
            {workouts.length} workout{workouts.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {workouts.length === 0 ? (
        <div className="card p-6 text-center bg-gray-50 dark:bg-slate-800">
          <p className="text-gray-600 dark:text-gray-400">No workouts on this day</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.map((workout) => (
            <div
              key={workout.id}
              className="w-full card p-5 bg-white dark:bg-slate-800 hover:shadow-xl transition-all transform hover:-translate-y-0.5 relative group"
            >
              <div
                onClick={() => onWorkoutClick(workout.id)}
                className="w-full text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{workout.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(workout.startedAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <button
                      onClick={(e) => onDeleteWorkout(workout.id, e)}
                      className="p-1 text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                      title="Delete workout"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  {workout.endedAt ? (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-2 border-green-200 dark:border-green-800">
                      ✓ Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-2 border-yellow-200 dark:border-yellow-800 animate-pulse-slow">
                      ⏱ In Progress
                    </span>
                  )}
                  {workout.isQuickWorkout && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-2 border-blue-200 dark:border-blue-800">
                      ⚡ Quick
                    </span>
                  )}
                  {workout.programNameSnapshot && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-lg">{workout.programNameSnapshot}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
