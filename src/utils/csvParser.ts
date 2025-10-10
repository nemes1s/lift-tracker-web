import type { CSVProgramData, CSVDayData, CSVExerciseData, CSVParseResult } from '../types/csv';

/**
 * Parse CSV file content into program data structure
 * Supports two formats:
 *
 * Format 1 (Simple - comma delimited):
 * Program Name,<name>
 * Total Weeks,<number>
 * Day Index,Day Name,Exercise Name,Sets,Reps,Notes
 * 0,Day 1 - Upper,Barbell Bench Press,3,5-8,
 * ...
 *
 * Format 2 (Advanced - semicolon delimited, week-specific):
 * week;day_index;workout_name;exercise_name;target_sets;target_reps;notes
 * 1;0;Upper (Strength Focus);Bench Press;3;5-8;Focus on form
 * ...
 */
export function parseCSV(fileContent: string): CSVParseResult {
  try {
    const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line);

    if (lines.length < 2) {
      return {
        success: false,
        error: 'CSV file is too short',
      };
    }

    // Detect format by checking the first line
    const firstLine = lines[0];
    const delimiter = firstLine.includes(';') ? ';' : ',';

    // Check if it's Format 2 (week-based with semicolon)
    const headerParts = firstLine.toLowerCase().split(delimiter).map(s => s.trim());
    if (headerParts[0] === 'week' && headerParts.includes('day_index') && headerParts.includes('workout_name')) {
      return parseWeekBasedCSV(lines, delimiter);
    }

    // Otherwise, parse as Format 1 (simple format)
    return parseSimpleCSV(lines, delimiter);
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Parse Format 1: Simple format with metadata rows
 */
function parseSimpleCSV(lines: string[], delimiter: string): CSVParseResult {
  if (lines.length < 3) {
    return {
      success: false,
      error: 'CSV file is too short. Expected at least program name, total weeks, and header row.',
    };
  }

  // Parse program name
  const programNameLine = lines[0].split(delimiter).map(s => s.trim());
  if (programNameLine[0].toLowerCase() !== 'program name') {
    return {
      success: false,
      error: 'First line must be "Program Name,<name>"',
    };
  }
  const programName = programNameLine.slice(1).join(delimiter).trim();
  if (!programName) {
    return {
      success: false,
      error: 'Program name cannot be empty',
    };
  }

  // Parse total weeks
  const totalWeeksLine = lines[1].split(delimiter).map(s => s.trim());
  if (totalWeeksLine[0].toLowerCase() !== 'total weeks') {
    return {
      success: false,
      error: 'Second line must be "Total Weeks,<number>"',
    };
  }
  const totalWeeks = parseInt(totalWeeksLine[1]);
  if (isNaN(totalWeeks) || totalWeeks < 1) {
    return {
      success: false,
      error: 'Total weeks must be a positive number',
    };
  }

  // Check header row
  const headerLine = lines[2].split(delimiter).map(s => s.trim());
  const expectedHeaders = ['day index', 'day name', 'exercise name', 'sets', 'reps'];
  const hasValidHeader = expectedHeaders.every((header, idx) =>
    headerLine[idx]?.toLowerCase() === header
  );

  if (!hasValidHeader) {
    return {
      success: false,
      error: 'Header row must be: "Day Index,Day Name,Exercise Name,Sets,Reps,Notes"',
    };
  }

  // Parse exercise data
  const dayMap = new Map<number, { dayName: string; exercises: CSVExerciseData[] }>();

  for (let i = 3; i < lines.length; i++) {
    const parts = lines[i].split(delimiter).map(s => s.trim());

    if (parts.length < 5) {
      return {
        success: false,
        error: `Line ${i + 1}: Expected at least 5 columns`,
      };
    }

    const dayIndex = parseInt(parts[0]);
    const dayName = parts[1];
    const exerciseName = parts[2];
    const sets = parseInt(parts[3]);
    const reps = parts[4];
    const notes = parts[5] || undefined;

    // Validate
    if (isNaN(dayIndex) || dayIndex < 0 || dayIndex > 6) {
      return {
        success: false,
        error: `Line ${i + 1}: Day Index must be 0-6`,
      };
    }

    if (!dayName || !exerciseName) {
      return {
        success: false,
        error: `Line ${i + 1}: Day Name and Exercise Name required`,
      };
    }

    if (isNaN(sets) || sets < 1) {
      return {
        success: false,
        error: `Line ${i + 1}: Sets must be positive`,
      };
    }

    if (!reps) {
      return {
        success: false,
        error: `Line ${i + 1}: Reps cannot be empty`,
      };
    }

    if (!dayMap.has(dayIndex)) {
      dayMap.set(dayIndex, { dayName, exercises: [] });
    }

    const day = dayMap.get(dayIndex)!;
    day.exercises.push({
      name: exerciseName,
      targetSets: sets,
      targetReps: reps,
      notes: notes && notes.length > 0 ? notes : undefined,
      orderIndex: day.exercises.length,
    });
  }

  if (dayMap.size === 0) {
    return {
      success: false,
      error: 'No exercise data found',
    };
  }

  const days: CSVDayData[] = Array.from(dayMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([dayIndex, data]) => ({
      dayIndex,
      dayName: data.dayName,
      exercises: data.exercises,
      weekNumber: 1,
    }));

  return {
    success: true,
    data: {
      programName,
      totalWeeks,
      days,
    },
  };
}

/**
 * Parse Format 2: Week-based format (semicolon delimited)
 * week;day_index;workout_name;exercise_name;target_sets;target_reps;notes
 */
function parseWeekBasedCSV(lines: string[], delimiter: string): CSVParseResult {
  const header = lines[0].toLowerCase().split(delimiter).map(s => s.trim());

  // Find column indices
  const weekIdx = header.indexOf('week');
  const dayIdx = header.indexOf('day_index');
  const workoutIdx = header.indexOf('workout_name');
  const exerciseIdx = header.indexOf('exercise_name');
  const setsIdx = header.indexOf('target_sets');
  const repsIdx = header.indexOf('target_reps');
  const notesIdx = header.indexOf('notes');

  if (weekIdx === -1 || dayIdx === -1 || workoutIdx === -1 || exerciseIdx === -1 || setsIdx === -1 || repsIdx === -1) {
    return {
      success: false,
      error: 'Missing required columns: week, day_index, workout_name, exercise_name, target_sets, target_reps',
    };
  }

  // Parse data: Map of week -> Map of dayIndex -> exercises
  const weekDayMap = new Map<number, Map<number, { dayName: string; exercises: CSVExerciseData[] }>>();
  let maxWeek = 0;

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(delimiter).map(s => s.trim());

    if (parts.length < 6) continue; // Skip incomplete lines

    const week = parseInt(parts[weekIdx]);
    const dayIndex = parseInt(parts[dayIdx]);
    const workoutName = parts[workoutIdx];
    const exerciseName = parts[exerciseIdx];
    const sets = parseInt(parts[setsIdx]);
    const reps = parts[repsIdx];
    const notes = notesIdx >= 0 && parts[notesIdx] ? parts[notesIdx] : undefined;

    // Validation
    if (isNaN(week) || week < 1) continue;
    if (isNaN(dayIndex) || dayIndex < 0 || dayIndex > 6) continue;
    if (!workoutName || !exerciseName) continue;
    if (isNaN(sets) || sets < 1) continue;
    if (!reps) continue;

    maxWeek = Math.max(maxWeek, week);

    // Get or create week map
    if (!weekDayMap.has(week)) {
      weekDayMap.set(week, new Map());
    }
    const dayMap = weekDayMap.get(week)!;

    // Get or create day
    if (!dayMap.has(dayIndex)) {
      dayMap.set(dayIndex, { dayName: workoutName, exercises: [] });
    }
    const day = dayMap.get(dayIndex)!;

    // Add exercise
    day.exercises.push({
      name: exerciseName,
      targetSets: sets,
      targetReps: reps,
      notes: notes && notes.length > 0 ? notes : undefined,
      orderIndex: day.exercises.length,
    });
  }

  if (weekDayMap.size === 0) {
    return {
      success: false,
      error: 'No valid exercise data found',
    };
  }

  // Convert to days array (flatten all weeks)
  const days: CSVDayData[] = [];
  for (const [week, dayMap] of Array.from(weekDayMap.entries()).sort((a, b) => a[0] - b[0])) {
    for (const [dayIndex, data] of Array.from(dayMap.entries()).sort((a, b) => a[0] - b[0])) {
      days.push({
        dayIndex,
        dayName: data.dayName,
        exercises: data.exercises,
        weekNumber: week,
      });
    }
  }

  // Infer program name from first workout name
  const firstName = days[0]?.dayName || 'Imported Program';
  const programName = firstName.includes('(')
    ? firstName.split('(')[0].trim() + ' Program'
    : 'Imported Program';

  return {
    success: true,
    data: {
      programName,
      totalWeeks: maxWeek,
      days,
    },
  };
}

/**
 * Read a CSV file using the File API
 */
export function readCSVFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        resolve(content);
      } else {
        reject(new Error('Failed to read file as text'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}
