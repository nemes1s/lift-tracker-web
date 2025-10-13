# Exercise Substitution System

This directory contains the exercise substitution map and related utilities for the LiftTracker application.

## Overview

The exercise substitution system provides:
- A comprehensive map of exercises and their alternatives
- Helper functions to find and manage exercise substitutions
- Grouping of exercises by muscle groups
- Form notes and instructions for proper exercise execution

## Files

### `exerciseSubstitutions.ts`
The main file containing:
- `EXERCISE_SUBSTITUTIONS` - The complete substitution map
- Helper functions for querying substitutions
- Exercise grouping by muscle groups
- Utility functions for searching and filtering

### `exerciseSubstitutions.example.ts`
Example usage patterns demonstrating:
- How to get substitutions for an exercise
- Building UI components with substitution data
- Exercise search and autocomplete
- Workout generation with alternatives

## Key Features

### 1. Direct Substitutions
Get immediate alternatives for any exercise:
```typescript
import { getExerciseSubstitutions } from './exerciseSubstitutions';

const subs = getExerciseSubstitutions('Barbell Bench Press');
// Returns: ['Machine Chest Press', 'DB Bench Press']
```

### 2. Bidirectional Lookup
Find all possible substitutions, including reverse relationships:
```typescript
import { getAllPossibleSubstitutions } from './exerciseSubstitutions';

const allSubs = getAllPossibleSubstitutions('DB Bench Press');
// Returns all exercises that can substitute or be substituted by DB Bench Press
```

### 3. Muscle Group Organization
Exercises are organized by target muscle groups:
- Chest
- Back
- Shoulders
- Biceps
- Triceps
- Quads
- Hamstrings
- Glutes
- Calves
- Core

### 4. Form Notes
Each exercise includes technical notes for proper execution:
```typescript
import { getExerciseNotes } from './exerciseSubstitutions';

const notes = getExerciseNotes('Barbell Bench Press');
// Returns: "Set up a comfortable arch, quick pause on the chest and explode up on each rep."
```

### 5. Search Functionality
Search exercises by partial name match:
```typescript
import { searchExercises } from './exerciseSubstitutions';

const results = searchExercises('curl');
// Returns all exercises with "curl" in the name
```

## Use Cases

### Equipment Substitution
When specific equipment isn't available:
```typescript
if (!hasEquipment('barbell')) {
  const alternatives = getExerciseSubstitutions('Barbell Bench Press');
  // Offer DB Bench Press or Machine Chest Press instead
}
```

### Exercise Variety
Rotate exercises to prevent adaptation:
```typescript
const currentExercise = 'Barbell Bench Press';
const alternatives = getExerciseSubstitutions(currentExercise);
// Suggest alternatives for workout variety
```

### Injury Accommodation
Find alternatives when an exercise causes discomfort:
```typescript
if (userReportsDiscomfort('Barbell Bench Press')) {
  const gentlerAlternatives = getExerciseSubstitutions('Barbell Bench Press');
  // Suggest machine or dumbbell variations
}
```

### Workout Building
Create flexible workout programs:
```typescript
const workout = {
  exercise: 'Barbell Bench Press',
  alternatives: getExerciseSubstitutions('Barbell Bench Press'),
  notes: getExerciseNotes('Barbell Bench Press'),
  muscleGroup: getExerciseMuscleGroup('Barbell Bench Press')
};
```

## Data Source

The exercise substitution map was generated from the "Simplified workout.xlsx" workout program template, which contains:
- 40+ primary exercises
- 2 substitution options per exercise
- Detailed form notes and execution cues
- Progressive overload tracking data

## Future Enhancements

Potential additions to this system:
- Exercise difficulty ratings
- Equipment requirements per exercise
- Video/image references
- User preference tracking
- Custom substitution rules
- Exercise history and performance tracking
- Integration with workout templates
