/**
 * Exercise Substitution Map
 * Generated from workout program template
 *
 * This map contains primary exercises and their alternative/substitution options
 * that can be used when equipment is unavailable or for exercise variety.
 */

export interface ExerciseSubstitution {
  primary: string;
  substitutions: string[];
  notes?: string;
}

export const EXERCISE_SUBSTITUTIONS: Record<string, ExerciseSubstitution> = {
  // CHEST EXERCISES
  '45° Incline Barbell Press': {
    primary: '45° Incline Barbell Press',
    substitutions: ['45° Incline DB Press', '45° Incline Machine Press'],
    notes: '1 second pause at the bottom of each rep while maintaining tension on the pecs'
  },
  'Cable Crossover Ladder': {
    primary: 'Cable Crossover Ladder',
    substitutions: ['Pec Deck', 'Bottom-Half DB Flye'],
    notes: 'Do one set with low cable position, one set with medium-height cable position, and one height with a high cable position'
  },
  'Barbell Bench Press': {
    primary: 'Barbell Bench Press',
    substitutions: ['Machine Chest Press', 'DB Bench Press', 'Dumbbell Bench Press'],
    notes: 'Set up a comfortable arch, quick pause on the chest and explode up on each rep'
  },
  'Dumbbell Bench Press': {
    primary: 'Dumbbell Bench Press',
    substitutions: ['Barbell Bench Press', 'Machine Chest Press'],
    notes: 'Control the weight, pause at the bottom with dumbbells just above chest level'
  },
  'Incline Barbell Press': {
    primary: 'Incline Barbell Press',
    substitutions: ['45° Incline Barbell Press', 'Incline Dumbbell Press', '45° Incline Machine Press'],
    notes: '30-45° incline angle for optimal upper chest activation'
  },
  'Incline Dumbbell Press': {
    primary: 'Incline Dumbbell Press',
    substitutions: ['Incline Barbell Press', '45° Incline DB Press', '45° Incline Machine Press'],
    notes: '30-45° incline, control the descent and drive through the chest'
  },
  'Cable Fly': {
    primary: 'Cable Fly',
    substitutions: ['Cable Crossover Ladder', 'Pec Deck', 'Bottom-Half DB Flye'],
    notes: 'Focus on the squeeze at peak contraction, maintain slight elbow bend'
  },
  'Bottom-Half DB Flye': {
    primary: 'Bottom-Half DB Flye',
    substitutions: ['Bottom-Half Seated Cable Flye', 'Low-to-High Cable Crossover'],
    notes: 'All reps and sets are to be performed in the bottom half of the ROM. Focus on feeling a deep stretch in your pecs at the bottom of each rep'
  },

  // BACK EXERCISES
  'Wide-Grip Pull-Up': {
    primary: 'Wide-Grip Pull-Up',
    substitutions: ['Wide-Grip Lat Pulldown', 'Dual-Handle Lat Pulldown'],
    notes: '1.5x shoulder width overhand grip. Slow 2-3 second negative. Feel your lats pulling apart on the way down'
  },
  'Pendlay Deficit Row': {
    primary: 'Pendlay Deficit Row',
    substitutions: ['Smith Machine Row', 'Single-Arm DB Row'],
    notes: 'Stand on a bumper plate. Focus on getting a big stretch and touch your stomach/chest on each rep'
  },
  'Neutral-Grip Lat Pulldown': {
    primary: 'Neutral-Grip Lat Pulldown',
    substitutions: ['Neutral-Grip Pull-Up', 'Dual-Handle Lat Pulldown'],
    notes: 'Do these pulldowns with the handle more out in front of you, more like a cross between pullover and a pulldown'
  },
  'Chest-Supported Machine Row': {
    primary: 'Chest-Supported Machine Row',
    substitutions: ['Chest-Supported T-Bar Row', 'Incline Chest-Supported DB Row'],
    notes: 'Flare elbows out at roughly 45° and squeeze your shoulder blades together hard at the top of each rep'
  },
  'Neutral-Grip Seated Cable Row': {
    primary: 'Neutral-Grip Seated Cable Row',
    substitutions: ['Helms Row', 'Meadows Row', 'Cable Row'],
    notes: 'Focus on squeezing your shoulder blades together, driving your elbows down and back'
  },
  'Cable Row': {
    primary: 'Cable Row',
    substitutions: ['Neutral-Grip Seated Cable Row', 'Chest-Supported Machine Row', 'Barbell Row'],
    notes: 'Keep torso stable, pull elbows back and squeeze shoulder blades together'
  },
  'Barbell Row': {
    primary: 'Barbell Row',
    substitutions: ['Pendlay Deficit Row', 'T-Bar Row', 'Chest-Supported Machine Row'],
    notes: 'Hinge at hips, keep back flat, row to lower chest'
  },
  'Chest-Supported Row': {
    primary: 'Chest-Supported Row',
    substitutions: ['Chest-Supported Machine Row', 'Chest-Supported T-Bar Row', 'Incline Chest-Supported DB Row'],
    notes: 'Eliminates lower back stress, focus purely on back contraction'
  },
  'Pull-Ups': {
    primary: 'Pull-Ups',
    substitutions: ['Wide-Grip Pull-Up', 'Neutral-Grip Pull-Up', 'Lat Pulldown'],
    notes: 'Full range of motion, chin over bar, control the descent'
  },
  'Weighted Pull-Ups': {
    primary: 'Weighted Pull-Ups',
    substitutions: ['Pull-Ups', 'Wide-Grip Pull-Up', 'Lat Pulldown'],
    notes: 'Add weight via belt or weighted vest, maintain strict form'
  },
  'Lat Pulldown': {
    primary: 'Lat Pulldown',
    substitutions: ['Wide-Grip Lat Pulldown', 'Neutral-Grip Lat Pulldown', 'Pull-Ups'],
    notes: 'Pull to upper chest, lean back slightly, squeeze lats at bottom'
  },
  'Deadlift': {
    primary: 'Deadlift',
    substitutions: ['Romanian Deadlift', 'Trap Bar Deadlift', 'Barbell RDL'],
    notes: 'Keep bar close to body, drive through heels, hinge at hips'
  },
  'Face Pulls': {
    primary: 'Face Pulls',
    substitutions: ['Rope Face Pull', '1-Arm 45° Cable Rear Delt Flye', 'Reverse Pec Deck'],
    notes: 'Pull to face level, externally rotate shoulders at end range'
  },

  // SHOULDER EXERCISES
  'High-Cable Lateral Raise': {
    primary: 'High-Cable Lateral Raise',
    substitutions: ['High-Cable Cuffed Lateral Raise', 'Lean-In DB Lateral Raise'],
    notes: 'Focus on squeezing your lateral delt to move the weight'
  },
  'Machine Shoulder Press': {
    primary: 'Machine Shoulder Press',
    substitutions: ['Cable Shoulder Press', 'Seated DB Shoulder Press', 'Overhead Press'],
    notes: 'Ensure that your elbows break at least 90°. Mind-muscle connection with your delts'
  },
  'Overhead Press': {
    primary: 'Overhead Press',
    substitutions: ['Barbell Overhead Press', 'Dumbbell Shoulder Press', 'Machine Shoulder Press'],
    notes: 'Press overhead in a straight line, engage core for stability'
  },
  'Dumbbell Shoulder Press': {
    primary: 'Dumbbell Shoulder Press',
    substitutions: ['Seated Dumbbell Press', 'Seated DB Shoulder Press', 'Barbell Overhead Press'],
    notes: 'Press dumbbells up and slightly together at top'
  },
  'Seated Dumbbell Press': {
    primary: 'Seated Dumbbell Press',
    substitutions: ['Dumbbell Shoulder Press', 'Seated DB Shoulder Press', 'Machine Shoulder Press'],
    notes: 'Use back support to isolate delts, press to just short of lockout'
  },
  'Lateral Raise': {
    primary: 'Lateral Raise',
    substitutions: ['Dumbbell Lateral Raise', 'High-Cable Lateral Raise', 'Lean-In DB Lateral Raise'],
    notes: 'Lead with elbows, raise to shoulder height, control the descent'
  },
  'Lateral Raise (Cable)': {
    primary: 'Lateral Raise (Cable)',
    substitutions: ['High-Cable Lateral Raise', 'Cable Lateral Raise', 'Dumbbell Lateral Raise'],
    notes: 'Constant tension from cable, focus on lateral delt contraction'
  },
  '1-Arm 45° Cable Rear Delt Flye': {
    primary: '1-Arm 45° Cable Rear Delt Flye',
    substitutions: ['Rope Face Pull', 'Reverse Pec Deck'],
    notes: 'Pause for 1-2 seconds in the squeeze of each rep. Contract the rear delts hard'
  },
  'Machine Shrug': {
    primary: 'Machine Shrug',
    substitutions: ['Cable Paused Shrug-In', 'DB Shrug'],
    notes: 'Brief pause at the top of the bottom of ROM. Think about pulling your shoulders up to your ears'
  },

  // ARM EXERCISES - BICEPS
  'Bayesian Cable Curl': {
    primary: 'Bayesian Cable Curl',
    substitutions: ['Seated Super-Bayesian High Cable Curl', 'Incline DB Stretch Curl'],
    notes: 'If you have a left-right bicep size imbalance, do these 1 arm at a time, starting with the weaker arm'
  },
  'EZ-Bar Cable Curl': {
    primary: 'EZ-Bar Cable Curl',
    substitutions: ['EZ-Bar Curl', 'DB Curl', 'Dumbbell Curl'],
    notes: 'Set up the cable at the lowest position. Maintain constant tension on the biceps'
  },
  'Dumbbell Curl': {
    primary: 'Dumbbell Curl',
    substitutions: ['DB Curl', 'EZ-Bar Curl', 'Barbell Curl'],
    notes: 'Keep elbows stable, curl with control, squeeze at top'
  },
  'Incline Dumbbell Curl': {
    primary: 'Incline Dumbbell Curl',
    substitutions: ['Incline DB Stretch Curl', 'Bayesian Cable Curl', 'Dumbbell Curl'],
    notes: 'Set bench to 45-60°, let arms hang for full stretch'
  },
  'Hammer Curl': {
    primary: 'Hammer Curl',
    substitutions: ['DB Hammer Curl', 'Rope Hammer Curl', 'Dumbbell Curl'],
    notes: 'Neutral grip, targets brachialis and brachioradialis'
  },
  'Machine Preacher Curl': {
    primary: 'Machine Preacher Curl',
    substitutions: ['EZ-Bar Preacher Curl', 'DB Preacher Curl'],
    notes: 'Smooth, controlled reps. Mind-muscle connection with the biceps'
  },

  // ARM EXERCISES - TRICEPS
  'Overhead Cable Triceps Extension (Bar)': {
    primary: 'Overhead Cable Triceps Extension (Bar)',
    substitutions: ['Overhead Cable Triceps Extension (Rope)', 'DB Skull Crusher'],
    notes: 'Optionally pause for 0.5-1 second in the stretched aspect of each rep'
  },
  'Cable Triceps Kickback': {
    primary: 'Cable Triceps Kickback',
    substitutions: ['DB Triceps Kickback', 'Bench Dip'],
    notes: 'There are two ways you can do this: upright or bent over. Choose the one that feels more comfortable for you'
  },
  'Triceps Pushdown': {
    primary: 'Triceps Pushdown',
    substitutions: ['Cable Triceps Pushdown', 'Rope Pushdown', 'Overhead Triceps Extension'],
    notes: 'Keep elbows pinned at sides, squeeze triceps at full extension'
  },
  'Overhead Triceps Ext.': {
    primary: 'Overhead Triceps Ext.',
    substitutions: ['Overhead Triceps Extension', 'Overhead Cable Triceps Extension (Bar)', 'DB Skull Crusher'],
    notes: 'Short form of Overhead Triceps Extension, maximal stretch at bottom'
  },
  'Overhead Triceps Extension': {
    primary: 'Overhead Triceps Extension',
    substitutions: ['Overhead Cable Triceps Extension (Bar)', 'Overhead Cable Triceps Extension (Rope)', 'DB Skull Crusher'],
    notes: 'Keep elbows pointing forward, lower for full triceps stretch'
  },
  'Dip (Assisted if needed)': {
    primary: 'Dip (Assisted if needed)',
    substitutions: ['Bench Dip', 'Triceps Dip', 'Close-Grip Bench Press'],
    notes: 'Lean forward for chest emphasis, stay upright for triceps emphasis'
  },

  // LEG EXERCISES - QUADS
  'Smith Machine Squat': {
    primary: 'Smith Machine Squat',
    substitutions: ['DB Bulgarian Split Squat', 'High-Bar Back Squat'],
    notes: 'Set up your feet as you would a normal squat and then bring them forward ~3-6 inches'
  },
  'Leg Extension': {
    primary: 'Leg Extension',
    substitutions: ['Reverse Nordic', 'Sissy Squat'],
    notes: 'Set the seat back as far as it will go while still feeling comfortable. Use a 2-3 second negative'
  },
  'Leg Press': {
    primary: 'Leg Press',
    substitutions: ['Smith Machine Static Lunge', 'DB Walking Lunge'],
    notes: 'Feet lower on the platform for more quad focus. Get as deep as you can without excessive back rounding'
  },
  'DB Bulgarian Split Squat': {
    primary: 'DB Bulgarian Split Squat',
    substitutions: ['DB Step-Up', 'Goblet Squat', 'Bulgarian Split Squat'],
    notes: 'Lower all the way down until your front thigh is parallel to the ground. Drive through your front heel on the way up'
  },
  'Bulgarian Split Squat': {
    primary: 'Bulgarian Split Squat',
    substitutions: ['DB Bulgarian Split Squat', 'Barbell Bulgarian Split Squat', 'Walking Lunge'],
    notes: 'Rear foot elevated, drop hips straight down, drive through front heel'
  },
  'Barbell Squat': {
    primary: 'Barbell Squat',
    substitutions: ['High-Bar Back Squat', 'Low-Bar Back Squat', 'Smith Machine Squat'],
    notes: 'Break at knees and hips simultaneously, descend to parallel or below'
  },
  'Front Squat': {
    primary: 'Front Squat',
    substitutions: ['Barbell Front Squat', 'Goblet Squat', 'Safety Bar Squat'],
    notes: 'Bar rests on front delts, elbows high, more upright torso than back squat'
  },

  // LEG EXERCISES - HAMSTRINGS
  'Lying Leg Curl': {
    primary: 'Lying Leg Curl',
    substitutions: ['Seated Leg Curl', 'Nordic Ham Curl'],
    notes: 'Set the machine so that you get the biggest stretch possible at the bottom. Prevent your butt from popping up as you curl'
  },
  'Barbell RDL': {
    primary: 'Barbell RDL',
    substitutions: ['DB RDL', 'Snatch-Grip RDL'],
    notes: 'To keep tension on the hamstrings, stop about 75% of the way to full lockout on each rep'
  },
  'Seated Leg Curl': {
    primary: 'Seated Leg Curl',
    substitutions: ['Lying Leg Curl', 'Nordic Ham Curl', 'Leg Curl'],
    notes: 'Lean forward over the machine to get a maximum stretch in your hamstrings'
  },
  'Leg Curl': {
    primary: 'Leg Curl',
    substitutions: ['Lying Leg Curl', 'Seated Leg Curl', 'Nordic Ham Curl'],
    notes: 'General leg curl - lying or seated variant based on equipment'
  },
  'Romanian Deadlift': {
    primary: 'Romanian Deadlift',
    substitutions: ['Barbell RDL', 'DB RDL', 'Stiff-Leg Deadlift'],
    notes: 'Hinge at hips, slight knee bend, feel stretch in hamstrings'
  },
  'Hip Thrust': {
    primary: 'Hip Thrust',
    substitutions: ['Barbell Hip Thrust', 'Glute Bridge', 'Single-Leg Hip Thrust'],
    notes: 'Upper back on bench, drive through heels, squeeze glutes at top'
  },

  // LEG EXERCISES - GLUTES/HIPS
  'Machine Hip Adduction': {
    primary: 'Machine Hip Adduction',
    substitutions: ['Cable Hip Adduction', 'Copenhagen Hip Adduction'],
    notes: 'Mind-muscle connection with your inner thighs. These are great for adding thigh mass from the front'
  },
  'Machine Hip Abduction': {
    primary: 'Machine Hip Abduction',
    substitutions: ['Cable Hip Abduction', 'Lateral Band Walk'],
    notes: 'If possible, use pads to increase the range of motion on the machine. Lean forward and grab onto the machine rails'
  },

  // LEG EXERCISES - CALVES
  'Standing Calf Raise': {
    primary: 'Standing Calf Raise',
    substitutions: ['Seated Calf Raise', 'Leg Press Calf Press'],
    notes: '1-2 second pause at the bottom of each rep. Instead of just going up onto your toes, think about rolling your ankle back and forth'
  },

  // CORE EXERCISES
  'Cable Crunch': {
    primary: 'Cable Crunch',
    substitutions: ['Decline Weighted Crunch', 'Machine Crunch', 'Kneeling Cable Crunch'],
    notes: 'Round your lower back as you crunch. Maintain a mind-muscle connection with your 6-pack'
  },
  'Roman Chair Leg Raise': {
    primary: 'Roman Chair Leg Raise',
    substitutions: ['Hanging Leg Raise', 'Modified Candlestick', 'Captains Chair Leg Raise'],
    notes: 'Allow your lower back to round as you curl your legs up. Just go until you hit the listed RPE with controlled form'
  },
  'Plank': {
    primary: 'Plank',
    substitutions: ['Front Plank', 'RKC Plank', 'Ab Wheel Rollout'],
    notes: 'Maintain neutral spine, engage entire core, breathe steadily'
  },
  'Ab Wheel Rollout': {
    primary: 'Ab Wheel Rollout',
    substitutions: ['Barbell Rollout', 'Plank', 'Dead Bug'],
    notes: 'Control the rollout, prevent lower back extension, strong core contraction'
  }
};

/**
 * Get substitution options for a given exercise
 */
export function getExerciseSubstitutions(exerciseName: string): string[] {
  const exercise = EXERCISE_SUBSTITUTIONS[exerciseName];
  return exercise ? exercise.substitutions : [];
}

/**
 * Check if an exercise has available substitutions
 */
export function hasSubstitutions(exerciseName: string): boolean {
  return exerciseName in EXERCISE_SUBSTITUTIONS;
}

/**
 * Get all exercises that can substitute for a given exercise
 * (includes reverse lookup - if A can substitute B, then B can substitute A)
 */
export function getAllPossibleSubstitutions(exerciseName: string): string[] {
  const directSubs = getExerciseSubstitutions(exerciseName);
  const reverseSubs: string[] = [];

  // Find exercises where the given exercise is listed as a substitution
  Object.entries(EXERCISE_SUBSTITUTIONS).forEach(([primary, data]) => {
    if (data.substitutions.includes(exerciseName)) {
      reverseSubs.push(primary);
      // Also add other substitutions of that exercise
      data.substitutions.forEach(sub => {
        if (sub !== exerciseName && !reverseSubs.includes(sub)) {
          reverseSubs.push(sub);
        }
      });
    }
  });

  return [...new Set([...directSubs, ...reverseSubs])];
}

/**
 * Get exercise notes/instructions
 */
export function getExerciseNotes(exerciseName: string): string | undefined {
  return EXERCISE_SUBSTITUTIONS[exerciseName]?.notes;
}

/**
 * Get all exercise names (for autocomplete, search, etc.)
 */
export function getAllExerciseNames(): string[] {
  const allNames = new Set<string>();

  Object.entries(EXERCISE_SUBSTITUTIONS).forEach(([primary, data]) => {
    allNames.add(primary);
    data.substitutions.forEach(sub => allNames.add(sub));
  });

  return Array.from(allNames).sort();
}

/**
 * Search exercises by partial name match
 */
export function searchExercises(query: string): string[] {
  const lowerQuery = query.toLowerCase();
  return getAllExerciseNames().filter(name =>
    name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Group exercises by muscle group
 */
export const EXERCISE_GROUPS = {
  chest: [
    '45° Incline Barbell Press',
    'Cable Crossover Ladder',
    'Barbell Bench Press',
    'Bottom-Half DB Flye',
    '45° Incline DB Press',
    '45° Incline Machine Press',
    'Pec Deck',
    'Machine Chest Press',
    'DB Bench Press',
    'Dumbbell Bench Press',
    'Incline Barbell Press',
    'Incline Dumbbell Press',
    'Cable Fly',
    'Bottom-Half Seated Cable Flye',
    'Low-to-High Cable Crossover'
  ],
  back: [
    'Wide-Grip Pull-Up',
    'Pendlay Deficit Row',
    'Neutral-Grip Lat Pulldown',
    'Chest-Supported Machine Row',
    'Neutral-Grip Seated Cable Row',
    'Wide-Grip Lat Pulldown',
    'Dual-Handle Lat Pulldown',
    'Smith Machine Row',
    'Single-Arm DB Row',
    'Neutral-Grip Pull-Up',
    'Chest-Supported T-Bar Row',
    'Incline Chest-Supported DB Row',
    'Helms Row',
    'Meadows Row',
    'Cable Row',
    'Barbell Row',
    'Chest-Supported Row',
    'Pull-Ups',
    'Weighted Pull-Ups',
    'Lat Pulldown',
    'Deadlift',
    'Face Pulls'
  ],
  shoulders: [
    'High-Cable Lateral Raise',
    'Machine Shoulder Press',
    '1-Arm 45° Cable Rear Delt Flye',
    'Machine Shrug',
    'High-Cable Cuffed Lateral Raise',
    'Lean-In DB Lateral Raise',
    'Cable Shoulder Press',
    'Seated DB Shoulder Press',
    'Rope Face Pull',
    'Reverse Pec Deck',
    'Cable Paused Shrug-In',
    'DB Shrug',
    'Overhead Press',
    'Dumbbell Shoulder Press',
    'Seated Dumbbell Press',
    'Lateral Raise',
    'Lateral Raise (Cable)'
  ],
  biceps: [
    'Bayesian Cable Curl',
    'EZ-Bar Cable Curl',
    'Machine Preacher Curl',
    'Seated Super-Bayesian High Cable Curl',
    'Incline DB Stretch Curl',
    'EZ-Bar Curl',
    'DB Curl',
    'EZ-Bar Preacher Curl',
    'DB Preacher Curl',
    'Dumbbell Curl',
    'Incline Dumbbell Curl',
    'Hammer Curl'
  ],
  triceps: [
    'Overhead Cable Triceps Extension (Bar)',
    'Cable Triceps Kickback',
    'Overhead Cable Triceps Extension (Rope)',
    'DB Skull Crusher',
    'DB Triceps Kickback',
    'Bench Dip',
    'Triceps Pushdown',
    'Overhead Triceps Ext.',
    'Overhead Triceps Extension',
    'Dip (Assisted if needed)'
  ],
  quads: [
    'Smith Machine Squat',
    'Leg Extension',
    'Leg Press',
    'DB Bulgarian Split Squat',
    'High-Bar Back Squat',
    'Reverse Nordic',
    'Sissy Squat',
    'Smith Machine Static Lunge',
    'DB Walking Lunge',
    'DB Step-Up',
    'Goblet Squat',
    'Bulgarian Split Squat',
    'Barbell Squat',
    'Front Squat'
  ],
  hamstrings: [
    'Lying Leg Curl',
    'Barbell RDL',
    'Seated Leg Curl',
    'Nordic Ham Curl',
    'DB RDL',
    'Snatch-Grip RDL',
    'Leg Curl',
    'Romanian Deadlift'
  ],
  glutes: [
    'Machine Hip Adduction',
    'Machine Hip Abduction',
    'Cable Hip Adduction',
    'Copenhagen Hip Adduction',
    'Cable Hip Abduction',
    'Lateral Band Walk',
    'Hip Thrust'
  ],
  calves: [
    'Standing Calf Raise',
    'Seated Calf Raise',
    'Leg Press Calf Press'
  ],
  core: [
    'Cable Crunch',
    'Roman Chair Leg Raise',
    'Decline Weighted Crunch',
    'Machine Crunch',
    'Hanging Leg Raise',
    'Modified Candlestick',
    'Plank',
    'Ab Wheel Rollout'
  ]
};

/**
 * Get muscle group for an exercise
 */
export function getExerciseMuscleGroup(exerciseName: string): string | undefined {
  for (const [group, exercises] of Object.entries(EXERCISE_GROUPS)) {
    if (exercises.includes(exerciseName)) {
      return group;
    }
  }
  return undefined;
}
