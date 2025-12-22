import { Scale } from 'lucide-react';
import type { SettingsModel } from '../../types/models';

interface WeightUnitSectionProps {
  settings: SettingsModel | null;
  onWeightUnitChange: (unit: 'kg' | 'lbs') => void;
}

export function WeightUnitSection({ settings, onWeightUnitChange }: WeightUnitSectionProps) {
  const currentUnit = settings?.weightUnit || 'kg';

  return (
    <div className="card p-6 bg-white dark:bg-slate-800">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <Scale className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Weight Unit</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Choose your preferred weight unit
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onWeightUnitChange('kg')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            currentUnit === 'kg'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
          }`}
        >
          Kilograms (kg)
        </button>
        <button
          onClick={() => onWeightUnitChange('lbs')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            currentUnit === 'lbs'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
          }`}
        >
          Pounds (lbs)
        </button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
        {currentUnit === 'kg'
          ? 'All weights will be displayed in kilograms'
          : 'All weights will be displayed in pounds'}
      </p>
    </div>
  );
}
