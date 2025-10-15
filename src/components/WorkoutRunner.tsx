import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, StopCircle, CheckCircle, Activity, Flame, Zap, Clock, Pause, Play, RefreshCw, X, Timer, SkipForward } from 'lucide-react';
import { db } from '../db/database';
import { previousWorkoutInstances } from '../utils/programLogic';
import { useAppStore } from '../store/appStore';
import type { Workout, ExerciseInstance, SetRecord, SettingsModel } from '../types/models';
import { v4 as uuidv4 } from 'uuid';
import { calculateWorkoutStats, formatVolume, formatRPE, formatDuration } from '../utils/workoutStats';
import { getExerciseSubstitutions, hasSubstitutions, getExerciseNotes } from '../data/exerciseSubstitutions';
import { playTimerNotification, initAudioContext, playCountdownBeep } from '../utils/audio';

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
  const [allExercisesWithSets, setAllExercisesWithSets] = useState<Array<{ sets: SetRecord[] }>>([]);

  // Pause/Resume state
  const [isPaused, setIsPaused] = useState(false);
  const [pauseStartTime, setPauseStartTime] = useState<Date | null>(null);
  const [totalPausedMs, setTotalPausedMs] = useState(workout.totalPausedMs || 0);
  const [_currentTime, setCurrentTime] = useState(new Date()); // Used to trigger re-renders for live timer

  // Exercise substitution state
  const [showSubstitutions, setShowSubstitutions] = useState(false);
  const [isSubstituting, setIsSubstituting] = useState(false);

  // Rest timer state
  const [settings, setSettings] = useState<SettingsModel | null>(null);
  const [restTimerActive, setRestTimerActive] = useState(false);
  const [restTimerSecondsLeft, setRestTimerSecondsLeft] = useState(0);
  const [restTimerDuration, setRestTimerDuration] = useState(90);
  const [restTimerCompleted, setRestTimerCompleted] = useState(false);

  const { setActiveWorkout, triggerRefresh } = useAppStore();

  const currentExercise = exercises[currentIndex];

  // Helper function to format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      const sett = await db.settings.toCollection().first();
      if (sett) {
        setSettings(sett);
        setRestTimerDuration(sett.restTimerDuration || 90);
      }
    };

    loadSettings();
  }, []);

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

  // Load all sets for all exercises (for stats calculation)
  const loadAllSets = async () => {
    if (exercises.length === 0) return;

    const exercisesWithSets = await Promise.all(
      exercises.map(async (ex) => {
        const sets = await db.setRecords
          .where('exerciseId')
          .equals(ex.id)
          .sortBy('timestamp');
        return { sets };
      })
    );

    setAllExercisesWithSets(exercisesWithSets);
  };

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

      // Reload all sets for stats
      await loadAllSets();
    };

    loadSets();
    // Clear inputs when changing exercise
    setWeightText('');
    setRepsText('');
    setRpeText('');
    // Clear rest timer when changing exercise
    skipRestTimer();
  }, [currentExercise]);

  // Initial load of all sets
  useEffect(() => {
    loadAllSets();
  }, [exercises]);

  // Live timer - updates every second when not paused
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Rest timer countdown - only runs when timer is active and workout not paused
  useEffect(() => {
    if (!restTimerActive || isPaused || restTimerSecondsLeft <= 0) return;

    const interval = setInterval(() => {
      setRestTimerSecondsLeft(prev => {
        if (prev <= 1) {
          // Timer completed
          setRestTimerActive(false);
          setRestTimerCompleted(true);

          // Play notification if enabled
          if (settings?.restTimerSound !== false) {
            playTimerNotification(true);
          }

          return 0;
        }

        // Play countdown beeps at 2 and 1 seconds remaining
        if ((prev === 2 || prev === 3) && settings?.restTimerSound !== false) {
          playCountdownBeep();
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [restTimerActive, isPaused, restTimerSecondsLeft, settings]);

  // Pause rest timer when workout is paused
  useEffect(() => {
    if (isPaused && restTimerActive) {
      // Timer will automatically stop counting due to the useEffect dependency
      // No need to stop it explicitly, it will resume when isPaused becomes false
    }
  }, [isPaused, restTimerActive]);

  // Handle pause
  const handlePause = async () => {
    setIsPaused(true);
    setPauseStartTime(new Date());
  };

  // Handle resume
  const handleResume = async () => {
    if (pauseStartTime) {
      const pausedDuration = new Date().getTime() - pauseStartTime.getTime();
      const newTotalPausedMs = totalPausedMs + pausedDuration;
      setTotalPausedMs(newTotalPausedMs);

      // Update database
      await db.workouts.update(workout.id, { totalPausedMs: newTotalPausedMs });
    }

    setIsPaused(false);
    setPauseStartTime(null);
  };

  // Handle stop (end workout immediately)
  const handleStopWorkout = async () => {
    // Check if any sets were logged
    const hasAnySets = allExercisesWithSets.some(ex => ex.sets.length > 0);

    if (!hasAnySets) {
      // No sets logged - delete the workout and all exercise instances
      const exerciseInstances = await db.exerciseInstances
        .where('workoutId')
        .equals(workout.id)
        .toArray();

      // Delete all exercise instances
      await Promise.all(
        exerciseInstances.map(ex => db.exerciseInstances.delete(ex.id))
      );

      // Delete the workout
      await db.workouts.delete(workout.id);

      setActiveWorkout(null);
      triggerRefresh();
      return;
    }

    // Sets were logged - save the workout
    if (isPaused && pauseStartTime) {
      const pausedDuration = new Date().getTime() - pauseStartTime.getTime();
      const newTotalPausedMs = totalPausedMs + pausedDuration;
      await db.workouts.update(workout.id, {
        endedAt: new Date(),
        totalPausedMs: newTotalPausedMs
      });
    } else {
      await db.workouts.update(workout.id, {
        endedAt: new Date(),
        totalPausedMs
      });
    }

    setActiveWorkout(null);
    triggerRefresh();
  };

  const handleLogSet = async () => {
    if (!currentExercise) return;

    const weight = parseFloat(weightText);
    const reps = parseInt(repsText);
    const rpe = rpeText ? parseFloat(rpeText) : undefined;

    if (isNaN(weight) || isNaN(reps)) return;

    // Initialize audio context on user interaction (required for iOS)
    initAudioContext();

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

    // Start rest timer if enabled and auto-start is on
    if (settings?.restTimerEnabled !== false && settings?.restTimerAutoStart !== false) {
      startRestTimer();
    }

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

  // Rest timer functions
  const startRestTimer = (duration: number = restTimerDuration) => {
    // Initialize audio context on user interaction (required for iOS)
    initAudioContext();

    setRestTimerDuration(duration);
    setRestTimerSecondsLeft(duration);
    setRestTimerActive(true);
    setRestTimerCompleted(false);
  };

  const skipRestTimer = () => {
    setRestTimerActive(false);
    setRestTimerSecondsLeft(0);
    setRestTimerCompleted(false);
  };

  const addRestTime = (seconds: number) => {
    setRestTimerSecondsLeft(prev => prev + seconds);
  };

  const handleDeleteSet = async (setId: string) => {
    if (!currentExercise) return;

    // Delete the set from the database
    await db.setRecords.delete(setId);

    // Reload sets
    const updatedSets = await db.setRecords
      .where('exerciseId')
      .equals(currentExercise.id)
      .sortBy('timestamp');

    setSets(updatedSets);

    // Reload all sets for stats
    await loadAllSets();
  };

  const handleFinishWorkout = async () => {
    // Check if any sets were logged
    const hasAnySets = allExercisesWithSets.some(ex => ex.sets.length > 0);

    if (!hasAnySets) {
      // No sets logged - delete the workout and all exercise instances
      const exerciseInstances = await db.exerciseInstances
        .where('workoutId')
        .equals(workout.id)
        .toArray();

      // Delete all exercise instances
      await Promise.all(
        exerciseInstances.map(ex => db.exerciseInstances.delete(ex.id))
      );

      // Delete the workout
      await db.workouts.delete(workout.id);

      setActiveWorkout(null);
      triggerRefresh();
      alert('Workout cancelled - no sets were logged.');
      return;
    }

    // Sets were logged - save the workout
    if (isPaused && pauseStartTime) {
      const pausedDuration = new Date().getTime() - pauseStartTime.getTime();
      const newTotalPausedMs = totalPausedMs + pausedDuration;
      await db.workouts.update(workout.id, {
        endedAt: new Date(),
        totalPausedMs: newTotalPausedMs
      });
    } else {
      await db.workouts.update(workout.id, {
        endedAt: new Date(),
        totalPausedMs
      });
    }

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

  const handleSubstituteExercise = async (newExerciseName: string) => {
    if (!currentExercise) return;

    setIsSubstituting(true);

    try {
      // Update only the current exercise instance
      await db.exerciseInstances.update(currentExercise.id, {
        name: newExerciseName,
        notes: getExerciseNotes(newExerciseName) || currentExercise.notes
      });

      // Reload exercises to reflect the change
      const updatedExercises = await db.exerciseInstances
        .where('workoutId')
        .equals(workout.id)
        .sortBy('orderIndex');

      setExercises(updatedExercises);

      // Close substitution menu
      setShowSubstitutions(false);

      // Trigger a refresh to update any other views
      triggerRefresh();
    } catch (error) {
      console.error('Error substituting exercise:', error);
      alert('Failed to substitute exercise. Please try again.');
    } finally {
      setIsSubstituting(false);
    }
  };

  if (!currentExercise) {
    return <div className="text-center text-gray-600">No exercises in this workout.</div>;
  }

  // Calculate current workout stats (accounting for paused time)
  const currentPausedMs = isPaused && pauseStartTime
    ? totalPausedMs + (new Date().getTime() - pauseStartTime.getTime())
    : totalPausedMs;
  const stats = calculateWorkoutStats(allExercisesWithSets, workout.startedAt, undefined, currentPausedMs);

  return (
    <div className="space-y-6">
      {/* Workout Controls */}
      <div className={`card p-4 transition-all duration-200 ${isPaused ? 'bg-yellow-50 border-2 border-yellow-300' : 'bg-white'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-3 h-3 rounded-full animate-pulse ${isPaused ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
              <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${isPaused ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
            </div>
            <h2 className={`text-lg font-bold ${isPaused ? 'text-yellow-700' : 'text-green-700'}`}>
              {isPaused ? 'Paused' : 'Running'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {!isPaused ? (
              <button
                onClick={handlePause}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-3 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Pause className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleResume}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Play className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={handleStopWorkout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <StopCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Exercise Header */}
      <div className="bg-primary-50 rounded-xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-primary-700">
              {currentExercise.name}
            </h3>
            {currentExercise.targetReps && (
              <p className="text-gray-700 font-medium mt-2">
                <span className="text-primary-600 font-bold">{currentExercise.targetSets}</span> sets × <span className="text-primary-600 font-bold">{currentExercise.targetReps}</span> reps
              </p>
            )}
          </div>
          {hasSubstitutions(currentExercise.name) && (
            <button
              onClick={() => setShowSubstitutions(!showSubstitutions)}
              className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-primary-100 text-primary-700 font-semibold rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105"
              disabled={isSubstituting}
            >
              <RefreshCw className={`w-4 h-4 ${isSubstituting ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
        {currentExercise.notes && (
          <p className="text-sm text-gray-600 mt-3 bg-white/60 rounded-lg p-3">{currentExercise.notes}</p>
        )}
      </div>

      {/* Exercise Substitution Options */}
      {showSubstitutions && hasSubstitutions(currentExercise.name) && (
        <div className="card p-5 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-900 text-lg">Alternative Exercises</h4>
            <button
              onClick={() => setShowSubstitutions(false)}
              className="text-gray-500 hover:text-gray-700 font-semibold text-sm"
            >
              Cancel
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Switch to a different exercise. This will update your exercise history to track the new exercise going forward.
          </p>
          <div className="space-y-2">
            {getExerciseSubstitutions(currentExercise.name).map((substitution) => {
              const notes = getExerciseNotes(substitution);
              return (
                <button
                  key={substitution}
                  onClick={() => handleSubstituteExercise(substitution)}
                  disabled={isSubstituting}
                  className="w-full text-left p-4 bg-white hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-400 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="font-bold text-gray-900">{substitution}</div>
                  {notes && (
                    <div className="text-sm text-gray-600 mt-1">{notes}</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Current Session Sets */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Today's Sets</p>
        {sets.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {sets.map((set) => (
              <div
                key={set.id}
                className="group relative px-4 py-2 bg-green-50 border-2 border-green-200 rounded-xl text-sm font-bold text-gray-800 shadow-sm"
              >
                <button
                  onClick={() => handleDeleteSet(set.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg"
                  title="Delete set"
                >
                  <X className="w-4 h-4" />
                </button>
                <span className="text-green-700">{set.weight}kg</span> × <span className="text-green-700">{set.reps}</span>
                {set.rpe && <span className="text-orange-600 ml-1">@{set.rpe}</span>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No sets logged yet - let's get started!</p>
        )}
      </div>

      {/* Rest Timer */}
      {(restTimerActive || restTimerCompleted) && settings?.restTimerEnabled !== false && (
        <div className={`card p-5 transition-all duration-300 ${
          restTimerCompleted
            ? 'bg-gradient-to-br from-green-50 to-white border-2 border-green-300 animate-pulse'
            : restTimerSecondsLeft <= restTimerDuration * 0.2
            ? 'bg-gradient-to-br from-red-50 to-white border-2 border-red-300'
            : restTimerSecondsLeft <= restTimerDuration * 0.5
            ? 'bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-300'
            : 'bg-gradient-to-br from-blue-50 to-white border-2 border-blue-300'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Timer className={`w-5 h-5 ${
                restTimerCompleted ? 'text-green-600' : 'text-blue-600'
              }`} />
              <h4 className="font-bold text-gray-900 text-lg">
                {restTimerCompleted ? 'Rest Complete!' : 'Rest Timer'}
              </h4>
            </div>
            <button
              onClick={skipRestTimer}
              className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-red-600 transition-all"
            >
              <SkipForward className="w-4 h-4" />
              Skip
            </button>
          </div>

          <div className="text-center mb-4">
            <div className={`text-6xl font-bold ${
              restTimerCompleted
                ? 'text-green-600'
                : restTimerSecondsLeft <= restTimerDuration * 0.2
                ? 'text-red-600'
                : 'text-blue-700'
            }`}>
              {restTimerCompleted ? '00:00' : formatTime(restTimerSecondsLeft)}
            </div>
            {!restTimerCompleted && (
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    restTimerSecondsLeft <= restTimerDuration * 0.2
                      ? 'bg-red-500'
                      : restTimerSecondsLeft <= restTimerDuration * 0.5
                      ? 'bg-yellow-500'
                      : 'bg-blue-500'
                  }`}
                  style={{
                    width: `${(restTimerSecondsLeft / restTimerDuration) * 100}%`,
                  }}
                ></div>
              </div>
            )}
          </div>

          {!restTimerCompleted && (
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => startRestTimer(60)}
                className="px-3 py-2 bg-white hover:bg-blue-50 border-2 border-blue-200 rounded-lg text-sm font-bold text-gray-700 transition-all"
              >
                1:00
              </button>
              <button
                onClick={() => startRestTimer(90)}
                className="px-3 py-2 bg-white hover:bg-blue-50 border-2 border-blue-200 rounded-lg text-sm font-bold text-gray-700 transition-all"
              >
                1:30
              </button>
              <button
                onClick={() => startRestTimer(120)}
                className="px-3 py-2 bg-white hover:bg-blue-50 border-2 border-blue-200 rounded-lg text-sm font-bold text-gray-700 transition-all"
              >
                2:00
              </button>
              <button
                onClick={() => startRestTimer(180)}
                className="px-3 py-2 bg-white hover:bg-blue-50 border-2 border-blue-200 rounded-lg text-sm font-bold text-gray-700 transition-all"
              >
                3:00
              </button>
            </div>
          )}

          {!restTimerCompleted && restTimerActive && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => addRestTime(15)}
                className="flex-1 px-3 py-2 bg-white hover:bg-green-50 border-2 border-green-200 rounded-lg text-sm font-bold text-green-700 transition-all"
              >
                +15s
              </button>
              <button
                onClick={() => addRestTime(30)}
                className="flex-1 px-3 py-2 bg-white hover:bg-green-50 border-2 border-green-200 rounded-lg text-sm font-bold text-green-700 transition-all"
              >
                +30s
              </button>
            </div>
          )}
        </div>
      )}

      {/* Manual Rest Timer Start */}
      {!restTimerActive && !restTimerCompleted && settings?.restTimerEnabled !== false && sets.length > 0 && (
        <button
          onClick={() => startRestTimer()}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-all font-bold shadow-sm hover:shadow-md border-2 border-blue-200"
        >
          <Timer className="w-5 h-5" />
          <span>Start Rest Timer ({formatTime(restTimerDuration)})</span>
        </button>
      )}

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

      {/* Live Workout Stats */}
      <div className="grid grid-cols-2 gap-3">
        <h4 className="col-span-2 font-bold text-gray-900 text-lg">Workout Stats:</h4>
        <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-3 border-2 border-primary-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-primary-600" />
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Volume</span>
          </div>
          <p className="text-xl font-bold text-primary-700">{formatVolume(stats.totalVolume)} kg</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl p-3 border-2 border-orange-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Calories</span>
          </div>
          <p className="text-xl font-bold text-orange-700">~{stats.estimatedCalories}</p>
        </div>

        {stats.averageRPE > 0 && (
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-3 border-2 border-purple-100 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Avg RPE</span>
            </div>
            <p className="text-xl font-bold text-purple-700">{formatRPE(stats.averageRPE)}</p>
          </div>
        )}

        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-3 border-2 border-blue-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Duration</span>
          </div>
          <p className="text-xl font-bold text-blue-700">{formatDuration(stats.duration)}</p>
        </div>
      </div>


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
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <CheckCircle className="w-6 h-6" />
          Finish Workout
        </button>
      )}
    </div>
  );
}
