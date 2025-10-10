// TypeScript interfaces for CSV program import

export interface CSVProgramData {
  programName: string;
  totalWeeks: number;
  days: CSVDayData[];
}

export interface CSVDayData {
  dayIndex: number;
  dayName: string;
  exercises: CSVExerciseData[];
  weekNumber?: number; // Optional: for week-specific programs
}

export interface CSVExerciseData {
  name: string;
  targetSets: number;
  targetReps: string;
  notes?: string;
  orderIndex: number;
}

export interface CSVParseResult {
  success: boolean;
  data?: CSVProgramData;
  error?: string;
}
