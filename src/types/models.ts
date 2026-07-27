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
  isMyoreps?: boolean; // Whether this exercise uses myoreps (rest-pause) technique
  isLengthenedPartials?: boolean; // Whether this exercise uses lengthened partials technique
}

export interface Workout {
  id: string;
  name: string;
  startedAt: Date;
  endedAt?: Date;
  programId?: string; // Program ID for proper linking
  programNameSnapshot?: string; // Kept for backwards compatibility
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
  isMyoreps?: boolean; // Whether this exercise uses myoreps (rest-pause) technique
  isLengthenedPartials?: boolean; // Whether this exercise uses lengthened partials technique
}

export interface SetRecord {
  id: string;
  exerciseId: string;
  weight: number; // kilograms
  reps: number;
  rpe?: number; // 6.0...10.0
  timestamp: Date;
  isWarmup: boolean;
  isPR?: boolean; // Whether this set is a personal record
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
  // Cookie / analytics consent
  cookieConsent?: 'granted' | 'denied'; // Whether the user allowed Google Analytics cookies
  cookieConsentDate?: Date; // When the consent choice was made
  // Rest timer settings
  restTimerEnabled?: boolean; // Whether rest timer is enabled (default: true)
  restTimerAutoStart?: boolean; // Auto-start timer after logging set (default: true)
  restTimerDuration?: number; // Default rest duration in seconds (default: 90)
  restTimerSound?: boolean; // Play sound when timer completes (default: true)
  // Weekly streak settings
  targetWorkoutsPerWeek?: number; // Target number of workouts per week for streak calculation (default: 3)
  // Calendar settings
  weekStartDay?: number; // Day of week to start the calendar (0 = Sunday, 1 = Monday, etc.) (default: 0)
  // Weight unit settings
  weightUnit?: 'kg' | 'lbs'; // Weight unit preference (default: 'kg')
  // Notification settings
  notificationsEnabled?: boolean; // Master switch for all notifications (default: false)
  workoutRemindersEnabled?: boolean; // Whether daily workout reminders are enabled (default: false)
  workoutReminderTime?: string; // Time for daily workout reminder in "HH:MM" format (default: "09:00")
  workoutReminderDays?: number[]; // Days to show reminder (0=Sun, 6=Sat) (default: [1,2,3,4,5])
  restTimerNotifications?: boolean; // Show notification when rest timer completes (default: false)
  streakRemindersEnabled?: boolean; // Remind user if they haven't worked out in a while (default: false)
  lastWorkoutReminderShown?: Date; // Last time workout reminder was shown
  lastStreakReminderShown?: Date; // Last time streak reminder was shown
  // Migration tracking
  programIdMigrationComplete?: boolean; // Whether programId migration has been run
  exerciseMigrationComplete?: boolean; // Whether exercise name migration to exercise library has been run
  // Workout behavior settings
  autoAdvanceOnTargetSets?: boolean; // Auto-advance to next exercise once target sets are hit (default: false)
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  force: 'push' | 'pull' | 'static' | null;
  level: 'beginner' | 'intermediate' | 'expert';
  mechanic: 'compound' | 'isolation' | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  category: string;
}

export interface ProgramCompletion {
  id: string;
  programId: string; // Reference to the program
  programName: string; // Snapshot of program name at completion
  startDate: Date; // When this program cycle started
  completionDate: Date; // When the program was marked complete
  totalWeeks: number; // Snapshot of total weeks
  totalWorkoutsCompleted: number; // Number of workouts completed in this cycle
  totalVolume: number; // Total volume (weight × reps) across all workouts
  totalSetsCompleted: number; // Total number of sets logged
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
