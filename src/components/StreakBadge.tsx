import { getStreakBadge } from '../utils/streakBadges';

interface StreakBadgeProps {
  weeks: number;
}

export function StreakBadge({ weeks }: StreakBadgeProps) {
  const badge = getStreakBadge(weeks);

  if (!badge) return null;

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 text-white">
        <span className="text-lg">{badge.emoji}</span>
        <span className="text-sm text-center">{badge.title}</span>
      </div>
      <p className="text-xs text-center text-gray-600 dark:text-gray-400 w-full">
        {badge.description}
      </p>
      <p className="text-xs text-center text-gray-500 dark:text-gray-500 w-full">
        {badge.minWeeks} – {badge.maxWeeks === Infinity ? '∞' : badge.maxWeeks} weeks
      </p>
    </div>
  );
}
