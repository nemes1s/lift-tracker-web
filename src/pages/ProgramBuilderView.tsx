import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye } from 'lucide-react';
import { ProgramInfoSection } from '../components/ProgramBuilder/ProgramInfoSection';
import { WorkoutDaySection } from '../components/ProgramBuilder/WorkoutDaySection';
import type { ProgramPreviewData } from '../utils/programTemplates';

// Builder state types
export interface ExerciseData {
  id: string;
  name: string;
  targetSets: number;
  targetReps: string;
  notes?: string;
}

export interface WorkoutDayData {
  dayIndex: number;
  name: string;
  exercises: ExerciseData[];
}

export function ProgramBuilderView() {
  const navigate = useNavigate();

  // Program info state
  const [programName, setProgramName] = useState('');
  const [totalWeeks, setTotalWeeks] = useState(12);
  const [startDate, setStartDate] = useState(new Date());

  // Workout days state
  const [workoutDays, setWorkoutDays] = useState<WorkoutDayData[]>([]);

  const handleBack = () => {
    navigate('/settings');
  };

  const handlePreview = () => {
    // Validation
    if (!programName.trim()) {
      alert('Please enter a program name');
      return;
    }

    if (workoutDays.length === 0) {
      alert('Please add at least one workout day');
      return;
    }

    // Check if all days have exercises
    const daysWithoutExercises = workoutDays.filter(day => day.exercises.length === 0);
    if (daysWithoutExercises.length > 0) {
      alert('All workout days must have at least one exercise');
      return;
    }

    // Generate ProgramPreviewData
    const previewData: ProgramPreviewData = {
      program: {
        id: '', // Will be generated when saved
        name: programName.trim(),
        totalWeeks,
        startDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      workouts: workoutDays.map(day => ({
        template: {
          id: '', // Will be generated when saved
          name: day.name,
          dayIndex: day.dayIndex,
          weekNumber: 1, // Phase 1: Simple programs use weekNumber = 1
          programId: '', // Will be set when saved
        },
        exercises: day.exercises.map((exercise, index) => ({
          id: '', // Will be generated when saved
          name: exercise.name,
          targetSets: exercise.targetSets,
          targetReps: exercise.targetReps,
          notes: exercise.notes,
          orderIndex: index,
          workoutTemplateId: '', // Will be set when saved
        })),
      })),
    };

    // Navigate to preview
    navigate('/program/preview', {
      state: {
        mode: 'preview',
        programData: previewData,
      },
    });
  };

  const handleAddDay = (dayIndex: number, dayName: string) => {
    // Check if day already exists
    if (workoutDays.some(day => day.dayIndex === dayIndex)) {
      alert('This day already has a workout');
      return;
    }

    setWorkoutDays([
      ...workoutDays,
      {
        dayIndex,
        name: dayName,
        exercises: [],
      },
    ]);
  };

  const handleRemoveDay = (dayIndex: number) => {
    setWorkoutDays(workoutDays.filter(day => day.dayIndex !== dayIndex));
  };

  const handleUpdateDay = (dayIndex: number, updates: Partial<WorkoutDayData>) => {
    setWorkoutDays(
      workoutDays.map(day =>
        day.dayIndex === dayIndex ? { ...day, ...updates } : day
      )
    );
  };

  const canPreview = programName.trim() !== '' && workoutDays.length > 0 &&
    workoutDays.every(day => day.exercises.length > 0);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="card p-6 bg-white dark:bg-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-primary-700 dark:text-primary-400">
                Build Custom Program
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Create your own workout program
              </p>
            </div>
          </div>
        </div>

        {/* Program Info Section */}
        <ProgramInfoSection
          programName={programName}
          totalWeeks={totalWeeks}
          startDate={startDate}
          onProgramNameChange={setProgramName}
          onTotalWeeksChange={setTotalWeeks}
          onStartDateChange={setStartDate}
        />

        {/* Workout Days Section */}
        <WorkoutDaySection
          workoutDays={workoutDays}
          onAddDay={handleAddDay}
          onRemoveDay={handleRemoveDay}
          onUpdateDay={handleUpdateDay}
        />

        {/* Preview Button */}
        <div className="sticky bottom-20 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-4 rounded-xl border-2 border-gray-200 dark:border-slate-700 shadow-lg">
          <button
            onClick={handlePreview}
            disabled={!canPreview}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 text-white rounded-xl transition-all font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Eye className="w-5 h-5" />
            <span>Preview Program</span>
          </button>
          {!canPreview && (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
              {programName.trim() === '' && 'Enter a program name • '}
              {workoutDays.length === 0 && 'Add at least one workout day • '}
              {workoutDays.length > 0 && workoutDays.some(day => day.exercises.length === 0) && 'Add exercises to all days'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
