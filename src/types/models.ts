// Data models matching the iOS LiftTracker app

export interface Program {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  startDate: Date;
  totalWeeks: number;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  dayIndex: number; // 0..6
  weekNumber: number; // 1..12
  programId: string;
}

export interface ExerciseTemplate {
  id: string;
  name: string;
  targetSets: number;
  targetReps?: string;
  notes?: string;
  orderIndex: number;
  workoutTemplateId: string;
}

export interface Workout {
  id: string;
  name: string;
  startedAt: Date;
  endedAt?: Date;
  programNameSnapshot?: string;
  totalPausedMs?: number; // Total time workout was paused in milliseconds
  isQuickWorkout?: boolean; // Whether this was a quick workout with reduced volume (~70% of sets)
}

export interface ExerciseInstance {
  id: string;
  name: string;
  workoutId: string;
  orderIndex: number;
  targetSets: number;
  targetReps?: string;
  notes?: string;
  isCustom?: boolean; // Whether this exercise was added manually during the workout
}

export interface SetRecord {
  id: string;
  exerciseId: string;
  weight: number; // kilograms
  reps: number;
  rpe?: number; // 6.0...10.0
  timestamp: Date;
  isWarmup: boolean;
}

export interface PersonalRecord {
  id: string;
  exerciseName: string;
  reps: number;
  bestWeight: number;
  occurredAt: Date;
}

export interface SettingsModel {
  id: string;
  useEpley: boolean; // else Brzycki
  activeProgramId?: string;
  disclaimerAccepted?: boolean; // User permanently dismissed disclaimer
  lastDisclaimerShown?: Date; // Last time disclaimer was shown
  // Rest timer settings
  restTimerEnabled?: boolean; // Whether rest timer is enabled (default: true)
  restTimerAutoStart?: boolean; // Auto-start timer after logging set (default: true)
  restTimerDuration?: number; // Default rest duration in seconds (default: 90)
  restTimerSound?: boolean; // Play sound when timer completes (default: true)
}

// Enum for split days
export const Split = {
  Day1: 0,
  Day2: 1,
  Day3: 2,
  Day4: 3,
  Day5: 4,
} as const;

export type Split = typeof Split[keyof typeof Split];

// Helper type for exercise with sets
export interface ExerciseWithSets extends ExerciseInstance {
  sets: SetRecord[];
}

// Helper type for workout with exercises
export interface WorkoutWithExercises extends Workout {
  exercises: ExerciseWithSets[];
}

// Program template data structure (for creating programs)
export interface ProgramTemplateExercise {
  name: string;
  targetSets: number;
  targetReps: string;
  orderIndex: number;
}

export interface ProgramTemplateDay {
  name: string;
  dayIndex: number;
  exercises: ProgramTemplateExercise[];
}

export interface ProgramTemplate {
  name: string;
  days: ProgramTemplateDay[];
}
