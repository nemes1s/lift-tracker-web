import { Activity } from 'lucide-react';
import type { SettingsModel } from '../../types/models';

interface WorkoutBehaviorSectionProps {
  settings: SettingsModel | null;
  onToggle: (field: keyof SettingsModel, value: boolean) => void;
}

export function WorkoutBehaviorSection({ settings, onToggle }: WorkoutBehaviorSectionProps) {
  return (
    <div className="card p-6 bg-white dark:bg-slate-800">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        <h2 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Workout Behavior</h2>
      </div>

      <label className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border-2 border-gray-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all cursor-pointer">
        <div className="pr-3">
          <span className="font-bold text-gray-900 dark:text-gray-100 block">Auto-advance Exercise</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Move to the next exercise automatically once your target sets are hit</span>
        </div>
        <div className="relative shrink-0">
          <input
            type="checkbox"
            checked={settings?.autoAdvanceOnTargetSets === true}
            onChange={(e) => onToggle('autoAdvanceOnTargetSets', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-14 h-7 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
        </div>
      </label>
    </div>
  );
}
