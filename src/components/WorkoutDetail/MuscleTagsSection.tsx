import { useEffect, useState } from 'react';
import type { WorkoutMuscles } from '../../utils/muscleGroupStats';
import { getMusclesForWorkout } from '../../utils/muscleGroupStats';

const MUSCLE_COLORS: Record<string, string> = {
  chest: '#6366f1',
  'middle back': '#8b5cf6',
  'lower back': '#a78bfa',
  lats: '#7c3aed',
  shoulders: '#3b82f6',
  biceps: '#f59e0b',
  triceps: '#ef4444',
  forearms: '#f97316',
  quadriceps: '#10b981',
  hamstrings: '#059669',
  glutes: '#14b8a6',
  calves: '#06b6d4',
  abdominals: '#ec4899',
  neck: '#94a3b8',
  traps: '#64748b',
  abductors: '#22d3ee',
  adductors: '#4ade80',
};

function muscleColor(muscle: string): string {
  return MUSCLE_COLORS[muscle.toLowerCase()] ?? '#94a3b8';
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

interface Props {
  workoutId: string;
}

export function MuscleTagsSection({ workoutId }: Props) {
  const [muscles, setMuscles] = useState<WorkoutMuscles | null>(null);

  useEffect(() => {
    getMusclesForWorkout(workoutId).then(setMuscles);
  }, [workoutId]);

  if (!muscles || (muscles.primary.length === 0 && muscles.secondary.length === 0)) {
    return null;
  }

  return (
    <div className="card p-5 bg-white dark:bg-slate-800">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Muscles Worked</h3>

      {muscles.primary.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Primary</p>
          <div className="flex flex-wrap gap-1.5">
            {muscles.primary.map(({ muscle }) => (
              <span
                key={muscle}
                className="text-xs font-medium px-2.5 py-1 rounded-full text-white"
                style={{ backgroundColor: muscleColor(muscle) }}
              >
                {capitalize(muscle)}
              </span>
            ))}
          </div>
        </div>
      )}

      {muscles.secondary.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Secondary</p>
          <div className="flex flex-wrap gap-1.5">
            {muscles.secondary.map(({ muscle }) => (
              <span
                key={muscle}
                className="text-xs font-medium px-2.5 py-1 rounded-full border"
                style={{
                  borderColor: muscleColor(muscle),
                  color: muscleColor(muscle),
                }}
              >
                {capitalize(muscle)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
