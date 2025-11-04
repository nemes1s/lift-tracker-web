/**
 * Streak badge levels and definitions
 * Based on consecutive weeks of meeting the workout goal
 */

export interface StreakBadge {
  minWeeks: number;
  maxWeeks: number;
  emoji: string;
  title: string;
  description: string;
}

export const STREAK_BADGES: StreakBadge[] = [
  {
    minWeeks: 1,
    maxWeeks: 4,
    emoji: '🐛',
    title: 'Larvae',
    description: 'Just wiggling into fitness life, but already stronger than a couch potato.',
  },
  {
    minWeeks: 5,
    maxWeeks: 12,
    emoji: '🐣',
    title: 'Rookie',
    description: 'You\'re out of the shell and lifting more than excuses.',
  },
  {
    minWeeks: 13,
    maxWeeks: 24,
    emoji: '🐕',
    title: 'Pumped Pup',
    description: 'Tail wagging, dumbbells dragging. You\'re too cute to quit.',
  },
  {
    minWeeks: 25,
    maxWeeks: 36,
    emoji: '🐺',
    title: 'Gym Wolf',
    description: 'You roam the iron lands with a pack-mentality. Leg day? Bring it.',
  },
  {
    minWeeks: 37,
    maxWeeks: 52,
    emoji: '🦍',
    title: 'Apex Lifter',
    description: 'Dominating your natural habitat: the squat rack. You alpha now.',
  },
  {
    minWeeks: 53,
    maxWeeks: 78,
    emoji: '🐉',
    title: 'Iron Dragon',
    description: 'You sleep on protein powder and breathe fire during reps.',
  },
  {
    minWeeks: 79,
    maxWeeks: 104,
    emoji: '🎖️',
    title: 'Titanium Titan',
    description: 'You\'ve worked out more weeks than there are moves in Mortal Kombat.',
  },
  {
    minWeeks: 105,
    maxWeeks: 156,
    emoji: '⚡️',
    title: 'Streak-Lord Supreme',
    description: 'Your presence in the gym bends time, space, and gym mirrors.',
  },
  {
    minWeeks: 157,
    maxWeeks: 208,
    emoji: '👑',
    title: 'Chrono Cranker',
    description: 'You\'ve outsmarted the clock and your past self. You\'re a timeless unit.',
  },
  {
    minWeeks: 209,
    maxWeeks: Infinity,
    emoji: '🧬',
    title: 'Final Form: Meta-Muscle Entity',
    description: 'You no longer *work out* — you *become* the gains. Level: undefined.',
  },
];

/**
 * Get the streak badge for a given number of weeks
 */
export function getStreakBadge(weeks: number): StreakBadge | null {
  if (weeks === 0) return null;

  const badge = STREAK_BADGES.find(b => weeks >= b.minWeeks && weeks <= b.maxWeeks);
  return badge || null;
}

/**
 * Format badge display text with emoji and title
 */
export function formatBadgeDisplay(badge: StreakBadge): string {
  return `${badge.emoji} ${badge.title}`;
}
