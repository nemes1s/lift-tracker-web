/**
 * Integration test for the complete workout flow
 * Tests the critical path: Program -> Template -> Workout -> Sets -> Completion
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db/database';
import {
  currentWeek,
  selectTemplate,
  instantiateWorkout,
  recommendedDay,
} from '../utils/programLogic';
import { v4 as uuidv4 } from 'uuid';

describe('Workout Flow Integration', () => {
  beforeEach(async () => {
    // Clear all database tables
    await db.programs.clear();
    await db.workoutTemplates.clear();
    await db.exerciseTemplates.clear();
    await db.workouts.clear();
    await db.exerciseInstances.clear();
    await db.setRecords.clear();
    await db.settings.clear();
  });

  it('should complete full workout flow from program creation to workout completion', async () => {
    // 1. Create a program
    const programId = uuidv4();
    const program = {
      id: programId,
      name: 'Test 3-Day Split',
      description: 'A test program',
      totalWeeks: 12,
      startDate: new Date().toISOString(),
    };
    await db.programs.add(program);

    // Set as active program
    await db.settings.add({
      id: 'settings',
      activeProgramId: programId,
    });

    // 2. Create workout templates for 3 phases (weeks 1, 5, 9) and 2 days
    const phases = [
      { week: 1, day: 0, name: 'Upper Body', exercises: ['Bench Press', 'Rows'], sets: 3, reps: '8-10' },
      { week: 1, day: 1, name: 'Lower Body', exercises: ['Squat', 'Deadlift'], sets: 3, reps: '6-8' },
      { week: 5, day: 0, name: 'Upper Body', exercises: ['Dumbbell Press', 'Cable Rows'], sets: 4, reps: '10-12' },
      { week: 5, day: 1, name: 'Lower Body', exercises: ['Front Squat', 'RDL'], sets: 4, reps: '8-10' },
      { week: 9, day: 0, name: 'Upper Body', exercises: ['Incline Press', 'Barbell Rows'], sets: 4, reps: '6-8' },
      { week: 9, day: 1, name: 'Lower Body', exercises: ['Back Squat', 'Sumo Deadlift'], sets: 4, reps: '5-6' },
    ];

    for (const phase of phases) {
      const templateId = uuidv4();
      await db.workoutTemplates.add({
        id: templateId,
        programId,
        name: `${phase.name} - Week ${phase.week}`,
        dayIndex: phase.day,
        weekNumber: phase.week,
      });

      // Add exercises for this template
      for (let i = 0; i < phase.exercises.length; i++) {
        await db.exerciseTemplates.add({
          id: uuidv4(),
          workoutTemplateId: templateId,
          name: phase.exercises[i],
          targetSets: phase.sets,
          targetReps: phase.reps,
          restTime: 120,
          notes: '',
          orderIndex: i,
        });
      }
    }

    // 3. Test week calculation
    const week = currentWeek(new Date(program.startDate), program.totalWeeks);
    expect(week).toBe(1); // Should be week 1 since we just started

    // 4. Select appropriate template for current week
    const template = await selectTemplate(programId, week, 0);
    expect(template).toBeDefined();
    expect(template?.weekNumber).toBe(1);
    expect(template?.name).toBe('Upper Body - Week 1');

    // 5. Test template selection for different weeks
    const week5Template = await selectTemplate(programId, 5, 0);
    expect(week5Template?.weekNumber).toBe(5);

    // Week 3 should use week 1 template (highest weekNumber <= 3)
    const week3Template = await selectTemplate(programId, 3, 0);
    expect(week3Template?.weekNumber).toBe(1);

    // Week 7 should use week 5 template
    const week7Template = await selectTemplate(programId, 7, 0);
    expect(week7Template?.weekNumber).toBe(5);

    // 6. Create a workout instance from template
    if (!template) throw new Error('Template not found');
    const workout = await instantiateWorkout(template, program.name);

    expect(workout.id).toBeDefined();
    expect(workout.name).toBe('Upper Body - Week 1');
    expect(workout.programId).toBe(programId);
    expect(workout.startedAt).toBeDefined();
    expect(workout.endedAt).toBeUndefined();

    // 7. Verify exercise instances were created
    const exercises = await db.exerciseInstances
      .where('workoutId')
      .equals(workout.id)
      .sortBy('orderIndex');

    expect(exercises).toHaveLength(2);
    expect(exercises[0].name).toBe('Bench Press');
    expect(exercises[0].targetSets).toBe(3);
    expect(exercises[0].targetReps).toBe('8-10');
    expect(exercises[1].name).toBe('Rows');

    // 8. Simulate logging sets for first exercise
    const exercise1 = exercises[0];
    const sets = [
      { weight: 135, reps: 10 },
      { weight: 135, reps: 9 },
      { weight: 135, reps: 8 },
    ];

    for (const set of sets) {
      await db.setRecords.add({
        id: uuidv4(),
        exerciseId: exercise1.id,
        workoutId: workout.id,
        weight: set.weight,
        reps: set.reps,
        timestamp: new Date().toISOString(),
      });
    }

    // 9. Verify sets were logged
    const loggedSets = await db.setRecords
      .where('exerciseId')
      .equals(exercise1.id)
      .sortBy('timestamp');

    expect(loggedSets).toHaveLength(3);
    expect(loggedSets[0].weight).toBe(135);
    expect(loggedSets[0].reps).toBe(10);

    // 10. Complete the workout
    await db.workouts.update(workout.id, {
      endedAt: new Date().toISOString(),
    });

    const completedWorkout = await db.workouts.get(workout.id);
    expect(completedWorkout?.endedAt).toBeDefined();

    // 11. Test recommended day after workout
    const nextDay = await recommendedDay(program);
    expect(nextDay).toBe(1); // Should recommend day 1 (next day after day 0)
  });

  it('should handle quick workout mode with reduced sets', async () => {
    // Create program and template
    const programId = uuidv4();
    await db.programs.add({
      id: programId,
      name: 'Test Program',
      description: 'Test',
      totalWeeks: 12,
      startDate: new Date().toISOString(),
    });

    const templateId = uuidv4();
    await db.workoutTemplates.add({
      id: templateId,
      programId,
      name: 'Quick Test',
      dayIndex: 0,
      weekNumber: 1,
    });

    // Add exercise with 4 sets
    await db.exerciseTemplates.add({
      id: uuidv4(),
      workoutTemplateId: templateId,
      name: 'Bench Press',
      targetSets: 4,
      targetReps: '8-10',
      restTime: 120,
      notes: '',
      orderIndex: 0,
    });

    const template = await db.workoutTemplates.get(templateId);
    if (!template) throw new Error('Template not found');

    // Create quick workout
    const workout = await instantiateWorkout(template, 'Test Program', true);

    expect(workout.isQuickWorkout).toBe(true);

    const exercises = await db.exerciseInstances
      .where('workoutId')
      .equals(workout.id)
      .toArray();

    // 4 sets * 0.7 = 2.8, rounds to 3
    expect(exercises[0].targetSets).toBe(3);
  });

  it('should handle cycling through program weeks', async () => {
    const programId = uuidv4();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 91); // 13 weeks ago

    await db.programs.add({
      id: programId,
      name: 'Test Program',
      description: 'Test',
      totalWeeks: 12,
      startDate: startDate.toISOString(),
    });

    // Current week should cycle back to week 2 (13 % 12 = 1, +1 = 2)
    const week = currentWeek(new Date(startDate.toISOString()), 12);
    expect(week).toBe(2);
  });

  it('should track workout history correctly', async () => {
    const programId = uuidv4();
    await db.programs.add({
      id: programId,
      name: 'Test Program',
      description: 'Test',
      totalWeeks: 12,
      startDate: new Date().toISOString(),
    });

    // Create template
    const templateId = uuidv4();
    await db.workoutTemplates.add({
      id: templateId,
      programId,
      name: 'Day 1',
      dayIndex: 0,
      weekNumber: 1,
    });

    await db.exerciseTemplates.add({
      id: uuidv4(),
      workoutTemplateId: templateId,
      name: 'Bench Press',
      targetSets: 3,
      targetReps: '8-10',
      restTime: 120,
      notes: '',
      orderIndex: 0,
    });

    // Create 3 workouts over time
    for (let i = 0; i < 3; i++) {
      const template = await db.workoutTemplates.get(templateId);
      if (!template) throw new Error('Template not found');

      const workout = await instantiateWorkout(template, 'Test Program');

      const exercises = await db.exerciseInstances
        .where('workoutId')
        .equals(workout.id)
        .toArray();

      // Log sets with progressive weight
      await db.setRecords.add({
        id: uuidv4(),
        exerciseId: exercises[0].id,
        workoutId: workout.id,
        weight: 135 + i * 5,
        reps: 10,
        timestamp: new Date(Date.now() - i * 86400000).toISOString(),
      });

      // Complete workout
      await db.workouts.update(workout.id, {
        endedAt: new Date(Date.now() - i * 86400000).toISOString(),
      });
    }

    // Verify workout history
    const workouts = await db.workouts
      .orderBy('startedAt')
      .reverse()
      .toArray();

    expect(workouts).toHaveLength(3);
    expect(workouts.every(w => w.endedAt)).toBe(true);

    // Verify progressive overload
    const allSets = await db.setRecords.toArray();
    const weights = allSets.map(s => s.weight).sort((a, b) => a - b);
    expect(weights).toEqual([135, 140, 145]);
  });

  it('should handle multiple day indices correctly', async () => {
    const programId = uuidv4();
    const program = {
      id: programId,
      name: 'Test Program',
      description: 'Test',
      totalWeeks: 12,
      startDate: new Date().toISOString(),
    };
    await db.programs.add(program);

    // Create templates for 3 different days
    for (let day = 0; day < 3; day++) {
      const templateId = uuidv4();
      await db.workoutTemplates.add({
        id: templateId,
        programId,
        name: `Day ${day + 1}`,
        dayIndex: day,
        weekNumber: 1,
      });

      await db.exerciseTemplates.add({
        id: uuidv4(),
        workoutTemplateId: templateId,
        name: `Exercise for Day ${day + 1}`,
        targetSets: 3,
        targetReps: '8-10',
        restTime: 120,
        notes: '',
        orderIndex: 0,
      });
    }

    // Test template selection for each day
    for (let day = 0; day < 3; day++) {
      const template = await selectTemplate(programId, 1, day);
      expect(template).toBeDefined();
      expect(template?.dayIndex).toBe(day);
      expect(template?.name).toBe(`Day ${day + 1}`);
    }

    // Test recommended day flow
    // Complete Day 1
    const day0Template = await selectTemplate(programId, 1, 0);
    if (!day0Template) throw new Error('Template not found');

    const workout = await instantiateWorkout(day0Template, program.name);
    await db.workouts.update(workout.id, {
      endedAt: new Date().toISOString(),
    });

    // Should recommend Day 2
    const nextDay = await recommendedDay(program);
    expect(nextDay).toBe(1);
  });
});
