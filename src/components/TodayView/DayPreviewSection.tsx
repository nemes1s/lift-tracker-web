import { useEffect, useState } from 'react';
import { Dumbbell } from 'lucide-react';
import { db } from '../../db/database';
import type { ExerciseTemplate, WorkoutTemplate } from '../../types/models';

interface DayPreviewSectionProps {
  template: WorkoutTemplate;
}

export function DayPreviewSection({ template }: DayPreviewSectionProps) {
  const [exercises, setExercises] = useState<ExerciseTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadExercises = async () => {
      setIsLoading(true);
      try {
        const exerciseTemplates = await db.exerciseTemplates
          .where('workoutTemplateId')
          .equals(template.id)
          .sortBy('orderIndex');
        setExercises(exerciseTemplates);
      } catch (error) {
        console.error('Error loading exercise templates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExercises();
  }, [template.id]);

  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4"></div>
          <div className="h-16 bg-gray-200 dark:bg-slate-700 rounded"></div>
          <div className="h-16 bg-gray-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (exercises.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Dumbbell className="w-4 h-4" />
        Workout Preview
      </h3>
      <div className="space-y-3">
        {exercises.map((exercise, index) => (
          <div
            key={exercise.id}
            className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-3 border border-gray-200 dark:border-slate-600"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 rounded-full border border-gray-300 dark:border-slate-600">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  {exercise.name}
                </h4>
                {exercise.notes && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {exercise.notes}
                  </p>
                )}
                {(exercise.isMyoreps || exercise.isLengthenedPartials) && (
                  <div className="flex gap-2 mt-2">
                    {exercise.isMyoreps && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                        Myoreps
                      </span>
                    )}
                    {exercise.isLengthenedPartials && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                        Lengthened Partials
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="text-sm font-bold text-primary-700 dark:text-primary-400">
                  {exercise.targetSets} × {exercise.targetReps || '?'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  sets × reps
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
        {exercises.length} exercise{exercises.length !== 1 ? 's' : ''} • {exercises.reduce((sum, ex) => sum + ex.targetSets, 0)} total sets
      </div>
    </div>
  );
}
