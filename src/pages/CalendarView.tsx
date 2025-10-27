import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus } from 'lucide-react';
import { db } from '../db/database';
import type { Workout, ExerciseInstance } from '../types/models';
import { calculateWorkoutStats, calculate1RMChange } from '../utils/workoutStats';
import { CalendarGrid } from '../components/CalendarGrid';
import { EmptyWorkoutsState } from '../components/CalendarView/EmptyWorkoutsState';
import { SelectedDayWorkoutsSection } from '../components/CalendarView/SelectedDayWorkoutsSection';
import { DeleteConfirmModal } from '../components/CalendarView/DeleteConfirmModal';
import { WorkoutStatsSection } from '../components/CalendarView/WorkoutStatsSection';
import { ExerciseListSection } from '../components/CalendarView/ExerciseListSection';
import { AddCustomExerciseModal } from '../components/shared/AddCustomExerciseModal';
import { getAllExerciseNames } from '../data/exerciseSubstitutions';
import { v4 as uuidv4 } from 'uuid';

export function CalendarView() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [deletingWorkoutId, setDeletingWorkoutId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadWorkouts = async () => {
      const allWorkouts = await db.workouts.orderBy('startedAt').reverse().toArray();
      setWorkouts(allWorkouts);
    };

    loadWorkouts();
  }, []);

  // Build set of dates that have workouts (YYYY-MM-DD format)
  const workoutDates = new Set<string>();
  workouts.forEach((workout) => {
    const dateKey = new Date(workout.startedAt).toISOString().split('T')[0];
    workoutDates.add(dateKey);
  });

  // Get workouts for selected date
  const selectedDayWorkouts = selectedDate
    ? workouts.filter((workout) => {
        const workoutDate = new Date(workout.startedAt);
        return (
          workoutDate.getDate() === selectedDate.getDate() &&
          workoutDate.getMonth() === selectedDate.getMonth() &&
          workoutDate.getFullYear() === selectedDate.getFullYear()
        );
      })
    : [];

  const handleWorkoutClick = (workoutId: string) => {
    navigate(`/workout/${workoutId}`);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleDeleteWorkout = (workoutId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingWorkoutId(workoutId);
  };

  const confirmDeleteWorkout = async () => {
    if (!deletingWorkoutId) return;

    // Delete all related set records first
    const exerciseInstances = await db.exerciseInstances
      .where('workoutId')
      .equals(deletingWorkoutId)
      .toArray();

    for (const ex of exerciseInstances) {
      await db.setRecords.where('exerciseId').equals(ex.id).delete();
    }

    // Delete all exercise instances
    await Promise.all(
      exerciseInstances.map(ex => db.exerciseInstances.delete(ex.id))
    );

    // Delete the workout
    await db.workouts.delete(deletingWorkoutId);

    // Refresh the workouts list
    const allWorkouts = await db.workouts.orderBy('startedAt').reverse().toArray();
    setWorkouts(allWorkouts);

    // Clear selected date if no workouts remain for that date
    if (selectedDate) {
      const remainingWorkouts = allWorkouts.filter((workout) => {
        const workoutDate = new Date(workout.startedAt);
        return (
          workoutDate.getDate() === selectedDate.getDate() &&
          workoutDate.getMonth() === selectedDate.getMonth() &&
          workoutDate.getFullYear() === selectedDate.getFullYear()
        );
      });
      if (remainingWorkouts.length === 0) {
        setSelectedDate(null);
      }
    }

    setDeletingWorkoutId(null);
  };

  const cancelDelete = () => {
    setDeletingWorkoutId(null);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="card p-6 bg-white dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-600 rounded-2xl shadow-lg">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-700 dark:text-primary-400">
                Workout Calendar
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Track your training history</p>
            </div>
          </div>
        </div>

        {workouts.length === 0 ? (
          <EmptyWorkoutsState />
        ) : (
          <>
            {/* Calendar Grid */}
            <CalendarGrid
              currentDate={currentMonth}
              onDateChange={setCurrentMonth}
              workoutDates={workoutDates}
              selectedDate={selectedDate}
              onDateClick={handleDateClick}
            />

            {/* Selected Day's Workouts */}
            <SelectedDayWorkoutsSection
              selectedDate={selectedDate}
              workouts={selectedDayWorkouts}
              onWorkoutClick={handleWorkoutClick}
              onDeleteWorkout={handleDeleteWorkout}
            />
          </>
        )}

        {/* Delete Confirmation Modal */}
        {deletingWorkoutId && (
          <DeleteConfirmModal
            onConfirm={confirmDeleteWorkout}
            onCancel={cancelDelete}
          />
        )}
      </div>
    </div>
  );
}

// Workout Detail Page
export function WorkoutDetail() {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [exercise1RMChanges, setExercise1RMChanges] = useState<Map<string, any>>(new Map());
  const [showAddCustomExercise, setShowAddCustomExercise] = useState(false);
  const [exerciseSuggestions, setExerciseSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const loadWorkout = async () => {
      // Get workout ID from URL
      const workoutId = window.location.pathname.split('/').pop();
      if (!workoutId) return;

      const w = await db.workouts.get(workoutId);
      if (!w) return;

      setWorkout(w);

      // Load exercises with sets
      const exs = await db.exerciseInstances
        .where('workoutId')
        .equals(workoutId)
        .sortBy('orderIndex');

      const exercisesWithSets = await Promise.all(
        exs.map(async (ex) => {
          const sets = await db.setRecords
            .where('exerciseId')
            .equals(ex.id)
            .sortBy('timestamp');

          return { ...ex, sets };
        })
      );

      setExercises(exercisesWithSets);

      // Calculate 1RM changes for each exercise
      const changes = new Map();
      for (const ex of exercisesWithSets) {
        const workingSets = ex.sets.filter((s: any) => !s.isWarmup);
        if (workingSets.length > 0) {
          const change = await calculate1RMChange(ex.name, workingSets, w.startedAt);
          changes.set(ex.id, change);
        }
      }
      setExercise1RMChanges(changes);
    };

    loadWorkout();
  }, []);

  // Load exercise suggestions for autocomplete
  useEffect(() => {
    const allExerciseNames = getAllExerciseNames();

    // Also add current exercises in this workout
    const currentExerciseNames = exercises
      .map(ex => ex.name)
      .filter(name => !allExerciseNames.includes(name)); // Only add if not already in substitutions

    // Combine and sort
    const combined = [...allExerciseNames, ...currentExerciseNames].sort();
    setExerciseSuggestions(combined);
  }, [exercises]);

  const handleAddCustomExercise = async (exerciseName: string) => {
    if (!workout) return;

    console.log('[WorkoutDetail] handleAddCustomExercise started', {
      exerciseName,
      workoutId: workout.id,
    });

    try {
      // Create new exercise instance
      const newExercise: ExerciseInstance = {
        id: uuidv4(),
        name: exerciseName,
        workoutId: workout.id,
        orderIndex: exercises.length,
        targetSets: 3,
        targetReps: '8-10',
        isCustom: true,
      };

      console.log('[WorkoutDetail] Adding custom exercise to database');
      await db.exerciseInstances.add(newExercise);

      // Reload exercises
      console.log('[WorkoutDetail] Reloading exercises for workout:', workout.id);
      const exs = await db.exerciseInstances
        .where('workoutId')
        .equals(workout.id)
        .sortBy('orderIndex');

      const exercisesWithSets = await Promise.all(
        exs.map(async (ex) => {
          const sets = await db.setRecords
            .where('exerciseId')
            .equals(ex.id)
            .sortBy('timestamp');

          return { ...ex, sets };
        })
      );

      console.log('[WorkoutDetail] Updated exercises loaded:', exercisesWithSets.length, 'exercises');
      setExercises(exercisesWithSets);

      // Calculate 1RM change for the new exercise (should be 0 if no sets)
      const changes = new Map(exercise1RMChanges);
      changes.set(newExercise.id, undefined);
      setExercise1RMChanges(changes);

      // Close modal
      setShowAddCustomExercise(false);
    } catch (error) {
      console.error('Error adding custom exercise:', error);
      alert('Failed to add custom exercise. Please try again.');
    }
  };

  if (!workout) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading workout...</p>
        </div>
      </div>
    );
  }

  // Calculate workout statistics
  const stats = calculateWorkoutStats(exercises, workout.startedAt, workout.endedAt, workout.totalPausedMs);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Workout Header */}
        <div className="card p-6 bg-white dark:bg-slate-800">
          <h1 className="text-2xl font-bold text-primary-700 dark:text-primary-400 mb-3">
            {workout.name}
          </h1>
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            {new Date(workout.startedAt).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          {workout.programNameSnapshot && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 bg-white/60 dark:bg-slate-900/60 px-3 py-1.5 rounded-lg inline-block">
              {workout.programNameSnapshot}
            </p>
          )}

          {/* Workout Summary Stats */}
          <WorkoutStatsSection stats={stats} hasEndTime={!!workout.endedAt} />
        </div>

        {/* Exercises */}
        <ExerciseListSection exercises={exercises} exercise1RMChanges={exercise1RMChanges} />

        {/* Add Custom Exercise Button */}
        <button
          onClick={() => setShowAddCustomExercise(true)}
          className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Custom Exercise
        </button>
      </div>

      {showAddCustomExercise && (
        <AddCustomExerciseModal
          onConfirm={handleAddCustomExercise}
          onCancel={() => setShowAddCustomExercise(false)}
          suggestions={exerciseSuggestions}
        />
      )}
    </div>
  );
}
