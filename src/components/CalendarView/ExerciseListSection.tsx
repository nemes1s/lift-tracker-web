import { estimate1RM } from '../../utils/oneRM';

interface SetRecord {
  id: string;
  weight: number;
  reps: number;
  rpe?: number;
  isWarmup?: boolean;
  timestamp: Date;
}

interface ExerciseWithSets {
  id: string;
  name: string;
  sets: SetRecord[];
}

interface ExerciseListSectionProps {
  exercises: ExerciseWithSets[];
  exercise1RMChanges: Map<string, any>;
}

export function ExerciseListSection({ exercises, exercise1RMChanges }: ExerciseListSectionProps) {
  return (
    <div className="space-y-4">
      {exercises.map((exercise) => {
        const best1RM =
          exercise.sets.length > 0
            ? Math.max(
                ...exercise.sets.map((s: any) =>
                  estimate1RM(s.weight, s.reps, 'epley')
                )
              )
            : 0;

        return (
          <div key={exercise.id} className="card p-5 bg-white dark:bg-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                {exercise.name}
              </h3>
              <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-full">
                {exercise.sets.length} sets
              </span>
            </div>

            <div className="space-y-2">
              {exercise.sets.map((set: any, idx: number) => (
                <div
                  key={set.id}
                  className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-slate-700 rounded-xl border border-gray-100 dark:border-slate-600"
                >
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Set {idx + 1}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900 dark:text-gray-100">{set.weight} kg</span>
                    <span className="text-gray-400">×</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">{set.reps} reps</span>
                    {set.rpe && (
                      <span className="text-sm font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded-lg">
                        @{set.rpe}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {best1RM > 0 && (
              <div className="mt-4 bg-primary-50 dark:bg-primary-900/30 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Best est. 1RM: <span className="text-primary-700 dark:text-primary-400 text-lg">{Math.round(best1RM)} kg</span>
                  </p>
                  {(() => {
                    const change1RM = exercise1RMChanges.get(exercise.id);
                    if (change1RM && change1RM.previous1RM !== null) {
                      const changeValue = change1RM.change;
                      const isPositive = changeValue > 0;
                      const isNeutral = Math.abs(changeValue) < 0.5;

                      return (
                        <div className={`flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-lg ${
                          isNeutral ? 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300' :
                          isPositive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          <span>
                            {isPositive ? '+' : ''}{Math.round(changeValue)} kg
                          </span>
                          <span className="text-xs">
                            {isNeutral ? '→' : isPositive ? '↗' : '↘'}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
