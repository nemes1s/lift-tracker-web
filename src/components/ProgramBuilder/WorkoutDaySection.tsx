import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { ExerciseList } from './ExerciseList';
import type { WorkoutDayData, ExerciseData } from '../../pages/ProgramBuilderView';

interface WorkoutDaySectionProps {
  workoutDays: WorkoutDayData[];
  onAddDay: (dayIndex: number, dayName: string) => void;
  onRemoveDay: (dayIndex: number) => void;
  onUpdateDay: (dayIndex: number, updates: Partial<WorkoutDayData>) => void;
}

const DAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export function WorkoutDaySection({
  workoutDays,
  onAddDay,
  onRemoveDay,
  onUpdateDay,
}: WorkoutDaySectionProps) {
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());

  const availableDays = DAY_NAMES.map((name, index) => ({
    index,
    name,
    isUsed: workoutDays.some(day => day.dayIndex === index),
  }));

  const handleSelectDay = (dayIndex: number, dayName: string) => {
    onAddDay(dayIndex, `${dayName} Workout`);
    setShowDayPicker(false);
    // Auto-expand the newly added day
    setExpandedDays(new Set([...expandedDays, dayIndex]));
  };

  const toggleDayExpanded = (dayIndex: number) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayIndex)) {
      newExpanded.delete(dayIndex);
    } else {
      newExpanded.add(dayIndex);
    }
    setExpandedDays(newExpanded);
  };

  const handleUpdateExercises = (dayIndex: number, exercises: ExerciseData[]) => {
    onUpdateDay(dayIndex, { exercises });
  };

  const handleUpdateDayName = (dayIndex: number, name: string) => {
    onUpdateDay(dayIndex, { name });
  };

  // Sort days by dayIndex for display
  const sortedDays = [...workoutDays].sort((a, b) => a.dayIndex - b.dayIndex);

  return (
    <div className="card p-6 bg-white dark:bg-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-900 dark:text-gray-100 text-lg">
          Workout Days ({workoutDays.length})
        </h2>
        <button
          onClick={() => setShowDayPicker(!showDayPicker)}
          disabled={workoutDays.length >= 7}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 text-white rounded-lg transition-all font-bold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          <span>Add Day</span>
        </button>
      </div>

      {/* Day Picker */}
      {showDayPicker && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-xl border-2 border-gray-200 dark:border-slate-600">
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
            Select a day:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {availableDays.map(day => (
              <button
                key={day.index}
                onClick={() => handleSelectDay(day.index, day.name)}
                disabled={day.isUsed}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  day.isUsed
                    ? 'bg-gray-200 dark:bg-slate-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 hover:bg-primary-50 dark:hover:bg-primary-900/30 border-2 border-gray-200 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-600'
                }`}
              >
                {day.name}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowDayPicker(false)}
            className="mt-3 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-bold"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Workout Days List */}
      {sortedDays.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400 text-sm italic text-center py-8">
          No workout days yet - click "Add Day" to get started
        </p>
      ) : (
        <div className="space-y-3">
          {sortedDays.map(day => {
            const isExpanded = expandedDays.has(day.dayIndex);
            return (
              <div
                key={day.dayIndex}
                className="border-2 border-gray-200 dark:border-slate-600 rounded-xl overflow-hidden"
              >
                {/* Day Header */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                        {DAY_NAMES[day.dayIndex]}
                      </span>
                      <input
                        type="text"
                        value={day.name}
                        onChange={(e) => handleUpdateDayName(day.dayIndex, e.target.value)}
                        placeholder="Workout name"
                        className="flex-1 px-3 py-1 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-bold text-gray-900 dark:text-gray-100 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {day.exercises.length} exercise{day.exercises.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleDayExpanded(day.dayIndex)}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => onRemoveDay(day.dayIndex)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Exercise List */}
                {isExpanded && (
                  <div className="p-4 bg-white dark:bg-slate-800">
                    <ExerciseList
                      exercises={day.exercises}
                      onUpdateExercises={(exercises) => handleUpdateExercises(day.dayIndex, exercises)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
