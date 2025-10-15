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
  programName?: string
): Promise<Workout> {
  const workoutId = uuidv4();

  const workout: Workout = {
    id: workoutId,
    name: template.name,
    startedAt: new Date(),
    programNameSnapshot: programName,
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
    const ex: ExerciseInstance = {
      id: uuidv4(),
      name: et.name,
      workoutId,
      orderIndex: i,
      targetSets: et.targetSets,
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

  const workouts = await db.workouts
    .orderBy('startedAt')
    .reverse()
    .toArray();

  return workouts.find((w) => {
    if (w.endedAt) return false;
    const workoutDate = new Date(w.startedAt);
    workoutDate.setHours(0, 0, 0, 0);
    return workoutDate.getTime() === today.getTime();
  });
}
