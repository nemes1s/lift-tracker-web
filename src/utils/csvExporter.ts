import { db } from '../db/database';

/**
 * Export a program to CSV format (semicolon-delimited)
 * Format: week;day_index;workout_name;exercise_name;target_sets;target_reps;notes
 *
 * This CSV can be re-imported using the CSV import feature
 */
export async function exportProgramToCSV(programId: string): Promise<string> {
  // Load program
  const program = await db.programs.get(programId);
  if (!program) {
    throw new Error('Program not found');
  }

  // Load all workout templates for this program
  const workoutTemplates = await db.workoutTemplates
    .where('programId')
    .equals(programId)
    .toArray();

  if (workoutTemplates.length === 0) {
    throw new Error('No workouts found in this program');
  }

  // Sort by week and day
  workoutTemplates.sort((a, b) => {
    if (a.weekNumber !== b.weekNumber) {
      return a.weekNumber - b.weekNumber;
    }
    return a.dayIndex - b.dayIndex;
  });

  // Build CSV header
  const lines: string[] = ['week;day_index;workout_name;exercise_name;target_sets;target_reps;notes'];

  // Process each workout template
  for (const template of workoutTemplates) {
    // Load exercises for this workout
    const exercises = await db.exerciseTemplates
      .where('workoutTemplateId')
      .equals(template.id)
      .toArray();

    // Sort by order index
    exercises.sort((a, b) => a.orderIndex - b.orderIndex);

    // Add each exercise as a row
    for (const exercise of exercises) {
      const row = [
        template.weekNumber.toString(),
        template.dayIndex.toString(),
        template.name,
        exercise.name,
        exercise.targetSets.toString(),
        exercise.targetReps || '',
        exercise.notes || '',
      ];

      // Escape and format values
      const formattedRow = row.map(value => {
        // If value contains semicolon, comma, or newline, wrap in quotes
        if (value.includes(';') || value.includes(',') || value.includes('\n') || value.includes('"')) {
          // Escape quotes by doubling them
          return '"' + value.replace(/"/g, '""') + '"';
        }
        return value;
      }).join(';');

      lines.push(formattedRow);
    }
  }

  return lines.join('\n');
}

/**
 * Export a program with additional progress information
 * Includes recent performance data for each exercise
 */
export async function exportProgramWithProgress(programId: string): Promise<string> {
  // Get base CSV
  const baseCSV = await exportProgramToCSV(programId);

  // Load program
  const program = await db.programs.get(programId);
  if (!program) {
    throw new Error('Program not found');
  }

  // Get all workouts for this program (based on programNameSnapshot)
  // Note: programNameSnapshot is not indexed, so we need to filter in JavaScript
  const allWorkouts = await db.workouts.toArray();
  const workouts = allWorkouts.filter(w => w.programNameSnapshot === program.name);

  if (workouts.length === 0) {
    // No progress data, just return base CSV
    return baseCSV;
  }

  // Build a map of exercise name -> recent sets
  const exerciseProgressMap = new Map<string, { weight: number; reps: number; date: Date }[]>();

  for (const workout of workouts) {
    const exerciseInstances = await db.exerciseInstances
      .where('workoutId')
      .equals(workout.id)
      .toArray();

    for (const exerciseInstance of exerciseInstances) {
      const sets = await db.setRecords
        .where('exerciseId')
        .equals(exerciseInstance.id)
        .toArray();

      // Filter out warmup sets
      const workingSets = sets.filter(s => !s.isWarmup);

      if (workingSets.length > 0) {
        const exerciseName = exerciseInstance.name;
        if (!exerciseProgressMap.has(exerciseName)) {
          exerciseProgressMap.set(exerciseName, []);
        }

        // Add all working sets with their dates
        for (const set of workingSets) {
          exerciseProgressMap.get(exerciseName)!.push({
            weight: set.weight,
            reps: set.reps,
            date: set.timestamp,
          });
        }
      }
    }
  }

  // Add progress columns to CSV
  const lines = baseCSV.split('\n');

  // Update header to include progress columns
  lines[0] = lines[0] + ';last_weight;last_reps;last_date';

  // Update each data row
  for (let i = 1; i < lines.length; i++) {
    const parts = parseCSVLine(lines[i]);
    if (parts.length < 4) continue;

    const exerciseName = parts[3]; // exercise_name column
    const progress = exerciseProgressMap.get(exerciseName);

    if (progress && progress.length > 0) {
      // Sort by date descending and get the most recent
      progress.sort((a, b) => b.date.getTime() - a.date.getTime());
      const mostRecent = progress[0];

      lines[i] = lines[i] + `;${mostRecent.weight};${mostRecent.reps};${mostRecent.date.toISOString().split('T')[0]}`;
    } else {
      lines[i] = lines[i] + ';;;';
    }
  }

  return lines.join('\n');
}

/**
 * Parse a CSV line respecting quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = i + 1 < line.length ? line[i + 1] : '';

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ';' && !inQuotes) {
      // Field separator
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current);

  return result;
}

/**
 * Trigger download of CSV content as a file
 */
export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
