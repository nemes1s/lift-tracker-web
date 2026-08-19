import type { Table } from 'dexie';
import { db } from '../db/database';
import { DATE_FIELDS, reviveDates } from './backup';

/**
 * Find the best matching program for a workout by name
 * When multiple programs have the same name, uses heuristics to pick the right one:
 * 1. If workout date falls within program's date range, prefer that program
 * 2. Otherwise, prefer the most recently created program (likely the active one)
 */
function findBestMatchingProgram(
  programNameSnapshot: string,
  workoutStartDate: Date,
  programsWithName: Array<{ id: string; name: string; createdAt: Date; startDate: Date }>
): string | null {
  if (programsWithName.length === 0) return null;
  if (programsWithName.length === 1) return programsWithName[0].id;

  console.log(`[Migration] Multiple programs found for "${programNameSnapshot}" (${programsWithName.length}), using heuristics to disambiguate`);

  // Try to find a program where the workout date falls within the program's active period
  // Program is "active" from startDate onwards
  const workoutTime = workoutStartDate.getTime();
  const candidatesByDateRange = programsWithName.filter(p => {
    const programStart = new Date(p.startDate).getTime();
    // Consider a program as candidate if workout happened after or around program start
    // Allow 1 week before program start (in case of timezone issues or user starting before official start)
    return workoutTime >= programStart - (7 * 24 * 60 * 60 * 1000);
  });

  if (candidatesByDateRange.length > 0) {
    // Among candidates, pick the most recently created (most likely the active program)
    const best = candidatesByDateRange.reduce((prev, curr) =>
      new Date(curr.createdAt).getTime() > new Date(prev.createdAt).getTime() ? curr : prev
    );
    console.log(`[Migration] Selected program "${best.name}" (${best.id}) based on date range heuristic`);
    return best.id;
  }

  // Fallback: just pick the most recently created program with this name
  const best = programsWithName.reduce((prev, curr) =>
    new Date(curr.createdAt).getTime() > new Date(prev.createdAt).getTime() ? curr : prev
  );
  console.log(`[Migration] Selected program "${best.name}" (${best.id}) as most recently created`);
  return best.id;
}

/**
 * Migration: Backfill programId for existing workouts
 *
 * This migration adds programId to workouts that only have programNameSnapshot.
 * It matches workouts to programs by name, with smart disambiguation when
 * multiple programs have the same name.
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

    // Group programs by name to handle duplicates
    const programsByName = new Map<string, Array<{ id: string; name: string; createdAt: Date; startDate: Date }>>();
    for (const program of allPrograms) {
      if (!programsByName.has(program.name)) {
        programsByName.set(program.name, []);
      }
      programsByName.get(program.name)!.push({
        id: program.id,
        name: program.name,
        createdAt: program.createdAt,
        startDate: program.startDate,
      });
    }

    let migratedCount = 0;
    let failedCount = 0;
    let disambiguatedCount = 0;

    // Update each workout
    for (const workout of workoutsNeedingMigration) {
      const programsWithName = programsByName.get(workout.programNameSnapshot!);

      if (!programsWithName) {
        failedCount++;
        console.warn(
          `[Migration] Could not find any program for workout "${workout.name}" (${workout.id}) with programNameSnapshot: "${workout.programNameSnapshot}"`
        );
        continue;
      }

      if (programsWithName.length > 1) {
        disambiguatedCount++;
      }

      const programId = findBestMatchingProgram(
        workout.programNameSnapshot!,
        new Date(workout.startedAt),
        programsWithName
      );

      if (programId) {
        await db.workouts.update(workout.id, { programId });
        migratedCount++;
        console.log(`[Migration] Migrated workout "${workout.name}" (${workout.id}) to program ID: ${programId}`);
      } else {
        failedCount++;
      }
    }

    console.log(`[Migration] Migration complete: ${migratedCount} migrated, ${failedCount} failed, ${disambiguatedCount} disambiguated`);
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
  }

  if (!settings?.dateRepairMigrationComplete) {
    console.log('[Migrations] Running serialized-date repair...');
    await migrateSerializedDates();

    if (settings) {
      await db.settings.update(settings.id, { dateRepairMigrationComplete: true });
    }
  }

  console.log('[Migrations] Done');
}

/**
 * Migration: Repair Date fields stored as ISO strings
 *
 * Backups created before the import fix round-tripped Date objects through
 * JSON, so `importBackup` wrote plain strings into IndexedDB. Any restored
 * record then crashed views that call `.getTime()` on those fields (opening
 * a restored workout from the calendar, for example) and sorted after real
 * Dates in date indexes. This rewrites the affected rows as real Dates.
 */
export async function migrateSerializedDates(): Promise<void> {
  const tables: Array<{ table: Table<Record<string, unknown>, string>; name: string; fields: readonly string[] }> = [
    { table: db.programs as never, name: 'programs', fields: DATE_FIELDS.programs },
    { table: db.workouts as never, name: 'workouts', fields: DATE_FIELDS.workouts },
    { table: db.setRecords as never, name: 'setRecords', fields: DATE_FIELDS.setRecords },
    { table: db.personalRecords as never, name: 'personalRecords', fields: DATE_FIELDS.personalRecords },
    { table: db.programCompletions as never, name: 'programCompletions', fields: DATE_FIELDS.programCompletions },
  ];

  let totalRepaired = 0;

  for (const { table, name, fields } of tables) {
    const rows = await table.toArray();
    const needsRepair = rows.filter(row =>
      fields.some(field => typeof row[field] === 'string')
    );

    if (needsRepair.length === 0) continue;

    await table.bulkPut(reviveDates<Record<string, unknown>>(needsRepair, fields));
    totalRepaired += needsRepair.length;
    console.log(`[Migration] Repaired ${needsRepair.length} string dates in ${name}`);
  }

  console.log(
    totalRepaired === 0
      ? '[Migration] No string dates found'
      : `[Migration] Date repair complete: ${totalRepaired} records`
  );
}
