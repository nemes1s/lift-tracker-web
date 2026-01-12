import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  currentWeek,
  selectTemplate,
  recommendedDay,
  instantiateWorkout,
  getProgressiveOverloadSuggestion,
} from './programLogic';
import { db } from '../db/database';
import {
  createMockProgram,
  createMockWorkoutTemplate,
  createMockExerciseTemplate,
  createMockWorkout,
} from '../test/testUtils';

describe('programLogic', () => {
  beforeEach(async () => {
    // Clear all tables before each test
    await db.programs.clear();
    await db.workoutTemplates.clear();
    await db.exerciseTemplates.clear();
    await db.workouts.clear();
    await db.exerciseInstances.clear();
    await db.setRecords.clear();
  });

  describe('currentWeek', () => {
    it('should return 1 when startDate is undefined', () => {
      expect(currentWeek(undefined, 12)).toBe(1);
    });

    it('should return 1 for the first week', () => {
      const today = new Date();
      expect(currentWeek(today, 12)).toBe(1);
    });

    it('should calculate correct week number', () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 14); // 2 weeks ago
      const week = currentWeek(startDate, 12);
      expect(week).toBe(3); // Week 3 (day 0-6 = week 1, day 7-13 = week 2, day 14+ = week 3)
    });

    it('should cycle through weeks after totalWeeks', () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 84); // 12 weeks ago (84 days)
      const week = currentWeek(startDate, 12);
      expect(week).toBe(1); // Should cycle back to week 1
    });

    it('should handle week 13 in a 12-week program', () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 91); // 13 weeks ago
      const week = currentWeek(startDate, 12);
      expect(week).toBe(2); // Week 13 should cycle to week 2
    });
  });

  describe('selectTemplate', () => {
    beforeEach(async () => {
      const program = createMockProgram({ id: 'prog-1' });
      await db.programs.add(program);
    });

    it('should select template with exact week match', async () => {
      // Create templates for weeks 1, 5, 9
      await db.workoutTemplates.add(
        createMockWorkoutTemplate({
          id: 'template-1',
          programId: 'prog-1',
          dayIndex: 0,
          weekNumber: 1,
          name: 'Week 1-4',
        })
      );
      await db.workoutTemplates.add(
        createMockWorkoutTemplate({
          id: 'template-5',
          programId: 'prog-1',
          dayIndex: 0,
          weekNumber: 5,
          name: 'Week 5-8',
        })
      );

      const template = await selectTemplate('prog-1', 5, 0);
      expect(template?.id).toBe('template-5');
      expect(template?.name).toBe('Week 5-8');
    });

    it('should select highest weekNumber <= current week', async () => {
      // Create templates for weeks 1, 5, 9
      await db.workoutTemplates.add(
        createMockWorkoutTemplate({
          id: 'template-1',
          programId: 'prog-1',
          dayIndex: 0,
          weekNumber: 1,
        })
      );
      await db.workoutTemplates.add(
        createMockWorkoutTemplate({
          id: 'template-5',
          programId: 'prog-1',
          dayIndex: 0,
          weekNumber: 5,
        })
      );

      // Week 3 should use week 1 template
      const template = await selectTemplate('prog-1', 3, 0);
      expect(template?.id).toBe('template-1');
    });

    it('should select correct template for week range', async () => {
      // Create templates for weeks 1, 5, 9
      await db.workoutTemplates.add(
        createMockWorkoutTemplate({
          id: 'template-1',
          programId: 'prog-1',
          dayIndex: 0,
          weekNumber: 1,
        })
      );
      await db.workoutTemplates.add(
        createMockWorkoutTemplate({
          id: 'template-5',
          programId: 'prog-1',
          dayIndex: 0,
          weekNumber: 5,
        })
      );
      await db.workoutTemplates.add(
        createMockWorkoutTemplate({
          id: 'template-9',
          programId: 'prog-1',
          dayIndex: 0,
          weekNumber: 9,
        })
      );

      // Week 7 should use week 5 template
      const template7 = await selectTemplate('prog-1', 7, 0);
      expect(template7?.id).toBe('template-5');

      // Week 11 should use week 9 template
      const template11 = await selectTemplate('prog-1', 11, 0);
      expect(template11?.id).toBe('template-9');
    });

    it('should return undefined if no valid template found', async () => {
      // No templates at all
      const template = await selectTemplate('prog-1', 1, 0);
      expect(template).toBeUndefined();
    });

    it('should filter by dayIndex correctly', async () => {
      await db.workoutTemplates.add(
        createMockWorkoutTemplate({
          id: 'template-day0',
          programId: 'prog-1',
          dayIndex: 0,
          weekNumber: 1,
        })
      );
      await db.workoutTemplates.add(
        createMockWorkoutTemplate({
          id: 'template-day1',
          programId: 'prog-1',
          dayIndex: 1,
          weekNumber: 1,
        })
      );

      const template = await selectTemplate('prog-1', 1, 1);
      expect(template?.id).toBe('template-day1');
    });
  });

  describe('recommendedDay', () => {
    let program: any;

    beforeEach(async () => {
      program = createMockProgram({ id: 'prog-1' });
      await db.programs.add(program);

      // Create templates for 3-day program (days 0, 1, 2)
      await db.workoutTemplates.add(
        createMockWorkoutTemplate({
          id: 'template-0',
          programId: 'prog-1',
          dayIndex: 0,
          weekNumber: 1,
          name: 'Day 1',
        })
      );
      await db.workoutTemplates.add(
        createMockWorkoutTemplate({
          id: 'template-1',
          programId: 'prog-1',
          dayIndex: 1,
          weekNumber: 1,
          name: 'Day 2',
        })
      );
      await db.workoutTemplates.add(
        createMockWorkoutTemplate({
          id: 'template-2',
          programId: 'prog-1',
          dayIndex: 2,
          weekNumber: 1,
          name: 'Day 3',
        })
      );
    });

    it('should return 0 if no previous workouts', async () => {
      const day = await recommendedDay(program);
      expect(day).toBe(0);
    });

    it('should recommend next day after last workout', async () => {
      // Complete workout on Day 1
      await db.workouts.add(
        createMockWorkout({
          id: 'workout-1',
          programId: 'prog-1',
          name: 'Day 1',
          endedAt: new Date().toISOString(),
        })
      );

      const day = await recommendedDay(program);
      expect(day).toBe(1); // Should recommend Day 2 (index 1)
    });

    it('should cycle back to day 0 after last day', async () => {
      // Complete workout on Day 3
      await db.workouts.add(
        createMockWorkout({
          id: 'workout-3',
          programId: 'prog-1',
          name: 'Day 3',
          endedAt: new Date().toISOString(),
        })
      );

      const day = await recommendedDay(program);
      expect(day).toBe(0); // Should cycle back to Day 1 (index 0)
    });
  });

  describe('instantiateWorkout', () => {
    let template: any;

    beforeEach(async () => {
      const program = createMockProgram({ id: 'prog-1' });
      await db.programs.add(program);

      template = createMockWorkoutTemplate({
        id: 'template-1',
        programId: 'prog-1',
        name: 'Upper Body',
      });
      await db.workoutTemplates.add(template);

      // Add some exercises
      await db.exerciseTemplates.add(
        createMockExerciseTemplate({
          id: 'ex-1',
          workoutTemplateId: 'template-1',
          name: 'Bench Press',
          targetSets: 4,
          orderIndex: 0,
        })
      );
      await db.exerciseTemplates.add(
        createMockExerciseTemplate({
          id: 'ex-2',
          workoutTemplateId: 'template-1',
          name: 'Rows',
          targetSets: 3,
          orderIndex: 1,
        })
      );
    });

    it('should create a workout with correct properties', async () => {
      const workout = await instantiateWorkout(template, 'Test Program');

      expect(workout.id).toBeDefined();
      expect(workout.name).toBe('Upper Body');
      expect(workout.programId).toBe('prog-1');
      expect(workout.programNameSnapshot).toBe('Test Program');
      expect(workout.startedAt).toBeDefined();
    });

    it('should create exercise instances for all exercises', async () => {
      const workout = await instantiateWorkout(template);

      const exercises = await db.exerciseInstances
        .where('workoutId')
        .equals(workout.id)
        .sortBy('orderIndex');

      expect(exercises).toHaveLength(2);
      expect(exercises[0].name).toBe('Bench Press');
      expect(exercises[1].name).toBe('Rows');
    });

    it('should preserve exercise order', async () => {
      const workout = await instantiateWorkout(template);

      const exercises = await db.exerciseInstances
        .where('workoutId')
        .equals(workout.id)
        .toArray();

      exercises.sort((a, b) => a.orderIndex - b.orderIndex);
      expect(exercises[0].orderIndex).toBe(0);
      expect(exercises[1].orderIndex).toBe(1);
    });

    it('should reduce sets by 30% for quick workouts', async () => {
      const workout = await instantiateWorkout(template, 'Test Program', true);

      const exercises = await db.exerciseInstances
        .where('workoutId')
        .equals(workout.id)
        .toArray();

      // Bench Press: 4 sets * 0.7 = 2.8 -> rounds to 3
      expect(exercises[0].targetSets).toBe(3);
      // Rows: 3 sets * 0.7 = 2.1 -> rounds to 3 (minimum 1)
      expect(exercises[1].targetSets).toBe(3);
    });

    it('should mark workout as quick workout when flag is true', async () => {
      const workout = await instantiateWorkout(template, 'Test Program', true);
      expect(workout.isQuickWorkout).toBe(true);
    });
  });

  describe('getProgressiveOverloadSuggestion', () => {
    beforeEach(async () => {
      const program = createMockProgram({ id: 'prog-1' });
      await db.programs.add(program);
    });

    it('should return no data message when no previous workouts', async () => {
      const suggestion = await getProgressiveOverloadSuggestion('Bench Press', '8-10');
      expect(suggestion.hasData).toBe(false);
      expect(suggestion.reason).toBe('No previous data');
    });

    it('should suggest weight increase when hitting target reps', async () => {
      // Create a completed workout with sets
      const workout = createMockWorkout({
        id: 'workout-1',
        programId: 'prog-1',
        endedAt: new Date().toISOString(),
      });
      await db.workouts.add(workout);

      await db.exerciseInstances.add({
        id: 'ex-1',
        workoutId: 'workout-1',
        name: 'Bench Press',
        targetSets: 3,
        targetReps: '8-10',
        orderIndex: 0,
      });

      // Add sets with reps at upper bound (10)
      await db.setRecords.add({
        id: 'set-1',
        exerciseId: 'ex-1',
        workoutId: 'workout-1',
        weight: 100,
        reps: 10,
        timestamp: new Date().toISOString(),
      });

      const suggestion = await getProgressiveOverloadSuggestion('Bench Press', '8-10');
      expect(suggestion.hasData).toBe(true);
      expect(suggestion.suggestedWeight).toBeDefined();
      expect(suggestion.suggestedWeight).toBeGreaterThan(100);
    });

    it('should suggest rep increase when consistently hitting target', async () => {
      // Create 3 completed workouts
      for (let i = 0; i < 3; i++) {
        const workout = createMockWorkout({
          id: `workout-${i}`,
          programId: 'prog-1',
          endedAt: new Date(Date.now() - i * 86400000).toISOString(), // Different days
        });
        await db.workouts.add(workout);

        await db.exerciseInstances.add({
          id: `ex-${i}`,
          workoutId: `workout-${i}`,
          name: 'Bench Press',
          targetSets: 3,
          targetReps: '8-10',
          orderIndex: 0,
        });

        // All sets hit upper bound
        await db.setRecords.add({
          id: `set-${i}`,
          exerciseId: `ex-${i}`,
          workoutId: `workout-${i}`,
          weight: 100,
          reps: 10,
          timestamp: new Date(Date.now() - i * 86400000).toISOString(),
        });
      }

      const suggestion = await getProgressiveOverloadSuggestion('Bench Press', '8-10');
      expect(suggestion.hasData).toBe(true);
      expect(suggestion.suggestedReps).toBe('10-12');
      expect(suggestion.reason).toContain('increase to 10-12');
    });

    it('should not suggest increase if not hitting target reps', async () => {
      const workout = createMockWorkout({
        id: 'workout-1',
        programId: 'prog-1',
        endedAt: new Date().toISOString(),
      });
      await db.workouts.add(workout);

      await db.exerciseInstances.add({
        id: 'ex-1',
        workoutId: 'workout-1',
        name: 'Bench Press',
        targetSets: 3,
        targetReps: '8-10',
        orderIndex: 0,
      });

      // Add set with reps below target (7 reps)
      await db.setRecords.add({
        id: 'set-1',
        exerciseId: 'ex-1',
        workoutId: 'workout-1',
        weight: 100,
        reps: 7,
        timestamp: new Date().toISOString(),
      });

      const suggestion = await getProgressiveOverloadSuggestion('Bench Press', '8-10');
      expect(suggestion.hasData).toBe(true);
      expect(suggestion.reason).toContain('Need to hit');
    });
  });
});
