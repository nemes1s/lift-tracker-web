import { db } from '../db/database';

/**
 * Migration: Backfill programId for existing workouts
 *
 * This migration adds programId to workouts that only have programNameSnapshot.
 * It matches workouts to programs by name.
 */
export async function migrateProgramIdToWorkouts(): Promise<void> {
  try {
    console.log('[Migration] Starting programId backfill migration...');

    // Get all workouts that don't have programId but have programNameSnapshot
    const allWorkouts = await db.workouts.toArray();
    const workoutsNeedingMigration = allWorkouts.filter(
      w => !w.programId && w.programNameSnapshot
    );

    if (workoutsNeedingMigration.length === 0) {
      console.log('[Migration] No workouts need migration');
      return;
    }

    console.log(`[Migration] Found ${workoutsNeedingMigration.length} workouts to migrate`);

    // Get all programs
    const allPrograms = await db.programs.toArray();
    const programsByName = new Map(
      allPrograms.map(p => [p.name, p.id])
    );

    let migratedCount = 0;
    let failedCount = 0;

    // Update each workout
    for (const workout of workoutsNeedingMigration) {
      const programId = programsByName.get(workout.programNameSnapshot!);

      if (programId) {
        await db.workouts.update(workout.id, { programId });
        migratedCount++;
        console.log(`[Migration] Migrated workout "${workout.name}" (${workout.id}) to program ID: ${programId}`);
      } else {
        failedCount++;
        console.warn(
          `[Migration] Could not find program for workout "${workout.name}" (${workout.id}) with programNameSnapshot: "${workout.programNameSnapshot}"`
        );
      }
    }

    console.log(`[Migration] Migration complete: ${migratedCount} migrated, ${failedCount} failed`);
  } catch (error) {
    console.error('[Migration] Migration failed:', error);
    throw error;
  }
}

/**
 * Run all pending migrations
 */
export async function runMigrations(): Promise<void> {
  console.log('[Migrations] Checking for pending migrations...');

  // Check if we need to run the programId migration
  const settings = await db.settings.toCollection().first();
  const hasRunProgramIdMigration = settings?.programIdMigrationComplete;

  if (!hasRunProgramIdMigration) {
    console.log('[Migrations] Running programId migration...');
    await migrateProgramIdToWorkouts();

    // Mark migration as complete
    if (settings) {
      await db.settings.update(settings.id, { programIdMigrationComplete: true });
    }
  } else {
    console.log('[Migrations] All migrations already completed');
  }
}
