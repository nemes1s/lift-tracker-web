import { Calendar } from 'lucide-react';
import type { SettingsModel } from '../../types/models';

interface WeekStartDaySectionProps {
  settings: SettingsModel | null;
  onWeekStartDayChange: (day: number) => void;
}

const daysOfWeek = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export function WeekStartDaySection({ settings, onWeekStartDayChange }: WeekStartDaySectionProps) {
  const currentWeekStartDay = settings?.weekStartDay ?? 0;

  return (
    <div className="card p-6 bg-white dark:bg-slate-800">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        <h2 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Calendar Settings</h2>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-gray-200 dark:border-slate-700 p-4">
        <label className="block mb-2">
          <span className="font-bold text-gray-900 dark:text-gray-100 block">Week Starts On</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Choose which day your week starts on</span>
        </label>
        <select
          value={currentWeekStartDay}
          onChange={(e) => onWeekStartDayChange(Number(e.target.value))}
          className="w-full mt-2 px-4 py-2 border-2 border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
        >
          {daysOfWeek.map((day) => (
            <option key={day.value} value={day.value}>
              {day.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
