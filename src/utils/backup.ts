import { db } from '../db/database';

const BACKUP_VERSION = 1;

export interface BackupData {
  version: number;
  exportedAt: string;
  programs: unknown[];
  workoutTemplates: unknown[];
  exerciseTemplates: unknown[];
  workouts: unknown[];
  exerciseInstances: unknown[];
  setRecords: unknown[];
  personalRecords: unknown[];
}

export interface BackupStats {
  programs: number;
  workouts: number;
  setRecords: number;
  personalRecords: number;
}

/**
 * Date fields per table. JSON.stringify() serializes Date objects to ISO
 * strings, so a round-tripped backup contains strings where the models
 * declare `Date`. Anything downstream that calls `.getTime()` on them
 * (e.g. calculateDuration in workoutStats.ts) throws, and IndexedDB also
 * sorts string keys after real dates, corrupting `orderBy('startedAt')`.
 * These maps let us revive the strings back into Dates on import.
 */
export const DATE_FIELDS = {
  programs: ['createdAt', 'updatedAt', 'startDate'],
  workouts: ['startedAt', 'endedAt'],
  setRecords: ['timestamp'],
  personalRecords: ['occurredAt'],
  programCompletions: ['startDate', 'completionDate'],
} as const;

/** Revive ISO date strings into Date objects on a copy of each row. */
export function reviveDates<T>(rows: unknown[], fields: readonly string[]): T[] {
  return rows.map((row) => {
    if (typeof row !== 'object' || row === null) return row as T;
    const out = { ...(row as Record<string, unknown>) };
    for (const field of fields) {
      const value = out[field];
      if (typeof value === 'string') {
        const parsed = new Date(value);
        // Leave unparseable values alone rather than writing Invalid Date.
        if (!Number.isNaN(parsed.getTime())) out[field] = parsed;
      }
    }
    return out as T;
  });
}

export async function exportBackup(): Promise<void> {
  const data: BackupData = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    programs: await db.programs.toArray(),
    workoutTemplates: await db.workoutTemplates.toArray(),
    exerciseTemplates: await db.exerciseTemplates.toArray(),
    workouts: await db.workouts.toArray(),
    exerciseInstances: await db.exerciseInstances.toArray(),
    setRecords: await db.setRecords.toArray(),
    personalRecords: await db.personalRecords.toArray(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lifttracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseBackupFile(content: string): BackupData {
  let data: unknown;
  try {
    data = JSON.parse(content);
  } catch {
    throw new Error('File is not valid JSON.');
  }

  if (typeof data !== 'object' || data === null) throw new Error('Invalid backup format.');

  const d = data as Record<string, unknown>;
  const required = ['programs', 'workoutTemplates', 'exerciseTemplates', 'workouts', 'exerciseInstances', 'setRecords', 'personalRecords'];
  for (const key of required) {
    if (!Array.isArray(d[key])) throw new Error(`Missing or invalid field: ${key}`);
  }

  return data as BackupData;
}

export function getBackupStats(data: BackupData): BackupStats {
  return {
    programs: data.programs.length,
    workouts: data.workouts.length,
    setRecords: data.setRecords.length,
    personalRecords: data.personalRecords.length,
  };
}

export async function importBackup(data: BackupData): Promise<void> {
  await db.transaction(
    'rw',
    [db.programs, db.workoutTemplates, db.exerciseTemplates, db.workouts, db.exerciseInstances, db.setRecords, db.personalRecords],
    async () => {
      await db.programs.clear();
      await db.workoutTemplates.clear();
      await db.exerciseTemplates.clear();
      await db.workouts.clear();
      await db.exerciseInstances.clear();
      await db.setRecords.clear();
      await db.personalRecords.clear();

      if (data.programs.length) await db.programs.bulkAdd(reviveDates(data.programs, DATE_FIELDS.programs) as never[]);
      if (data.workoutTemplates.length) await db.workoutTemplates.bulkAdd(data.workoutTemplates as never[]);
      if (data.exerciseTemplates.length) await db.exerciseTemplates.bulkAdd(data.exerciseTemplates as never[]);
      if (data.workouts.length) await db.workouts.bulkAdd(reviveDates(data.workouts, DATE_FIELDS.workouts) as never[]);
      if (data.exerciseInstances.length) await db.exerciseInstances.bulkAdd(data.exerciseInstances as never[]);
      if (data.setRecords.length) await db.setRecords.bulkAdd(reviveDates(data.setRecords, DATE_FIELDS.setRecords) as never[]);
      if (data.personalRecords.length) await db.personalRecords.bulkAdd(reviveDates(data.personalRecords, DATE_FIELDS.personalRecords) as never[]);
    }
  );
}
