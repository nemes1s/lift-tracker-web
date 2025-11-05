import { db } from '../db/database';
import type { Program, Workout, SetRecord } from '../types/models';
import { estimate1RM } from './oneRM';

export interface ExerciseStats {
  exerciseName: string;
  totalWorkouts: number;
  totalSets: number;
  totalVolume: number; // kg
  bestWeight: number;
  best1RM: number;
  firstWorkoutDate: Date;
  lastWorkoutDate: Date;
  progressData: ExerciseProgressPoint[];
}

export interface ExerciseProgressPoint {
  date: Date;
  weight: number;
  reps: number;
  volume: number;
  oneRepMax: number;
  workoutName: string;
}

export interface ProgramStats {
  program: Program;
  totalWorkouts: number;
  totalVolume: number;
  totalSets: number;
  dateRange: {
    start: Date;
    end: Date;
  };
  exerciseStats: ExerciseStats[];
}

/**
 * Aggregate all training statistics for a program
 * This includes all exercises and their progress over time
 */
export async function aggregateProgramStats(programId: string): Promise<ProgramStats> {
  // Get the program
  const program = await db.programs.get(programId);
  if (!program) {
    throw new Error(`Program not found: ${programId}`);
  }

  // Get all completed workouts for this program
  const allWorkouts = await db.workouts.toArray();
  const programWorkouts = allWorkouts
    .filter(w => w.programNameSnapshot === program.name && w.endedAt !== undefined)
    .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());

  if (programWorkouts.length === 0) {
    // No workouts yet
    return {
      program,
      totalWorkouts: 0,
      totalVolume: 0,
      totalSets: 0,
      dateRange: {
        start: program.startDate,
        end: program.startDate,
      },
      exerciseStats: [],
    };
  }

  // Aggregate exercise data across all workouts
  const exerciseDataMap = new Map<string, {
    workouts: Set<string>;
    sets: Array<{ set: SetRecord; workout: Workout }>;
  }>();

  let totalVolume = 0;
  let totalSets = 0;

  // Collect all exercise data
  for (const workout of programWorkouts) {
    const exerciseInstances = await db.exerciseInstances
      .where('workoutId')
      .equals(workout.id)
      .toArray();

    for (const exercise of exerciseInstances) {
      const sets = await db.setRecords
        .where('exerciseId')
        .equals(exercise.id)
        .toArray();

      const workingSets = sets.filter(s => !s.isWarmup);

      if (!exerciseDataMap.has(exercise.name)) {
        exerciseDataMap.set(exercise.name, {
          workouts: new Set(),
          sets: [],
        });
      }

      const data = exerciseDataMap.get(exercise.name)!;
      data.workouts.add(workout.id);

      for (const set of workingSets) {
        data.sets.push({ set, workout });
        totalVolume += set.weight * set.reps;
        totalSets++;
      }
    }
  }

  // Calculate stats for each exercise
  const exerciseStats: ExerciseStats[] = [];

  for (const [exerciseName, data] of exerciseDataMap.entries()) {
    if (data.sets.length === 0) continue;

    const sortedSets = data.sets.sort((a, b) =>
      new Date(a.workout.startedAt).getTime() - new Date(b.workout.startedAt).getTime()
    );

    const exerciseVolume = sortedSets.reduce((sum, { set }) => sum + (set.weight * set.reps), 0);
    const bestWeight = Math.max(...sortedSets.map(({ set }) => set.weight));
    const best1RM = Math.max(...sortedSets.map(({ set }) => estimate1RM(set.weight, set.reps)));

    // Group by workout to get best set per workout for progress tracking
    const workoutBestSets = new Map<string, { set: SetRecord; workout: Workout }>();
    for (const item of sortedSets) {
      const workoutId = item.workout.id;
      const existing = workoutBestSets.get(workoutId);
      const current1RM = estimate1RM(item.set.weight, item.set.reps);

      if (!existing || current1RM > estimate1RM(existing.set.weight, existing.set.reps)) {
        workoutBestSets.set(workoutId, item);
      }
    }

    const progressData: ExerciseProgressPoint[] = Array.from(workoutBestSets.values())
      .map(({ set, workout }) => ({
        date: workout.startedAt,
        weight: set.weight,
        reps: set.reps,
        volume: set.weight * set.reps,
        oneRepMax: estimate1RM(set.weight, set.reps),
        workoutName: workout.name,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    exerciseStats.push({
      exerciseName,
      totalWorkouts: data.workouts.size,
      totalSets: data.sets.length,
      totalVolume: exerciseVolume,
      bestWeight,
      best1RM,
      firstWorkoutDate: sortedSets[0].workout.startedAt,
      lastWorkoutDate: sortedSets[sortedSets.length - 1].workout.startedAt,
      progressData,
    });
  }

  // Sort exercises by total volume (most to least)
  exerciseStats.sort((a, b) => b.totalVolume - a.totalVolume);

  return {
    program,
    totalWorkouts: programWorkouts.length,
    totalVolume,
    totalSets,
    dateRange: {
      start: programWorkouts[0].startedAt,
      end: programWorkouts[programWorkouts.length - 1].startedAt,
    },
    exerciseStats,
  };
}

/**
 * Format a date as a short string (e.g., "Jan 1, 2025")
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format volume in kg with thousands separator
 */
export function formatVolume(volume: number): string {
  return volume.toLocaleString('en-US', { maximumFractionDigits: 0 });
}
