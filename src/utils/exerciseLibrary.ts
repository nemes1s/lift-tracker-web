import type { ExerciseDefinition } from '../types/models';
import rawData from '../data/exerciseLibrary.json';

const definitions = rawData as ExerciseDefinition[];

const byName = new Map<string, ExerciseDefinition>(
  definitions.map(d => [d.name.toLowerCase(), d])
);

export function getExerciseDefinition(name: string): ExerciseDefinition | undefined {
  return byName.get(name.toLowerCase());
}

export function getPrimaryMuscles(name: string): string[] {
  return byName.get(name.toLowerCase())?.primaryMuscles ?? [];
}

export function getSecondaryMuscles(name: string): string[] {
  return byName.get(name.toLowerCase())?.secondaryMuscles ?? [];
}

export function getAllDefinitionNames(): string[] {
  return definitions.map(d => d.name);
}

export function getMusclesForExercises(names: string[]): { primary: string[]; secondary: string[] } {
  const primary = new Set<string>();
  const secondary = new Set<string>();
  for (const name of names) {
    const def = byName.get(name.toLowerCase());
    if (def) {
      def.primaryMuscles.forEach(m => primary.add(m));
      def.secondaryMuscles.forEach(m => secondary.add(m));
    }
  }
  return { primary: [...primary], secondary: [...secondary] };
}

// Classic antagonist muscle-group pairs, used to suggest supersets (e.g. biceps + triceps).
const ANTAGONIST_MUSCLE_PAIRS: [string, string][] = [
  ['biceps', 'triceps'],
  ['chest', 'lats'],
  ['chest', 'middle back'],
  ['quadriceps', 'hamstrings'],
  ['abdominals', 'lower back'],
  ['abductors', 'adductors'],
];

// Whether two exercises train opposing muscle groups (e.g. Bicep Curl + Triceps Pushdown).
// Exercises not in the library (custom names) have no known muscles and never match.
export function areAntagonistExercises(nameA: string, nameB: string): boolean {
  const musclesA = getPrimaryMuscles(nameA);
  const musclesB = getPrimaryMuscles(nameB);
  return ANTAGONIST_MUSCLE_PAIRS.some(
    ([a, b]) =>
      (musclesA.includes(a) && musclesB.includes(b)) ||
      (musclesA.includes(b) && musclesB.includes(a))
  );
}

export { definitions as exerciseDefinitions };
