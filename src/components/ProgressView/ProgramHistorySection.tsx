import { Trophy, Calendar, Dumbbell, TrendingUp } from 'lucide-react';
import type { ProgramCompletion } from '../../types/models';

interface ProgramHistorySectionProps {
  completions: ProgramCompletion[];
}

export function ProgramHistorySection({ completions }: ProgramHistorySectionProps) {
  if (completions.length === 0) {
    return null;
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    }
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toFixed(0);
  };

  const calculateDuration = (start: Date, end: Date) => {
    const diffTime = Math.abs(new Date(end).getTime() - new Date(start).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;

    if (weeks === 0) {
      return `${days} day${days !== 1 ? 's' : ''}`;
    }
    if (days === 0) {
      return `${weeks} week${weeks !== 1 ? 's' : ''}`;
    }
    return `${weeks}w ${days}d`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-yellow-500 dark:bg-yellow-600 rounded-lg">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Training Milestones
        </h2>
      </div>

      <div className="grid gap-4">
        {completions.map((completion, index) => (
          <div
            key={completion.id}
            className="card p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border border-yellow-200 dark:border-yellow-800"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-500 dark:bg-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">#{completions.length - index}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {completion.programName}
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{formatDate(completion.completionDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <TrendingUp className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{calculateDuration(completion.startDate, completion.completionDate)}</span>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-2">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Workouts</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {completion.totalWorkoutsCompleted}
                    </div>
                  </div>
                  <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-2">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Sets</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {completion.totalSetsCompleted}
                    </div>
                  </div>
                  <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-2">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Volume</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {formatVolume(completion.totalVolume)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-3">
          <Dumbbell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Total Programs Completed
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Keep crushing your goals!
            </div>
          </div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {completions.length}
          </div>
        </div>
      </div>
    </div>
  );
}
