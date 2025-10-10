import { db } from '../db/database';
import type { Program, WorkoutTemplate, ExerciseTemplate } from '../types/models';
import type { CSVProgramData } from '../types/csv';
import { v4 as uuidv4 } from 'uuid';

// Create a 5-day split program
export async function create5DaySplit(): Promise<Program> {
  const programId = uuidv4();
  const program: Program = {
    id: programId,
    name: '5-Day Split',
    createdAt: new Date(),
    updatedAt: new Date(),
    startDate: new Date(),
    totalWeeks: 12,
  };

  await db.programs.add(program);

  const days = [
    { name: 'Day 1 – Upper', idx: 0 },
    { name: 'Day 2 – Lower', idx: 1 },
    { name: 'Day 3 – Pull', idx: 2 },
    { name: 'Day 4 – Push', idx: 3 },
    { name: 'Day 5 – Legs', idx: 4 },
  ];

  for (const day of days) {
    const templateId = uuidv4();
    const template: WorkoutTemplate = {
      id: templateId,
      name: day.name,
      dayIndex: day.idx,
      weekNumber: 1,
      programId,
    };

    await db.workoutTemplates.add(template);

    // Add starter exercises for Day 1
    if (day.idx === 0) {
      const exercises: Omit<ExerciseTemplate, 'id'>[] = [
        { name: 'Barbell Bench Press', targetSets: 3, targetReps: '5-8', orderIndex: 0, workoutTemplateId: templateId },
        { name: 'Incline DB Press', targetSets: 3, targetReps: '8-10', orderIndex: 1, workoutTemplateId: templateId },
        { name: 'Overhead Press', targetSets: 3, targetReps: '8-10', orderIndex: 2, workoutTemplateId: templateId },
      ];

      for (const ex of exercises) {
        await db.exerciseTemplates.add({ id: uuidv4(), ...ex });
      }
    }
  }

  return program;
}

// Create a 3-day split program
export async function create3DaySplit(): Promise<Program> {
  const programId = uuidv4();
  const program: Program = {
    id: programId,
    name: '3-Day Split',
    createdAt: new Date(),
    updatedAt: new Date(),
    startDate: new Date(),
    totalWeeks: 12,
  };

  await db.programs.add(program);

  const days = [
    {
      name: 'Full Body A',
      idx: 0,
      exercises: [
        { name: 'Barbell Bench Press', targetSets: 3, targetReps: '6-8', orderIndex: 0 },
        { name: 'Barbell Row', targetSets: 3, targetReps: '6-8', orderIndex: 1 },
        { name: 'Overhead Press', targetSets: 3, targetReps: '8-10', orderIndex: 2 },
        { name: 'Pull-Ups', targetSets: 3, targetReps: '6-10', orderIndex: 3 },
        { name: 'Dumbbell Curl', targetSets: 3, targetReps: '10-12', orderIndex: 4 },
        { name: 'Triceps Pushdown', targetSets: 3, targetReps: '10-12', orderIndex: 5 },
      ],
    },
    {
      name: 'Legs',
      idx: 1,
      exercises: [
        { name: 'Barbell Squat', targetSets: 4, targetReps: '6-8', orderIndex: 0 },
        { name: 'Romanian Deadlift', targetSets: 3, targetReps: '8-10', orderIndex: 1 },
        { name: 'Leg Press', targetSets: 3, targetReps: '10-12', orderIndex: 2 },
        { name: 'Leg Curl', targetSets: 3, targetReps: '10-12', orderIndex: 3 },
        { name: 'Standing Calf Raise', targetSets: 4, targetReps: '12-15', orderIndex: 4 },
        { name: 'Plank', targetSets: 3, targetReps: '30-60s', orderIndex: 5 },
      ],
    },
    {
      name: 'Full Body B',
      idx: 2,
      exercises: [
        { name: 'Incline Dumbbell Press', targetSets: 3, targetReps: '8-10', orderIndex: 0 },
        { name: 'Lat Pulldown', targetSets: 3, targetReps: '8-10', orderIndex: 1 },
        { name: 'Dumbbell Shoulder Press', targetSets: 3, targetReps: '8-10', orderIndex: 2 },
        { name: 'Cable Row', targetSets: 3, targetReps: '10-12', orderIndex: 3 },
        { name: 'Hammer Curl', targetSets: 3, targetReps: '10-12', orderIndex: 4 },
        { name: 'Overhead Triceps Extension', targetSets: 3, targetReps: '10-12', orderIndex: 5 },
      ],
    },
  ];

  for (const day of days) {
    const templateId = uuidv4();
    const template: WorkoutTemplate = {
      id: templateId,
      name: day.name,
      dayIndex: day.idx,
      weekNumber: 1,
      programId,
    };

    await db.workoutTemplates.add(template);

    for (const ex of day.exercises) {
      await db.exerciseTemplates.add({
        id: uuidv4(),
        ...ex,
        workoutTemplateId: templateId,
      });
    }
  }

  return program;
}

// Create minimal effort 4-day program
export async function createMinimalEffort4Day(): Promise<Program> {
  const programId = uuidv4();
  const program: Program = {
    id: programId,
    name: 'Minimal Effort (4-Day)',
    createdAt: new Date(),
    updatedAt: new Date(),
    startDate: new Date(),
    totalWeeks: 12,
  };

  await db.programs.add(program);

  const days = [
    {
      name: 'Upper A',
      idx: 0,
      exercises: [
        { name: 'Barbell Bench Press', targetSets: 2, targetReps: '5-8', orderIndex: 0 },
        { name: 'Barbell Row', targetSets: 2, targetReps: '5-8', orderIndex: 1 },
        { name: 'Overhead Press', targetSets: 2, targetReps: '6-10', orderIndex: 2 },
        { name: 'Face Pulls', targetSets: 2, targetReps: '12-15', orderIndex: 3 },
      ],
    },
    {
      name: 'Lower A',
      idx: 1,
      exercises: [
        { name: 'Barbell Squat', targetSets: 2, targetReps: '5-8', orderIndex: 0 },
        { name: 'Romanian Deadlift', targetSets: 2, targetReps: '6-10', orderIndex: 1 },
        { name: 'Leg Curl', targetSets: 2, targetReps: '10-12', orderIndex: 2 },
        { name: 'Standing Calf Raise', targetSets: 2, targetReps: '12-15', orderIndex: 3 },
      ],
    },
    {
      name: 'Upper B',
      idx: 2,
      exercises: [
        { name: 'Incline Dumbbell Press', targetSets: 2, targetReps: '6-10', orderIndex: 0 },
        { name: 'Pull-Ups', targetSets: 2, targetReps: '5-10', orderIndex: 1 },
        { name: 'Dumbbell Curl', targetSets: 2, targetReps: '8-12', orderIndex: 2 },
        { name: 'Triceps Pushdown', targetSets: 2, targetReps: '10-12', orderIndex: 3 },
      ],
    },
    {
      name: 'Lower B',
      idx: 3,
      exercises: [
        { name: 'Deadlift', targetSets: 2, targetReps: '5-8', orderIndex: 0 },
        { name: 'Bulgarian Split Squat', targetSets: 2, targetReps: '8-10', orderIndex: 1 },
        { name: 'Leg Extension', targetSets: 2, targetReps: '10-12', orderIndex: 2 },
        { name: 'Ab Wheel Rollout', targetSets: 2, targetReps: '8-12', orderIndex: 3 },
      ],
    },
  ];

  for (const day of days) {
    const templateId = uuidv4();
    const template: WorkoutTemplate = {
      id: templateId,
      name: day.name,
      dayIndex: day.idx,
      weekNumber: 1,
      programId,
    };

    await db.workoutTemplates.add(template);

    for (const ex of day.exercises) {
      await db.exerciseTemplates.add({
        id: uuidv4(),
        ...ex,
        workoutTemplateId: templateId,
      });
    }
  }

  return program;
}

// Create upper/lower 4-day program
export async function createUpperLower4Day(): Promise<Program> {
  const programId = uuidv4();
  const program: Program = {
    id: programId,
    name: 'Upper/Lower 4-Day',
    createdAt: new Date(),
    updatedAt: new Date(),
    startDate: new Date(),
    totalWeeks: 12,
  };

  await db.programs.add(program);

  const days = [
    {
      name: 'Upper A',
      idx: 0,
      exercises: [
        { name: 'Barbell Bench Press', targetSets: 4, targetReps: '6-8', orderIndex: 0 },
        { name: 'Barbell Row', targetSets: 4, targetReps: '6-8', orderIndex: 1 },
        { name: 'Overhead Press', targetSets: 3, targetReps: '8-10', orderIndex: 2 },
        { name: 'Lat Pulldown', targetSets: 3, targetReps: '8-10', orderIndex: 3 },
        { name: 'Lateral Raise', targetSets: 3, targetReps: '12-15', orderIndex: 4 },
        { name: 'Dumbbell Curl', targetSets: 3, targetReps: '10-12', orderIndex: 5 },
      ],
    },
    {
      name: 'Lower A',
      idx: 1,
      exercises: [
        { name: 'Barbell Squat', targetSets: 4, targetReps: '6-8', orderIndex: 0 },
        { name: 'Romanian Deadlift', targetSets: 3, targetReps: '8-10', orderIndex: 1 },
        { name: 'Leg Press', targetSets: 3, targetReps: '10-12', orderIndex: 2 },
        { name: 'Leg Curl', targetSets: 3, targetReps: '10-12', orderIndex: 3 },
        { name: 'Standing Calf Raise', targetSets: 4, targetReps: '12-15', orderIndex: 4 },
        { name: 'Cable Crunch', targetSets: 3, targetReps: '12-15', orderIndex: 5 },
      ],
    },
    {
      name: 'Upper B',
      idx: 2,
      exercises: [
        { name: 'Incline Dumbbell Press', targetSets: 4, targetReps: '8-10', orderIndex: 0 },
        { name: 'Pull-Ups', targetSets: 4, targetReps: '6-10', orderIndex: 1 },
        { name: 'Dumbbell Shoulder Press', targetSets: 3, targetReps: '8-10', orderIndex: 2 },
        { name: 'Cable Row', targetSets: 3, targetReps: '10-12', orderIndex: 3 },
        { name: 'Face Pulls', targetSets: 3, targetReps: '12-15', orderIndex: 4 },
        { name: 'Triceps Pushdown', targetSets: 3, targetReps: '10-12', orderIndex: 5 },
      ],
    },
    {
      name: 'Lower B',
      idx: 3,
      exercises: [
        { name: 'Deadlift', targetSets: 4, targetReps: '5-8', orderIndex: 0 },
        { name: 'Bulgarian Split Squat', targetSets: 3, targetReps: '8-10', orderIndex: 1 },
        { name: 'Leg Extension', targetSets: 3, targetReps: '10-12', orderIndex: 2 },
        { name: 'Seated Leg Curl', targetSets: 3, targetReps: '10-12', orderIndex: 3 },
        { name: 'Seated Calf Raise', targetSets: 4, targetReps: '15-20', orderIndex: 4 },
        { name: 'Plank', targetSets: 3, targetReps: '45-60s', orderIndex: 5 },
      ],
    },
  ];

  for (const day of days) {
    const templateId = uuidv4();
    const template: WorkoutTemplate = {
      id: templateId,
      name: day.name,
      dayIndex: day.idx,
      weekNumber: 1,
      programId,
    };

    await db.workoutTemplates.add(template);

    for (const ex of day.exercises) {
      await db.exerciseTemplates.add({
        id: uuidv4(),
        ...ex,
        workoutTemplateId: templateId,
      });
    }
  }

  return program;
}

// Create a program from imported CSV data
export async function createProgramFromCSV(csvData: CSVProgramData): Promise<Program> {
  const programId = uuidv4();
  const program: Program = {
    id: programId,
    name: csvData.programName,
    createdAt: new Date(),
    updatedAt: new Date(),
    startDate: new Date(),
    totalWeeks: csvData.totalWeeks,
  };

  await db.programs.add(program);

  // Create workout templates and exercise templates for each day
  // Note: csvData.days may contain multiple entries per day (one for each week)
  for (const day of csvData.days) {
    const templateId = uuidv4();
    const template: WorkoutTemplate = {
      id: templateId,
      name: day.dayName,
      dayIndex: day.dayIndex,
      weekNumber: day.weekNumber || 1, // Use the week number from CSV or default to 1
      programId,
    };

    await db.workoutTemplates.add(template);

    // Add exercises in the order they appear in the CSV
    for (const exercise of day.exercises) {
      await db.exerciseTemplates.add({
        id: uuidv4(),
        name: exercise.name,
        targetSets: exercise.targetSets,
        targetReps: exercise.targetReps,
        notes: exercise.notes,
        orderIndex: exercise.orderIndex,
        workoutTemplateId: templateId,
      });
    }
  }

  return program;
}

// Ensure at least one program exists
export async function ensureDefaultProgram(): Promise<Program> {
  const existing = await db.programs.toCollection().first();

  if (existing) {
    return existing;
  }

  return await create5DaySplit();
}
