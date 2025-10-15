import { Moon, Sun } from 'lucide-react';

interface AppearanceSectionProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function AppearanceSection({ darkMode, onToggleDarkMode }: AppearanceSectionProps) {
  return (
    <div className="card p-6 bg-white dark:bg-slate-800">
      <div className="flex items-center gap-2 mb-4">
        {darkMode ? (
          <Moon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        ) : (
          <Sun className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        )}
        <h2 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Appearance</h2>
      </div>

      <label className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border-2 border-gray-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all cursor-pointer">
        <div>
          <span className="font-bold text-gray-900 dark:text-gray-100 block">Dark Mode</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Use dark theme throughout the app</span>
        </div>
        <div className="relative">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={onToggleDarkMode}
            className="sr-only peer"
          />
          <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
        </div>
      </label>
    </div>
  );
}
