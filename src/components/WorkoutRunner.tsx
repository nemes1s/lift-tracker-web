import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, StopCircle, CheckCircle } from 'lucide-react';
import { db } from '../db/database';
import { previousWorkoutInstances } from '../utils/programLogic';
import { useAppStore } from '../store/appStore';
import type { Workout, ExerciseInstance, SetRecord } from '../types/models';
import { v4 as uuidv4 } from 'uuid';

interface WorkoutRunnerProps {
  workout: Workout;
}

export function WorkoutRunner({ workout }: WorkoutRunnerProps) {
  const [exercises, setExercises] = useState<ExerciseInstance[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sets, setSets] = useState<SetRecord[]>([]);
  const [weightText, setWeightText] = useState('');
  const [repsText, setRepsText] = useState('');
  const [rpeText, setRpeText] = useState('');
  const [previousHistory, setPreviousHistory] = useState<{ workout: Workout; sets: SetRecord[] }[]>([]);

  const { setActiveWorkout, triggerRefresh } = useAppStore();

  const currentExercise = exercises[currentIndex];

  // Load exercises
  useEffect(() => {
    const loadExercises = async () => {
      const exs = await db.exerciseInstances
        .where('workoutId')
        .equals(workout.id)
        .sortBy('orderIndex');

      setExercises(exs);
    };

    loadExercises();
  }, [workout.id]);

  // Load sets for current exercise
  useEffect(() => {
    const loadSets = async () => {
      if (!currentExercise) return;

      const s = await db.setRecords
        .where('exerciseId')
        .equals(currentExercise.id)
        .sortBy('timestamp');

      setSets(s);

      // Load previous workout history
      const history = await previousWorkoutInstances(currentExercise.name, 3);
      setPreviousHistory(history);
    };

    loadSets();
    // Clear inputs when changing exercise
    setWeightText('');
    setRepsText('');
    setRpeText('');
  }, [currentExercise]);

  const handleLogSet = async () => {
    if (!currentExercise) return;

    const weight = parseFloat(weightText);
    const reps = parseInt(repsText);
    const rpe = rpeText ? parseFloat(rpeText) : undefined;

    if (isNaN(weight) || isNaN(reps)) return;

    const set: SetRecord = {
      id: uuidv4(),
      exerciseId: currentExercise.id,
      weight,
      reps,
      rpe,
      timestamp: new Date(),
      isWarmup: false,
    };

    await db.setRecords.add(set);

    // Reload sets
    const updatedSets = await db.setRecords
      .where('exerciseId')
      .equals(currentExercise.id)
      .sortBy('timestamp');

    setSets(updatedSets);

    // Clear inputs
    setWeightText('');
    setRepsText('');
    setRpeText('');

    // Auto-advance if target sets reached
    if (updatedSets.length >= currentExercise.targetSets && currentIndex < exercises.length - 1) {
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 300);
    }
  };

  const handlePrefillSet = (weight: number, reps: number, rpe?: number) => {
    setWeightText(weight.toString());
    setRepsText(reps.toString());
    setRpeText(rpe ? rpe.toFixed(1) : '');
  };

  const handleFinishWorkout = async () => {
    await db.workouts.update(workout.id, { endedAt: new Date() });
    setActiveWorkout(null);
    triggerRefresh();
  };

  const goNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (!currentExercise) {
    return <div className="text-center text-gray-600">No exercises in this workout.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Exercise Header */}
      <div className="bg-primary-50 rounded-xl p-5">
        <h3 className="text-2xl font-bold text-primary-700">
          {currentExercise.name}
        </h3>
        {currentExercise.targetReps && (
          <p className="text-gray-700 font-medium mt-2">
            <span className="text-primary-600 font-bold">{currentExercise.targetSets}</span> sets × <span className="text-primary-600 font-bold">{currentExercise.targetReps}</span> reps
          </p>
        )}
        {currentExercise.notes && (
          <p className="text-sm text-gray-600 mt-3 bg-white/60 rounded-lg p-3">{currentExercise.notes}</p>
        )}
      </div>

      {/* Current Session Sets */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Today's Sets</p>
        {sets.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {sets.map((set, idx) => (
              <div
                key={set.id}
                className="px-4 py-2 bg-green-50 border-2 border-green-200 rounded-xl text-sm font-bold text-gray-800 shadow-sm"
              >
                Set {idx + 1}: <span className="text-green-700">{set.weight}kg</span> × <span className="text-green-700">{set.reps}</span>
                {set.rpe && <span className="text-orange-600 ml-1">@{set.rpe}</span>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No sets logged yet - let's get started!</p>
        )}
      </div>

      {/* Set Logger */}
      <div className="card p-5 bg-white">
        <p className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Log New Set</p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Weight (kg)</label>
            <input
              type="number"
              step="0.5"
              placeholder="0"
              value={weightText}
              onChange={(e) => setWeightText(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Reps</label>
            <input
              type="number"
              placeholder="0"
              value={repsText}
              onChange={(e) => setRepsText(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">RPE</label>
            <input
              type="number"
              step="0.5"
              placeholder="0"
              value={rpeText}
              onChange={(e) => setRpeText(e.target.value)}
              className="input-field"
            />
          </div>
        </div>
        <button
          onClick={handleLogSet}
          disabled={!weightText || !repsText}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <CheckCircle className="w-5 h-5" />
          Log Set
        </button>
      </div>

      {/* Previous Workout History */}
      {previousHistory.length > 0 && (
        <div className="card p-5 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-900 text-lg">Previous Workouts</h4>
            <span className="text-xs text-primary-600 font-semibold bg-primary-50 px-3 py-1 rounded-full">Tap to prefill</span>
          </div>
          <div className="space-y-3">
            {previousHistory.map((item, idx) => (
              <div key={idx} className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-gray-800">
                    {new Date(item.workout.startedAt).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">{item.workout.name}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.sets.map((set) => (
                    <button
                      key={set.id}
                      onClick={() => handlePrefillSet(set.weight, set.reps, set.rpe)}
                      className="px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-sm font-medium hover:border-primary-300 hover:bg-primary-50 transition-all transform hover:scale-105"
                    >
                      {set.weight}kg × {set.reps}
                      {set.rpe && <span className="text-orange-600 ml-1">@{set.rpe}</span>}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="card p-4 bg-white">
          <div className="text-center mb-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Exercise {currentIndex + 1} of {exercises.length}</span>
          </div>
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={goPrevious}
            disabled={currentIndex === 0}
            className="btn-secondary flex flex-1 items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>


          <button
            onClick={goNext}
            disabled={currentIndex === exercises.length - 1}
            className="btn-primary flex flex-1 items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Finish Workout */}
      {currentIndex === exercises.length - 1 && (
        <button
          onClick={handleFinishWorkout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <StopCircle className="w-6 h-6" />
          Finish Workout
        </button>
      )}
    </div>
  );
}
