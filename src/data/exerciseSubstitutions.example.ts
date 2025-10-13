/**
 * Example usage of the Exercise Substitution Map
 *
 * This file demonstrates how to use the exercise substitution system
 * in your application.
 */

import {
  EXERCISE_SUBSTITUTIONS,
  getExerciseSubstitutions,
  hasSubstitutions,
  getAllPossibleSubstitutions,
  getExerciseNotes,
  searchExercises,
  getExerciseMuscleGroup,
  EXERCISE_GROUPS
} from './exerciseSubstitutions';

// Example 1: Get direct substitutions for an exercise
function example1() {
  const exercise = 'Barbell Bench Press';
  const substitutions = getExerciseSubstitutions(exercise);

  console.log(`Substitutions for ${exercise}:`);
  substitutions.forEach(sub => console.log(`  - ${sub}`));
  // Output:
  //   - Machine Chest Press
  //   - DB Bench Press
}

// Example 2: Check if an exercise has substitutions
function example2() {
  const exercise = 'Barbell Bench Press';

  if (hasSubstitutions(exercise)) {
    console.log(`${exercise} has available substitutions`);
    // Get the notes for proper form
    const notes = getExerciseNotes(exercise);
    console.log(`Form notes: ${notes}`);
  }
}

// Example 3: Get ALL possible substitutions (including reverse lookups)
function example3() {
  const exercise = 'DB Bench Press';
  const allSubs = getAllPossibleSubstitutions(exercise);

  console.log(`All possible substitutions for ${exercise}:`);
  allSubs.forEach(sub => console.log(`  - ${sub}`));
  // This will include exercises that list DB Bench Press as a substitution
  // as well as their other substitutions
}

// Example 4: Search for exercises
function example4() {
  const searchTerm = 'curl';
  const results = searchExercises(searchTerm);

  console.log(`Exercises matching "${searchTerm}":`);
  results.forEach(ex => console.log(`  - ${ex}`));
  // Output will include all curl variations
}

// Example 5: Get exercises by muscle group
function example5() {
  const muscleGroup = 'chest';
  const exercises = EXERCISE_GROUPS[muscleGroup];

  console.log(`Chest exercises:`);
  exercises.forEach(ex => console.log(`  - ${ex}`));
}

// Example 6: Find muscle group for an exercise
function example6() {
  const exercise = 'Barbell Bench Press';
  const muscleGroup = getExerciseMuscleGroup(exercise);

  console.log(`${exercise} targets: ${muscleGroup}`);
  // Output: Barbell Bench Press targets: chest
}

// Example 7: Build a workout substitution UI
function buildSubstitutionUI(selectedExercise: string) {
  const substitutions = getExerciseSubstitutions(selectedExercise);
  const notes = getExerciseNotes(selectedExercise);

  return {
    exercise: selectedExercise,
    canSubstitute: substitutions.length > 0,
    alternatives: substitutions.map(sub => ({
      name: sub,
      muscleGroup: getExerciseMuscleGroup(sub),
      notes: getExerciseNotes(sub)
    })),
    formNotes: notes
  };
}

// Example 8: Exercise autocomplete/search component
function exerciseAutocomplete(userInput: string) {
  const matches = searchExercises(userInput);

  return matches.map(exercise => ({
    name: exercise,
    muscleGroup: getExerciseMuscleGroup(exercise),
    hasAlternatives: hasSubstitutions(exercise),
    alternativeCount: getExerciseSubstitutions(exercise).length
  }));
}

// Example 9: Suggest alternatives when equipment is unavailable
function suggestAlternatives(unavailableEquipment: string[]) {
  const suggestions: Record<string, string[]> = {};

  // For each exercise in the program
  Object.keys(EXERCISE_SUBSTITUTIONS).forEach(exercise => {
    // If the exercise requires unavailable equipment
    const needsUnavailableEquipment = unavailableEquipment.some(equipment =>
      exercise.toLowerCase().includes(equipment.toLowerCase())
    );

    if (needsUnavailableEquipment) {
      suggestions[exercise] = getExerciseSubstitutions(exercise);
    }
  });

  return suggestions;
}

// Example 10: Generate a complete workout with substitutions
interface WorkoutExercise {
  name: string;
  sets: number;
  reps: number;
  notes?: string;
  alternatives?: string[];
}

function generateWorkout(exerciseNames: string[]): WorkoutExercise[] {
  return exerciseNames.map(name => ({
    name,
    sets: 3,
    reps: 10,
    notes: getExerciseNotes(name),
    alternatives: getExerciseSubstitutions(name)
  }));
}

// Example usage in a React component
/*
function ExerciseSelector({ currentExercise }: { currentExercise: string }) {
  const substitutions = getExerciseSubstitutions(currentExercise);
  const notes = getExerciseNotes(currentExercise);

  return (
    <div>
      <h3>{currentExercise}</h3>
      {notes && <p className="form-notes">{notes}</p>}

      {substitutions.length > 0 && (
        <div className="substitutions">
          <h4>Alternative Exercises:</h4>
          <ul>
            {substitutions.map(sub => (
              <li key={sub}>
                {sub}
                <button onClick={() => switchExercise(sub)}>
                  Switch to this
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
*/

// Export examples for testing
export {
  example1,
  example2,
  example3,
  example4,
  example5,
  example6,
  buildSubstitutionUI,
  exerciseAutocomplete,
  suggestAlternatives,
  generateWorkout
};
