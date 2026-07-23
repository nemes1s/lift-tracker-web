import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { getExerciseSubstitutions, getExerciseNotes } from '../../data/exerciseSubstitutions';
import { getAllDefinitionNames, getPrimaryMuscles, getExerciseDefinition } from '../../utils/exerciseLibrary';
import { db } from '../../db/database';

interface ExerciseSubstitutionSectionProps {
  exerciseName: string;
  isSubstituting: boolean;
  onSubstitute: (newExerciseName: string) => void;
  onCancel: () => void;
}

function MusclePills({ name }: { name: string }) {
  const muscles = getPrimaryMuscles(name);
  if (muscles.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {muscles.slice(0, 3).map(m => (
        <span key={m} className="text-xs px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full">
          {m}
        </span>
      ))}
    </div>
  );
}

export function ExerciseSubstitutionSection({
  exerciseName,
  isSubstituting,
  onSubstitute,
  onCancel
}: ExerciseSubstitutionSectionProps) {
  const substitutions = getExerciseSubstitutions(exerciseName);
  const [searchQuery, setSearchQuery] = useState('');
  const [userExercises, setUserExercises] = useState<string[]>([]);

  const allLibraryNames = getAllDefinitionNames();
  const totalCount = allLibraryNames.length;

  useEffect(() => {
    const loadUserExercises = async () => {
      try {
        const exercises = await db.exerciseInstances.toArray();
        const uniqueNames = Array.from(new Set(exercises.map(e => e.name))).sort();
        setUserExercises(uniqueNames);
      } catch (error) {
        console.error('Failed to load user exercises:', error);
      }
    };
    loadUserExercises();
  }, []);

  const searchResults = searchQuery.trim()
    ? (() => {
        const query = searchQuery.toLowerCase();
        const fromLibrary = allLibraryNames.filter(name =>
          name.toLowerCase().includes(query)
        );
        const fromHistory = userExercises.filter(name =>
          name.toLowerCase().includes(query) && !allLibraryNames.includes(name)
        );
        const combined = [...fromLibrary, ...fromHistory];
        return combined.filter(ex => ex !== exerciseName);
      })()
    : [];

  // Group by primary muscle from library, fallback to 'Other'
  const groupedResults: Record<string, string[]> = {};
  searchResults.forEach(exercise => {
    const muscles = getPrimaryMuscles(exercise);
    const group = muscles.length > 0
      ? muscles[0].charAt(0).toUpperCase() + muscles[0].slice(1)
      : 'Other';
    if (!groupedResults[group]) groupedResults[group] = [];
    groupedResults[group].push(exercise);
  });

  // Sort groups: library groups first, 'Other' last
  const sortedGroups = Object.entries(groupedResults).sort(([a], [b]) => {
    if (a === 'Other') return 1;
    if (b === 'Other') return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="card p-5 bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 border-2 border-blue-200 dark:border-blue-700 max-h-[70vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Alternative Exercises</h4>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-semibold text-sm"
        >
          Cancel
        </button>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Switch to a different exercise. This will update your exercise history to track the new exercise going forward.
      </p>

      {/* Suggested Alternatives */}
      {substitutions.length > 0 && (
        <div className="mb-6">
          <h5 className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-2">Suggested Alternatives</h5>
          <div className="space-y-2">
            {substitutions.map((substitution) => {
              const notes = getExerciseNotes(substitution);
              return (
                <button
                  key={substitution}
                  onClick={() => onSubstitute(substitution)}
                  disabled={isSubstituting}
                  className="w-full text-left p-4 bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900 border-2 border-blue-200 dark:border-blue-600 hover:border-blue-400 dark:hover:border-blue-400 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="font-bold text-gray-900 dark:text-gray-100">{substitution}</div>
                  <MusclePills name={substitution} />
                  {notes && (
                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{notes}</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Search Section */}
      <div className="border-t-2 border-blue-200 dark:border-blue-700 pt-4">
        <h5 className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-2">Search All Exercises</h5>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises..."
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-400 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400"
          />
        </div>

        {searchQuery.trim() && (
          <div className="space-y-4">
            {searchResults.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No exercises found matching "{searchQuery}"
              </p>
            ) : (
              sortedGroups.map(([group, exercises]) => (
                <div key={group}>
                  <h6 className="font-semibold text-xs uppercase text-gray-500 dark:text-gray-400 mb-2">
                    {group}
                  </h6>
                  <div className="space-y-2">
                    {exercises.map((exercise) => {
                      const notes = getExerciseNotes(exercise);
                      const def = getExerciseDefinition(exercise);
                      return (
                        <button
                          key={exercise}
                          onClick={() => onSubstitute(exercise)}
                          disabled={isSubstituting}
                          className="w-full text-left p-3 bg-white dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900 border border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-400 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{exercise}</div>
                            {def?.equipment && (
                              <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 mt-0.5">{def.equipment}</span>
                            )}
                          </div>
                          <MusclePills name={exercise} />
                          {notes && (
                            <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">{notes}</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {!searchQuery.trim() && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-2">
            Type to search {totalCount}+ exercises
          </p>
        )}
      </div>
    </div>
  );
}
