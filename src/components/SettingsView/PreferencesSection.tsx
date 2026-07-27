import type { SettingsModel } from '../../types/models';
import { SegmentedControl } from './SegmentedControl';
import { SettingsRows } from './SettingsRows';
import { SettingsToggle } from './SettingsToggle';

interface PreferencesSectionProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  settings: SettingsModel | null;
  onWeekStartDayChange: (day: number) => void;
  onWeightUnitChange: (unit: 'kg' | 'lbs') => void;
  onFormulaUpdate: (useEpley: boolean) => void;
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

export function PreferencesSection({
  darkMode,
  onToggleDarkMode,
  settings,
  onWeekStartDayChange,
  onWeightUnitChange,
  onFormulaUpdate,
}: PreferencesSectionProps) {
  const currentWeekStartDay = settings?.weekStartDay ?? 0;
  const currentUnit = settings?.weightUnit || 'kg';
  const useEpley = settings?.useEpley === true;

  return (
    <SettingsRows>
      <SettingsToggle
        label="Dark Mode"
        checked={darkMode}
        onChange={onToggleDarkMode}
      />

      <div className="flex items-center justify-between gap-4 py-4">
        <div>
          <span className="font-bold text-gray-900 dark:text-gray-100 block">Week Starts On</span>
        </div>
        <select
          value={currentWeekStartDay}
          onChange={(e) => onWeekStartDayChange(Number(e.target.value))}
          className="shrink-0 px-3 py-2 border-2 border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
        >
          {daysOfWeek.map((day) => (
            <option key={day.value} value={day.value}>
              {day.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between gap-4 py-4">
        <span className="font-bold text-gray-900 dark:text-gray-100 block">Weight Unit</span>
        <SegmentedControl
          value={currentUnit}
          onChange={onWeightUnitChange}
          options={[
            { value: 'kg', label: 'kg' },
            { value: 'lbs', label: 'lbs' },
          ]}
        />
      </div>

      <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
        <span className="font-bold text-gray-900 dark:text-gray-100 block">1RM Formula</span>
        <SegmentedControl
          value={useEpley ? 'epley' : 'brzycki'}
          onChange={(value) => onFormulaUpdate(value === 'epley')}
          options={[
            { value: 'epley', label: 'Epley' },
            { value: 'brzycki', label: 'Brzycki' },
          ]}
        />
      </div>
    </SettingsRows>
  );
}
