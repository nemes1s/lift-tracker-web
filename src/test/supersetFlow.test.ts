import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db/database';
import { getProgramDefinition } from '../data/builtInPrograms';
import { createProgramFromDefinition } from '../utils/programTemplates';
import { selectTemplate, instantiateWorkout } from '../utils/programLogic';
import { getSupersetAdvance, getSupersetLabel, resolveRestDuration } from '../utils/supersets';
import type { ExerciseInstance } from '../types/models';
import { v4 as uuidv4 } from 'uuid';

describe('Superset Flow Integration', () => {
  beforeEach(async () => {
    await db.programs.clear();
    await db.workoutTemplates.clear();
    await db.exerciseTemplates.clear();
    await db.workouts.clear();
    await db.exerciseInstances.clear();
    await db.setRecords.clear();
  });

  it('carries supersetGroup from definition through template to live workout', async () => {
    const definition = getProgramDefinition('superset-express')!;
    const program = await createProgramFromDefinition(definition);

    const template = await selectTemplate(program.id, 1, 0);
    expect(template).toBeDefined();

    const templateExercises = await db.exerciseTemplates
      .where('workoutTemplateId')
      .equals(template!.id)
      .sortBy('orderIndex');

    expect(templateExercises).toHaveLength(6);
    expect(templateExercises.map((e) => e.supersetGroup)).toEqual([1, 1, 2, 2, 3, 3]);

    const workout = await instantiateWorkout(template!, program.name);
    const instances = await db.exerciseInstances
      .where('workoutId')
      .equals(workout.id)
      .sortBy('orderIndex');

    expect(instances.map((e) => e.supersetGroup)).toEqual([1, 1, 2, 2, 3, 3]);
    expect(getSupersetLabel(instances, 0)).toBe('A1');
    expect(getSupersetLabel(instances, 3)).toBe('B2');
    expect(getSupersetLabel(instances, 5)).toBe('C2');
  });

  it('walks a full superset session in the expected order', async () => {
    const definition = getProgramDefinition('superset-express')!;
    const program = await createProgramFromDefinition(definition);
    const template = await selectTemplate(program.id, 1, 0);
    const workout = await instantiateWorkout(template!, program.name);

    const exercises = await db.exerciseInstances
      .where('workoutId')
      .equals(workout.id)
      .sortBy('orderIndex');

    // Log a set against an exercise, exactly as WorkoutRunner does
    const logSet = async (exercise: ExerciseInstance) => {
      await db.setRecords.add({
        id: uuidv4(),
        exerciseId: exercise.id,
        weight: 60,
        reps: 8,
        timestamp: new Date(),
        isWarmup: false,
      });
    };

    const countSets = async () => {
      const counts: Record<string, number> = {};
      for (const ex of exercises) {
        counts[ex.id] = await db.setRecords.where('exerciseId').equals(ex.id).count();
      }
      return counts;
    };

    // Drive the first pair (A1/A2, 3 sets each) and record where the runner would go
    const visited: number[] = [];
    const rests: number[] = [];
    let index = 0;

    for (let step = 0; step < 6; step++) {
      visited.push(index);
      await logSet(exercises[index]);

      const advance = getSupersetAdvance(exercises, index, await countSets());
      rests.push(resolveRestDuration(advance, 90, 10));

      if (advance.nextIndex === null) break;
      index = advance.nextIndex;
    }

    // Alternates A1 -> A2 -> A1 ... for three rounds
    expect(visited).toEqual([0, 1, 0, 1, 0, 1]);

    // Short rest inside a round, full rest when the round wraps
    expect(rests).toEqual([10, 90, 10, 90, 10, 90]);

    // After the sixth set both exercises are done, so the group is complete
    const finalAdvance = getSupersetAdvance(exercises, 1, await countSets());
    expect(finalAdvance.groupComplete).toBe(true);
    expect(finalAdvance.nextIndex).toBe(2); // first exercise of the next pair
  });

  it('runs a Cardio Pulse circuit across all its exercises before repeating', async () => {
    const definition = getProgramDefinition('cardio-pulse')!;
    const program = await createProgramFromDefinition(definition);
    const template = await selectTemplate(program.id, 1, 0);
    const workout = await instantiateWorkout(template!, program.name);

    const exercises = await db.exerciseInstances
      .where('workoutId')
      .equals(workout.id)
      .sortBy('orderIndex');

    // Day 0 week 1: circuit 1 has four exercises, circuit 2 has three
    expect(exercises.map((e) => e.supersetGroup)).toEqual([1, 1, 1, 1, 2, 2, 2]);

    const counts: Record<string, number> = {};
    const visited: number[] = [];
    let index = 0;

    // One full round of circuit 1 should touch each of its four exercises in order
    for (let step = 0; step < 4; step++) {
      visited.push(index);
      counts[exercises[index].id] = (counts[exercises[index].id] ?? 0) + 1;
      const advance = getSupersetAdvance(exercises, index, counts);
      index = advance.nextIndex!;
    }

    expect(visited).toEqual([0, 1, 2, 3]);
    expect(index).toBe(0); // wrapped back to the top of the circuit for round two
  });

  it('leaves non-superset programs navigating normally', async () => {
    const definition = getProgramDefinition('beginner-foundation')!;
    const program = await createProgramFromDefinition(definition);
    const template = await selectTemplate(program.id, 1, 0);
    const workout = await instantiateWorkout(template!, program.name);

    const exercises = await db.exerciseInstances
      .where('workoutId')
      .equals(workout.id)
      .sortBy('orderIndex');

    for (let i = 0; i < exercises.length; i++) {
      const advance = getSupersetAdvance(exercises, i, {});
      expect(advance.nextIndex).toBeNull();
      expect(advance.useSupersetRest).toBe(false);
      expect(getSupersetLabel(exercises, i)).toBeNull();
    }
  });

  it('respects quick workout set reduction while keeping groups intact', async () => {
    const definition = getProgramDefinition('superset-express')!;
    const program = await createProgramFromDefinition(definition);
    const template = await selectTemplate(program.id, 1, 0);
    const workout = await instantiateWorkout(template!, program.name, true);

    const exercises = await db.exerciseInstances
      .where('workoutId')
      .equals(workout.id)
      .sortBy('orderIndex');

    expect(workout.isQuickWorkout).toBe(true);
    expect(exercises.map((e) => e.supersetGroup)).toEqual([1, 1, 2, 2, 3, 3]);
    // 3 target sets reduced to ceil(3 * 0.7) = 3 stays 3; verify none dropped below 1
    for (const exercise of exercises) {
      expect(exercise.targetSets).toBeGreaterThanOrEqual(1);
    }
  });
});
