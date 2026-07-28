import { describe, it, expect } from 'vitest';
import { BUILT_IN_PROGRAM_DEFINITIONS, getProgramDefinition } from './builtInPrograms';
import exerciseLibrary from './exerciseLibrary.json';
import { getSupersetMemberIndices } from '../utils/supersets';

const libraryNames = new Set((exerciseLibrary as Array<{ name: string }>).map((e) => e.name));

describe('built-in program definitions', () => {
  it('exposes the five new programs with unique ids', () => {
    const ids = BUILT_IN_PROGRAM_DEFINITIONS.map((p) => p.id);
    expect(ids).toEqual([
      'beginner-foundation',
      'ppl-6-day',
      'bodyweight',
      'cardio-pulse',
      'superset-express',
    ]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('looks up a definition by id', () => {
    expect(getProgramDefinition('cardio-pulse')?.name).toBe('Cardio Pulse');
    expect(getProgramDefinition('nope')).toBeUndefined();
  });

  describe.each(BUILT_IN_PROGRAM_DEFINITIONS)('$name', (program) => {
    it('uses exercise names that exist in the bundled library', () => {
      const unknown = program.days
        .flatMap((day) => day.exercises.map((e) => e.name))
        .filter((name) => !libraryNames.has(name));
      expect(unknown).toEqual([]);
    });

    it('defines all three phases (weeks 1, 5, 9) for every day', () => {
      const dayIndexes = [...new Set(program.days.map((d) => d.dayIndex))];

      for (const dayIndex of dayIndexes) {
        const weeks = program.days
          .filter((d) => d.dayIndex === dayIndex)
          .map((d) => d.weekNumber)
          .sort((a, b) => a - b);
        expect(weeks).toEqual([1, 5, 9]);
      }
    });

    it('numbers days contiguously from zero', () => {
      const dayIndexes = [...new Set(program.days.map((d) => d.dayIndex))].sort((a, b) => a - b);
      expect(dayIndexes).toEqual(dayIndexes.map((_, i) => i));
      expect(dayIndexes[dayIndexes.length - 1]).toBeLessThanOrEqual(6);
    });

    it('gives every exercise positive sets and a rep target', () => {
      for (const day of program.days) {
        expect(day.exercises.length).toBeGreaterThan(0);
        for (const exercise of day.exercises) {
          expect(exercise.targetSets).toBeGreaterThan(0);
          expect(exercise.targetReps).toMatch(/^\d+(-\d+)?$/);
        }
      }
    });

    it('only uses superset groups that contain at least two exercises', () => {
      for (const day of program.days) {
        const members = day.exercises.map((e, i) => ({ id: String(i), targetSets: e.targetSets, supersetGroup: e.supersetGroup }));

        for (let i = 0; i < members.length; i++) {
          if (members[i].supersetGroup === undefined) continue;
          expect(getSupersetMemberIndices(members, i).length).toBeGreaterThanOrEqual(2);
        }
      }
    });

    it('keeps each superset group contiguous in the exercise order', () => {
      for (const day of program.days) {
        const groups = new Map<number, number[]>();
        day.exercises.forEach((exercise, index) => {
          if (exercise.supersetGroup === undefined) return;
          const list = groups.get(exercise.supersetGroup) ?? [];
          list.push(index);
          groups.set(exercise.supersetGroup, list);
        });

        for (const indices of groups.values()) {
          const span = indices[indices.length - 1] - indices[0] + 1;
          expect(span).toBe(indices.length);
        }
      }
    });
  });
});

describe('superset-heavy programs', () => {
  it('Cardio Pulse runs every exercise inside a circuit', () => {
    const program = getProgramDefinition('cardio-pulse')!;
    for (const day of program.days) {
      for (const exercise of day.exercises) {
        expect(exercise.supersetGroup).toBeDefined();
      }
    }
  });

  it('Superset Express pairs every exercise', () => {
    const program = getProgramDefinition('superset-express')!;
    for (const day of program.days) {
      expect(day.exercises.every((e) => e.supersetGroup !== undefined)).toBe(true);
      // three pairs per session
      expect(new Set(day.exercises.map((e) => e.supersetGroup)).size).toBe(3);
    }
  });

  it('Beginner Foundation uses no supersets', () => {
    const program = getProgramDefinition('beginner-foundation')!;
    const anySuperset = program.days.some((d) => d.exercises.some((e) => e.supersetGroup !== undefined));
    expect(anySuperset).toBe(false);
  });
});
