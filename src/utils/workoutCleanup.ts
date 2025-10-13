/**
 * Utility functions for cleaning up empty/abandoned workouts
 */

import { db } from '../db/database';

/**
 * Delete empty workouts (workouts with no logged sets)
 * This helps keep the database clean when users start but don't complete workouts
 */
export async function cleanupEmptyWorkouts(): Promise<number> {
  let deletedCount = 0;

  // Get all workouts
  const allWorkouts = await db.workouts.toArray();

  for (const workout of allWorkouts) {
    // Get all exercise instances for this workout
    const exerciseInstances = await db.exerciseInstances
      .where('workoutId')
      .equals(workout.id)
      .toArray();

    // Check if any exercise has sets logged
    let hasAnySets = false;
    for (const exercise of exerciseInstances) {
      const sets = await db.setRecords
        .where('exerciseId')
        .equals(exercise.id)
        .toArray();

      if (sets.length > 0) {
        hasAnySets = true;
        break;
      }
    }

    // If no sets were logged, delete the workout and its exercises
    if (!hasAnySets) {
      // Delete all exercise instances
      await Promise.all(
        exerciseInstances.map(ex => db.exerciseInstances.delete(ex.id))
      );

      // Delete the workout
      await db.workouts.delete(workout.id);
      deletedCount++;
    }
  }

  return deletedCount;
}

/**
 * Clean up abandoned workouts from previous days
 * Workouts that were started but not ended (no endedAt timestamp) and are older than today
 */
export async function cleanupAbandonedWorkouts(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let deletedCount = 0;

  // Get all unfinished workouts
  const unfinishedWorkouts = await db.workouts
    .filter(w => !w.endedAt)
    .toArray();

  for (const workout of unfinishedWorkouts) {
    const workoutDate = new Date(workout.startedAt);
    workoutDate.setHours(0, 0, 0, 0);

    // If the workout is from a previous day
    if (workoutDate.getTime() < today.getTime()) {
      // Get all exercise instances
      const exerciseInstances = await db.exerciseInstances
        .where('workoutId')
        .equals(workout.id)
        .toArray();

      // Check if any sets were logged
      let hasAnySets = false;
      for (const exercise of exerciseInstances) {
        const sets = await db.setRecords
          .where('exerciseId')
          .equals(exercise.id)
          .toArray();

        if (sets.length > 0) {
          hasAnySets = true;
          break;
        }
      }

      if (!hasAnySets) {
        // Delete all exercise instances
        await Promise.all(
          exerciseInstances.map(ex => db.exerciseInstances.delete(ex.id))
        );

        // Delete the workout
        await db.workouts.delete(workout.id);
        deletedCount++;
      } else {
        // Has sets but wasn't properly ended - mark it as ended
        await db.workouts.update(workout.id, {
          endedAt: new Date(workout.startedAt.getTime() + 2 * 60 * 60 * 1000) // Assume 2 hour workout
        });
      }
    }
  }

  return deletedCount;
}
