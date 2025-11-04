import { Target } from 'lucide-react';
import type { SettingsModel } from '../../types/models';

interface WeeklyGoalSectionProps {
  settings: SettingsModel | null;
  onGoalChange: (goal: number) => void;
}

export function WeeklyGoalSection({
  settings,
  onGoalChange
}: WeeklyGoalSectionProps) {
  const currentGoal = settings?.targetWorkoutsPerWeek ?? 3;

  return (
    <div className="card p-6 bg-white dark:bg-slate-800">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        <h2 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Weekly Streak Goal</h2>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border-2 border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <label className="block">
              <span className="font-bold text-gray-900 dark:text-gray-100 block mb-1">Target Workouts Per Week</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Minimum workouts needed to maintain streak (1-7)</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="7"
                value={currentGoal}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val >= 1 && val <= 7) {
                    onGoalChange(val);
                  }
                }}
                className="w-16 px-3 py-2 border-2 border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-100 rounded-lg font-bold text-gray-900 text-center"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">workouts</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="7"
              step="1"
              value={currentGoal}
              onChange={(e) => onGoalChange(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2 px-1">
            <span>1 day/week</span>
            <span>7 days/week</span>
          </div>
        </div>

        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-l-4 border-blue-500">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>How it works:</strong> Your streak increases by 1 week when you complete at least this many workouts in a calendar week. The streak resets if you don't meet the goal in any week.
          </p>
        </div>
      </div>
    </div>
  );
}
