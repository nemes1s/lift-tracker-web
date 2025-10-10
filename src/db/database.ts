import Dexie, { type Table } from 'dexie';
import type {
  Program,
  WorkoutTemplate,
  ExerciseTemplate,
  Workout,
  ExerciseInstance,
  SetRecord,
  PersonalRecord,
  SettingsModel,
} from '../types/models';

export class LiftTrackerDatabase extends Dexie {
  programs!: Table<Program, string>;
  workoutTemplates!: Table<WorkoutTemplate, string>;
  exerciseTemplates!: Table<ExerciseTemplate, string>;
  workouts!: Table<Workout, string>;
  exerciseInstances!: Table<ExerciseInstance, string>;
  setRecords!: Table<SetRecord, string>;
  personalRecords!: Table<PersonalRecord, string>;
  settings!: Table<SettingsModel, string>;

  constructor() {
    super('LiftTrackerDB');

    this.version(1).stores({
      programs: 'id, name, createdAt, startDate',
      workoutTemplates: 'id, programId, dayIndex, weekNumber',
      exerciseTemplates: 'id, workoutTemplateId, orderIndex',
      workouts: 'id, startedAt, endedAt',
      exerciseInstances: 'id, workoutId, orderIndex',
      setRecords: 'id, exerciseId, timestamp',
      personalRecords: 'id, exerciseName, occurredAt',
      settings: 'id',
    });
  }
}

export const db = new LiftTrackerDatabase();
