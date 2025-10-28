import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { estimate1RM } from '../../utils/oneRM';
import { db } from '../../db/database';
import { v4 as uuidv4 } from 'uuid';

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
  workoutId?: string;
  onSetLogged?: () => void;
}

export function ExerciseListSection({ exercises, exercise1RMChanges, workoutId, onSetLogged }: ExerciseListSectionProps) {
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [rpe, setRpe] = useState('');

  const handleLogSet = async (exerciseId: string) => {
    if (!workoutId || !weight || !reps) {
      alert('Please enter weight and reps');
      return;
    }

    try {
      const set = {
        id: uuidv4(),
        exerciseId,
        weight: parseFloat(weight),
        reps: parseInt(reps),
        rpe: rpe ? parseFloat(rpe) : undefined,
        timestamp: new Date(),
        isWarmup: false,
      };

      await db.setRecords.add(set);

      // Clear inputs
      setWeight('');
      setReps('');
      setRpe('');
      setExpandedExerciseId(null);

      // Trigger refresh
      if (onSetLogged) {
        onSetLogged();
      }
    } catch (error) {
      console.error('Error logging set:', error);
      alert('Failed to log set');
    }
  };

  const handleDeleteSet = async (setId: string) => {
    try {
      await db.setRecords.delete(setId);
      if (onSetLogged) {
        onSetLogged();
      }
    } catch (error) {
      console.error('Error deleting set:', error);
      alert('Failed to delete set');
    }
  };
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
                    {workoutId && (
                      <button
                        onClick={() => handleDeleteSet(set.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 dark:text-red-400 transition-colors"
                        title="Delete set"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {workoutId && (
              <div className="mt-4">
                <button
                  onClick={() => setExpandedExerciseId(expandedExerciseId === exercise.id ? null : exercise.id)}
                  className="w-full flex items-center justify-between py-2 px-4 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg text-emerald-700 dark:text-emerald-400 font-semibold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Log New Set
                  </span>
                  {expandedExerciseId === exercise.id ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {expandedExerciseId === exercise.id && (
                  <div className="mt-3 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="e.g., 50.5"
                        className="w-full px-3 py-2 border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-500 dark:focus:border-primary-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Reps
                      </label>
                      <input
                        type="number"
                        value={reps}
                        onChange={(e) => setReps(e.target.value)}
                        placeholder="e.g., 8"
                        className="w-full px-3 py-2 border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-500 dark:focus:border-primary-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        RPE (optional)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="6"
                        max="10"
                        value={rpe}
                        onChange={(e) => setRpe(e.target.value)}
                        placeholder="e.g., 8"
                        className="w-full px-3 py-2 border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary-500 dark:focus:border-primary-400"
                      />
                    </div>

                    <button
                      onClick={() => handleLogSet(exercise.id)}
                      disabled={!weight || !reps}
                      className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                    >
                      Log Set
                    </button>
                  </div>
                )}
              </div>
            )}

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
