/**
 * Utility to check alignment between program templates and exercise substitution map
 */

import { getAllExerciseNames } from '../data/exerciseSubstitutions';

// All exercises used in program templates
export const PROGRAM_TEMPLATE_EXERCISES = [
  // 5-Day Split
  'Barbell Bench Press',
  'Barbell Row',
  'Overhead Press',
  'Lat Pulldown',
  'Lateral Raise',
  'Dumbbell Curl',
  'Triceps Pushdown',
  'Barbell Squat',
  'Romanian Deadlift',
  'Leg Press',
  'Seated Leg Curl',
  'Standing Calf Raise',
  'Cable Crunch',
  'Deadlift',
  'Weighted Pull-Ups',
  'Chest-Supported Row',
  'Face Pulls',
  'Incline Dumbbell Curl',
  'Hammer Curl',
  'Incline Barbell Press',
  'Dumbbell Bench Press',
  'Seated Dumbbell Press',
  'Cable Fly',
  'Lateral Raise (Cable)',
  'Dip (Assisted if needed)',
  'Overhead Triceps Ext.',
  'Front Squat',
  'Bulgarian Split Squat',
  'Leg Extension',
  'Hip Thrust',
  'Seated Calf Raise',
  'Plank',
  // 3-Day Split
  'Pull-Ups',
  'Incline Dumbbell Press',
  'Dumbbell Shoulder Press',
  'Cable Row',
  'Overhead Triceps Extension',
  'Leg Curl',
  // 4-Day Minimal
  'Ab Wheel Rollout',
];

export function checkExerciseAlignment() {
  const substitutionMapExercises = new Set(getAllExerciseNames());
  const templateExercises = new Set(PROGRAM_TEMPLATE_EXERCISES);

  const missingInMap: string[] = [];
  const inMapButNotUsed: string[] = [];

  // Check which template exercises are missing from the map
  for (const exercise of templateExercises) {
    if (!substitutionMapExercises.has(exercise)) {
      missingInMap.push(exercise);
    }
  }

  // Check which map exercises are not used in templates
  for (const exercise of substitutionMapExercises) {
    if (!templateExercises.has(exercise)) {
      inMapButNotUsed.push(exercise);
    }
  }

  return {
    missingInMap: missingInMap.sort(),
    inMapButNotUsed: inMapButNotUsed.sort(),
    totalTemplateExercises: templateExercises.size,
    totalMapExercises: substitutionMapExercises.size,
  };
}
