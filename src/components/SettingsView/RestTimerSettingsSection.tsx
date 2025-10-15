import { Timer } from 'lucide-react';
import type { SettingsModel } from '../../types/models';
import { initAudioContext, playTimerNotification } from '../../utils/audio';

interface RestTimerSettingsSectionProps {
  settings: SettingsModel | null;
  onToggle: (field: keyof SettingsModel, value: boolean) => void;
  onDurationChange: (duration: number) => void;
}

export function RestTimerSettingsSection({
  settings,
  onToggle,
  onDurationChange
}: RestTimerSettingsSectionProps) {
  return (
    <div className="card p-6 bg-white dark:bg-slate-800">
      <div className="flex items-center gap-2 mb-4">
        <Timer className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        <h2 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Rest Timer</h2>
      </div>

      <div className="space-y-4">
        {/* Enable Rest Timer */}
        <label className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border-2 border-gray-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all cursor-pointer">
          <div>
            <span className="font-bold text-gray-900 dark:text-gray-100 block">Enable Rest Timer</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Show timer between sets</span>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              checked={settings?.restTimerEnabled !== false}
              onChange={(e) => onToggle('restTimerEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
          </div>
        </label>

        {/* Auto-start Timer */}
        <label className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border-2 border-gray-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all cursor-pointer">
          <div>
            <span className="font-bold text-gray-900 dark:text-gray-100 block">Auto-start Timer</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Start automatically after logging a set</span>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              checked={settings?.restTimerAutoStart !== false}
              onChange={(e) => onToggle('restTimerAutoStart', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
          </div>
        </label>

        {/* Sound Notification */}
        <label className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border-2 border-gray-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all cursor-pointer">
          <div>
            <span className="font-bold text-gray-900 dark:text-gray-100 block">Sound Notification</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">Play sound when timer completes</span>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              checked={settings?.restTimerSound !== false}
              onChange={(e) => onToggle('restTimerSound', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
          </div>
        </label>

        {/* Test Sound Button */}
        <button
          onClick={() => {
            initAudioContext();
            playTimerNotification(true);
          }}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-xl transition-all font-bold shadow-sm hover:shadow-md border-2 border-blue-200 dark:border-blue-800"
        >
          <Timer className="w-5 h-5" />
          <span>Test Sound</span>
        </button>

        {/* Default Rest Duration */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border-2 border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <label className="block">
              <span className="font-bold text-gray-900 dark:text-gray-100 block mb-1">Default Rest Duration</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">Time in seconds (30-300)</span>
            </label>
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
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="30"
              max="300"
              step="15"
              value={settings?.restTimerDuration ?? 90}
              onChange={(e) => onDurationChange(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2 px-1">
            <span>30s</span>
            <span>5 min</span>
          </div>
        </div>
      </div>
    </div>
  );
}
