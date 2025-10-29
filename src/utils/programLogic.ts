import { db } from '../db/database';
import type { Program, WorkoutTemplate, Workout, ExerciseInstance } from '../types/models';
import { v4 as uuidv4 } from 'uuid';

// Calculate current week number based on program start date
export function currentWeek(startDate: Date | undefined, totalWeeks: number): number {
  if (!startDate) return 1;

  const now = new Date();
  const start = new Date(startDate);
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const weekNum = Math.floor(diffDays / 7) + 1;

  // Cycle through weeks if past totalWeeks
  return ((weekNum - 1) % totalWeeks) + 1;
}

// Get the active program from settings
export async function getActiveProgram(): Promise<Program | undefined> {
  const settings = await db.settings.toCollection().first();

  if (settings?.activeProgramId) {
    return await db.programs.get(settings.activeProgramId);
  }

  // Fallback to first program
  return await db.programs.toCollection().first();
}

// Select the appropriate workout template for a given week and day index
// Finds the template with the highest weekNumber <= current week
export async function selectTemplate(
  programId: string,
  weekNumber: number,
  dayIndex: number
): Promise<WorkoutTemplate | undefined> {
  // Get all templates for this program and day
  const templates = await db.workoutTemplates
    .where({ programId, dayIndex })
    .toArray();

  // Filter to templates with weekNumber <= current week
  const validTemplates = templates.filter(t => t.weekNumber <= weekNumber);

  if (validTemplates.length === 0) {
    return undefined;
  }

  // Sort by weekNumber descending and return the first one (highest weekNumber)
  validTemplates.sort((a, b) => b.weekNumber - a.weekNumber);
  return validTemplates[0];
}

// Get recommended day based on last workout
export async function recommendedDay(program: Program): Promise<number> {
  const lastWorkout = await db.workouts
    .orderBy('startedAt')
    .reverse()
    .filter((w) => w.endedAt !== undefined)
    .first();

  if (!lastWorkout) {
    return 0; // Start at Day 1 if no history
  }

  // Get all workout templates for this program
  const templates = await db.workoutTemplates
    .where('programId')
    .equals(program.id)
    .toArray();

  const template = templates.find(
    (t) =>
      lastWorkout.name.includes(t.name) ||
      lastWorkout.name === t.name
  );

  if (!template) return 0;

  const maxDayIndex = Math.max(...templates.map((t) => t.dayIndex));
  return (template.dayIndex + 1) % (maxDayIndex + 1);
}

// Create a new workout instance from a template
export async function instantiateWorkout(
  template: WorkoutTemplate,
  programName?: string,
  isQuickWorkout?: boolean
): Promise<Workout> {
  const workoutId = uuidv4();

  const workout: Workout = {
    id: workoutId,
    name: template.name,
    startedAt: new Date(),
    programNameSnapshot: programName,
    isQuickWorkout: isQuickWorkout ?? false,
  };

  await db.workouts.add(workout);

  // Get exercises for this template
  const exercises = await db.exerciseTemplates
    .where('workoutTemplateId')
    .equals(template.id)
    .sortBy('orderIndex');

  // Create exercise instances
  for (let i = 0; i < exercises.length; i++) {
    const et = exercises[i];
    // Reduce sets by 30% if quick workout (70% of original sets)
    const targetSets = isQuickWorkout
      ? Math.max(1, Math.ceil(et.targetSets * 0.7))
      : et.targetSets;

    const ex: ExerciseInstance = {
      id: uuidv4(),
      name: et.name,
      workoutId,
      orderIndex: i,
      targetSets,
      targetReps: et.targetReps,
      notes: et.notes,
    };
    await db.exerciseInstances.add(ex);
  }

  return workout;
}

// Get previous sets for an exercise
export async function previousSets(exerciseName: string): Promise<any[]> {
  const workouts = await db.workouts
    .orderBy('startedAt')
    .reverse()
    .toArray();

  for (const workout of workouts) {
    const exercises = await db.exerciseInstances
      .where('workoutId')
      .equals(workout.id)
      .toArray();

    const exercise = exercises.find((e) => e.name === exerciseName);
    if (exercise) {
      const sets = await db.setRecords
        .where('exerciseId')
        .equals(exercise.id)
        .reverse()
        .sortBy('timestamp');

      if (sets.length > 0) {
        return sets;
      }
    }
  }

  return [];
}

// Get previous workout instances for an exercise
export async function previousWorkoutInstances(
  exerciseName: string,
  limit: number = 3
): Promise<{ workout: Workout; sets: any[] }[]> {
  const results: { workout: Workout; sets: any[] }[] = [];

  const workouts = await db.workouts
    .orderBy('startedAt')
    .reverse()
    .filter((w) => w.endedAt !== undefined)
    .toArray();

  for (const workout of workouts) {
    if (results.length >= limit) break;

    const exercises = await db.exerciseInstances
      .where('workoutId')
      .equals(workout.id)
      .toArray();

    const exercise = exercises.find((e) => e.name === exerciseName);
    if (exercise) {
      const sets = await db.setRecords
        .where('exerciseId')
        .equals(exercise.id)
        .sortBy('timestamp');

      if (sets.length > 0) {
        results.push({ workout, sets });
      }
    }
  }

  return results;
}

// Get best weight for an exercise
export async function previousBestWeight(exerciseName: string): Promise<number | undefined> {
  const workouts = await db.workouts.toArray();
  let maxWeight = 0;

  for (const workout of workouts) {
    const exercises = await db.exerciseInstances
      .where('workoutId')
      .equals(workout.id)
      .toArray();

    for (const exercise of exercises) {
      if (exercise.name === exerciseName) {
        const sets = await db.setRecords
          .where('exerciseId')
          .equals(exercise.id)
          .toArray();

        for (const set of sets) {
          if (set.weight > maxWeight) {
            maxWeight = set.weight;
          }
        }
      }
    }
  }

  return maxWeight > 0 ? maxWeight : undefined;
}

// Find active workout for today
export async function findActiveWorkoutForToday(): Promise<Workout | undefined> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  console.log('[findActiveWorkoutForToday] Today date:', {
    todayDate: today.toISOString(),
    todayTime: today.getTime(),
    currentTime: new Date().toISOString(),
  });

  const workouts = await db.workouts
    .orderBy('startedAt')
    .reverse()
    .toArray();

  console.log('[findActiveWorkoutForToday] Total workouts in DB:', workouts.length);
  console.log('[findActiveWorkoutForToday] Recent workouts:', workouts.slice(0, 5).map(w => ({
    id: w.id,
    name: w.name,
    startedAt: w.startedAt,
    endedAt: w.endedAt,
    startedAtIso: new Date(w.startedAt).toISOString(),
  })));

  const result = workouts.find((w) => {
    if (w.endedAt) {
      console.log('[findActiveWorkoutForToday] Skipping workout (has endedAt):', w.id);
      return false;
    }
    const workoutDate = new Date(w.startedAt);
    workoutDate.setHours(0, 0, 0, 0);
    const isMatch = workoutDate.getTime() === today.getTime();
    console.log('[findActiveWorkoutForToday] Checking workout:', {
      id: w.id,
      name: w.name,
      workoutDate: workoutDate.toISOString(),
      workoutTime: workoutDate.getTime(),
      isMatch,
    });
    return isMatch;
  });

  console.log('[findActiveWorkoutForToday] Result:', result ? { id: result.id, name: result.name } : 'NOT FOUND');
  return result;
}

// Calculate adaptive percentage increase based on weight
function getAdaptivePercentageIncrease(currentWeight: number): number {
  if (currentWeight < 50) return 0.05; // 5% for lighter weights
  if (currentWeight < 150) return 0.0375; // 3.75% for medium weights
  return 0.025; // 2.5% for heavier weights
}

// Round weight to nearest sensible increment based on weight magnitude
function roundWeightToNearestIncrement(weight: number): number {
  if (weight < 20) return Math.round(weight * 2) / 2; // 0.5 lb increments
  if (weight < 50) return Math.round(weight); // 1 lb increments
  return Math.round(weight * 2) / 2; // 0.5 lb increments for all others
}

// Parse rep range (e.g., "8-10" returns [8, 10])
function parseRepRange(repString: string): [number, number] | null {
  const match = repString.match(/^(\d+)-(\d+)$/);
  if (!match) return null;
  return [parseInt(match[1]), parseInt(match[2])];
}

// Interface for progressive overload suggestion
export interface ProgressiveOverloadSuggestion {
  suggestedWeight?: number;
  suggestedReps?: string;
  reason: string;
  hasData: boolean;
}

// Get progressive overload suggestion based on previous workouts
export async function getProgressiveOverloadSuggestion(
  exerciseName: string,
  targetReps: string | undefined
): Promise<ProgressiveOverloadSuggestion> {
  try {
    // Get last 3 completed workouts for this exercise
    const previousWorkouts = await previousWorkoutInstances(exerciseName, 3);

    if (previousWorkouts.length === 0) {
      return {
        reason: 'No previous data',
        hasData: false,
      };
    }

    // Analyze the last 3 workouts
    const workoutAnalysis = previousWorkouts.map((pw) => {
      const lastSet = pw.sets[pw.sets.length - 1]; // Get last set of workout
      if (!lastSet) return null;
      return { weight: lastSet.weight, reps: lastSet.reps };
    }).filter((a) => a !== null) as Array<{ weight: number; reps: number }>;

    if (workoutAnalysis.length === 0) {
      return {
        reason: 'No set data available',
        hasData: false,
      };
    }

    // Get the last set data
    const lastSet = workoutAnalysis[0];
    const parsedReps = parseRepRange(targetReps || '');

    // Check if hit upper bound reps in last workout
    let hitTargetReps = false;
    if (parsedReps) {
      const [_lowerBound, upperBound] = parsedReps;
      hitTargetReps = lastSet.reps >= upperBound;
    }

    // Check if consistently hitting upper bound (at least 2 of last 3 workouts)
    let consistentlyHittingReps = false;
    if (parsedReps) {
      const [_lowerBound, upperBound] = parsedReps;
      const hittingCount = workoutAnalysis.filter((a) => a.reps >= upperBound).length;
      consistentlyHittingReps = hittingCount >= 2;
    }

    // Suggest rep increase first if hitting targets consistently
    if (consistentlyHittingReps && parsedReps) {
      const [lowerBound, upperBound] = parsedReps;
      const newReps = `${lowerBound + 2}-${upperBound + 2}`;
      return {
        suggestedReps: newReps,
        reason: `Hit ${upperBound} reps consistently - increase to ${newReps}`,
        hasData: true,
      };
    }

    // If not hitting target reps, suggest keeping weight the same
    if (!hitTargetReps) {
      return {
        reason: `Need to hit ${parsedReps?.[1] || 'target'} reps first`,
        hasData: true,
      };
    }

    // If hitting target reps (but not consistently), suggest weight increase
    const percentIncrease = getAdaptivePercentageIncrease(lastSet.weight);
    const newWeight = lastSet.weight * (1 + percentIncrease);
    const roundedWeight = roundWeightToNearestIncrement(newWeight);

    return {
      suggestedWeight: roundedWeight,
      reason: `Hit ${lastSet.reps} reps - increase weight to ${roundedWeight}`,
      hasData: true,
    };
  } catch (error) {
    console.error('Error calculating progressive overload suggestion:', error);
    return {
      reason: 'Unable to calculate suggestion',
      hasData: false,
    };
  }
}
