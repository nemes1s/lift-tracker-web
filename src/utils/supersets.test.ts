import { describe, it, expect } from 'vitest';
import {
  getSupersetMemberIndices,
  isInSuperset,
  getSupersetLabel,
  getSupersetAdvance,
  resolveRestDuration,
  getNextSupersetGroup,
  reorderForSuperset,
  findSupersetHints,
  DEFAULT_SUPERSET_REST,
  type SupersetMember,
  type AntagonistCandidate,
} from './supersets';

function ex(id: string, targetSets: number, supersetGroup?: number): SupersetMember {
  return { id, targetSets, supersetGroup };
}

function namedEx(id: string, name: string, supersetGroup?: number): AntagonistCandidate {
  return { id, name, targetSets: 3, supersetGroup };
}

// A1/A2 pair, then a standalone, then a B1/B2/B3 triple
const workout: SupersetMember[] = [
  ex('a1', 3, 1),
  ex('a2', 3, 1),
  ex('solo', 3),
  ex('b1', 2, 2),
  ex('b2', 2, 2),
  ex('b3', 2, 2),
];

describe('getSupersetMemberIndices', () => {
  it('returns all members of the group', () => {
    expect(getSupersetMemberIndices(workout, 0)).toEqual([0, 1]);
    expect(getSupersetMemberIndices(workout, 4)).toEqual([3, 4, 5]);
  });

  it('returns empty for a standalone exercise', () => {
    expect(getSupersetMemberIndices(workout, 2)).toEqual([]);
  });

  it('treats a lone exercise carrying a group number as standalone', () => {
    const lonely = [ex('x', 3, 7), ex('y', 3)];
    expect(getSupersetMemberIndices(lonely, 0)).toEqual([]);
    expect(isInSuperset(lonely, 0)).toBe(false);
  });
});

describe('getSupersetLabel', () => {
  it('labels groups by order of first appearance', () => {
    expect(getSupersetLabel(workout, 0)).toBe('A1');
    expect(getSupersetLabel(workout, 1)).toBe('A2');
    expect(getSupersetLabel(workout, 3)).toBe('B1');
    expect(getSupersetLabel(workout, 5)).toBe('B3');
  });

  it('returns null for standalone exercises', () => {
    expect(getSupersetLabel(workout, 2)).toBeNull();
  });

  it('assigns letters by position, not by the raw group number', () => {
    // Group 5 appears before group 2, so group 5 becomes "A"
    const reordered = [ex('p', 3, 5), ex('q', 3, 5), ex('r', 3, 2), ex('s', 3, 2)];
    expect(getSupersetLabel(reordered, 0)).toBe('A1');
    expect(getSupersetLabel(reordered, 2)).toBe('B1');
  });
});

describe('getSupersetAdvance', () => {
  it('does not advance for a standalone exercise', () => {
    const advance = getSupersetAdvance(workout, 2, { solo: 1 });
    expect(advance.nextIndex).toBeNull();
    expect(advance.useSupersetRest).toBe(false);
  });

  it('moves to the next member with the short rest mid-round', () => {
    const advance = getSupersetAdvance(workout, 0, { a1: 1, a2: 0 });
    expect(advance.nextIndex).toBe(1);
    expect(advance.useSupersetRest).toBe(true);
    expect(advance.roundComplete).toBe(false);
  });

  it('wraps to the top of the group with the full rest when a round ends', () => {
    const advance = getSupersetAdvance(workout, 1, { a1: 1, a2: 1 });
    expect(advance.nextIndex).toBe(0);
    expect(advance.useSupersetRest).toBe(false);
    expect(advance.roundComplete).toBe(true);
    expect(advance.groupComplete).toBe(false);
  });

  it('walks a three-exercise group in order then wraps', () => {
    expect(getSupersetAdvance(workout, 3, { b1: 1 }).nextIndex).toBe(4);
    expect(getSupersetAdvance(workout, 4, { b1: 1, b2: 1 }).nextIndex).toBe(5);

    const wrap = getSupersetAdvance(workout, 5, { b1: 1, b2: 1, b3: 1 });
    expect(wrap.nextIndex).toBe(3);
    expect(wrap.roundComplete).toBe(true);
  });

  it('skips members that already hit their target sets', () => {
    // a1 still owes a set, a2 is finished — from a1 we should wrap back to a1
    const advance = getSupersetAdvance(workout, 0, { a1: 1, a2: 3 });
    expect(advance.nextIndex).toBe(0);
    expect(advance.roundComplete).toBe(true);
  });

  it('leaves the group for the next exercise once every member is done', () => {
    const advance = getSupersetAdvance(workout, 1, { a1: 3, a2: 3 });
    expect(advance.nextIndex).toBe(2); // the standalone exercise after the group
    expect(advance.groupComplete).toBe(true);
    expect(advance.useSupersetRest).toBe(false);
  });

  it('returns null when the finished group is last in the workout', () => {
    const advance = getSupersetAdvance(workout, 5, { b1: 2, b2: 2, b3: 2 });
    expect(advance.nextIndex).toBeNull();
    expect(advance.groupComplete).toBe(true);
  });

  it('treats a missing set count as zero', () => {
    const advance = getSupersetAdvance(workout, 0, {});
    expect(advance.nextIndex).toBe(1);
    expect(advance.useSupersetRest).toBe(true);
  });
});

describe('resolveRestDuration', () => {
  it('uses the short rest inside a round', () => {
    const advance = getSupersetAdvance(workout, 0, { a1: 1 });
    expect(resolveRestDuration(advance, 90)).toBe(DEFAULT_SUPERSET_REST);
    expect(resolveRestDuration(advance, 90, 15)).toBe(15);
  });

  it('uses the full rest when the round wraps', () => {
    const advance = getSupersetAdvance(workout, 1, { a1: 1, a2: 1 });
    expect(resolveRestDuration(advance, 90)).toBe(90);
  });
});

describe('getNextSupersetGroup', () => {
  it('returns 1 when no exercise has a group yet', () => {
    expect(getNextSupersetGroup([ex('a', 3), ex('b', 3)])).toBe(1);
  });

  it('returns one past the highest existing group', () => {
    expect(getNextSupersetGroup(workout)).toBe(3);
  });
});

describe('reorderForSuperset', () => {
  it('moves a newly appended exercise to sit right after a standalone partner', () => {
    const withNew = [...workout, ex('z', 3)];
    const { order, group } = reorderForSuperset(withNew, 'z', 'solo');

    expect(group).toBe(3);
    expect(order.map((e) => e.id)).toEqual(['a1', 'a2', 'solo', 'z', 'b1', 'b2', 'b3']);
  });

  it('inserts after the last member of an existing group, joining it as a circuit', () => {
    const withNew = [...workout, ex('z', 3)];
    // b2 is the middle member of the b-group — z should land after b3, not right after b2
    const { order, group } = reorderForSuperset(withNew, 'z', 'b2');

    expect(group).toBe(2);
    expect(order.map((e) => e.id)).toEqual(['a1', 'a2', 'solo', 'b1', 'b2', 'b3', 'z']);
  });

  it('leaves exercises unrelated to the pairing in their original relative order', () => {
    const withNew = [...workout, ex('z', 3)];
    const { order } = reorderForSuperset(withNew, 'z', 'a1');

    const untouched = order.filter((e) => e.id !== 'z' && e.id !== 'a1');
    expect(untouched.map((e) => e.id)).toEqual(['a2', 'solo', 'b1', 'b2', 'b3']);
  });
});

describe('findSupersetHints', () => {
  it('suggests the later exercise pairs with the earlier one', () => {
    const list = [
      namedEx('1', 'Dumbbell Bicep Curl'),
      namedEx('2', 'Triceps Pushdown'),
    ];
    expect(findSupersetHints(list)).toEqual(new Map([['2', '1']]));
  });

  it('finds no hint when nothing opposes', () => {
    const list = [
      namedEx('1', 'Dumbbell Bicep Curl'),
      namedEx('2', 'Standing Calf Raises'),
    ];
    expect(findSupersetHints(list).size).toBe(0);
  });

  it('skips exercises already in a superset group', () => {
    const list = [
      namedEx('1', 'Dumbbell Bicep Curl', 1),
      namedEx('2', 'Triceps Pushdown', 1),
      namedEx('3', 'Barbell Curl'),
    ];
    // 1 and 2 are already grouped; 3 (also biceps) has no unpaired antagonist left
    expect(findSupersetHints(list).size).toBe(0);
  });

  it('matches greedily, leaving at most one hint per exercise', () => {
    // Curl could pair with either Pushdown or Overhead Extension — only the first free
    // candidate is matched, and both curl and that candidate are then unavailable
    const list = [
      namedEx('curl', 'Dumbbell Bicep Curl'),
      namedEx('squat', 'Barbell Squat'),
      namedEx('pushdown', 'Triceps Pushdown'),
      namedEx('legcurl', 'Seated Leg Curl'),
    ];
    const hints = findSupersetHints(list);
    expect(hints).toEqual(
      new Map([
        ['pushdown', 'curl'],
        ['legcurl', 'squat'],
      ])
    );
  });

  it('does not suggest a partner for an exercise already used in another hint', () => {
    const list = [
      namedEx('curl1', 'Dumbbell Bicep Curl'),
      namedEx('curl2', 'Barbell Curl'),
      namedEx('pushdown', 'Triceps Pushdown'),
    ];
    // Both curls oppose the one pushdown — only the first curl should claim it
    expect(findSupersetHints(list)).toEqual(new Map([['pushdown', 'curl1']]));
  });
});
