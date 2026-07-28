import { describe, it, expect } from 'vitest';
import {
  getSupersetMemberIndices,
  isInSuperset,
  getSupersetLabel,
  getSupersetAdvance,
  resolveRestDuration,
  DEFAULT_SUPERSET_REST,
  type SupersetMember,
} from './supersets';

function ex(id: string, targetSets: number, supersetGroup?: number): SupersetMember {
  return { id, targetSets, supersetGroup };
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
