import { db } from '../db/database';
import type { Program, ProgramCompletion } from '../types/models';
import { v4 as uuidv4 } from 'uuid';

/**
 * Calculate stats for a program cycle (workouts between start date and now)
 */
async function calculateProgramStats(program: Program): Promise<{
  totalWorkoutsCompleted: number;
  totalVolume: number;
  totalSetsCompleted: number;
}> {
  // Get all completed workouts for this program since start date
  const workouts = await db.workouts
    .orderBy('startedAt')
    .filter((w) => {
      if (!w.endedAt) return false; // Only completed workouts

      const workoutDate = new Date(w.startedAt);
      const programStart = new Date(program.startDate);

      // Workout must be after program start
      if (workoutDate < programStart) return false;

      // Prefer programId for matching, fall back to programNameSnapshot for backwards compatibility
      if (w.programId) {
        return w.programId === program.id;
      }
      return w.programNameSnapshot === program.name;
    })
    .toArray();

  let totalVolume = 0;
  let totalSetsCompleted = 0;

  // Calculate volume and sets for each workout
  for (const workout of workouts) {
    const exercises = await db.exerciseInstances
      .where('workoutId')
      .equals(workout.id)
      .toArray();

    for (const exercise of exercises) {
      const sets = await db.setRecords
        .where('exerciseId')
        .equals(exercise.id)
        .toArray();

      for (const set of sets) {
        if (!set.isWarmup) {
          totalVolume += set.weight * set.reps;
          totalSetsCompleted++;
        }
      }
    }
  }

  return {
    totalWorkoutsCompleted: workouts.length,
    totalVolume,
    totalSetsCompleted,
  };
}

/**
 * Mark the current program cycle as complete
 * Creates a ProgramCompletion record with stats and achievements
 */
export async function completeProgramCycle(program: Program): Promise<ProgramCompletion> {
  const stats = await calculateProgramStats(program);

  const completion: ProgramCompletion = {
    id: uuidv4(),
    programId: program.id,
    programName: program.name,
    startDate: new Date(program.startDate),
    completionDate: new Date(),
    totalWeeks: program.totalWeeks,
    ...stats,
  };

  await db.programCompletions.add(completion);

  return completion;
}

/**
 * Restart a program by setting its start date to today
 */
export async function restartProgram(programId: string): Promise<void> {
  const program = await db.programs.get(programId);
  if (!program) {
    throw new Error('Program not found');
  }

  await db.programs.update(programId, {
    startDate: new Date(),
    updatedAt: new Date(),
  });
}

/**
 * Get all program completions sorted by completion date (most recent first)
 */
export async function getProgramCompletions(): Promise<ProgramCompletion[]> {
  return await db.programCompletions
    .orderBy('completionDate')
    .reverse()
    .toArray();
}

/**
 * Get completions for a specific program
 */
export async function getProgramCompletionsByProgram(programId: string): Promise<ProgramCompletion[]> {
  return await db.programCompletions
    .where('programId')
    .equals(programId)
    .reverse()
    .sortBy('completionDate');
}

/**
 * Check if the current program cycle is complete (at or past total weeks)
 */
export function isProgramCycleComplete(program: Program): boolean {
  if (!program.startDate) return false;

  const now = new Date();
  const start = new Date(program.startDate);
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const weekNum = Math.floor(diffDays / 7) + 1;

  // Program is complete if we've reached or passed the total weeks
  return weekNum >= program.totalWeeks;
}
