// Superset grouping and navigation helpers.
//
// Exercises that share the same `supersetGroup` number within a workout are performed
// back-to-back as a superset: one set of each exercise in order, a short rest between
// them, then a full rest once the round is finished.

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
