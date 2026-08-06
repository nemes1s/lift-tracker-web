// Superset grouping and navigation helpers.
//
// Exercises that share the same `supersetGroup` number within a workout are performed
// back-to-back as a superset: one set of each exercise in order, a short rest between
// them, then a full rest once the round is finished.

import { areAntagonistExercises } from './exerciseLibrary';

export const DEFAULT_SUPERSET_REST = 10; // seconds between exercises inside a superset

// Minimal shape needed for grouping — works for both ExerciseInstance and ExerciseTemplate
export interface SupersetMember {
  id: string;
  targetSets: number;
  supersetGroup?: number;
}

// A group is only a superset if at least two exercises share the group number.
// A lone exercise carrying a group number behaves as a normal standalone exercise.
export function getSupersetMemberIndices<T extends SupersetMember>(
  exercises: T[],
  index: number
): number[] {
  const group = exercises[index]?.supersetGroup;
  if (group === undefined || group === null) return [];

  const members = exercises
    .map((ex, i) => (ex.supersetGroup === group ? i : -1))
    .filter((i) => i !== -1);

  return members.length >= 2 ? members : [];
}

export function isInSuperset<T extends SupersetMember>(exercises: T[], index: number): boolean {
  return getSupersetMemberIndices(exercises, index).length > 0;
}

// Display label like "A1", "A2", "B1". Group letters are assigned by order of first
// appearance in the exercise list, so the labels always read top-to-bottom.
export function getSupersetLabel<T extends SupersetMember>(
  exercises: T[],
  index: number
): string | null {
  const members = getSupersetMemberIndices(exercises, index);
  if (members.length === 0) return null;

  const group = exercises[index].supersetGroup;

  // Distinct group numbers in order of first appearance, counting real supersets only
  const seen: number[] = [];
  exercises.forEach((ex, i) => {
    if (
      ex.supersetGroup !== undefined &&
      ex.supersetGroup !== null &&
      !seen.includes(ex.supersetGroup) &&
      getSupersetMemberIndices(exercises, i).length > 0
    ) {
      seen.push(ex.supersetGroup);
    }
  });

  const letterIndex = seen.indexOf(group as number);
  if (letterIndex === -1) return null;

  const letter = String.fromCharCode(65 + (letterIndex % 26));
  const position = members.indexOf(index) + 1;
  return `${letter}${position}`;
}

export interface SupersetAdvance {
  // Index to move to. null means stay on the current exercise.
  nextIndex: number | null;
  // Rest to start: short inside a round, full once the round wraps.
  useSupersetRest: boolean;
  // True when the advance wrapped back to the top of the group (a full round was finished)
  roundComplete: boolean;
  // True when every exercise in the group has hit its target sets
  groupComplete: boolean;
}

/**
 * Decide where the runner should go after logging a set.
 *
 * Within a superset we move to the next member that still owes sets. If every later
 * member is done we wrap to the first unfinished member, which counts as finishing a
 * round and earns the full rest. When the whole group is done we fall out of the group
 * to the next exercise after it.
 *
 * `setCounts` maps exercise id -> number of sets already logged (including the set that
 * triggered this call).
 */
export function getSupersetAdvance<T extends SupersetMember>(
  exercises: T[],
  currentIndex: number,
  setCounts: Record<string, number>
): SupersetAdvance {
  const members = getSupersetMemberIndices(exercises, currentIndex);

  if (members.length === 0) {
    return { nextIndex: null, useSupersetRest: false, roundComplete: false, groupComplete: false };
  }

  const needsWork = (i: number) => (setCounts[exercises[i].id] ?? 0) < exercises[i].targetSets;
  const position = members.indexOf(currentIndex);

  // Next unfinished member later in the round
  const ahead = members.slice(position + 1).find(needsWork);
  if (ahead !== undefined) {
    return {
      nextIndex: ahead,
      useSupersetRest: true,
      roundComplete: false,
      groupComplete: false,
    };
  }

  // Wrap to the first unfinished member — a round just finished, so take the full rest
  const wrapped = members.find(needsWork);
  if (wrapped !== undefined) {
    return {
      nextIndex: wrapped,
      useSupersetRest: false,
      roundComplete: true,
      groupComplete: false,
    };
  }

  // Whole group is done — leave it for the first exercise after the group
  const lastMember = members[members.length - 1];
  const afterGroup = lastMember + 1;
  return {
    nextIndex: afterGroup < exercises.length ? afterGroup : null,
    useSupersetRest: false,
    roundComplete: true,
    groupComplete: true,
  };
}

// Resolve the rest duration to start after a set, given the advance decision.
export function resolveRestDuration(
  advance: SupersetAdvance,
  fullRestSeconds: number,
  supersetRestSeconds: number = DEFAULT_SUPERSET_REST
): number {
  return advance.useSupersetRest ? supersetRestSeconds : fullRestSeconds;
}

// Lowest unused group number, for pairing a newly added exercise with an existing one.
export function getNextSupersetGroup<T extends SupersetMember>(exercises: T[]): number {
  const used = exercises.map((e) => e.supersetGroup ?? 0);
  return Math.max(0, ...used) + 1;
}

// Moves `movingId` to sit right after `partnerId`'s group and returns the group number to
// assign both. Superset navigation only runs back-to-back on adjacent exercises, so an
// exercise added elsewhere in the workout (e.g. appended to the end) needs to be relocated
// next to its partner, not just tagged with the same group number in place.
export function reorderForSuperset<T extends SupersetMember>(
  exercises: T[],
  movingId: string,
  partnerId: string
): { order: T[]; group: number } {
  const partner = exercises.find((ex) => ex.id === partnerId);
  const moving = exercises.find((ex) => ex.id === movingId);
  if (!partner || !moving) {
    return { order: exercises, group: getNextSupersetGroup(exercises) };
  }

  const group = partner.supersetGroup ?? getNextSupersetGroup(exercises);

  const withoutMoving = exercises.filter((ex) => ex.id !== movingId);
  const existingGroupIndices = partner.supersetGroup !== undefined
    ? withoutMoving
        .map((ex, i) => (ex.supersetGroup === partner.supersetGroup ? i : -1))
        .filter((i) => i !== -1)
    : [withoutMoving.findIndex((ex) => ex.id === partnerId)];
  const insertAt = Math.max(...existingGroupIndices) + 1;

  const order = [
    ...withoutMoving.slice(0, insertAt),
    moving,
    ...withoutMoving.slice(insertAt),
  ];

  return { order, group };
}

// Minimal shape needed to detect antagonist pairs among exercises already in a workout.
export interface AntagonistCandidate extends SupersetMember {
  name: string;
}

// Finds unpaired exercises whose muscle groups oppose one another (e.g. Bench Press +
// Row), for surfacing as inline "pairs with X" hints. Matches greedily from top to
// bottom so each exercise gets at most one suggested partner — an exercise that could
// pair with either of two candidates is matched to whichever comes first in the list,
// and that candidate is then no longer available for anyone else. Exercises already in
// a superset group are skipped. Returns a map of exerciseId -> suggested partnerId,
// keyed by whichever of the pair sits later in the array (reorderForSuperset moves that
// one to sit next to the earlier partner).
export function findSupersetHints<T extends AntagonistCandidate>(
  exercises: T[]
): Map<string, string> {
  const hints = new Map<string, string>();
  const matched = new Set<string>();

  for (let i = 0; i < exercises.length; i++) {
    const a = exercises[i];
    if (a.supersetGroup !== undefined || matched.has(a.id)) continue;

    for (let j = i + 1; j < exercises.length; j++) {
      const b = exercises[j];
      if (b.supersetGroup !== undefined || matched.has(b.id)) continue;

      if (areAntagonistExercises(a.name, b.name)) {
        hints.set(b.id, a.id);
        matched.add(a.id);
        matched.add(b.id);
        break;
      }
    }
  }

  return hints;
}
