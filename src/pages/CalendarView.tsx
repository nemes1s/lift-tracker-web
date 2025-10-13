import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Dumbbell, Activity, Flame, Zap, Clock, Trash2 } from 'lucide-react';
import { db } from '../db/database';
import type { Workout } from '../types/models';
import { estimate1RM } from '../utils/oneRM';
import { calculateWorkoutStats, calculate1RMChange, formatVolume, formatRPE, formatDuration } from '../utils/workoutStats';
import { CalendarGrid } from '../components/CalendarGrid';

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
    e.stopPropagation(); // Prevent navigation to workout detail
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
    <div className="h-full overflow-y-auto pb-20">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="card p-6 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-600 rounded-2xl shadow-lg">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-700">
                Workout Calendar
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">Track your training history</p>
            </div>
          </div>
        </div>

        {workouts.length === 0 ? (
          <div className="card p-10 text-center bg-gray-50">
            <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">No workouts yet</p>
            <p className="text-sm text-gray-500 mt-1">Start your first workout today!</p>
          </div>
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
            {selectedDate && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h2>
                  {selectedDayWorkouts.length > 0 && (
                    <span className="text-sm font-semibold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full">
                      {selectedDayWorkouts.length} workout{selectedDayWorkouts.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {selectedDayWorkouts.length === 0 ? (
                  <div className="card p-6 text-center bg-gray-50">
                    <p className="text-gray-600">No workouts on this day</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDayWorkouts.map((workout) => (
                      <div
                        key={workout.id}
                        className="w-full card p-5 bg-white hover:shadow-xl transition-all transform hover:-translate-y-0.5 relative group"
                      >
                        <button
                          onClick={() => handleWorkoutClick(workout.id)}
                          className="w-full text-left"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 text-lg">{workout.name}</h3>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(workout.startedAt).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-3">
                              <button
                                onClick={(e) => handleDeleteWorkout(workout.id, e)}
                                className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                                title="Delete workout"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-4 flex-wrap">
                            {workout.endedAt ? (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border-2 border-green-200">
                                ✓ Completed
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border-2 border-yellow-200 animate-pulse-slow">
                                ⏱ In Progress
                              </span>
                            )}
                            {workout.programNameSnapshot && (
                              <p className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">{workout.programNameSnapshot}</p>
                            )}
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Delete Confirmation Modal */}
        {deletingWorkoutId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="card p-6 max-w-sm w-full bg-white animate-slideUp">
              <h3 className="text-xl font-bold text-red-700 mb-3">
                Delete Workout?
              </h3>
              <p className="text-gray-700 mb-6 font-medium">
                This will permanently delete this workout and all its data. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteWorkout}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
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

  if (!workout) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading workout...</p>
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
        <div className="card p-6 bg-white">
          <h1 className="text-2xl font-bold text-primary-700 mb-3">
            {workout.name}
          </h1>
          <p className="text-gray-700 font-medium">
            {new Date(workout.startedAt).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          {workout.programNameSnapshot && (
            <p className="text-sm text-gray-600 mt-2 bg-white/60 px-3 py-1.5 rounded-lg inline-block">
              {workout.programNameSnapshot}
            </p>
          )}

          {/* Workout Summary Stats */}
          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-4 border-2 border-primary-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-primary-600" />
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Total Volume</span>
              </div>
              <p className="text-2xl font-bold text-primary-700">{formatVolume(stats.totalVolume)} kg</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl p-4 border-2 border-orange-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-orange-600" />
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Est. Calories</span>
              </div>
              <p className="text-2xl font-bold text-orange-700">~{stats.estimatedCalories} kcal</p>
            </div>

            {stats.averageRPE > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-4 border-2 border-purple-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Avg. Effort</span>
                </div>
                <p className="text-2xl font-bold text-purple-700">RPE {formatRPE(stats.averageRPE)}</p>
              </div>
            )}

            {workout.endedAt && (
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border-2 border-blue-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Duration</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">{formatDuration(stats.duration)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-4">
          {exercises.map((exercise) => {
            const best1RM =
              exercise.sets.length > 0
                ? Math.max(
                    ...exercise.sets.map((s: any) =>
                      estimate1RM(s.weight, s.reps, 'epley')
                    )
                  )
                : 0;

            return (
              <div key={exercise.id} className="card p-5 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 text-lg">
                    {exercise.name}
                  </h3>
                  <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                    {exercise.sets.length} sets
                  </span>
                </div>

                <div className="space-y-2">
                  {exercise.sets.map((set: any, idx: number) => (
                    <div
                      key={set.id}
                      className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      <span className="text-sm font-semibold text-gray-600">Set {idx + 1}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900">{set.weight} kg</span>
                        <span className="text-gray-400">×</span>
                        <span className="font-bold text-gray-900">{set.reps} reps</span>
                        {set.rpe && (
                          <span className="text-sm font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                            @{set.rpe}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {best1RM > 0 && (
                  <div className="mt-4 bg-primary-50 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-700">
                        Best est. 1RM: <span className="text-primary-700 text-lg">{Math.round(best1RM)} kg</span>
                      </p>
                      {(() => {
                        const change1RM = exercise1RMChanges.get(exercise.id);
                        if (change1RM && change1RM.previous1RM !== null) {
                          const changeValue = change1RM.change;
                          const isPositive = changeValue > 0;
                          const isNeutral = Math.abs(changeValue) < 0.5;

                          return (
                            <div className={`flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-lg ${
                              isNeutral ? 'bg-gray-100 text-gray-700' :
                              isPositive ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              <span>
                                {isPositive ? '+' : ''}{Math.round(changeValue)} kg
                              </span>
                              <span className="text-xs">
                                {isNeutral ? '→' : isPositive ? '↗' : '↘'}
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
