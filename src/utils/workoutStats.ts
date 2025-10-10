import type { SetRecord } from '../types/models';
import { estimate1RM } from './oneRM';
import { getExerciseProgress } from './progressTracking';

export interface WorkoutStats {
  totalVolume: number; // kg
  estimatedCalories: number;
  averageRPE: number;
  duration: number; // minutes
  totalSets: number;
}

export interface Exercise1RMChange {
  current1RM: number;
  previous1RM: number | null;
  change: number; // positive = improvement
  percentChange: number;
}

/**
 * Calculate total volume (weight × reps) for all sets
 */
export function calculateTotalVolume(
  exercises: Array<{ sets: SetRecord[] }>
): number {
  let total = 0;

  for (const exercise of exercises) {
    for (const set of exercise.sets) {
      if (!set.isWarmup) {
        total += set.weight * set.reps;
      }
    }
  }

  return total;
}

/**
 * Estimate calories burned during workout
 * Based on total volume and workout duration
 *
 * Formula combines:
 * - Volume-based: ~0.05 calories per kg lifted
 * - Time-based: ~3.5 calories per minute (metabolic equivalent for resistance training)
 */
export function estimateCaloriesBurned(
  totalVolume: number,
  durationMinutes: number
): number {
  const volumeCalories = totalVolume * 0.05;
  const timeCalories = durationMinutes * 3.5;

  return Math.round(volumeCalories + timeCalories);
}

/**
 * Calculate volume-weighted average RPE
 * Gives more weight to heavier/higher-rep sets
 */
export function calculateAverageRPE(
  exercises: Array<{ sets: SetRecord[] }>
): number {
  let totalWeightedRPE = 0;
  let totalVolume = 0;

  for (const exercise of exercises) {
    for (const set of exercise.sets) {
      if (!set.isWarmup && set.rpe !== undefined) {
        const volume = set.weight * set.reps;
        totalWeightedRPE += set.rpe * volume;
        totalVolume += volume;
      }
    }
  }

  if (totalVolume === 0) return 0;

  return totalWeightedRPE / totalVolume;
}

/**
 * Calculate workout duration in minutes
 */
export function calculateDuration(startedAt: Date, endedAt?: Date): number {
  const end = endedAt || new Date();
  const durationMs = end.getTime() - startedAt.getTime();
  return Math.round(durationMs / 60000); // Convert to minutes
}

/**
 * Get comprehensive workout statistics
 */
export function calculateWorkoutStats(
  exercises: Array<{ sets: SetRecord[] }>,
  startedAt: Date,
  endedAt?: Date
): WorkoutStats {
  const totalVolume = calculateTotalVolume(exercises);
  const duration = calculateDuration(startedAt, endedAt);
  const averageRPE = calculateAverageRPE(exercises);

  let totalSets = 0;
  for (const exercise of exercises) {
    totalSets += exercise.sets.filter(s => !s.isWarmup).length;
  }

  return {
    totalVolume,
    estimatedCalories: estimateCaloriesBurned(totalVolume, duration),
    averageRPE,
    duration,
    totalSets,
  };
}

/**
 * Get previous best 1RM for an exercise before a specific date
 * Used to calculate improvement/decline
 */
export async function getPreviousBest1RM(
  exerciseName: string,
  beforeDate: Date
): Promise<number | null> {
  const progressData = await getExerciseProgress(exerciseName);

  if (progressData.length === 0) {
    return null;
  }

  // Filter to only include data before the specified date
  const previousData = progressData.filter(
    d => d.date.getTime() < beforeDate.getTime()
  );

  if (previousData.length === 0) {
    return null;
  }

  // Find the best 1RM from previous workouts
  const best = previousData.reduce((max, curr) =>
    curr.oneRepMax > max.oneRepMax ? curr : max
  );

  return best.oneRepMax;
}

/**
 * Calculate 1RM change for an exercise compared to previous workouts
 */
export async function calculate1RMChange(
  exerciseName: string,
  currentSets: SetRecord[],
  workoutDate: Date
): Promise<Exercise1RMChange> {
  // Calculate current best 1RM from this workout
  const current1RM = currentSets.length > 0
    ? Math.max(...currentSets.map(s => estimate1RM(s.weight, s.reps)))
    : 0;

  // Get previous best 1RM
  const previous1RM = await getPreviousBest1RM(exerciseName, workoutDate);

  if (previous1RM === null) {
    return {
      current1RM,
      previous1RM: null,
      change: 0,
      percentChange: 0,
    };
  }

  const change = current1RM - previous1RM;
  const percentChange = (change / previous1RM) * 100;

  return {
    current1RM,
    previous1RM,
    change,
    percentChange,
  };
}

/**
 * Format volume for display (adds commas for thousands)
 */
export function formatVolume(volume: number): string {
  return volume.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

/**
 * Format RPE for display
 */
export function formatRPE(rpe: number): string {
  return rpe.toFixed(1);
}

/**
 * Format duration for display
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}
