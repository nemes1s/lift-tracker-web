// Declarative definitions for the built-in programs.
//
// Each program carries three template phases per day — week 1 (base), week 5 (variation)
// and week 9 (strength) — matching `selectTemplate()`, which picks the highest
// weekNumber <= the current week. Exercise names are taken from the bundled exercise
// library (src/data/exerciseLibrary.json) so substitutions and muscle-group stats resolve.
//
// `supersetGroup`: exercises sharing a number within a day are performed back-to-back
// with only a short rest between them.

export interface ProgramDefinitionExercise {
  name: string;
  targetSets: number;
  targetReps: string;
  notes?: string;
  isMyoreps?: boolean;
  isLengthenedPartials?: boolean;
  supersetGroup?: number;
}

export interface ProgramDefinitionDay {
  name: string;
  dayIndex: number;
  weekNumber: number;
  exercises: ProgramDefinitionExercise[];
}

export interface ProgramDefinition {
  id: string;
  name: string;
  description: string;
  totalWeeks: number;
  days: ProgramDefinitionDay[];
}

// ---------------------------------------------------------------------------
// Beginner Foundation — 3 days/week, full body, no supersets
// ---------------------------------------------------------------------------

const BEGINNER_FOUNDATION: ProgramDefinition = {
  id: 'beginner-foundation',
  name: 'Beginner Foundation',
  description: '3 days a week, full body. Learn the main lifts and build a base.',
  totalWeeks: 12,
  days: [
    // Weeks 1-4: learn the patterns, moderate reps
    {
      name: 'Full Body A',
      dayIndex: 0,
      weekNumber: 1,
      exercises: [
        { name: 'Barbell Squat', targetSets: 3, targetReps: '8-10', notes: 'Start light, own the depth before adding weight' },
        { name: 'Barbell Bench Press - Medium Grip', targetSets: 3, targetReps: '8-10' },
        { name: 'Bent Over Barbell Row', targetSets: 3, targetReps: '8-10' },
        { name: 'Standing Military Press', targetSets: 2, targetReps: '10-12' },
        { name: 'Plank', targetSets: 3, targetReps: '30-45', notes: 'Seconds, not reps' },
      ],
    },
    {
      name: 'Full Body B',
      dayIndex: 1,
      weekNumber: 1,
      exercises: [
        { name: 'Romanian Deadlift', targetSets: 3, targetReps: '8-10', isLengthenedPartials: true },
        { name: 'Wide-Grip Lat Pulldown', targetSets: 3, targetReps: '8-10' },
        { name: 'Dumbbell Bench Press', targetSets: 3, targetReps: '8-10' },
        { name: 'Leg Press', targetSets: 3, targetReps: '10-12' },
        { name: 'Crunches', targetSets: 3, targetReps: '12-15' },
      ],
    },
    {
      name: 'Full Body C',
      dayIndex: 2,
      weekNumber: 1,
      exercises: [
        { name: 'Barbell Deadlift', targetSets: 3, targetReps: '5-8', notes: 'Stop the set the moment your back rounds' },
        { name: 'Goblet Squat', targetSets: 3, targetReps: '10-12' },
        { name: 'Seated Cable Rows', targetSets: 3, targetReps: '10-12' },
        { name: 'Seated Dumbbell Press', targetSets: 3, targetReps: '10-12' },
        { name: 'Standing Calf Raises', targetSets: 3, targetReps: '12-15', isMyoreps: true },
      ],
    },

    // Weeks 5-8: more volume, first isolation work
    {
      name: 'Full Body A',
      dayIndex: 0,
      weekNumber: 5,
      exercises: [
        { name: 'Barbell Squat', targetSets: 4, targetReps: '8-10' },
        { name: 'Barbell Bench Press - Medium Grip', targetSets: 4, targetReps: '8-10' },
        { name: 'Bent Over Barbell Row', targetSets: 4, targetReps: '8-10' },
        { name: 'Standing Military Press', targetSets: 3, targetReps: '10-12' },
        { name: 'Dumbbell Bicep Curl', targetSets: 2, targetReps: '10-12', isMyoreps: true },
        { name: 'Plank', targetSets: 3, targetReps: '45-60', notes: 'Seconds, not reps' },
      ],
    },
    {
      name: 'Full Body B',
      dayIndex: 1,
      weekNumber: 5,
      exercises: [
        { name: 'Romanian Deadlift', targetSets: 4, targetReps: '8-10', isLengthenedPartials: true },
        { name: 'Wide-Grip Lat Pulldown', targetSets: 4, targetReps: '8-10' },
        { name: 'Incline Dumbbell Press', targetSets: 3, targetReps: '8-10' },
        { name: 'Leg Press', targetSets: 3, targetReps: '10-12' },
        { name: 'Side Lateral Raise', targetSets: 3, targetReps: '12-15', isMyoreps: true },
        { name: 'Crunches', targetSets: 3, targetReps: '15-20' },
      ],
    },
    {
      name: 'Full Body C',
      dayIndex: 2,
      weekNumber: 5,
      exercises: [
        { name: 'Barbell Deadlift', targetSets: 3, targetReps: '5-8' },
        { name: 'Front Barbell Squat', targetSets: 3, targetReps: '8-10' },
        { name: 'Seated Cable Rows', targetSets: 4, targetReps: '10-12' },
        { name: 'Seated Dumbbell Press', targetSets: 3, targetReps: '10-12' },
        { name: 'Triceps Pushdown', targetSets: 3, targetReps: '10-12', isMyoreps: true },
        { name: 'Standing Calf Raises', targetSets: 4, targetReps: '12-15', isMyoreps: true },
      ],
    },

    // Weeks 9-12: heavier, lower reps on the main lifts
    {
      name: 'Full Body A',
      dayIndex: 0,
      weekNumber: 9,
      exercises: [
        { name: 'Barbell Squat', targetSets: 4, targetReps: '5-6', notes: 'Keep 2 reps in reserve' },
        { name: 'Barbell Bench Press - Medium Grip', targetSets: 4, targetReps: '5-6' },
        { name: 'Bent Over Barbell Row', targetSets: 4, targetReps: '6-8' },
        { name: 'Standing Military Press', targetSets: 3, targetReps: '6-8' },
        { name: 'Plank', targetSets: 3, targetReps: '60-90', notes: 'Seconds, not reps' },
      ],
    },
    {
      name: 'Full Body B',
      dayIndex: 1,
      weekNumber: 9,
      exercises: [
        { name: 'Romanian Deadlift', targetSets: 4, targetReps: '6-8', isLengthenedPartials: true },
        { name: 'Weighted Pull Ups', targetSets: 4, targetReps: '5-8', notes: 'Band assistance is fine' },
        { name: 'Incline Dumbbell Press', targetSets: 4, targetReps: '6-8' },
        { name: 'Leg Press', targetSets: 3, targetReps: '8-10' },
        { name: 'Hanging Leg Raise', targetSets: 3, targetReps: '10-12' },
      ],
    },
    {
      name: 'Full Body C',
      dayIndex: 2,
      weekNumber: 9,
      exercises: [
        { name: 'Barbell Deadlift', targetSets: 4, targetReps: '3-5' },
        { name: 'Front Barbell Squat', targetSets: 3, targetReps: '6-8' },
        { name: 'Chest-Supported Row', targetSets: 4, targetReps: '8-10' },
        { name: 'Seated Dumbbell Press', targetSets: 3, targetReps: '8-10' },
        { name: 'Standing Calf Raises', targetSets: 4, targetReps: '10-12', isMyoreps: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Push / Pull / Legs — 6 days/week
// ---------------------------------------------------------------------------

const PPL_6_DAY: ProgramDefinition = {
  id: 'ppl-6-day',
  name: 'Push / Pull / Legs (6 Day)',
  description: 'Six sessions a week, each muscle group twice. High volume, needs recovery.',
  totalWeeks: 12,
  days: [
    // Weeks 1-4
    {
      name: 'Push A',
      dayIndex: 0,
      weekNumber: 1,
      exercises: [
        { name: 'Barbell Bench Press - Medium Grip', targetSets: 4, targetReps: '6-8' },
        { name: 'Seated Dumbbell Press', targetSets: 3, targetReps: '8-10' },
        { name: 'Incline Dumbbell Press', targetSets: 3, targetReps: '10-12' },
        { name: 'Side Lateral Raise', targetSets: 3, targetReps: '12-15', isMyoreps: true },
        { name: 'Triceps Pushdown', targetSets: 3, targetReps: '10-12', isMyoreps: true },
      ],
    },
    {
      name: 'Pull A',
      dayIndex: 1,
      weekNumber: 1,
      exercises: [
        { name: 'Bent Over Barbell Row', targetSets: 4, targetReps: '6-8' },
        { name: 'Wide-Grip Lat Pulldown', targetSets: 3, targetReps: '8-10' },
        { name: 'Seated Cable Rows', targetSets: 3, targetReps: '10-12' },
        { name: 'Face Pull', targetSets: 3, targetReps: '12-15', isMyoreps: true },
        { name: 'Dumbbell Bicep Curl', targetSets: 3, targetReps: '10-12', isMyoreps: true, isLengthenedPartials: true },
      ],
    },
    {
      name: 'Legs A',
      dayIndex: 2,
      weekNumber: 1,
      exercises: [
        { name: 'Barbell Squat', targetSets: 4, targetReps: '6-8' },
        { name: 'Romanian Deadlift', targetSets: 3, targetReps: '8-10', isLengthenedPartials: true },
        { name: 'Leg Press', targetSets: 3, targetReps: '10-12' },
        { name: 'Seated Leg Curl', targetSets: 3, targetReps: '10-12', isMyoreps: true },
        { name: 'Standing Calf Raises', targetSets: 4, targetReps: '12-15', isMyoreps: true },
      ],
    },
    {
      name: 'Push B',
      dayIndex: 3,
      weekNumber: 1,
      exercises: [
        { name: 'Standing Military Press', targetSets: 4, targetReps: '6-8' },
        { name: 'Dumbbell Bench Press', targetSets: 3, targetReps: '8-10' },
        { name: 'Dips - Triceps Version', targetSets: 3, targetReps: '8-12' },
        { name: 'Cable Seated Lateral Raise', targetSets: 3, targetReps: '12-15', isMyoreps: true },
        { name: 'Triceps Overhead Extension with Rope', targetSets: 3, targetReps: '10-12', isLengthenedPartials: true },
      ],
    },
    {
      name: 'Pull B',
      dayIndex: 4,
      weekNumber: 1,
      exercises: [
        { name: 'Barbell Deadlift', targetSets: 3, targetReps: '4-6', notes: 'Keep 1-2 reps in reserve' },
        { name: 'Pullups', targetSets: 4, targetReps: '6-10' },
        { name: 'Chest-Supported Row', targetSets: 3, targetReps: '10-12' },
        { name: 'Cable Rope Rear-Delt Rows', targetSets: 3, targetReps: '12-15', isMyoreps: true },
        { name: 'Hammer Curls', targetSets: 3, targetReps: '10-12', isMyoreps: true },
      ],
    },
    {
      name: 'Legs B',
      dayIndex: 5,
      weekNumber: 1,
      exercises: [
        { name: 'Front Barbell Squat', targetSets: 4, targetReps: '6-8' },
        { name: 'Bulgarian Split Squat', targetSets: 3, targetReps: '10-12' },
        { name: 'Seated Leg Curl', targetSets: 3, targetReps: '10-12', isLengthenedPartials: true },
        { name: 'Leg Extensions', targetSets: 3, targetReps: '12-15', isMyoreps: true },
        { name: 'Seated Calf Raise', targetSets: 4, targetReps: '15-20', isMyoreps: true },
      ],
    },

    // Weeks 5-8: variation phase, more volume on the weak links
    {
      name: 'Push A',
      dayIndex: 0,
      weekNumber: 5,
      exercises: [
        { name: 'Barbell Incline Bench Press - Medium Grip', targetSets: 4, targetReps: '8-10' },
        { name: 'Machine Bench Press', targetSets: 3, targetReps: '10-12' },
        { name: 'Seated Dumbbell Press', targetSets: 4, targetReps: '10-12' },
        { name: 'Side Lateral Raise', targetSets: 4, targetReps: '15-20', isMyoreps: true },
        { name: 'Triceps Pushdown', targetSets: 4, targetReps: '12-15', isMyoreps: true },
      ],
    },
    {
      name: 'Pull A',
      dayIndex: 1,
      weekNumber: 5,
      exercises: [
        { name: 'Chest-Supported Row', targetSets: 4, targetReps: '10-12' },
        { name: 'Close-Grip Front Lat Pulldown', targetSets: 4, targetReps: '10-12' },
        { name: 'Seated Cable Rows', targetSets: 3, targetReps: '12-15' },
        { name: 'Face Pull', targetSets: 4, targetReps: '15-20', isMyoreps: true },
        { name: 'Incline Dumbbell Curl', targetSets: 4, targetReps: '12-15', isMyoreps: true, isLengthenedPartials: true },
      ],
    },
    {
      name: 'Legs A',
      dayIndex: 2,
      weekNumber: 5,
      exercises: [
        { name: 'Barbell Squat', targetSets: 4, targetReps: '8-10' },
        { name: 'Romanian Deadlift', targetSets: 4, targetReps: '10-12', isLengthenedPartials: true },
        { name: 'Leg Press', targetSets: 4, targetReps: '12-15' },
        { name: 'Seated Leg Curl', targetSets: 4, targetReps: '12-15', isMyoreps: true },
        { name: 'Standing Calf Raises', targetSets: 5, targetReps: '15-20', isMyoreps: true },
      ],
    },
    {
      name: 'Push B',
      dayIndex: 3,
      weekNumber: 5,
      exercises: [
        { name: 'Seated Dumbbell Press', targetSets: 4, targetReps: '8-10' },
        { name: 'Flat Bench Cable Flyes', targetSets: 4, targetReps: '12-15', isLengthenedPartials: true },
        { name: 'Dips - Triceps Version', targetSets: 3, targetReps: '10-12' },
        { name: 'Cable Seated Lateral Raise', targetSets: 4, targetReps: '15-20', isMyoreps: true },
        { name: 'Triceps Overhead Extension with Rope', targetSets: 4, targetReps: '12-15', isLengthenedPartials: true },
      ],
    },
    {
      name: 'Pull B',
      dayIndex: 4,
      weekNumber: 5,
      exercises: [
        { name: 'Barbell Deadlift', targetSets: 3, targetReps: '5-6' },
        { name: 'Pullups', targetSets: 4, targetReps: '8-12' },
        { name: 'One Arm Lat Pulldown', targetSets: 3, targetReps: '12-15' },
        { name: 'Cable Rope Rear-Delt Rows', targetSets: 4, targetReps: '15-20', isMyoreps: true },
        { name: 'Hammer Curls', targetSets: 4, targetReps: '12-15', isMyoreps: true },
      ],
    },
    {
      name: 'Legs B',
      dayIndex: 5,
      weekNumber: 5,
      exercises: [
        { name: 'Front Barbell Squat', targetSets: 4, targetReps: '8-10' },
        { name: 'Bulgarian Split Squat', targetSets: 4, targetReps: '12-15' },
        { name: 'Natural Glute Ham Raise', targetSets: 3, targetReps: '8-12' },
        { name: 'Leg Extensions', targetSets: 4, targetReps: '15-20', isMyoreps: true },
        { name: 'Seated Calf Raise', targetSets: 5, targetReps: '15-20', isMyoreps: true },
      ],
    },

    // Weeks 9-12: strength phase
    {
      name: 'Push A',
      dayIndex: 0,
      weekNumber: 9,
      exercises: [
        { name: 'Barbell Bench Press - Medium Grip', targetSets: 5, targetReps: '3-5' },
        { name: 'Standing Military Press', targetSets: 4, targetReps: '5-6' },
        { name: 'Barbell Incline Bench Press - Medium Grip', targetSets: 3, targetReps: '6-8' },
        { name: 'Side Lateral Raise', targetSets: 3, targetReps: '12-15', isMyoreps: true },
        { name: 'Lying Close-Grip Barbell Triceps Press To Chin', targetSets: 3, targetReps: '8-10' },
      ],
    },
    {
      name: 'Pull A',
      dayIndex: 1,
      weekNumber: 9,
      exercises: [
        { name: 'Bent Over Barbell Row', targetSets: 5, targetReps: '5-6' },
        { name: 'Weighted Pull Ups', targetSets: 4, targetReps: '4-6' },
        { name: 'Seated Cable Rows', targetSets: 3, targetReps: '8-10' },
        { name: 'Face Pull', targetSets: 3, targetReps: '12-15', isMyoreps: true },
        { name: 'Barbell Curl', targetSets: 3, targetReps: '8-10' },
      ],
    },
    {
      name: 'Legs A',
      dayIndex: 2,
      weekNumber: 9,
      exercises: [
        { name: 'Barbell Squat', targetSets: 5, targetReps: '3-5' },
        { name: 'Romanian Deadlift', targetSets: 4, targetReps: '6-8', isLengthenedPartials: true },
        { name: 'Leg Press', targetSets: 3, targetReps: '8-10' },
        { name: 'Seated Leg Curl', targetSets: 3, targetReps: '10-12', isMyoreps: true },
        { name: 'Standing Calf Raises', targetSets: 4, targetReps: '10-12', isMyoreps: true },
      ],
    },
    {
      name: 'Push B',
      dayIndex: 3,
      weekNumber: 9,
      exercises: [
        { name: 'Standing Military Press', targetSets: 5, targetReps: '3-5' },
        { name: 'Dumbbell Bench Press', targetSets: 4, targetReps: '6-8' },
        { name: 'Dips - Triceps Version', targetSets: 3, targetReps: '6-10', notes: 'Add weight when 10 reps is easy' },
        { name: 'Cable Seated Lateral Raise', targetSets: 3, targetReps: '12-15', isMyoreps: true },
        { name: 'Triceps Pushdown', targetSets: 3, targetReps: '10-12', isMyoreps: true },
      ],
    },
    {
      name: 'Pull B',
      dayIndex: 4,
      weekNumber: 9,
      exercises: [
        { name: 'Barbell Deadlift', targetSets: 4, targetReps: '3-4', notes: 'Heaviest session of the week' },
        { name: 'Weighted Pull Ups', targetSets: 4, targetReps: '4-6' },
        { name: 'Chest-Supported Row', targetSets: 3, targetReps: '8-10' },
        { name: 'Cable Rope Rear-Delt Rows', targetSets: 3, targetReps: '12-15', isMyoreps: true },
        { name: 'Hammer Curls', targetSets: 3, targetReps: '10-12', isMyoreps: true },
      ],
    },
    {
      name: 'Legs B',
      dayIndex: 5,
      weekNumber: 9,
      exercises: [
        { name: 'Front Barbell Squat', targetSets: 5, targetReps: '4-6' },
        { name: 'Barbell Lunge', targetSets: 3, targetReps: '8-10' },
        { name: 'Seated Leg Curl', targetSets: 3, targetReps: '10-12', isLengthenedPartials: true },
        { name: 'Leg Extensions', targetSets: 3, targetReps: '12-15', isMyoreps: true },
        { name: 'Seated Calf Raise', targetSets: 4, targetReps: '12-15', isMyoreps: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Bodyweight — 4 days/week, no equipment beyond a bar to hang from
// ---------------------------------------------------------------------------

const BODYWEIGHT: ProgramDefinition = {
  id: 'bodyweight',
  name: 'Bodyweight Only',
  description: 'No gym needed. Progress by adding reps, then harder variations.',
  totalWeeks: 12,
  days: [
    // Weeks 1-4: build the base movements
    {
      name: 'Upper Push',
      dayIndex: 0,
      weekNumber: 1,
      exercises: [
        { name: 'Pushups', targetSets: 4, targetReps: '8-15', notes: 'Elevate your hands if you cannot hit 8' },
        { name: 'Bench Dips', targetSets: 3, targetReps: '10-15' },
        { name: 'Push-Ups - Close Triceps Position', targetSets: 3, targetReps: '8-12' },
        { name: 'Push Up to Side Plank', targetSets: 3, targetReps: '8-10' },
        { name: 'Plank', targetSets: 3, targetReps: '30-45', notes: 'Seconds, not reps' },
      ],
    },
    {
      name: 'Upper Pull',
      dayIndex: 1,
      weekNumber: 1,
      exercises: [
        { name: 'Inverted Row', targetSets: 4, targetReps: '8-12', notes: 'Use a table edge or low bar' },
        { name: 'Band Assisted Pull-Up', targetSets: 3, targetReps: '5-10' },
        { name: 'Bodyweight Mid Row', targetSets: 3, targetReps: '10-15' },
        { name: 'Hyperextensions With No Hyperextension Bench', targetSets: 3, targetReps: '12-15' },
        { name: 'Scapular Pull-Up', targetSets: 3, targetReps: '8-12' },
      ],
    },
    {
      name: 'Lower',
      dayIndex: 2,
      weekNumber: 1,
      exercises: [
        { name: 'Bodyweight Squat', targetSets: 4, targetReps: '15-25' },
        { name: 'Bodyweight Walking Lunge', targetSets: 3, targetReps: '12-16', notes: 'Per leg' },
        { name: 'Single Leg Glute Bridge', targetSets: 3, targetReps: '12-15' },
        { name: 'Freehand Jump Squat', targetSets: 3, targetReps: '10-12' },
        { name: 'Calf Raise On A Dumbbell', targetSets: 4, targetReps: '15-20', isMyoreps: true },
      ],
    },
    {
      name: 'Core & Full Body',
      dayIndex: 3,
      weekNumber: 1,
      exercises: [
        { name: 'Hanging Leg Raise', targetSets: 3, targetReps: '8-12' },
        { name: 'Crunches', targetSets: 3, targetReps: '15-20' },
        { name: 'Russian Twist', targetSets: 3, targetReps: '20-30' },
        { name: 'Side Bridge', targetSets: 3, targetReps: '30-45', notes: 'Seconds per side' },
        { name: 'Bent-Knee Hip Raise', targetSets: 3, targetReps: '12-15' },
      ],
    },

    // Weeks 5-8: harder leverages, more volume
    {
      name: 'Upper Push',
      dayIndex: 0,
      weekNumber: 5,
      exercises: [
        { name: 'Decline Push-Up', targetSets: 4, targetReps: '10-15' },
        { name: 'Diamond Push-Ups', targetSets: 3, targetReps: '8-12' },
        { name: 'Parallel Bar Dip', targetSets: 4, targetReps: '8-12' },
        { name: 'Push-Ups With Feet Elevated', targetSets: 3, targetReps: '10-15' },
        { name: 'Plank', targetSets: 3, targetReps: '60-75', notes: 'Seconds, not reps' },
      ],
    },
    {
      name: 'Upper Pull',
      dayIndex: 1,
      weekNumber: 5,
      exercises: [
        { name: 'Pullups', targetSets: 4, targetReps: '5-10' },
        { name: 'Inverted Row', targetSets: 4, targetReps: '12-15' },
        { name: 'Chin-Up', targetSets: 3, targetReps: '5-10' },
        { name: 'Bodyweight Mid Row', targetSets: 3, targetReps: '12-18' },
        { name: 'Hyperextensions With No Hyperextension Bench', targetSets: 3, targetReps: '15-20' },
      ],
    },
    {
      name: 'Lower',
      dayIndex: 2,
      weekNumber: 5,
      exercises: [
        { name: 'Bodyweight Squat', targetSets: 4, targetReps: '25-35' },
        { name: 'Bulgarian Split Squat', targetSets: 4, targetReps: '10-15', notes: 'Bodyweight, back foot on a chair' },
        { name: 'Freehand Jump Squat', targetSets: 4, targetReps: '12-15' },
        { name: 'Single Leg Glute Bridge', targetSets: 3, targetReps: '15-20' },
        { name: 'Calf Raise On A Dumbbell', targetSets: 4, targetReps: '20-25', isMyoreps: true },
      ],
    },
    {
      name: 'Core & Full Body',
      dayIndex: 3,
      weekNumber: 5,
      exercises: [
        { name: 'Hanging Leg Raise', targetSets: 4, targetReps: '10-15' },
        { name: 'Jackknife Sit-Up', targetSets: 3, targetReps: '12-18' },
        { name: 'Russian Twist', targetSets: 3, targetReps: '30-40' },
        { name: 'Side Bridge', targetSets: 3, targetReps: '45-60', notes: 'Seconds per side' },
        { name: 'Reverse Crunch', targetSets: 3, targetReps: '15-20' },
      ],
    },

    // Weeks 9-12: strength-biased, hardest variations
    {
      name: 'Upper Push',
      dayIndex: 0,
      weekNumber: 9,
      exercises: [
        { name: 'Handstand Push-Ups', targetSets: 4, targetReps: '3-8', notes: 'Wall-supported, or pike push-ups if not there yet' },
        { name: 'Single-Arm Push-Up', targetSets: 3, targetReps: '3-6', notes: 'Per side, feet wide' },
        { name: 'Ring Dips', targetSets: 4, targetReps: '6-10' },
        { name: 'Decline Push-Up', targetSets: 3, targetReps: '12-18' },
        { name: 'Plank', targetSets: 3, targetReps: '90-120', notes: 'Seconds, not reps' },
      ],
    },
    {
      name: 'Upper Pull',
      dayIndex: 1,
      weekNumber: 9,
      exercises: [
        { name: 'Weighted Pull Ups', targetSets: 5, targetReps: '4-6', notes: 'Backpack works fine as load' },
        { name: 'One Arm Chin-Up', targetSets: 3, targetReps: '2-5', notes: 'Assisted with the free hand on your wrist' },
        { name: 'Inverted Row with Straps', targetSets: 4, targetReps: '10-15' },
        { name: 'Mixed Grip Chin', targetSets: 3, targetReps: '6-10' },
        { name: 'Hyperextensions With No Hyperextension Bench', targetSets: 3, targetReps: '20-25' },
      ],
    },
    {
      name: 'Lower',
      dayIndex: 2,
      weekNumber: 9,
      exercises: [
        { name: 'Kettlebell Pistol Squat', targetSets: 4, targetReps: '4-8', notes: 'Bodyweight pistols, hold a counterweight if needed' },
        { name: 'Bulgarian Split Squat', targetSets: 4, targetReps: '12-15' },
        { name: 'Freehand Jump Squat', targetSets: 4, targetReps: '15-20' },
        { name: 'Natural Glute Ham Raise', targetSets: 3, targetReps: '5-10' },
        { name: 'Calf Raise On A Dumbbell', targetSets: 5, targetReps: '20-25', isMyoreps: true },
      ],
    },
    {
      name: 'Core & Full Body',
      dayIndex: 3,
      weekNumber: 9,
      exercises: [
        { name: 'Hanging Leg Raise', targetSets: 4, targetReps: '12-20' },
        { name: 'Hanging Pike', targetSets: 3, targetReps: '5-10' },
        { name: 'Knee/Hip Raise On Parallel Bars', targetSets: 3, targetReps: '12-15' },
        { name: 'Side Bridge', targetSets: 3, targetReps: '60-90', notes: 'Seconds per side' },
        { name: 'Russian Twist', targetSets: 3, targetReps: '40-50' },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Cardio Pulse — circuit / metcon, everything runs as a continuous circuit
// ---------------------------------------------------------------------------

const CARDIO_PULSE: ProgramDefinition = {
  id: 'cardio-pulse',
  name: 'Cardio Pulse',
  description: 'Circuit conditioning. Light loads, minimal rest, heart rate stays high.',
  totalWeeks: 12,
  days: [
    // Weeks 1-4: two circuits per session, learn the pace
    {
      name: 'Full Body Circuit',
      dayIndex: 0,
      weekNumber: 1,
      exercises: [
        { name: 'Goblet Squat', targetSets: 3, targetReps: '15-20', supersetGroup: 1, notes: 'Circuit 1 — move straight to the next exercise' },
        { name: 'Pushups', targetSets: 3, targetReps: '12-20', supersetGroup: 1 },
        { name: 'One-Arm Kettlebell Swings', targetSets: 3, targetReps: '12-15', supersetGroup: 1, notes: 'Per side' },
        { name: 'Inverted Row', targetSets: 3, targetReps: '10-15', supersetGroup: 1 },
        { name: 'Plank', targetSets: 3, targetReps: '30-45', supersetGroup: 2, notes: 'Circuit 2 — seconds, not reps' },
        { name: 'Bodyweight Walking Lunge', targetSets: 3, targetReps: '16-20', supersetGroup: 2 },
        { name: 'Russian Twist', targetSets: 3, targetReps: '20-30', supersetGroup: 2 },
      ],
    },
    {
      name: 'Lower & Core Circuit',
      dayIndex: 1,
      weekNumber: 1,
      exercises: [
        { name: 'Bodyweight Squat', targetSets: 3, targetReps: '20-30', supersetGroup: 1, notes: 'Circuit 1' },
        { name: 'Freehand Jump Squat', targetSets: 3, targetReps: '10-15', supersetGroup: 1 },
        { name: 'Single Leg Glute Bridge', targetSets: 3, targetReps: '12-15', supersetGroup: 1 },
        { name: 'Step-up with Knee Raise', targetSets: 3, targetReps: '12-16', supersetGroup: 1 },
        { name: 'Crunches', targetSets: 3, targetReps: '20-25', supersetGroup: 2, notes: 'Circuit 2' },
        { name: 'Bent-Knee Hip Raise', targetSets: 3, targetReps: '15-20', supersetGroup: 2 },
        { name: 'Side Bridge', targetSets: 3, targetReps: '30-45', supersetGroup: 2, notes: 'Seconds per side' },
      ],
    },
    {
      name: 'Upper & Power Circuit',
      dayIndex: 2,
      weekNumber: 1,
      exercises: [
        { name: 'Kettlebell Thruster', targetSets: 3, targetReps: '10-15', supersetGroup: 1, notes: 'Circuit 1' },
        { name: 'Bodyweight Mid Row', targetSets: 3, targetReps: '12-18', supersetGroup: 1 },
        { name: 'Bench Dips', targetSets: 3, targetReps: '12-18', supersetGroup: 1 },
        { name: 'Battling Ropes', targetSets: 3, targetReps: '20-30', supersetGroup: 1, notes: 'Seconds of continuous waves' },
        { name: 'Push-Ups - Close Triceps Position', targetSets: 3, targetReps: '10-15', supersetGroup: 2, notes: 'Circuit 2' },
        { name: 'Side Lateral Raise', targetSets: 3, targetReps: '15-20', supersetGroup: 2 },
        { name: 'Plank', targetSets: 3, targetReps: '30-45', supersetGroup: 2, notes: 'Seconds, not reps' },
      ],
    },

    // Weeks 5-8: denser circuits, higher rep targets
    {
      name: 'Full Body Circuit',
      dayIndex: 0,
      weekNumber: 5,
      exercises: [
        { name: 'Goblet Squat', targetSets: 4, targetReps: '20-25', supersetGroup: 1, notes: 'Circuit 1' },
        { name: 'Decline Push-Up', targetSets: 4, targetReps: '15-20', supersetGroup: 1 },
        { name: 'One-Arm Kettlebell Swings', targetSets: 4, targetReps: '15-20', supersetGroup: 1, notes: 'Per side' },
        { name: 'Inverted Row', targetSets: 4, targetReps: '12-18', supersetGroup: 1 },
        { name: 'Bodyweight Walking Lunge', targetSets: 4, targetReps: '20-24', supersetGroup: 2, notes: 'Circuit 2' },
        { name: 'Hanging Leg Raise', targetSets: 4, targetReps: '10-15', supersetGroup: 2 },
        { name: 'Plank', targetSets: 4, targetReps: '45-60', supersetGroup: 2, notes: 'Seconds, not reps' },
      ],
    },
    {
      name: 'Lower & Core Circuit',
      dayIndex: 1,
      weekNumber: 5,
      exercises: [
        { name: 'Freehand Jump Squat', targetSets: 4, targetReps: '15-20', supersetGroup: 1, notes: 'Circuit 1' },
        { name: 'Bulgarian Split Squat', targetSets: 4, targetReps: '12-15', supersetGroup: 1 },
        { name: 'One-Arm Kettlebell Swings', targetSets: 4, targetReps: '15-20', supersetGroup: 1 },
        { name: 'Step-up with Knee Raise', targetSets: 4, targetReps: '16-20', supersetGroup: 1 },
        { name: 'Russian Twist', targetSets: 4, targetReps: '30-40', supersetGroup: 2, notes: 'Circuit 2' },
        { name: 'Reverse Crunch', targetSets: 4, targetReps: '15-20', supersetGroup: 2 },
        { name: 'Side Bridge', targetSets: 4, targetReps: '45-60', supersetGroup: 2, notes: 'Seconds per side' },
      ],
    },
    {
      name: 'Upper & Power Circuit',
      dayIndex: 2,
      weekNumber: 5,
      exercises: [
        { name: 'Kettlebell Thruster', targetSets: 4, targetReps: '15-20', supersetGroup: 1, notes: 'Circuit 1' },
        { name: 'Pullups', targetSets: 4, targetReps: '6-10', supersetGroup: 1 },
        { name: 'Parallel Bar Dip', targetSets: 4, targetReps: '10-15', supersetGroup: 1 },
        { name: 'Battling Ropes', targetSets: 4, targetReps: '30-40', supersetGroup: 1, notes: 'Seconds of continuous waves' },
        { name: 'Dumbbell Clean', targetSets: 4, targetReps: '10-12', supersetGroup: 2, notes: 'Circuit 2' },
        { name: 'Side Lateral Raise', targetSets: 4, targetReps: '20-25', supersetGroup: 2 },
        { name: 'Push Up to Side Plank', targetSets: 4, targetReps: '12-16', supersetGroup: 2 },
      ],
    },

    // Weeks 9-12: power-biased, shorter and sharper
    {
      name: 'Full Body Circuit',
      dayIndex: 0,
      weekNumber: 9,
      exercises: [
        { name: 'Power Clean', targetSets: 4, targetReps: '5-8', supersetGroup: 1, notes: 'Circuit 1 — stay explosive, drop the weight if speed dies' },
        { name: 'Freehand Jump Squat', targetSets: 4, targetReps: '12-15', supersetGroup: 1 },
        { name: 'Pushups', targetSets: 4, targetReps: '20-25', supersetGroup: 1 },
        { name: 'One-Arm Kettlebell Swings', targetSets: 4, targetReps: '20-25', supersetGroup: 1 },
        { name: 'Wind Sprints', targetSets: 4, targetReps: '20-30', supersetGroup: 2, notes: 'Circuit 2 — seconds of hard effort' },
        { name: 'Hanging Leg Raise', targetSets: 4, targetReps: '12-18', supersetGroup: 2 },
        { name: 'Plank', targetSets: 4, targetReps: '60-90', supersetGroup: 2, notes: 'Seconds, not reps' },
      ],
    },
    {
      name: 'Lower & Core Circuit',
      dayIndex: 1,
      weekNumber: 9,
      exercises: [
        { name: 'Front Squats With Two Kettlebells', targetSets: 4, targetReps: '10-15', supersetGroup: 1, notes: 'Circuit 1' },
        { name: 'Weighted Jump Squat', targetSets: 4, targetReps: '8-12', supersetGroup: 1 },
        { name: 'Bulgarian Split Squat', targetSets: 4, targetReps: '12-15', supersetGroup: 1 },
        { name: 'Natural Glute Ham Raise', targetSets: 4, targetReps: '8-12', supersetGroup: 1 },
        { name: 'Wind Sprints', targetSets: 4, targetReps: '20-30', supersetGroup: 2, notes: 'Circuit 2 — seconds of hard effort' },
        { name: 'Knee/Hip Raise On Parallel Bars', targetSets: 4, targetReps: '12-18', supersetGroup: 2 },
        { name: 'Side Bridge', targetSets: 4, targetReps: '60-75', supersetGroup: 2, notes: 'Seconds per side' },
      ],
    },
    {
      name: 'Upper & Power Circuit',
      dayIndex: 2,
      weekNumber: 9,
      exercises: [
        { name: 'One-Arm Kettlebell Snatch', targetSets: 4, targetReps: '8-10', supersetGroup: 1, notes: 'Circuit 1 — per side' },
        { name: 'Weighted Pull Ups', targetSets: 4, targetReps: '5-8', supersetGroup: 1 },
        { name: 'Ring Dips', targetSets: 4, targetReps: '8-12', supersetGroup: 1 },
        { name: 'Battling Ropes', targetSets: 4, targetReps: '40-50', supersetGroup: 1, notes: 'Seconds of continuous waves' },
        { name: 'Kettlebell Thruster', targetSets: 4, targetReps: '12-15', supersetGroup: 2, notes: 'Circuit 2' },
        { name: 'Rope Climb', targetSets: 4, targetReps: '2-4', supersetGroup: 2 },
        { name: 'Push Up to Side Plank', targetSets: 4, targetReps: '16-20', supersetGroup: 2 },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Superset Express — every exercise paired, for days with no time
// ---------------------------------------------------------------------------

const SUPERSET_EXPRESS: ProgramDefinition = {
  id: 'superset-express',
  name: 'Superset Express',
  description: 'Three paired supersets per session. In and out in about 30 minutes.',
  totalWeeks: 12,
  days: [
    // Weeks 1-4: antagonist pairs, moderate reps
    {
      name: 'Express Upper',
      dayIndex: 0,
      weekNumber: 1,
      exercises: [
        { name: 'Barbell Bench Press - Medium Grip', targetSets: 3, targetReps: '8-10', supersetGroup: 1 },
        { name: 'Bent Over Barbell Row', targetSets: 3, targetReps: '8-10', supersetGroup: 1 },
        { name: 'Seated Dumbbell Press', targetSets: 3, targetReps: '10-12', supersetGroup: 2 },
        { name: 'Wide-Grip Lat Pulldown', targetSets: 3, targetReps: '10-12', supersetGroup: 2 },
        { name: 'Dumbbell Bicep Curl', targetSets: 3, targetReps: '12-15', supersetGroup: 3, isMyoreps: true },
        { name: 'Triceps Pushdown', targetSets: 3, targetReps: '12-15', supersetGroup: 3, isMyoreps: true },
      ],
    },
    {
      name: 'Express Lower',
      dayIndex: 1,
      weekNumber: 1,
      exercises: [
        { name: 'Barbell Squat', targetSets: 3, targetReps: '8-10', supersetGroup: 1 },
        { name: 'Seated Leg Curl', targetSets: 3, targetReps: '10-12', supersetGroup: 1 },
        { name: 'Romanian Deadlift', targetSets: 3, targetReps: '10-12', supersetGroup: 2, isLengthenedPartials: true },
        { name: 'Leg Extensions', targetSets: 3, targetReps: '12-15', supersetGroup: 2 },
        { name: 'Standing Calf Raises', targetSets: 3, targetReps: '15-20', supersetGroup: 3, isMyoreps: true },
        { name: 'Crunches', targetSets: 3, targetReps: '15-20', supersetGroup: 3 },
      ],
    },
    {
      name: 'Express Full Body',
      dayIndex: 2,
      weekNumber: 1,
      exercises: [
        { name: 'Goblet Squat', targetSets: 3, targetReps: '12-15', supersetGroup: 1 },
        { name: 'Dumbbell Bench Press', targetSets: 3, targetReps: '10-12', supersetGroup: 1 },
        { name: 'Romanian Deadlift', targetSets: 3, targetReps: '10-12', supersetGroup: 2 },
        { name: 'Seated Cable Rows', targetSets: 3, targetReps: '10-12', supersetGroup: 2 },
        { name: 'Side Lateral Raise', targetSets: 3, targetReps: '12-15', supersetGroup: 3, isMyoreps: true },
        { name: 'Plank', targetSets: 3, targetReps: '30-45', supersetGroup: 3, notes: 'Seconds, not reps' },
      ],
    },

    // Weeks 5-8: same pairing, more reps and a fourth set on the openers
    {
      name: 'Express Upper',
      dayIndex: 0,
      weekNumber: 5,
      exercises: [
        { name: 'Barbell Incline Bench Press - Medium Grip', targetSets: 4, targetReps: '10-12', supersetGroup: 1 },
        { name: 'Chest-Supported Row', targetSets: 4, targetReps: '10-12', supersetGroup: 1 },
        { name: 'Seated Dumbbell Press', targetSets: 3, targetReps: '12-15', supersetGroup: 2 },
        { name: 'Close-Grip Front Lat Pulldown', targetSets: 3, targetReps: '12-15', supersetGroup: 2 },
        { name: 'Incline Dumbbell Curl', targetSets: 3, targetReps: '12-15', supersetGroup: 3, isMyoreps: true, isLengthenedPartials: true },
        { name: 'Triceps Overhead Extension with Rope', targetSets: 3, targetReps: '12-15', supersetGroup: 3, isLengthenedPartials: true },
      ],
    },
    {
      name: 'Express Lower',
      dayIndex: 1,
      weekNumber: 5,
      exercises: [
        { name: 'Front Barbell Squat', targetSets: 4, targetReps: '10-12', supersetGroup: 1 },
        { name: 'Seated Leg Curl', targetSets: 4, targetReps: '12-15', supersetGroup: 1 },
        { name: 'Bulgarian Split Squat', targetSets: 3, targetReps: '12-15', supersetGroup: 2 },
        { name: 'Leg Extensions', targetSets: 3, targetReps: '15-20', supersetGroup: 2, isMyoreps: true },
        { name: 'Seated Calf Raise', targetSets: 3, targetReps: '20-25', supersetGroup: 3, isMyoreps: true },
        { name: 'Hanging Leg Raise', targetSets: 3, targetReps: '12-15', supersetGroup: 3 },
      ],
    },
    {
      name: 'Express Full Body',
      dayIndex: 2,
      weekNumber: 5,
      exercises: [
        { name: 'Dumbbell Squat', targetSets: 4, targetReps: '15-20', supersetGroup: 1 },
        { name: 'Incline Dumbbell Press', targetSets: 4, targetReps: '12-15', supersetGroup: 1 },
        { name: 'Romanian Deadlift', targetSets: 3, targetReps: '12-15', supersetGroup: 2, isLengthenedPartials: true },
        { name: 'Pullups', targetSets: 3, targetReps: '6-10', supersetGroup: 2 },
        { name: 'Cable Seated Lateral Raise', targetSets: 3, targetReps: '15-20', supersetGroup: 3, isMyoreps: true },
        { name: 'Russian Twist', targetSets: 3, targetReps: '25-35', supersetGroup: 3 },
      ],
    },

    // Weeks 9-12: heavier pairs, lower reps, same time budget
    {
      name: 'Express Upper',
      dayIndex: 0,
      weekNumber: 9,
      exercises: [
        { name: 'Barbell Bench Press - Medium Grip', targetSets: 4, targetReps: '5-6', supersetGroup: 1 },
        { name: 'Bent Over Barbell Row', targetSets: 4, targetReps: '5-6', supersetGroup: 1 },
        { name: 'Standing Military Press', targetSets: 3, targetReps: '6-8', supersetGroup: 2 },
        { name: 'Weighted Pull Ups', targetSets: 3, targetReps: '5-8', supersetGroup: 2 },
        { name: 'Barbell Curl', targetSets: 3, targetReps: '8-10', supersetGroup: 3 },
        { name: 'Dips - Triceps Version', targetSets: 3, targetReps: '8-12', supersetGroup: 3 },
      ],
    },
    {
      name: 'Express Lower',
      dayIndex: 1,
      weekNumber: 9,
      exercises: [
        { name: 'Barbell Squat', targetSets: 4, targetReps: '5-6', supersetGroup: 1 },
        { name: 'Seated Leg Curl', targetSets: 4, targetReps: '10-12', supersetGroup: 1 },
        { name: 'Barbell Deadlift', targetSets: 3, targetReps: '4-5', supersetGroup: 2, notes: 'Pair with calves so the bar work stays crisp' },
        { name: 'Standing Calf Raises', targetSets: 3, targetReps: '12-15', supersetGroup: 2, isMyoreps: true },
        { name: 'Leg Extensions', targetSets: 3, targetReps: '12-15', supersetGroup: 3, isMyoreps: true },
        { name: 'Hanging Leg Raise', targetSets: 3, targetReps: '12-18', supersetGroup: 3 },
      ],
    },
    {
      name: 'Express Full Body',
      dayIndex: 2,
      weekNumber: 9,
      exercises: [
        { name: 'Front Barbell Squat', targetSets: 4, targetReps: '6-8', supersetGroup: 1 },
        { name: 'Dumbbell Bench Press', targetSets: 4, targetReps: '6-8', supersetGroup: 1 },
        { name: 'Romanian Deadlift', targetSets: 3, targetReps: '8-10', supersetGroup: 2, isLengthenedPartials: true },
        { name: 'Chest-Supported Row', targetSets: 3, targetReps: '8-10', supersetGroup: 2 },
        { name: 'Side Lateral Raise', targetSets: 3, targetReps: '12-15', supersetGroup: 3, isMyoreps: true },
        { name: 'Plank', targetSets: 3, targetReps: '60-90', supersetGroup: 3, notes: 'Seconds, not reps' },
      ],
    },
  ],
};

export const BUILT_IN_PROGRAM_DEFINITIONS: ProgramDefinition[] = [
  BEGINNER_FOUNDATION,
  PPL_6_DAY,
  BODYWEIGHT,
  CARDIO_PULSE,
  SUPERSET_EXPRESS,
];

export function getProgramDefinition(id: string): ProgramDefinition | undefined {
  return BUILT_IN_PROGRAM_DEFINITIONS.find((p) => p.id === id);
}
