import { db } from '../db/database';
import type { SetRecord } from '../types/models';

export interface ExerciseProgressData {
  date: Date;
  weight: number;
  reps: number;
  volume: number; // weight × reps
  oneRepMax: number; // Calculated 1RM
  exerciseName: string;
  isQuickWorkout?: boolean; // Whether the workout was a quick workout
}

export interface ExerciseStats {
  exerciseName: string;
  totalSets: number;
  totalVolume: number;
  maxWeight: number;
  maxWeightDate: Date;
  bestOneRepMax: number;
  bestOneRepMaxDate: Date;
  firstWorkoutDate: Date;
  lastWorkoutDate: Date;
  workoutCount: number;
}

/**
 * Get all unique exercise names from workout history
 */
export async function getAllExerciseNames(): Promise<string[]> {
  const exercises = await db.exerciseInstances.toArray();
  const uniqueNames = new Set(exercises.map(ex => ex.name));
  return Array.from(uniqueNames).sort();
}

/**
 * Get progression data for a specific exercise
 */
export async function getExerciseProgress(exerciseName: string): Promise<ExerciseProgressData[]> {
  // Get all exercise instances with this name
  const exerciseInstances = await db.exerciseInstances
    .filter(ex => ex.name === exerciseName)
    .toArray();

  if (exerciseInstances.length === 0) {
    return [];
  }

  const exerciseIds = exerciseInstances.map(ex => ex.id);

  // Get all sets for these exercises
  const allSets: SetRecord[] = [];
  for (const id of exerciseIds) {
    const sets = await db.setRecords
      .where('exerciseId')
      .equals(id)
      .toArray();
    allSets.push(...sets);
  }

  // Filter out warmup sets and sort by timestamp
  const workSets = allSets
    .filter(set => !set.isWarmup)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Convert to progress data
  return workSets.map(set => ({
    date: new Date(set.timestamp),
    weight: set.weight,
    reps: set.reps,
    volume: set.weight * set.reps,
    oneRepMax: calculateOneRepMax(set.weight, set.reps),
    exerciseName,
  }));
}

/**
 * Calculate 1RM using Epley formula
 */
function calculateOneRepMax(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

/**
 * Get statistics for a specific exercise
 */
export async function getExerciseStats(exerciseName: string): Promise<ExerciseStats | null> {
  const progressData = await getExerciseProgress(exerciseName);

  if (progressData.length === 0) {
    return null;
  }

  // Group by workout session (same day = same workout)
  const workoutDates = new Set(progressData.map(d => d.date.toDateString()));

  // Find max weight
  const maxWeightEntry = progressData.reduce((max, curr) =>
    curr.weight > max.weight ? curr : max
  );

  // Find best 1RM
  const bestOneRepMaxEntry = progressData.reduce((max, curr) =>
    curr.oneRepMax > max.oneRepMax ? curr : max
  );

  // Calculate total volume
  const totalVolume = progressData.reduce((sum, d) => sum + d.volume, 0);

  return {
    exerciseName,
    totalSets: progressData.length,
    totalVolume,
    maxWeight: maxWeightEntry.weight,
    maxWeightDate: maxWeightEntry.date,
    bestOneRepMax: bestOneRepMaxEntry.oneRepMax,
    bestOneRepMaxDate: bestOneRepMaxEntry.date,
    firstWorkoutDate: progressData[0].date,
    lastWorkoutDate: progressData[progressData.length - 1].date,
    workoutCount: workoutDates.size,
  };
}

/**
 * Get best set (highest weight × reps) for each workout session
 */
export async function getBestSetPerWorkout(exerciseName: string): Promise<ExerciseProgressData[]> {
  const allData = await getExerciseProgress(exerciseName);

  if (allData.length === 0) {
    return [];
  }

  // Group by date (day level)
  const byDate = new Map<string, ExerciseProgressData[]>();

  for (const data of allData) {
    const dateKey = data.date.toDateString();
    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, []);
    }
    byDate.get(dateKey)!.push(data);
  }

  // Get best set from each day (highest weight, then highest reps as tiebreaker)
  const bestSets: ExerciseProgressData[] = [];

  for (const [, sets] of byDate) {
    const best = sets.reduce((max, curr) => {
      if (curr.weight > max.weight) return curr;
      if (curr.weight === max.weight && curr.reps > max.reps) return curr;
      return max;
    });
    bestSets.push(best);
  }

  // Sort and then fetch workout info to add isQuickWorkout flag
  const sorted = bestSets.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Enrich with workout info
  for (const set of sorted) {
    // Find the exercise instance for this set
    const exerciseInstance = await db.exerciseInstances
      .filter(ex => ex.name === exerciseName)
      .toArray();

    // Find the set record matching this data
    let workoutId: string | undefined;
    for (const ex of exerciseInstance) {
      const setRecord = await db.setRecords
        .where('exerciseId')
        .equals(ex.id)
        .filter(s => {
          const d = new Date(s.timestamp);
          return d.getTime() === set.date.getTime() &&
                 s.weight === set.weight &&
                 s.reps === set.reps;
        })
        .first();

      if (setRecord) {
        workoutId = ex.workoutId;
        break;
      }
    }

    // Get the workout to check if it's a quick workout
    if (workoutId) {
      const workout = await db.workouts.get(workoutId);
      if (workout) {
        set.isQuickWorkout = workout.isQuickWorkout ?? false;
      }
    }
  }

  return sorted;
}

/**
 * Get recent PRs (personal records) across all exercises
 */
export async function getRecentPRs(limit: number = 10): Promise<Array<{
  exerciseName: string;
  weight: number;
  reps: number;
  date: Date;
  oneRepMax: number;
}>> {
  const allExercises = await getAllExerciseNames();
  const prs: Array<{
    exerciseName: string;
    weight: number;
    reps: number;
    date: Date;
    oneRepMax: number;
  }> = [];

  for (const exerciseName of allExercises) {
    const stats = await getExerciseStats(exerciseName);
    if (stats) {
      prs.push({
        exerciseName: stats.exerciseName,
        weight: stats.maxWeight,
        reps: 0, // We don't track reps for max weight currently
        date: stats.maxWeightDate,
        oneRepMax: stats.bestOneRepMax,
      });
    }
  }

  // Sort by date (most recent first) and limit
  return prs
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);
}
