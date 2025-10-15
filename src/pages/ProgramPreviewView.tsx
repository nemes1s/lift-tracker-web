import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, CheckCircle, X, Dumbbell, Calendar, Activity } from 'lucide-react';
import { db } from '../db/database';
import { saveProgramPreviewData, type ProgramPreviewData } from '../utils/programTemplates';
import type { WorkoutTemplate, ExerciseTemplate } from '../types/models';
import { useAppStore } from '../store/appStore';

interface LocationState {
  mode: 'preview' | 'view';
  programData?: ProgramPreviewData;
  programId?: string;
}

export function ProgramPreviewView() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const { triggerRefresh } = useAppStore();

  const [programData, setProgramData] = useState<ProgramPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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

        // Sort workouts by dayIndex
        workouts.sort((a, b) => a.template.dayIndex - b.template.dayIndex);

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
      // Save program to database
      const savedProgram = await saveProgramPreviewData(programData);

      // Set as active program
      const settings = await db.settings.toCollection().first();
      if (settings) {
        await db.settings.update(settings.id, { activeProgramId: savedProgram.id });
      }

      triggerRefresh();
      navigate('/settings');
    } catch (error) {
      console.error('Failed to save program:', error);
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/settings');
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
                    Day {workout.template.dayIndex + 1} • {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {workout.exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{exercise.name}</p>
                      {exercise.notes && (
                        <p className="text-xs text-gray-600 mt-1">{exercise.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <span className="text-sm font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg">
                        {exercise.targetSets} × {exercise.targetReps}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-20 bg-white/95 backdrop-blur-sm p-4 rounded-xl border-2 border-gray-200 shadow-lg">
          {isPreviewMode ? (
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-bold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
          ) : (
            <button
              onClick={handleCancel}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span>Back to Settings</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
