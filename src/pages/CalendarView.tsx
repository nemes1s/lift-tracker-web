import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Dumbbell } from 'lucide-react';
import { db } from '../db/database';
import type { Workout } from '../types/models';
import { estimate1RM } from '../utils/oneRM';

export function CalendarView() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadWorkouts = async () => {
      const allWorkouts = await db.workouts.orderBy('startedAt').reverse().toArray();
      setWorkouts(allWorkouts);
    };

    loadWorkouts();
  }, []);

  const handleWorkoutClick = (workoutId: string) => {
    navigate(`/workout/${workoutId}`);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="card p-6 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-600 rounded-2xl shadow-lg">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-700">
                Workout History
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">Review your training sessions</p>
            </div>
          </div>
        </div>

        {/* Workouts List */}
        <div className="space-y-3">
          {workouts.length === 0 ? (
            <div className="card p-10 text-center bg-gray-50">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Dumbbell className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No workouts yet</p>
              <p className="text-sm text-gray-500 mt-1">Start your first workout today!</p>
            </div>
          ) : (
            workouts.map((workout) => (
              <button
                key={workout.id}
                onClick={() => handleWorkoutClick(workout.id)}
                className="w-full card p-5 hover:shadow-xl transition-all text-left transform hover:-translate-y-0.5 bg-white"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{workout.name}</h3>
                    <p className="text-sm text-gray-700 font-medium mt-1">
                      {new Date(workout.startedAt).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(workout.startedAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
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
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Workout Detail Page
export function WorkoutDetail() {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercises, setExercises] = useState<any[]>([]);

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
                    <p className="text-sm font-semibold text-gray-700">
                      Best est. 1RM: <span className="text-primary-700 text-lg">{Math.round(best1RM)} kg</span>
                    </p>
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
