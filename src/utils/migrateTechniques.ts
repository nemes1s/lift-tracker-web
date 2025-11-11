import { db } from '../db/database';

/**
 * Migration utility to add myoreps and lengthened partials flags to existing exercises
 * This updates exercises in the database based on their name and position in the workout
 */
export async function migrateTechniqueFlagsToExistingPrograms(): Promise<number> {
  let updatedCount = 0;

  // Define which exercises should have which techniques
  const myorepsExercises = [
    'Lateral Raise',
    'Cable Lateral Raise',
    'Dumbbell Curl',
    'Triceps Pushdown',
    'Face Pulls',
    'Incline Dumbbell Curl',
    'Hammer Curl',
    'Overhead Triceps Ext.',
    'Seated Leg Curl',
    'Standing Calf Raise',
    'Cable Crunch',
    'EZ Bar Curl',
    'Rope Triceps Extension',
    'Lying Leg Curl',
    'Seated Calf Raise',
    'Hanging Leg Raise',
    'Rear Delt Fly',
    'Cable Curl',
    'Reverse Curl',
    'Cable Triceps Kickback',
    'Donkey Calf Raise',
    'Barbell Curl',
    'Skull Crushers',
    'Preacher Curl',
    'Concentration Curl',
    'Calf Press on Leg Press',
  ];

  const lengthenedPartialsExercises = [
    'Romanian Deadlift',
    'Dumbbell Curl',
    'Seated Leg Curl',
    'Standing Calf Raise',
    'Cable Fly',
    'Overhead Triceps Ext.',
    'Incline Dumbbell Curl',
    'Hammer Curl',
    'Leg Extension',
    'Seated Calf Raise',
    'EZ Bar Curl',
    'Rope Triceps Extension',
    'Good Morning',
    'Lying Leg Curl',
    'Rear Delt Fly',
    'Cable Curl',
    'Reverse Curl',
    'Incline Dumbbell Fly',
    'Pec Deck',
    'Cable Triceps Kickback',
    'Sissy Squat',
    'Glute Ham Raise',
    'Donkey Calf Raise',
    'Barbell Curl',
    'Skull Crushers',
    'Nordic Hamstring Curl',
    'Preacher Curl',
    'Concentration Curl',
    'Calf Press on Leg Press',
  ];

  // Get all exercise templates
  const allExercises = await db.exerciseTemplates.toArray();

  for (const exercise of allExercises) {
    let needsUpdate = false;
    const updates: Partial<typeof exercise> = {};

    // Check if exercise should have myoreps flag
    if (myorepsExercises.includes(exercise.name) && !exercise.isMyoreps) {
      updates.isMyoreps = true;
      needsUpdate = true;
    }

    // Check if exercise should have lengthened partials flag
    if (lengthenedPartialsExercises.includes(exercise.name) && !exercise.isLengthenedPartials) {
      updates.isLengthenedPartials = true;
      needsUpdate = true;
    }

    // Update if needed
    if (needsUpdate) {
      await db.exerciseTemplates.update(exercise.id, updates);
      updatedCount++;
    }
  }

  console.log(`✅ Migrated ${updatedCount} exercises with technique flags`);
  return updatedCount;
}

/**
 * Check if migration is needed by looking for exercises that should have flags but don't
 */
export async function needsTechniqueMigration(): Promise<boolean> {
  const exercises = await db.exerciseTemplates.toArray();

  // Check if any exercise has the new flags already
  const hasFlags = exercises.some(e => e.isMyoreps || e.isLengthenedPartials);

  // If no exercises have flags but we have exercises, we need migration
  return exercises.length > 0 && !hasFlags;
}
