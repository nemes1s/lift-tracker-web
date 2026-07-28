import type { SettingsModel } from '../../types/models';
import { initAudioContext, playTimerNotification } from '../../utils/audio';
import { SettingsRows } from './SettingsRows';
import { SettingsToggle } from './SettingsToggle';
import { DEFAULT_SUPERSET_REST } from '../../utils/supersets';

interface WorkoutBehaviorSectionProps {
  settings: SettingsModel | null;
  onToggle: (field: keyof SettingsModel, value: boolean) => void;
  onDurationChange: (duration: number) => void;
  onGoalChange: (goal: number) => void;
  onSupersetRestChange: (duration: number) => void;
}

export function WorkoutBehaviorSection({
  settings,
  onToggle,
  onDurationChange,
  onGoalChange,
  onSupersetRestChange,
}: WorkoutBehaviorSectionProps) {
  const currentGoal = settings?.targetWorkoutsPerWeek ?? 3;

  return (
    <SettingsRows>
      <SettingsToggle
        label="Enable Rest Timer"
        description="Show timer between sets"
        checked={settings?.restTimerEnabled !== false}
        onChange={(checked) => onToggle('restTimerEnabled', checked)}
      />

      <SettingsToggle
        label="Auto-start Timer"
        description="Start automatically after logging a set"
        checked={settings?.restTimerAutoStart !== false}
        onChange={(checked) => onToggle('restTimerAutoStart', checked)}
      />

      <div className="flex items-center justify-between gap-4 py-4">
        <div>
          <span className="font-bold text-gray-900 dark:text-gray-100 block">Sound Notification</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Play sound when timer completes ·{' '}
            <button
              onClick={() => {
                initAudioContext();
                playTimerNotification(true);
              }}
              className="font-bold text-primary-600 dark:text-primary-400 hover:underline"
            >
              Test
            </button>
          </span>
        </div>
        <div className="relative shrink-0">
          <input
            type="checkbox"
            checked={settings?.restTimerSound !== false}
            onChange={(e) => onToggle('restTimerSound', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-14 h-7 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
        </div>
      </div>

      <div className="py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="font-bold text-gray-900 dark:text-gray-100 block">Default Rest Duration</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Time in seconds (30-300)</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="30"
              max="300"
              value={settings?.restTimerDuration ?? 90}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (val >= 30 && val <= 300) {
                  onDurationChange(val);
                }
              }}
              className="w-20 px-3 py-2 border-2 border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-100 rounded-lg font-bold text-gray-900 text-center"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">sec</span>
          </div>
        </div>
        <input
          type="range"
          min="30"
          max="300"
          step="15"
          value={settings?.restTimerDuration ?? 90}
          onChange={(e) => onDurationChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
          <span>30s</span>
          <span>5 min</span>
        </div>
      </div>

      <div className="py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="font-bold text-gray-900 dark:text-gray-100 block">Superset Rest</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Rest between exercises inside a superset (5-60)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="5"
              max="60"
              value={settings?.supersetRestDuration ?? DEFAULT_SUPERSET_REST}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (val >= 5 && val <= 60) {
                  onSupersetRestChange(val);
                }
              }}
              className="w-20 px-3 py-2 border-2 border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-100 rounded-lg font-bold text-gray-900 text-center"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">sec</span>
          </div>
        </div>
        <input
          type="range"
          min="5"
          max="60"
          step="5"
          value={settings?.supersetRestDuration ?? DEFAULT_SUPERSET_REST}
          onChange={(e) => onSupersetRestChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
          <span>5s</span>
          <span>60s</span>
        </div>
      </div>

      <SettingsToggle
        label="Auto-advance Exercise"
        description="Move to the next exercise once your target sets are hit"
        checked={settings?.autoAdvanceOnTargetSets === true}
        onChange={(checked) => onToggle('autoAdvanceOnTargetSets', checked)}
      />

      <div className="py-4 first:pt-0 last:pb-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="font-bold text-gray-900 dark:text-gray-100 block">Weekly Streak Goal</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Workouts needed per week to keep your streak (1-7)</span>
          </div>
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
        <input
          type="range"
          min="1"
          max="7"
          step="1"
          value={currentGoal}
          onChange={(e) => onGoalChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
          <span>1 day/week</span>
          <span>7 days/week</span>
        </div>
      </div>
    </SettingsRows>
  );
}
