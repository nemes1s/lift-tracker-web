import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import {
  getExerciseSubstitutions,
  getExerciseNotes,
  searchExercises,
  getExerciseMuscleGroup,
  EXERCISE_GROUPS
} from '../../data/exerciseSubstitutions';
import { db } from '../../db/database';

interface ExerciseSubstitutionSectionProps {
  exerciseName: string;
  isSubstituting: boolean;
  onSubstitute: (newExerciseName: string) => void;
  onCancel: () => void;
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

  // Load all unique exercise names from user's workout history
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

  // Filter exercises based on search query - combine predefined exercises and user's history
  const searchResults = searchQuery.trim()
    ? (() => {
        const query = searchQuery.toLowerCase();
        const predefined = searchExercises(searchQuery);
        const fromHistory = userExercises.filter(name =>
          name.toLowerCase().includes(query)
        );
        // Combine and deduplicate
        const combined = Array.from(new Set([...predefined, ...fromHistory]));
        // Filter out current exercise
        return combined.filter(ex => ex !== exerciseName).sort();
      })()
    : [];

  // Group search results by muscle group
  const groupedResults: Record<string, string[]> = {};
  searchResults.forEach(exercise => {
    const group = getExerciseMuscleGroup(exercise) || 'other';
    if (!groupedResults[group]) {
      groupedResults[group] = [];
    }
    groupedResults[group].push(exercise);
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

        {/* Search Results */}
        {searchQuery.trim() && (
          <div className="space-y-4">
            {searchResults.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No exercises found matching "{searchQuery}"
              </p>
            ) : (
              Object.entries(groupedResults).map(([group, exercises]) => (
                <div key={group}>
                  <h6 className="font-semibold text-xs uppercase text-gray-500 dark:text-gray-400 mb-2">
                    {group}
                  </h6>
                  <div className="space-y-2">
                    {exercises.map((exercise) => {
                      const notes = getExerciseNotes(exercise);
                      return (
                        <button
                          key={exercise}
                          onClick={() => onSubstitute(exercise)}
                          disabled={isSubstituting}
                          className="w-full text-left p-3 bg-white dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900 border border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-400 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{exercise}</div>
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
            Type to search through {Object.values(EXERCISE_GROUPS).flat().length + userExercises.length}+ exercises
          </p>
        )}
      </div>
    </div>
  );
}
