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
  thisWeekAvgDuration: number; // average workout duration in minutes
  lastWeekAvgDuration: number; // average workout duration in minutes
  durationChange: number; // percentage
  thisWeekVolumePerHour: number; // kg per hour
  lastWeekVolumePerHour: number; // kg per hour
  volumePerHourChange: number; // percentage
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
  const settings = await db.settings.toCollection().first();
  const targetWorkoutsPerWeek = settings?.targetWorkoutsPerWeek ?? 3;
  const weekStartDay = settings?.weekStartDay ?? 0;

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

  // Calculate streaks (now weekly streaks)
  const { current, longest } = calculateWeeklyStreaks(sortedWorkouts, targetWorkoutsPerWeek, weekStartDay);

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

    const stats = calculateWorkoutStats(exercisesWithSets, workout.startedAt, workout.endedAt, workout.totalPausedMs);
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
 * Helper: Get the week key (YYYY-Www) for a date
 * @param date The date to get the week for
 * @param weekStartDay Day of week to start (0 = Sunday, 1 = Monday, etc.)
 */
function getWeekKey(date: Date, weekStartDay: number = 0): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  // Get the start of the week this date falls in
  const dayOfWeek = d.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysToWeekStart = (dayOfWeek - weekStartDay + 7) % 7;
  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() - daysToWeekStart);

  // Create a simple week key based on the week start date
  const year = weekStart.getFullYear();
  // Calculate week number by counting days from Jan 1
  const jan1 = new Date(year, 0, 1);
  const daysSinceJan1 = Math.floor((weekStart.getTime() - jan1.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.floor(daysSinceJan1 / 7) + 1;

  return `${year}-W${String(weekNumber).padStart(2, '0')}`;
}

/**
 * Calculate current and longest streaks based on weekly goals
 * A week counts as a streak if the user completes >= targetWorkoutsPerWeek workouts
 * @param workouts Array of workouts to analyze
 * @param targetWorkoutsPerWeek Minimum workouts per week to maintain streak
 * @param weekStartDay Day of week to start (0 = Sunday, 1 = Monday, etc.)
 */
function calculateWeeklyStreaks(workouts: any[], targetWorkoutsPerWeek: number, weekStartDay: number = 0): { current: number; longest: number } {
  if (workouts.length === 0) return { current: 0, longest: 0 };

  // Group workouts by week
  const workoutsByWeek = new Map<string, number>();

  workouts.forEach(w => {
    const weekKey = getWeekKey(new Date(w.startedAt), weekStartDay);
    workoutsByWeek.set(weekKey, (workoutsByWeek.get(weekKey) ?? 0) + 1);
  });

  // Get sorted weeks
  const sortedWeeks = Array.from(workoutsByWeek.keys()).sort();

  let longestStreak = 0;
  let currentStreak = 0;
  let tempStreak = 0;

  // Calculate longest streak and identify consecutive weeks that meet the goal
  const streakWeeks: string[] = [];

  for (const week of sortedWeeks) {
    const workoutCount = workoutsByWeek.get(week) ?? 0;

    if (workoutCount >= targetWorkoutsPerWeek) {
      tempStreak++;
      streakWeeks.push(week);
    } else {
      if (tempStreak > 0) {
        longestStreak = Math.max(longestStreak, tempStreak);
      }
      tempStreak = 0;
      streakWeeks.length = 0;
    }
  }

  // Don't forget to check the final streak
  longestStreak = Math.max(longestStreak, tempStreak);

  // Calculate current streak
  // Get current week
  const today = new Date();
  const currentWeekKey = getWeekKey(today, weekStartDay);

  // Find the last consecutive weeks from now that met the goal
  let checkWeekIndex = sortedWeeks.length - 1;
  currentStreak = 0;

  while (checkWeekIndex >= 0) {
    const week = sortedWeeks[checkWeekIndex];
    const workoutCount = workoutsByWeek.get(week) ?? 0;

    if (workoutCount >= targetWorkoutsPerWeek) {
      currentStreak++;
      checkWeekIndex--;
    } else {
      // Check if this is the current week - if so, it's not broken yet
      if (week === currentWeekKey && currentStreak === 0) {
        // Current week hasn't met goal yet, but we can still show progress
        checkWeekIndex--;
      } else {
        break;
      }
    }
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

  const settings = await db.settings.toCollection().first();
  const weekStartDay = settings?.weekStartDay ?? 0;

  const now = new Date();
  const thisWeekStart = new Date(now);
  // Calculate days to week start: if today is Wednesday (3) and week starts Sunday (0), go back 3 days
  const daysToWeekStart = (now.getDay() - weekStartDay + 7) % 7;
  thisWeekStart.setDate(now.getDate() - daysToWeekStart);
  thisWeekStart.setHours(0, 0, 0, 0);

  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(thisWeekStart.getDate() - 7);

  const lastWeekEnd = new Date(thisWeekStart);
  lastWeekEnd.setMilliseconds(-1);

  let thisWeekWorkouts = 0;
  let lastWeekWorkouts = 0;
  let thisWeekVolume = 0;
  let lastWeekVolume = 0;
  let thisWeekTotalDuration = 0;
  let lastWeekTotalDuration = 0;

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

    const stats = calculateWorkoutStats(exercisesWithSets, workout.startedAt, workout.endedAt, workout.totalPausedMs);

    if (workoutDate >= thisWeekStart) {
      thisWeekWorkouts++;
      thisWeekVolume += stats.totalVolume;
      thisWeekTotalDuration += stats.duration;
    } else if (workoutDate >= lastWeekStart && workoutDate <= lastWeekEnd) {
      lastWeekWorkouts++;
      lastWeekVolume += stats.totalVolume;
      lastWeekTotalDuration += stats.duration;
    }
  }

  const change = lastWeekVolume > 0
    ? ((thisWeekVolume - lastWeekVolume) / lastWeekVolume) * 100
    : 0;

  const thisWeekAvgDuration = thisWeekWorkouts > 0 ? Math.round(thisWeekTotalDuration / thisWeekWorkouts) : 0;
  const lastWeekAvgDuration = lastWeekWorkouts > 0 ? Math.round(lastWeekTotalDuration / lastWeekWorkouts) : 0;

  const durationChange = lastWeekAvgDuration > 0
    ? ((thisWeekAvgDuration - lastWeekAvgDuration) / lastWeekAvgDuration) * 100
    : 0;

  const thisWeekVolumePerHour = thisWeekTotalDuration > 0 ? Math.round((thisWeekVolume / thisWeekTotalDuration) * 60) : 0;
  const lastWeekVolumePerHour = lastWeekTotalDuration > 0 ? Math.round((lastWeekVolume / lastWeekTotalDuration) * 60) : 0;

  const volumePerHourChange = lastWeekVolumePerHour > 0
    ? ((thisWeekVolumePerHour - lastWeekVolumePerHour) / lastWeekVolumePerHour) * 100
    : 0;

  return {
    thisWeekWorkouts,
    lastWeekWorkouts,
    thisWeekVolume,
    lastWeekVolume,
    change,
    thisWeekAvgDuration,
    lastWeekAvgDuration,
    durationChange,
    thisWeekVolumePerHour,
    lastWeekVolumePerHour,
    volumePerHourChange,
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

    const stats = calculateWorkoutStats(exercisesWithSets, workout.startedAt, workout.endedAt, workout.totalPausedMs);

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
 * Get weekly volume trend for the last 12 weeks
 */
export async function getWeeklyVolumeTrend(): Promise<MonthlyVolume[]> {
  const workouts = await db.workouts
    .filter(w => w.endedAt !== undefined)
    .toArray();

  const settings = await db.settings.toCollection().first();
  const weekStartDay = settings?.weekStartDay ?? 0;

  const weeklyData = new Map<string, { volume: number; workouts: number }>();

  for (const workout of workouts) {
    const weekKey = getWeekKey(new Date(workout.startedAt), weekStartDay);

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

    const stats = calculateWorkoutStats(exercisesWithSets, workout.startedAt, workout.endedAt, workout.totalPausedMs);

    if (!weeklyData.has(weekKey)) {
      weeklyData.set(weekKey, { volume: 0, workouts: 0 });
    }

    const data = weeklyData.get(weekKey)!;
    data.volume += stats.totalVolume;
    data.workouts++;
  }

  // Get last 12 weeks
  const result: MonthlyVolume[] = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - (i * 7));
    const weekKey = getWeekKey(date, weekStartDay);
    const weekNumber = weekKey.split('-W')[1];
    const year = weekKey.split('-')[0];
    const weekLabel = `W${weekNumber} '${year.slice(-2)}`;

    const data = weeklyData.get(weekKey);
    result.push({
      month: weekLabel,
      volume: data?.volume || 0,
      workouts: data?.workouts || 0,
    });
  }

  return result;
}

/**
 * Get rep PRs for a specific exercise or multiple exercise variants
 * Returns best weight achieved for different rep ranges
 * @param exerciseNames Single exercise name or array of exercise names to combine
 */
export async function getRepPRs(exerciseNames: string | string[]): Promise<RepPR[]> {
  // Normalize to array
  const names = Array.isArray(exerciseNames) ? exerciseNames : [exerciseNames];

  const exerciseInstances = await db.exerciseInstances
    .filter(ex => names.includes(ex.name))
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
 * Check if a new set is a personal record
 * Returns true if:
 * - It's the first workset for this exercise, OR
 * - It's a weight PR for this rep count (heavier than any previous set at this rep count), OR
 * - It's a rep PR for this weight (more reps than any previous set at this weight)
 *
 * Note: Only weight and reps are considered. RPE is NOT factored into PR calculations.
 */
export async function isSetAPR(exerciseName: string, weight: number, reps: number): Promise<boolean> {
  const exerciseInstances = await db.exerciseInstances
    .filter(ex => ex.name === exerciseName)
    .toArray();

  if (exerciseInstances.length === 0) return true; // First set of this exercise is a PR

  // Get all previous sets for this exercise
  const allSets: any[] = [];
  for (const instance of exerciseInstances) {
    const sets = await db.setRecords
      .where('exerciseId')
      .equals(instance.id)
      .toArray();
    allSets.push(...sets.filter(s => !s.isWarmup));
  }

  if (allSets.length === 0) return true; // First workset is a PR

  // Check if this is a weight PR for this rep count
  // Only counts as PR if you've done this rep count before AND this weight is heavier
  const setsAtThisRepCount = allSets.filter(s => s.reps === reps);
  if (setsAtThisRepCount.length > 0 && weight > Math.max(...setsAtThisRepCount.map(s => s.weight))) {
    return true;
  }

  // Check if this is a rep PR for this weight
  // Only counts as PR if you've lifted this weight before AND these are more reps
  const setsAtThisWeight = allSets.filter(s => s.weight === weight);
  if (setsAtThisWeight.length > 0 && reps > Math.max(...setsAtThisWeight.map(s => s.reps))) {
    return true;
  }

  return false;
}

/**
 * Calculate consistency score for an exercise (days between workouts)
 */
/**
 * Get exercise consistency metric (average days between workouts)
 * @param exerciseNames Single exercise name or array of exercise names to combine
 */
export async function getExerciseConsistency(exerciseNames: string | string[]): Promise<number | null> {
  // Normalize to array
  const names = Array.isArray(exerciseNames) ? exerciseNames : [exerciseNames];

  const exerciseInstances = await db.exerciseInstances
    .filter(ex => names.includes(ex.name))
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
