/**
 * Exercise matching and grouping utilities
 *
 * This module provides functionality to normalize exercise names and group similar exercises together.
 * This helps aggregate statistics for exercises with minor naming variations.
 */

/**
 * Normalize an exercise name for matching purposes
 *
 * Normalization rules:
 * - Convert to lowercase
 * - Remove degree indicators (45, 90, 180, degree, deg)
 * - Standardize equipment names (db/dumbbell, bb/barbell)
 * - Remove position modifiers (seated, lying, standing, incline, decline, flat)
 * - Remove "leg" prefix for leg exercises (helps match "Press" with "Leg Press")
 * - Normalize whitespace
 *
 * Examples:
 * - "45 Incline DB Press" → "dumbbell press"
 * - "Incline Dumbbell Press" → "dumbbell press"
 * - "Seated Leg Press" → "press"
 * - "Leg Press" → "press"
 */
export function normalizeExerciseName(name: string): string {
  return name
    .toLowerCase()
    // Remove degree indicators
    .replace(/\b(45|90|180|degree|deg)\b/gi, '')
    // Standardize equipment names
    .replace(/\b(db|dumbell)\b/gi, 'dumbbell')
    .replace(/\b(bb)\b/gi, 'barbell')
    // Remove position modifiers
    .replace(/\b(seated|lying|standing|incline|decline|flat)\b/gi, '')
    // Remove "leg" prefix (helps match leg exercises)
    .replace(/\bleg\s+/gi, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Group similar exercises together by normalized name
 *
 * Returns a map where:
 * - Key: normalized exercise name (canonical)
 * - Value: array of original exercise names that match
 *
 * @param exercises Array of exercise names to group
 * @returns Map of normalized name to original names
 */
export function groupSimilarExercises(exercises: string[]): Map<string, string[]> {
  const groups = new Map<string, string[]>();

  for (const exercise of exercises) {
    const normalized = normalizeExerciseName(exercise);

    if (!groups.has(normalized)) {
      groups.set(normalized, []);
    }

    groups.get(normalized)!.push(exercise);
  }

  return groups;
}

/**
 * Get the canonical (display) name for a group of similar exercises
 *
 * Strategy:
 * 1. If all names are identical, use that name
 * 2. Otherwise, use the shortest name (likely the most generic)
 *
 * @param exercises Array of similar exercise names
 * @returns The canonical name to display
 */
export function getCanonicalName(exercises: string[]): string {
  if (exercises.length === 0) return '';
  if (exercises.length === 1) return exercises[0];

  // Check if all names are the same
  const allSame = exercises.every(name => name === exercises[0]);
  if (allSame) return exercises[0];

  // Return the shortest name (most generic)
  return exercises.reduce((shortest, current) =>
    current.length < shortest.length ? current : shortest
  );
}

/**
 * Get all exercise variants for a given exercise name when combining is enabled
 *
 * If combining is disabled, returns the exercise name as-is in an array.
 * If combining is enabled, returns all exercises with the same normalized name.
 *
 * @param exerciseName The selected exercise name
 * @param allExercises All available exercise names
 * @param combineSimilar Whether to combine similar exercises
 * @returns Array of exercise names to query (may contain just one if not combining)
 */
export function getExerciseVariants(
  exerciseName: string,
  allExercises: string[],
  combineSimilar: boolean
): string[] {
  if (!combineSimilar) {
    return [exerciseName];
  }

  const normalized = normalizeExerciseName(exerciseName);
  const groups = groupSimilarExercises(allExercises);

  return groups.get(normalized) || [exerciseName];
}

/**
 * Create a display list of exercises for the selector, with grouping information
 *
 * When combining is enabled:
 * - Shows canonical names
 * - Adds count of variants if > 1
 * - Returns a map of display name → original names
 *
 * When combining is disabled:
 * - Shows original names as-is
 *
 * @param exercises Array of all exercise names
 * @param combineSimilar Whether to combine similar exercises
 * @returns Object with display names and a map to resolve them to original names
 */
export function createExerciseDisplayList(
  exercises: string[],
  combineSimilar: boolean
): {
  displayNames: string[];
  nameMap: Map<string, string[]>; // display name → original names
} {
  if (!combineSimilar) {
    // No grouping, show original names
    const nameMap = new Map<string, string[]>();
    exercises.forEach(name => nameMap.set(name, [name]));

    return {
      displayNames: exercises,
      nameMap,
    };
  }

  // Group exercises and create display names
  const groups = groupSimilarExercises(exercises);
  const displayNames: string[] = [];
  const nameMap = new Map<string, string[]>();

  for (const [, variants] of groups) {
    const canonical = getCanonicalName(variants);
    const displayName = variants.length > 1
      ? `${canonical} (${variants.length} variants)`
      : canonical;

    displayNames.push(displayName);
    nameMap.set(displayName, variants);
  }

  // Sort alphabetically
  displayNames.sort((a, b) => a.localeCompare(b));

  return {
    displayNames,
    nameMap,
  };
}

/**
 * Get the display name for a selected exercise
 *
 * @param exerciseName The selected exercise (can be a canonical name or variant)
 * @param allExercises All available exercises
 * @param combineSimilar Whether combining is enabled
 * @returns The display name to show in the selector
 */
export function getExerciseDisplayName(
  exerciseName: string,
  allExercises: string[],
  combineSimilar: boolean
): string {
  if (!combineSimilar) {
    return exerciseName;
  }

  const { nameMap } = createExerciseDisplayList(allExercises, combineSimilar);

  // Find the display name that includes this exercise
  for (const [displayName, variants] of nameMap) {
    if (variants.includes(exerciseName)) {
      return displayName;
    }
  }

  // Fallback to original name if not found
  return exerciseName;
}
