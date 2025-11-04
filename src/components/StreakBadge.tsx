import { useState } from 'react';
import { Info, X } from 'lucide-react';
import { getStreakBadge } from '../utils/streakBadges';

interface StreakBadgeProps {
  weeks: number;
  interactive?: boolean;
}

export function StreakBadge({ weeks, interactive = true }: StreakBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const badge = getStreakBadge(weeks);

  if (!badge) return null;

  return (
    <div className="relative inline-block">
      <button
        onClick={() => interactive && setShowTooltip(!showTooltip)}
        disabled={!interactive}
        className={`
          inline-flex items-center gap-2 px-3 py-2 rounded-lg font-semibold
          bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700
          text-white hover:shadow-lg transition-all
          ${interactive ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
        `}
      >
        <span className="text-lg">{badge.emoji}</span>
        <span className="text-sm">{badge.title}</span>
        {interactive && <Info className="w-4 h-4 opacity-70" />}
      </button>

      {/* Tooltip */}
      {showTooltip && interactive && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 z-50">
          <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg p-4 shadow-xl border border-slate-700 dark:border-slate-300">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-lg mb-1">
                  {badge.emoji} {badge.title}
                </p>
                <p className="text-sm leading-relaxed opacity-90">
                  {badge.description}
                </p>
                <p className="text-xs mt-2 opacity-70">
                  {badge.minWeeks} – {badge.maxWeeks === Infinity ? '∞' : badge.maxWeeks} weeks
                </p>
              </div>
              <button
                onClick={() => setShowTooltip(false)}
                className="flex-shrink-0 hover:opacity-70 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-1 w-3 h-3 bg-slate-900 dark:bg-white rotate-45 border-r border-b border-slate-700 dark:border-slate-300" />
          </div>
        </div>
      )}
    </div>
  );
}
