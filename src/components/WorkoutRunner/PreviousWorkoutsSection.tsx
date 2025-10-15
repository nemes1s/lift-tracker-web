import type { Workout, SetRecord } from '../../types/models';

interface PreviousWorkoutsSectionProps {
  history: Array<{ workout: Workout; sets: SetRecord[] }>;
  onPrefillSet: (weight: number, reps: number, rpe?: number) => void;
}

export function PreviousWorkoutsSection({ history, onPrefillSet }: PreviousWorkoutsSectionProps) {
  if (history.length === 0) return null;

  return (
    <div className="card p-5 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-gray-900 text-lg">Previous Workouts</h4>
        <span className="text-xs text-primary-600 font-semibold bg-primary-50 px-3 py-1 rounded-full">Tap to prefill</span>
      </div>
      <div className="space-y-3">
        {history.map((item, idx) => (
          <div key={idx} className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-gray-800">
                {new Date(item.workout.startedAt).toLocaleDateString()}
              </span>
              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">{item.workout.name}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {item.sets.map((set) => (
                <button
                  key={set.id}
                  onClick={() => onPrefillSet(set.weight, set.reps, set.rpe)}
                  className="px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-sm font-medium hover:border-primary-300 hover:bg-primary-50 transition-all transform hover:scale-105"
                >
                  {set.weight}kg × {set.reps}
                  {set.rpe && <span className="text-orange-600 ml-1">@{set.rpe}</span>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
