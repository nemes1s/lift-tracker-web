import { useState, useMemo } from 'react';
import { Combobox } from '@headlessui/react';
import { Search, Check, ChevronsUpDown } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { createExerciseDisplayList, getExerciseDisplayName } from '../../utils/exerciseMatching';

interface ExerciseSelectorSectionProps {
  exercises: string[];
  selectedExercise: string;
  onExerciseChange: (exercise: string) => void;
}

export function ExerciseSelectorSection({
  exercises,
  selectedExercise,
  onExerciseChange
}: ExerciseSelectorSectionProps) {
  const [query, setQuery] = useState('');

  const combineSimilarExercises = useAppStore(state => state.progressPreferences.combineSimilarExercises);
  const setCombineSimilarExercises = useAppStore(state => state.setCombineSimilarExercises);

  if (exercises.length === 0) return null;

  // Create display list based on combine setting
  const { displayNames, nameMap } = useMemo(
    () => createExerciseDisplayList(exercises, combineSimilarExercises),
    [exercises, combineSimilarExercises]
  );

  // Get the display name for the currently selected exercise
  const selectedDisplayName = useMemo(
    () => getExerciseDisplayName(selectedExercise, exercises, combineSimilarExercises),
    [selectedExercise, exercises, combineSimilarExercises]
  );

  // Filter exercises based on search query (case-insensitive, matches anywhere)
  const filteredExercises = query === ''
    ? displayNames
    : displayNames.filter((exercise) =>
        exercise.toLowerCase().includes(query.toLowerCase())
      );

  // Handle selection: map display name back to actual exercise name
  const handleExerciseChange = (displayName: string | null) => {
    if (!displayName) return;

    const variants = nameMap.get(displayName);
    if (variants && variants.length > 0) {
      // If it's a grouped exercise, select the first variant (canonical name)
      onExerciseChange(variants[0]);
    } else {
      // Fallback to the display name itself
      onExerciseChange(displayName);
    }
  };

  return (
    <div className="card p-6 bg-white dark:bg-slate-800">
      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
        Select Exercise
      </label>

      <Combobox value={selectedDisplayName} onChange={handleExerciseChange}>
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <Combobox.Input
              className="input-field pl-10 pr-10"
              placeholder="Search exercises..."
              displayValue={(exercise: string) => exercise}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronsUpDown className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </Combobox.Button>
          </div>

          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white dark:bg-slate-700 shadow-lg border border-gray-200 dark:border-slate-600 focus:outline-none">
            {filteredExercises.length === 0 && query !== '' ? (
              <div className="relative cursor-default select-none px-4 py-3 text-gray-500 dark:text-gray-400">
                No exercises found.
              </div>
            ) : (
              filteredExercises.map((exercise) => (
                <Combobox.Option
                  key={exercise}
                  value={exercise}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-3 pl-10 pr-4 ${
                      active
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-900 dark:text-gray-100'
                    }`
                  }
                >
                  {({ selected, active }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                        {exercise}
                      </span>
                      {selected && (
                        <span
                          className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                            active ? 'text-white' : 'text-primary-600 dark:text-primary-400'
                          }`}
                        >
                          <Check className="h-5 w-5" />
                        </span>
                      )}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </div>
      </Combobox>

      {/* Combine similar exercises checkbox */}
      <div className="mt-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={combineSimilarExercises}
            onChange={(e) => setCombineSimilarExercises(e.target.checked)}
            className="w-4 h-4 text-primary-600 bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-slate-600 rounded focus:ring-primary-500 dark:focus:ring-primary-600 focus:ring-2"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Combine similar exercises
          </span>
        </label>
        <p className="mt-1 ml-6 text-xs text-gray-500 dark:text-gray-400">
          Groups exercises like "Incline DB Press" and "45° Incline Dumbbell Press" together
        </p>
      </div>
    </div>
  );
}
