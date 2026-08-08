import { describe, it, expect } from 'vitest';
import { areAntagonistExercises } from './exerciseLibrary';

describe('areAntagonistExercises', () => {
  it('matches biceps and triceps', () => {
    expect(areAntagonistExercises('Dumbbell Bicep Curl', 'Triceps Pushdown')).toBe(true);
  });

  it('matches quadriceps and hamstrings, regardless of argument order', () => {
    expect(areAntagonistExercises('Barbell Squat', 'Seated Leg Curl')).toBe(true);
    expect(areAntagonistExercises('Seated Leg Curl', 'Barbell Squat')).toBe(true);
  });

  it('matches chest and back', () => {
    expect(areAntagonistExercises('Barbell Bench Press - Medium Grip', 'Bent Over Barbell Row')).toBe(true);
  });

  it('returns false for exercises training the same muscle group', () => {
    expect(areAntagonistExercises('Dumbbell Bicep Curl', 'Barbell Curl')).toBe(false);
  });

  it('returns false for unrelated muscle groups', () => {
    expect(areAntagonistExercises('Dumbbell Bicep Curl', 'Barbell Squat')).toBe(false);
  });

  it('returns false for names not in the exercise library', () => {
    expect(areAntagonistExercises('Made Up Exercise', 'Triceps Pushdown')).toBe(false);
  });
});
