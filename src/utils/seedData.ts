import { db } from '../db/database';
import type {
  Program,
  WorkoutTemplate,
  ExerciseTemplate,
  Workout,
  ExerciseInstance,
  SetRecord,
} from '../types/models';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

interface ExerciseConfig {
  name: string;
  targetSets: number;
  targetReps: string;
}

const EXERCISES_BY_DAY: Record<number, ExerciseConfig[]> = {
  0: [
    { name: 'Bench Press', targetSets: 4, targetReps: '6-8' },
    { name: 'Incline Dumbbell Press', targetSets: 3, targetReps: '8-10' },
    { name: 'Tricep Dips', targetSets: 3, targetReps: '6-10' },
  ],
  1: [
    { name: 'Barbell Rows', targetSets: 4, targetReps: '6-8' },
    { name: 'Lat Pulldowns', targetSets: 3, targetReps: '8-10' },
    { name: 'Barbell Curls', targetSets: 3, targetReps: '8-10' },
  ],
  2: [
    { name: 'Barbell Squats', targetSets: 4, targetReps: '6-8' },
    { name: 'Romanian Deadlifts', targetSets: 3, targetReps: '8-10' },
    { name: 'Leg Press', targetSets: 3, targetReps: '10-12' },
  ],
};

const DAY_NAMES = ['Chest & Triceps', 'Back & Biceps', 'Legs'];

export async function seedTestData(options: {
  daysToPopulate?: number;
  workoutsPerWeek?: number;
} = {}): Promise<void> {
  const {
    daysToPopulate = 90,
    workoutsPerWeek = 3,
  } = options;

  // Clear existing data (optional - comment out to append)
  // await db.workouts.clear();
  // await db.exerciseInstances.clear();
  // await db.setRecords.clear();

  // Create program
  const programId = generateId();
  const now = new Date();
  const program: Program = {
    id: programId,
    name: 'Test Strength Program',
    createdAt: new Date(now.getTime() - daysToPopulate * 24 * 60 * 60 * 1000),
    updatedAt: now,
    startDate: new Date(now.getTime() - daysToPopulate * 24 * 60 * 60 * 1000),
    totalWeeks: 12,
  };

  await db.programs.add(program);

  // Create workout templates
  const templates: WorkoutTemplate[] = [];
  for (let dayIndex = 0; dayIndex < 3; dayIndex++) {
    for (const weekNumber of [1, 5, 9]) {
      const template: WorkoutTemplate = {
        id: generateId(),
        name: DAY_NAMES[dayIndex],
        dayIndex,
        weekNumber,
        programId,
      };
      await db.workoutTemplates.add(template);
      templates.push(template);

      // Add exercise templates
      const exercises = EXERCISES_BY_DAY[dayIndex];
      for (let idx = 0; idx < exercises.length; idx++) {
        const ex = exercises[idx];
        const exerciseTemplate: ExerciseTemplate = {
          id: generateId(),
          name: ex.name,
          targetSets: ex.targetSets,
          targetReps: ex.targetReps,
          orderIndex: idx,
          workoutTemplateId: template.id,
        };
        await db.exerciseTemplates.add(exerciseTemplate);
      }
    }
  }

  // Generate historical workouts
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - daysToPopulate);

  let workoutCount = 0;
  for (let dayOffset = 0; dayOffset < daysToPopulate; dayOffset += 7 / workoutsPerWeek) {
    const workoutDate = new Date(startDate);
    workoutDate.setDate(workoutDate.getDate() + dayOffset);

    const dayOfWeek = workoutDate.getDay();
    const dayIndex = dayOfWeek === 0 ? 2 : (dayOfWeek - 1) % 3;

    const workoutId = generateId();
    const endTime = new Date(workoutDate.getTime() + 50 * 60 * 1000 + Math.random() * 40 * 60 * 1000);

    const workout: Workout = {
      id: workoutId,
      name: DAY_NAMES[dayIndex],
      startedAt: workoutDate,
      endedAt: endTime,
      programNameSnapshot: program.name,
    };

    await db.workouts.add(workout);

    // Add exercises and sets for this workout
    const exercises = EXERCISES_BY_DAY[dayIndex];
    // const weekNumber = Math.min(1 + Math.floor((dayOffset / 7) * 1.5), 12);

    for (let exIdx = 0; exIdx < exercises.length; exIdx++) {
      const ex = exercises[exIdx];
      const exerciseId = generateId();

      const exerciseInstance: ExerciseInstance = {
        id: exerciseId,
        name: ex.name,
        workoutId,
        orderIndex: exIdx,
        targetSets: ex.targetSets,
        targetReps: ex.targetReps,
      };

      await db.exerciseInstances.add(exerciseInstance);

      // Generate sets with realistic progression
      const baseWeight = 80 + dayIndex * 20;
      const progressionMultiplier = 1 + (dayOffset / daysToPopulate) * 0.15; // ~15% progression over period

      for (let setIdx = 0; setIdx < ex.targetSets; setIdx++) {
        const weight = Math.round(baseWeight * progressionMultiplier * 10) / 10;
        const [minReps, maxReps] = ex.targetReps.split('-').map(Number);
        const reps = minReps + Math.floor(Math.random() * (maxReps - minReps + 1));

        const setTime = new Date(workoutDate.getTime() + (exIdx * 10 + setIdx * 3) * 60 * 1000);

        const setRecord: SetRecord = {
          id: generateId(),
          exerciseId,
          weight,
          reps,
          rpe: 6 + Math.random() * 4,
          timestamp: setTime,
          isWarmup: setIdx === 0 && workoutCount > 5,
          isPR: workoutCount > 15 && setIdx === ex.targetSets - 1 && Math.random() > 0.85,
        };

        await db.setRecords.add(setRecord);
      }
    }

    workoutCount++;
  }

  console.log(`✅ Seeded ${workoutCount} workouts with realistic progression data`);
}

// Dev helper to clear all data
export async function clearAllData(): Promise<void> {
  await Promise.all([
    db.workouts.clear(),
    db.exerciseInstances.clear(),
    db.setRecords.clear(),
    db.workoutTemplates.clear(),
    db.exerciseTemplates.clear(),
    db.programs.clear(),
    db.personalRecords.clear(),
  ]);
  console.log('✅ All data cleared');
}
