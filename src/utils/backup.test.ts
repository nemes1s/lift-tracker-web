import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db/database';
import { parseBackupFile, importBackup, type BackupData } from './backup';
import { migrateSerializedDates } from './migrations';
import { calculateWorkoutStats } from './workoutStats';

const startedAt = new Date('2026-07-01T10:00:00.000Z');
const endedAt = new Date('2026-07-01T11:00:00.000Z');

function makeBackup(): BackupData {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    programs: [
      {
        id: 'p1',
        name: 'Test Program',
        createdAt: new Date('2026-06-01T00:00:00.000Z'),
        updatedAt: new Date('2026-06-01T00:00:00.000Z'),
        startDate: new Date('2026-06-01T00:00:00.000Z'),
        totalWeeks: 12,
      },
    ],
    workoutTemplates: [],
    exerciseTemplates: [],
    workouts: [{ id: 'w1', name: 'Push Day', startedAt, endedAt, programId: 'p1' }],
    exerciseInstances: [
      { id: 'e1', name: 'Bench Press', workoutId: 'w1', orderIndex: 0, targetSets: 3 },
    ],
    setRecords: [
      {
        id: 's1',
        exerciseId: 'e1',
        weight: 100,
        reps: 5,
        timestamp: new Date('2026-07-01T10:15:00.000Z'),
        isWarmup: false,
      },
    ],
    personalRecords: [
      {
        id: 'pr1',
        exerciseName: 'Bench Press',
        reps: 5,
        bestWeight: 100,
        occurredAt: new Date('2026-07-01T10:15:00.000Z'),
      },
    ],
  };
}

/** Mimics the real round trip: export writes JSON, import reads it back. */
function roundTrip(): BackupData {
  return parseBackupFile(JSON.stringify(makeBackup()));
}

beforeEach(async () => {
  await Promise.all([
    db.programs.clear(),
    db.workoutTemplates.clear(),
    db.exerciseTemplates.clear(),
    db.workouts.clear(),
    db.exerciseInstances.clear(),
    db.setRecords.clear(),
    db.personalRecords.clear(),
    db.programCompletions.clear(),
    db.settings.clear(),
  ]);
});

describe('importBackup date handling', () => {
  it('restores workout dates as Date objects, not ISO strings', async () => {
    await importBackup(roundTrip());

    const workout = await db.workouts.get('w1');
    expect(workout!.startedAt).toBeInstanceOf(Date);
    expect(workout!.endedAt).toBeInstanceOf(Date);
    expect(workout!.startedAt.getTime()).toBe(startedAt.getTime());
    expect(workout!.endedAt!.getTime()).toBe(endedAt.getTime());
  });

  it('restores dates on programs, set records and personal records', async () => {
    await importBackup(roundTrip());

    const program = await db.programs.get('p1');
    expect(program!.createdAt).toBeInstanceOf(Date);
    expect(program!.updatedAt).toBeInstanceOf(Date);
    expect(program!.startDate).toBeInstanceOf(Date);

    const set = await db.setRecords.get('s1');
    expect(set!.timestamp).toBeInstanceOf(Date);

    const pr = await db.personalRecords.get('pr1');
    expect(pr!.occurredAt).toBeInstanceOf(Date);
  });

  it('lets a restored workout render stats without throwing', async () => {
    await importBackup(roundTrip());

    const workout = await db.workouts.get('w1');
    const sets = await db.setRecords.where('exerciseId').equals('e1').toArray();

    // This is what WorkoutDetail does on render; with string dates it threw
    // "startedAt.getTime is not a function".
    const stats = calculateWorkoutStats(
      [{ sets }],
      workout!.startedAt,
      workout!.endedAt,
      workout!.totalPausedMs
    );

    expect(stats.duration).toBe(60);
    expect(stats.totalVolume).toBe(500);
  });

  it('keeps restored workouts in date order alongside newer ones', async () => {
    await importBackup(roundTrip());
    await db.workouts.add({
      id: 'w2',
      name: 'Later Workout',
      startedAt: new Date('2026-08-01T10:00:00.000Z'),
      programId: 'p1',
    });

    const ordered = await db.workouts.orderBy('startedAt').reverse().toArray();
    expect(ordered.map(w => w.id)).toEqual(['w2', 'w1']);
  });
});

describe('migrateSerializedDates', () => {
  it('repairs rows already written as ISO strings by an older import', async () => {
    const stale = roundTrip();
    // Write the raw JSON rows straight in, bypassing the fixed import path.
    await db.workouts.bulkAdd(stale.workouts as never[]);
    await db.setRecords.bulkAdd(stale.setRecords as never[]);
    await db.programs.bulkAdd(stale.programs as never[]);
    await db.personalRecords.bulkAdd(stale.personalRecords as never[]);

    expect(typeof (await db.workouts.get('w1'))!.startedAt).toBe('string');

    await migrateSerializedDates();

    const workout = await db.workouts.get('w1');
    expect(workout!.startedAt).toBeInstanceOf(Date);
    expect(workout!.startedAt.getTime()).toBe(startedAt.getTime());
    expect((await db.setRecords.get('s1'))!.timestamp).toBeInstanceOf(Date);
    expect((await db.programs.get('p1'))!.startDate).toBeInstanceOf(Date);
    expect((await db.personalRecords.get('pr1'))!.occurredAt).toBeInstanceOf(Date);
  });

  it('leaves already-correct data untouched', async () => {
    await importBackup(roundTrip());
    await migrateSerializedDates();

    const workout = await db.workouts.get('w1');
    expect(workout!.startedAt).toBeInstanceOf(Date);
    expect(workout!.startedAt.getTime()).toBe(startedAt.getTime());
  });
});
