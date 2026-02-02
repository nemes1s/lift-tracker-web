import { describe, it, expect, beforeEach } from 'vitest';
import {
  currentWeek,
  selectTemplate,
  recommendedDay,
  instantiateWorkout,
  getProgressiveOverloadSuggestion,
  findTemplateForWorkout,
  updateTemplateFromWorkout,
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

  describe('findTemplateForWorkout', () => {
    beforeEach(async () => {
      const program = createMockProgram({ id: 'prog-1' });
      await db.programs.add(program);

      // Create templates
      await db.workoutTemplates.add(
        createMockWorkoutTemplate({
          id: 'template-1',
          programId: 'prog-1',
          name: 'Upper Body Day',
          dayIndex: 0,
          weekNumber: 1,
        })
      );
      await db.workoutTemplates.add(
        createMockWorkoutTemplate({
          id: 'template-2',
          programId: 'prog-1',
          name: 'Lower Body Day',
          dayIndex: 1,
          weekNumber: 1,
        })
      );
    });

    it('should find template by exact name match', async () => {
      const workout = createMockWorkout({
        id: 'workout-1',
        programId: 'prog-1',
        name: 'Upper Body Day',
      });
      await db.workouts.add(workout);

      const template = await findTemplateForWorkout(workout);
      expect(template).toBeDefined();
      expect(template?.id).toBe('template-1');
      expect(template?.name).toBe('Upper Body Day');
    });

    it('should find template when workout name includes template name', async () => {
      const workout = createMockWorkout({
        id: 'workout-1',
        programId: 'prog-1',
        name: 'Upper Body Day - Week 1',
      });
      await db.workouts.add(workout);

      const template = await findTemplateForWorkout(workout);
      expect(template).toBeDefined();
      expect(template?.id).toBe('template-1');
    });

    it('should return undefined if workout has no programId', async () => {
      const workout = createMockWorkout({
        id: 'workout-1',
        programId: undefined,
        name: 'Standalone Workout',
      });
      await db.workouts.add(workout);

      const template = await findTemplateForWorkout(workout);
      expect(template).toBeUndefined();
    });

    it('should return undefined if no matching template found', async () => {
      const workout = createMockWorkout({
        id: 'workout-1',
        programId: 'prog-1',
        name: 'Nonexistent Workout',
      });
      await db.workouts.add(workout);

      const template = await findTemplateForWorkout(workout);
      expect(template).toBeUndefined();
    });
  });

  describe('updateTemplateFromWorkout', () => {
    let workout: any;
    let template: any;

    beforeEach(async () => {
      const program = createMockProgram({ id: 'prog-1' });
      await db.programs.add(program);

      // Create template with initial exercises
      template = createMockWorkoutTemplate({
        id: 'template-1',
        programId: 'prog-1',
        name: 'Upper Body',
        dayIndex: 0,
        weekNumber: 1,
      });
      await db.workoutTemplates.add(template);

      await db.exerciseTemplates.add(
        createMockExerciseTemplate({
          id: 'old-ex-1',
          workoutTemplateId: 'template-1',
          name: 'Old Exercise 1',
          targetSets: 3,
          targetReps: '8-10',
          orderIndex: 0,
        })
      );
      await db.exerciseTemplates.add(
        createMockExerciseTemplate({
          id: 'old-ex-2',
          workoutTemplateId: 'template-1',
          name: 'Old Exercise 2',
          targetSets: 3,
          targetReps: '8-10',
          orderIndex: 1,
        })
      );

      // Create workout based on template
      workout = createMockWorkout({
        id: 'workout-1',
        programId: 'prog-1',
        name: 'Upper Body',
      });
      await db.workouts.add(workout);
    });

    it('should update template with new exercises from workout', async () => {
      // Create new exercise instances
      const exercises = [
        {
          id: 'new-ex-1',
          workoutId: 'workout-1',
          name: 'Bench Press',
          targetSets: 4,
          targetReps: '6-8',
          orderIndex: 0,
          notes: 'Focus on form',
        },
        {
          id: 'new-ex-2',
          workoutId: 'workout-1',
          name: 'Rows',
          targetSets: 4,
          targetReps: '8-10',
          orderIndex: 1,
          notes: '',
        },
      ];

      for (const ex of exercises) {
        await db.exerciseInstances.add(ex);
      }

      const result = await updateTemplateFromWorkout(workout, exercises);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Updated "Upper Body" template');
      expect(result.message).toContain('2 exercises');
      expect(result.updatedTemplateId).toBe('template-1');

      // Verify old exercises were deleted
      const updatedExercises = await db.exerciseTemplates
        .where('workoutTemplateId')
        .equals('template-1')
        .sortBy('orderIndex');

      expect(updatedExercises).toHaveLength(2);
      expect(updatedExercises.find(e => e.name === 'Old Exercise 1')).toBeUndefined();
      expect(updatedExercises.find(e => e.name === 'Old Exercise 2')).toBeUndefined();

      // Verify new exercises were added
      expect(updatedExercises[0].name).toBe('Bench Press');
      expect(updatedExercises[0].targetSets).toBe(4);
      expect(updatedExercises[0].targetReps).toBe('6-8');
      expect(updatedExercises[0].notes).toBe('Focus on form');

      expect(updatedExercises[1].name).toBe('Rows');
      expect(updatedExercises[1].targetSets).toBe(4);
      expect(updatedExercises[1].targetReps).toBe('8-10');
    });

    it('should preserve exercise order', async () => {
      const exercises = [
        {
          id: 'ex-1',
          workoutId: 'workout-1',
          name: 'Exercise 1',
          targetSets: 3,
          targetReps: '10',
          orderIndex: 0,
        },
        {
          id: 'ex-2',
          workoutId: 'workout-1',
          name: 'Exercise 2',
          targetSets: 3,
          targetReps: '10',
          orderIndex: 1,
        },
        {
          id: 'ex-3',
          workoutId: 'workout-1',
          name: 'Exercise 3',
          targetSets: 3,
          targetReps: '10',
          orderIndex: 2,
        },
      ];

      for (const ex of exercises) {
        await db.exerciseInstances.add(ex);
      }

      await updateTemplateFromWorkout(workout, exercises);

      const updatedExercises = await db.exerciseTemplates
        .where('workoutTemplateId')
        .equals('template-1')
        .sortBy('orderIndex');

      expect(updatedExercises[0].orderIndex).toBe(0);
      expect(updatedExercises[1].orderIndex).toBe(1);
      expect(updatedExercises[2].orderIndex).toBe(2);
    });

    it('should preserve myoreps and lengthened partials flags', async () => {
      const exercises = [
        {
          id: 'ex-1',
          workoutId: 'workout-1',
          name: 'Lateral Raise',
          targetSets: 3,
          targetReps: '12-15',
          orderIndex: 0,
          isMyoreps: true,
        },
        {
          id: 'ex-2',
          workoutId: 'workout-1',
          name: 'Dumbbell Curl',
          targetSets: 3,
          targetReps: '10-12',
          orderIndex: 1,
          isMyoreps: true,
          isLengthenedPartials: true,
        },
      ];

      for (const ex of exercises) {
        await db.exerciseInstances.add(ex);
      }

      await updateTemplateFromWorkout(workout, exercises);

      const updatedExercises = await db.exerciseTemplates
        .where('workoutTemplateId')
        .equals('template-1')
        .sortBy('orderIndex');

      expect(updatedExercises[0].isMyoreps).toBe(true);
      expect(updatedExercises[0].isLengthenedPartials).toBeUndefined();

      expect(updatedExercises[1].isMyoreps).toBe(true);
      expect(updatedExercises[1].isLengthenedPartials).toBe(true);
    });

    it('should fail if workout has no programId', async () => {
      const workoutWithoutProgram = createMockWorkout({
        id: 'workout-2',
        programId: undefined,
        name: 'Standalone',
      });
      await db.workouts.add(workoutWithoutProgram);

      const result = await updateTemplateFromWorkout(workoutWithoutProgram, []);

      expect(result.success).toBe(false);
      expect(result.message).toContain('not linked to a program');
    });

    it('should fail if no matching template found', async () => {
      const workoutWithNoTemplate = createMockWorkout({
        id: 'workout-2',
        programId: 'prog-1',
        name: 'Nonexistent Workout',
      });
      await db.workouts.add(workoutWithNoTemplate);

      const result = await updateTemplateFromWorkout(workoutWithNoTemplate, []);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Could not find matching workout template');
    });
  });
});
