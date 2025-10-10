import { db } from '../db/database';
import { calculateWorkoutStats } from './workoutStats';

export interface GlobalStats {
  totalWorkouts: number;
  currentStreak: number;
  longestStreak: number;
  totalVolume: number;
  totalCalories: number;
  averageDuration: number;
  daysTraining: number;
  firstWorkoutDate: Date | null;
}

export interface WeeklyComparison {
  thisWeekWorkouts: number;
  lastWeekWorkouts: number;
  thisWeekVolume: number;
  lastWeekVolume: number;
  change: number; // percentage
}

export interface MonthlyVolume {
  month: string;
  volume: number;
  workouts: number;
}

export interface RepPR {
  reps: number;
  weight: number;
  date: Date;
}

/**
 * Calculate global/lifetime statistics
 */
export async function getGlobalStats(): Promise<GlobalStats> {
  const workouts = await db.workouts.toArray();

  if (workouts.length === 0) {
    return {
      totalWorkouts: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalVolume: 0,
      totalCalories: 0,
      averageDuration: 0,
      daysTraining: 0,
      firstWorkoutDate: null,
    };
  }

  // Sort by date
  const sortedWorkouts = workouts
    .filter(w => w.endedAt) // Only completed workouts
    .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());

  const firstWorkoutDate = sortedWorkouts.length > 0
    ? new Date(sortedWorkouts[0].startedAt)
    : null;

  // Calculate streaks
  const { current, longest } = calculateStreaks(sortedWorkouts);

  // Calculate total volume and calories
  let totalVolume = 0;
  let totalCalories = 0;
  let totalDuration = 0;

  for (const workout of sortedWorkouts) {
    const exercises = await db.exerciseInstances
      .where('workoutId')
      .equals(workout.id)
      .toArray();

    const exercisesWithSets = await Promise.all(
      exercises.map(async (ex) => {
        const sets = await db.setRecords
          .where('exerciseId')
          .equals(ex.id)
          .toArray();
        return { sets };
      })
    );

    const stats = calculateWorkoutStats(exercisesWithSets, workout.startedAt, workout.endedAt);
    totalVolume += stats.totalVolume;
    totalCalories += stats.estimatedCalories;
    totalDuration += stats.duration;
  }

  const daysTraining = firstWorkoutDate
    ? Math.floor((Date.now() - firstWorkoutDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    totalWorkouts: sortedWorkouts.length,
    currentStreak: current,
    longestStreak: longest,
    totalVolume,
    totalCalories,
    averageDuration: sortedWorkouts.length > 0 ? Math.round(totalDuration / sortedWorkouts.length) : 0,
    daysTraining,
    firstWorkoutDate,
  };
}

/**
 * Calculate current and longest streaks
 * A streak is consecutive days with at least one workout
 */
function calculateStreaks(workouts: any[]): { current: number; longest: number } {
  if (workouts.length === 0) return { current: 0, longest: 0 };

  // Get unique workout dates (day level)
  const workoutDates = new Set<string>();
  workouts.forEach(w => {
    const date = new Date(w.startedAt);
    const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    workoutDates.add(dateKey);
  });

  const sortedDates = Array.from(workoutDates)
    .map(key => {
      const [year, month, day] = key.split('-').map(Number);
      return new Date(year, month - 1, day);
    })
    .sort((a, b) => a.getTime() - b.getTime());

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate longest streak
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = sortedDates[i - 1];
    const currDate = sortedDates[i];

    const dayDiff = Math.floor(
      (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (dayDiff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Calculate current streak
  const lastWorkoutDate = sortedDates[sortedDates.length - 1];
  lastWorkoutDate.setHours(0, 0, 0, 0);

  const daysSinceLastWorkout = Math.floor(
    (today.getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceLastWorkout <= 1) {
    // Count backwards from last workout
    currentStreak = 1;
    for (let i = sortedDates.length - 2; i >= 0; i--) {
      const prevDate = sortedDates[i];
      const currDate = sortedDates[i + 1];

      const dayDiff = Math.floor(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dayDiff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  } else {
    currentStreak = 0;
  }

  return { current: currentStreak, longest: longestStreak };
}

/**
 * Get weekly comparison stats
 */
export async function getWeeklyComparison(): Promise<WeeklyComparison> {
  const workouts = await db.workouts
    .filter(w => w.endedAt !== undefined)
    .toArray();

  const now = new Date();
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
  thisWeekStart.setHours(0, 0, 0, 0);

  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(thisWeekStart.getDate() - 7);

  const lastWeekEnd = new Date(thisWeekStart);
  lastWeekEnd.setMilliseconds(-1);

  let thisWeekWorkouts = 0;
  let lastWeekWorkouts = 0;
  let thisWeekVolume = 0;
  let lastWeekVolume = 0;

  for (const workout of workouts) {
    const workoutDate = new Date(workout.startedAt);

    const exercises = await db.exerciseInstances
      .where('workoutId')
      .equals(workout.id)
      .toArray();

    const exercisesWithSets = await Promise.all(
      exercises.map(async (ex) => {
        const sets = await db.setRecords
          .where('exerciseId')
          .equals(ex.id)
          .toArray();
        return { sets };
      })
    );

    const stats = calculateWorkoutStats(exercisesWithSets, workout.startedAt, workout.endedAt);

    if (workoutDate >= thisWeekStart) {
      thisWeekWorkouts++;
      thisWeekVolume += stats.totalVolume;
    } else if (workoutDate >= lastWeekStart && workoutDate <= lastWeekEnd) {
      lastWeekWorkouts++;
      lastWeekVolume += stats.totalVolume;
    }
  }

  const change = lastWeekVolume > 0
    ? ((thisWeekVolume - lastWeekVolume) / lastWeekVolume) * 100
    : 0;

  return {
    thisWeekWorkouts,
    lastWeekWorkouts,
    thisWeekVolume,
    lastWeekVolume,
    change,
  };
}

/**
 * Get monthly volume trend for the last 6 months
 */
export async function getMonthlyVolumeTrend(): Promise<MonthlyVolume[]> {
  const workouts = await db.workouts
    .filter(w => w.endedAt !== undefined)
    .toArray();

  const monthlyData = new Map<string, { volume: number; workouts: number }>();

  for (const workout of workouts) {
    const date = new Date(workout.startedAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    const exercises = await db.exerciseInstances
      .where('workoutId')
      .equals(workout.id)
      .toArray();

    const exercisesWithSets = await Promise.all(
      exercises.map(async (ex) => {
        const sets = await db.setRecords
          .where('exerciseId')
          .equals(ex.id)
          .toArray();
        return { sets };
      })
    );

    const stats = calculateWorkoutStats(exercisesWithSets, workout.startedAt, workout.endedAt);

    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, { volume: 0, workouts: 0 });
    }

    const data = monthlyData.get(monthKey)!;
    data.volume += stats.totalVolume;
    data.workouts++;
  }

  // Get last 6 months
  const result: MonthlyVolume[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    const data = monthlyData.get(monthKey);
    result.push({
      month: monthName,
      volume: data?.volume || 0,
      workouts: data?.workouts || 0,
    });
  }

  return result;
}

/**
 * Get rep PRs for a specific exercise
 * Returns best weight achieved for different rep ranges
 */
export async function getRepPRs(exerciseName: string): Promise<RepPR[]> {
  const exerciseInstances = await db.exerciseInstances
    .filter(ex => ex.name === exerciseName)
    .toArray();

  if (exerciseInstances.length === 0) return [];

  const repPRMap = new Map<number, RepPR>();

  for (const instance of exerciseInstances) {
    const sets = await db.setRecords
      .where('exerciseId')
      .equals(instance.id)
      .toArray();

    for (const set of sets) {
      if (!set.isWarmup) {
        const existing = repPRMap.get(set.reps);
        if (!existing || set.weight > existing.weight) {
          repPRMap.set(set.reps, {
            reps: set.reps,
            weight: set.weight,
            date: set.timestamp,
          });
        }
      }
    }
  }

  return Array.from(repPRMap.values()).sort((a, b) => a.reps - b.reps);
}

/**
 * Calculate consistency score for an exercise (days between workouts)
 */
export async function getExerciseConsistency(exerciseName: string): Promise<number | null> {
  const exerciseInstances = await db.exerciseInstances
    .filter(ex => ex.name === exerciseName)
    .toArray();

  if (exerciseInstances.length === 0) return null;

  // Get workout dates for this exercise
  const workoutIds = new Set(exerciseInstances.map(ex => ex.workoutId));
  const workouts = await db.workouts
    .filter(w => workoutIds.has(w.id) && w.endedAt !== undefined)
    .toArray();

  if (workouts.length < 2) return null;

  const dates = workouts
    .map(w => new Date(w.startedAt))
    .sort((a, b) => a.getTime() - b.getTime());

  // Calculate average days between workouts
  let totalDays = 0;
  for (let i = 1; i < dates.length; i++) {
    const dayDiff = (dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
    totalDays += dayDiff;
  }

  return totalDays / (dates.length - 1);
}
