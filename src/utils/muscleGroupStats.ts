import { db } from '../db/database';
import { getPrimaryMuscles, getSecondaryMuscles } from './exerciseLibrary';

export interface MuscleCount {
  muscle: string;
  count: number;
}

export interface WorkoutMuscles {
  primary: MuscleCount[];
  secondary: MuscleCount[];
}

export interface MuscleFrequency {
  muscle: string;
  workoutCount: number;
  lastTrained: Date;
}

export async function getMusclesForWorkout(workoutId: string): Promise<WorkoutMuscles> {
  const instances = await db.exerciseInstances
    .where('workoutId')
    .equals(workoutId)
    .toArray();

  const primaryCounts = new Map<string, number>();
  const secondaryCounts = new Map<string, number>();

  for (const ex of instances) {
    for (const m of getPrimaryMuscles(ex.name)) {
      primaryCounts.set(m, (primaryCounts.get(m) ?? 0) + 1);
    }
    for (const m of getSecondaryMuscles(ex.name)) {
      secondaryCounts.set(m, (secondaryCounts.get(m) ?? 0) + 1);
    }
  }

  const toSorted = (map: Map<string, number>): MuscleCount[] =>
    [...map.entries()]
      .map(([muscle, count]) => ({ muscle, count }))
      .sort((a, b) => b.count - a.count);

  return {
    primary: toSorted(primaryCounts),
    secondary: toSorted(secondaryCounts),
  };
}

export async function getMuscleFrequency(days: number): Promise<MuscleFrequency[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const workouts = await db.workouts
    .where('startedAt')
    .above(since)
    .toArray();

  const completedWorkouts = workouts.filter(w => w.endedAt);

  const muscleToWorkouts = new Map<string, Set<string>>();
  const muscleLastTrained = new Map<string, Date>();

  for (const workout of completedWorkouts) {
    const instances = await db.exerciseInstances
      .where('workoutId')
      .equals(workout.id)
      .toArray();

    for (const ex of instances) {
      const muscles = [
        ...getPrimaryMuscles(ex.name),
        ...getSecondaryMuscles(ex.name),
      ];
      for (const m of muscles) {
        if (!muscleToWorkouts.has(m)) muscleToWorkouts.set(m, new Set());
        muscleToWorkouts.get(m)!.add(workout.id);

        const prev = muscleLastTrained.get(m);
        const workoutDate = new Date(workout.startedAt);
        if (!prev || workoutDate > prev) {
          muscleLastTrained.set(m, workoutDate);
        }
      }
    }
  }

  return [...muscleToWorkouts.entries()]
    .map(([muscle, workoutIds]) => ({
      muscle,
      workoutCount: workoutIds.size,
      lastTrained: muscleLastTrained.get(muscle)!,
    }))
    .sort((a, b) => b.workoutCount - a.workoutCount);
}
