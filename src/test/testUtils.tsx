import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import type { Program, WorkoutTemplate, ExerciseTemplate, Workout, ExerciseInstance, SetRecord } from '../types/models';

/**
 * Custom render function that wraps components with necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <BrowserRouter>{children}</BrowserRouter>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Creates a mock program for testing
 */
export function createMockProgram(overrides?: Partial<Program>): Program {
  return {
    id: 'test-program-1',
    name: 'Test Program',
    description: 'A test program',
    totalWeeks: 12,
    startDate: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Creates a mock workout template for testing
 */
export function createMockWorkoutTemplate(
  overrides?: Partial<WorkoutTemplate>
): WorkoutTemplate {
  return {
    id: 'test-template-1',
    programId: 'test-program-1',
    name: 'Test Day',
    dayIndex: 0,
    weekNumber: 1,
    ...overrides,
  };
}

/**
 * Creates a mock exercise template for testing
 */
export function createMockExerciseTemplate(
  overrides?: Partial<ExerciseTemplate>
): ExerciseTemplate {
  return {
    id: 'test-exercise-1',
    workoutTemplateId: 'test-template-1',
    name: 'Bench Press',
    targetSets: 3,
    targetReps: '8-10',
    restTime: 120,
    notes: '',
    orderIndex: 0,
    ...overrides,
  };
}

/**
 * Creates a mock workout for testing
 */
export function createMockWorkout(overrides?: Partial<Workout>): Workout {
  return {
    id: 'test-workout-1',
    programId: 'test-program-1',
    name: 'Test Workout',
    startedAt: new Date(),
    ...overrides,
  };
}

/**
 * Creates a mock exercise instance for testing
 */
export function createMockExerciseInstance(
  overrides?: Partial<ExerciseInstance>
): ExerciseInstance {
  return {
    id: 'test-exercise-instance-1',
    workoutId: 'test-workout-1',
    name: 'Bench Press',
    targetSets: 3,
    targetReps: '8-10',
    orderIndex: 0,
    ...overrides,
  };
}

/**
 * Creates a mock set record for testing
 */
export function createMockSetRecord(overrides?: Partial<SetRecord>): SetRecord {
  return {
    id: 'test-set-1',
    exerciseId: 'test-exercise-instance-1',
    weight: 100,
    reps: 8,
    timestamp: new Date(),
    isWarmup: false,
    ...overrides,
  };
}

/**
 * Waits for a condition to be true (useful for async state updates)
 */
export async function waitFor(
  condition: () => boolean,
  timeout = 3000,
  interval = 50
): Promise<void> {
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}
