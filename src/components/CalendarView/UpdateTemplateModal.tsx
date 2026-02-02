import type { ExerciseInstance } from '../../types/models';

interface UpdateTemplateModalProps {
  workoutName: string;
  exercises: ExerciseInstance[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function UpdateTemplateModal({
  workoutName,
  exercises,
  onConfirm,
  onCancel,
}: UpdateTemplateModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="card p-6 max-w-md w-full bg-white dark:bg-slate-800 animate-slideUp max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-primary-700 dark:text-primary-400 mb-3">
          Update Program Template?
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4 font-medium">
          This will update the <span className="text-primary-600 dark:text-primary-400 font-bold">"{workoutName}"</span> template in your program with the exercises from this workout.
        </p>

        <div className="mb-4 p-3 bg-gray-100 dark:bg-slate-700/50 rounded-xl">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-semibold">
            New template will include:
          </p>
          <ul className="space-y-1">
            {exercises.map((ex, idx) => (
              <li
                key={ex.id}
                className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2"
              >
                <span className="text-primary-600 dark:text-primary-400 font-bold">
                  {idx + 1}.
                </span>
                <span className="font-medium">{ex.name}</span>
                <span className="text-gray-500 dark:text-gray-500 text-xs">
                  ({ex.targetSets} × {ex.targetReps || '?'})
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-amber-600 dark:text-amber-400 mb-6 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
          Future workouts for this day will use these exercises. This won't affect past workouts.
        </p>

        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Update Template
          </button>
        </div>
      </div>
    </div>
  );
}
