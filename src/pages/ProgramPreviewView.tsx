import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, CheckCircle, X, Dumbbell, Calendar, Activity, Edit3, Save, Zap, Maximize2, ArrowUp, ArrowDown } from 'lucide-react';
import { db } from '../db/database';
import { saveProgramPreviewData, type ProgramPreviewData } from '../utils/programTemplates';
import type { WorkoutTemplate, ExerciseTemplate } from '../types/models';
import { useAppStore } from '../store/appStore';
import { getSupersetLabel } from '../utils/supersets';

interface LocationState {
  mode: 'preview' | 'view';
  programData?: ProgramPreviewData;
  programId?: string;
  returnToHome?: boolean;
}

export function ProgramPreviewView() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const { triggerRefresh } = useAppStore();

  const [programData, setProgramData] = useState<ProgramPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedExercises, setEditedExercises] = useState<Map<string, { isMyoreps?: boolean; isLengthenedPartials?: boolean }>>(new Map());
  const [reorderedWorkouts, setReorderedWorkouts] = useState<Map<string, ExerciseTemplate[]>>(new Map());

  useEffect(() => {
    const loadData = async () => {
      if (!state) {
        // No state provided, redirect back to settings
        navigate('/settings');
        return;
      }

      if (state.mode === 'preview' && state.programData) {
        // Preview mode: use provided program data
        setProgramData(state.programData);
        setIsLoading(false);
      } else if (state.mode === 'view' && state.programId) {
        // View mode: load program from database
        const program = await db.programs.get(state.programId);
        if (!program) {
          navigate('/settings');
          return;
        }

        // Load all workout templates and exercises for this program
        const workoutTemplates = await db.workoutTemplates
          .where('programId')
          .equals(state.programId)
          .toArray();

        const workouts: Array<{
          template: WorkoutTemplate;
          exercises: ExerciseTemplate[];
        }> = [];

        for (const template of workoutTemplates) {
          const exercises = await db.exerciseTemplates
            .where('workoutTemplateId')
            .equals(template.id)
            .sortBy('orderIndex');

          workouts.push({ template, exercises });
        }

        // Sort workouts by week first, then by day index
        workouts.sort((a, b) => {
          if (a.template.weekNumber !== b.template.weekNumber) {
            return a.template.weekNumber - b.template.weekNumber;
          }
          return a.template.dayIndex - b.template.dayIndex;
        });

        setProgramData({ program, workouts });
        setIsLoading(false);
      } else {
        // Invalid state
        navigate('/settings');
      }
    };

    loadData();
  }, [state, navigate]);

  const handleConfirm = async () => {
    if (!programData || state.mode !== 'preview') return;

    setIsSaving(true);
    try {
      // Check for duplicate program names
      const existingPrograms = await db.programs.toArray();
      const duplicateProgram = existingPrograms.find(
        p => p.name.toLowerCase() === programData.program.name.toLowerCase()
      );

      if (duplicateProgram) {
        const confirmOverride = window.confirm(
          `A program named "${duplicateProgram.name}" already exists.\n\nDo you want to:\n- OK: Create a new program anyway (not recommended)\n- Cancel: Go back and choose a different name`
        );
        if (!confirmOverride) {
          setIsSaving(false);
          return;
        }
      }

      // Save program to database
      const savedProgram = await saveProgramPreviewData(programData);

      // Set as active program
      const settings = await db.settings.toCollection().first();
      if (settings) {
        await db.settings.update(settings.id, { activeProgramId: savedProgram.id });
      }

      triggerRefresh();
      // Navigate back to home if coming from initial selection, otherwise to settings
      navigate(state.returnToHome ? '/' : '/settings');
    } catch (error) {
      console.error('Failed to save program:', error);
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Navigate back to home if coming from initial selection, otherwise to settings
    navigate(state?.returnToHome ? '/' : '/settings');
  };

  const handleEnterEditMode = () => {
    setIsEditMode(true);
    // Initialize edited exercises with current values
    const initialEdits = new Map();
    const initialReordered = new Map();
    programData?.workouts.forEach(workout => {
      // Initialize reordered exercises with current order
      initialReordered.set(workout.template.id, [...workout.exercises]);

      workout.exercises.forEach(exercise => {
        initialEdits.set(exercise.id, {
          isMyoreps: exercise.isMyoreps || false,
          isLengthenedPartials: exercise.isLengthenedPartials || false,
        });
      });
    });
    setEditedExercises(initialEdits);
    setReorderedWorkouts(initialReordered);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedExercises(new Map());
    setReorderedWorkouts(new Map());
  };

  const handleToggleMyoreps = (exerciseId: string) => {
    setEditedExercises(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(exerciseId) || { isMyoreps: false, isLengthenedPartials: false };
      newMap.set(exerciseId, { ...current, isMyoreps: !current.isMyoreps });
      return newMap;
    });
  };

  const handleToggleLengthenedPartials = (exerciseId: string) => {
    setEditedExercises(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(exerciseId) || { isMyoreps: false, isLengthenedPartials: false };
      newMap.set(exerciseId, { ...current, isLengthenedPartials: !current.isLengthenedPartials });
      return newMap;
    });
  };

  const handleMoveExerciseUp = (workoutTemplateId: string, exerciseIndex: number) => {
    if (exerciseIndex === 0) return; // Can't move first exercise up

    setReorderedWorkouts(prev => {
      const newMap = new Map(prev);
      const exercises = newMap.get(workoutTemplateId);
      if (!exercises) return prev;

      const newExercises = [...exercises];
      // Swap with previous exercise
      [newExercises[exerciseIndex - 1], newExercises[exerciseIndex]] =
        [newExercises[exerciseIndex], newExercises[exerciseIndex - 1]];

      newMap.set(workoutTemplateId, newExercises);
      return newMap;
    });
  };

  const handleMoveExerciseDown = (workoutTemplateId: string, exerciseIndex: number) => {
    const exercises = reorderedWorkouts.get(workoutTemplateId);
    if (!exercises || exerciseIndex === exercises.length - 1) return; // Can't move last exercise down

    setReorderedWorkouts(prev => {
      const newMap = new Map(prev);
      const exercises = newMap.get(workoutTemplateId);
      if (!exercises) return prev;

      const newExercises = [...exercises];
      // Swap with next exercise
      [newExercises[exerciseIndex], newExercises[exerciseIndex + 1]] =
        [newExercises[exerciseIndex + 1], newExercises[exerciseIndex]];

      newMap.set(workoutTemplateId, newExercises);
      return newMap;
    });
  };

  const handleSaveEdits = async () => {
    setIsSaving(true);
    try {
      // Update all edited exercises in the database
      for (const [exerciseId, flags] of editedExercises.entries()) {
        await db.exerciseTemplates.update(exerciseId, {
          isMyoreps: flags.isMyoreps || undefined,
          isLengthenedPartials: flags.isLengthenedPartials || undefined,
        });
      }

      // Update exercise order for reordered workouts
      for (const [_workoutTemplateId, exercises] of reorderedWorkouts.entries()) {
        for (let i = 0; i < exercises.length; i++) {
          await db.exerciseTemplates.update(exercises[i].id, {
            orderIndex: i,
          });
        }
      }

      // Reload program data
      if (state.mode === 'view' && state.programId) {
        const program = await db.programs.get(state.programId);
        if (program) {
          const workoutTemplates = await db.workoutTemplates
            .where('programId')
            .equals(state.programId)
            .toArray();

          const workouts: Array<{
            template: WorkoutTemplate;
            exercises: ExerciseTemplate[];
          }> = [];

          for (const template of workoutTemplates) {
            const exercises = await db.exerciseTemplates
              .where('workoutTemplateId')
              .equals(template.id)
              .sortBy('orderIndex');

            workouts.push({ template, exercises });
          }

          workouts.sort((a, b) => {
            if (a.template.weekNumber !== b.template.weekNumber) {
              return a.template.weekNumber - b.template.weekNumber;
            }
            return a.template.dayIndex - b.template.dayIndex;
          });

          setProgramData({ program, workouts });
        }
      }

      setIsEditMode(false);
      setEditedExercises(new Map());
      setReorderedWorkouts(new Map());
      triggerRefresh();
    } catch (error) {
      console.error('Failed to save edits:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading program...</p>
        </div>
      </div>
    );
  }

  if (!programData) {
    return null;
  }

  const { program, workouts } = programData;
  const isPreviewMode = state.mode === 'preview';

  // Count total exercises
  const totalExercises = workouts.reduce((sum, workout) => sum + workout.exercises.length, 0);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="card p-6 bg-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary-600 rounded-2xl shadow-lg">
              {isPreviewMode ? (
                <Eye className="w-7 h-7 text-white" />
              ) : (
                <Eye className="w-7 h-7 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-primary-700">
                {isPreviewMode ? 'Preview Program' : 'View Program'}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {isPreviewMode ? 'Review before creating' : 'Program details'}
              </p>
            </div>
          </div>

          {/* Program Info */}
          <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-5 border-2 border-primary-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{program.name}</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-3 text-center">
                <Calendar className="w-5 h-5 text-primary-600 mx-auto mb-1" />
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Weeks</p>
                <p className="text-lg font-bold text-primary-700">{program.totalWeeks}</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <Dumbbell className="w-5 h-5 text-primary-600 mx-auto mb-1" />
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Days</p>
                <p className="text-lg font-bold text-primary-700">{workouts.length}</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <Activity className="w-5 h-5 text-primary-600 mx-auto mb-1" />
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Exercises</p>
                <p className="text-lg font-bold text-primary-700">{totalExercises}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Workout Days */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 px-2">Workout Days</h3>
          {workouts.map((workout) => (
            <div key={workout.template.id} className="card p-5 bg-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{workout.template.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Week {workout.template.weekNumber} • Day {workout.template.dayIndex + 1} • {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {(isEditMode ? reorderedWorkouts.get(workout.template.id) || workout.exercises : workout.exercises).map((exercise, exerciseIndex) => {
                  const flags = isEditMode ? editedExercises.get(exercise.id) : { isMyoreps: exercise.isMyoreps, isLengthenedPartials: exercise.isLengthenedPartials };
                  const exercisesArray = isEditMode ? reorderedWorkouts.get(workout.template.id) || workout.exercises : workout.exercises;
                  const supersetLabel = getSupersetLabel(exercisesArray, exerciseIndex);

                  return (
                    <div
                      key={exercise.id}
                      className="flex items-start gap-3 py-3 px-4 bg-gray-50 dark:bg-slate-700 rounded-xl border border-gray-100 dark:border-slate-600"
                    >
                      {/* Reorder buttons in edit mode */}
                      {isEditMode && (
                        <div className="flex flex-col gap-1 pt-1">
                          <button
                            onClick={() => handleMoveExerciseUp(workout.template.id, exerciseIndex)}
                            disabled={exerciseIndex === 0}
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move up"
                          >
                            <ArrowUp className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          </button>
                          <button
                            onClick={() => handleMoveExerciseDown(workout.template.id, exerciseIndex)}
                            disabled={exerciseIndex === exercisesArray.length - 1}
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title="Move down"
                          >
                            <ArrowDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          </button>
                        </div>
                      )}

                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-gray-100">{exercise.name}</p>
                        {exercise.notes && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{exercise.notes}</p>
                        )}
                        {isEditMode && (
                          <div className="flex flex-col gap-2 mt-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={flags?.isMyoreps || false}
                                onChange={() => handleToggleMyoreps(exercise.id)}
                                className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500"
                              />
                              <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                <Zap className="w-3.5 h-3.5 text-amber-600" />
                                Myoreps
                              </span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={flags?.isLengthenedPartials || false}
                                onChange={() => handleToggleLengthenedPartials(exercise.id)}
                                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                              />
                              <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                                <Maximize2 className="w-3.5 h-3.5 text-purple-600" />
                                Lengthened Partials
                              </span>
                            </label>
                          </div>
                        )}
                        {!isEditMode && (supersetLabel || flags?.isMyoreps || flags?.isLengthenedPartials) && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {supersetLabel && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-bold rounded-full">
                                SUPERSET {supersetLabel}
                              </span>
                            )}
                            {flags?.isMyoreps && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-bold rounded-full">
                                <Zap className="w-3 h-3" />
                                MYOREPS
                              </span>
                            )}
                            {flags?.isLengthenedPartials && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full">
                                <Maximize2 className="w-3 h-3" />
                                LENGTHENED
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <span className="text-sm font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/40 px-3 py-1.5 rounded-lg">
                          {exercise.targetSets} × {exercise.targetReps}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-20 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-4 rounded-xl border-2 border-gray-200 dark:border-slate-600 shadow-lg">
          {isPreviewMode ? (
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 rounded-xl transition-all font-bold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-5 h-5" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleConfirm}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Create Program</span>
                  </>
                )}
              </button>
            </div>
          ) : isEditMode ? (
            <div className="flex gap-3">
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 rounded-xl transition-all font-bold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-5 h-5" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSaveEdits}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleEnterEditMode}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-all font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Edit3 className="w-5 h-5" />
                <span>Edit Program</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <span>Back to Settings</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
