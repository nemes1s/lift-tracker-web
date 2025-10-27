import { useEffect, useState } from 'react';
import { db } from '../db/database';
import { previousWorkoutInstances, getProgressiveOverloadSuggestion } from '../utils/programLogic';
import type { ProgressiveOverloadSuggestion } from '../utils/programLogic';
import { useAppStore } from '../store/appStore';
import type { Workout, ExerciseInstance, SetRecord, SettingsModel } from '../types/models';
import { v4 as uuidv4 } from 'uuid';
import { calculateWorkoutStats } from '../utils/workoutStats';
import { getExerciseNotes, hasSubstitutions } from '../data/exerciseSubstitutions';
import { playTimerNotification, initAudioContext, playCountdownBeep } from '../utils/audio';
import { WorkoutControlsSection } from './WorkoutRunner/WorkoutControlsSection';
import { ExerciseHeaderSection } from './WorkoutRunner/ExerciseHeaderSection';
import { ExerciseSubstitutionSection } from './WorkoutRunner/ExerciseSubstitutionSection';
import { CurrentSetsSection } from './WorkoutRunner/CurrentSetsSection';
import { RestTimerSection } from './WorkoutRunner/RestTimerSection';
import { SetLoggerSection } from './WorkoutRunner/SetLoggerSection';
import { PreviousWorkoutsSection } from './WorkoutRunner/PreviousWorkoutsSection';
import { WorkoutStatsSection } from './WorkoutRunner/WorkoutStatsSection';
import { ExerciseNavigationSection } from './WorkoutRunner/ExerciseNavigationSection';
import { FinishWorkoutButton } from './WorkoutRunner/FinishWorkoutButton';

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
  const [suggestion, setSuggestion] = useState<ProgressiveOverloadSuggestion | undefined>(undefined);

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

      // Load progressive overload suggestion
      const sug = await getProgressiveOverloadSuggestion(
        currentExercise.name,
        currentExercise.targetReps
      );
      setSuggestion(sug);

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

  const handleApplySuggestion = (suggestedWeight?: number, suggestedReps?: string) => {
    if (suggestedWeight) {
      setWeightText(suggestedWeight.toString());
    }
    if (suggestedReps) {
      // Parse the rep range and use the lower bound as suggested reps
      const match = suggestedReps.match(/^(\d+)-(\d+)$/);
      if (match) {
        setRepsText(match[1]); // Use lower bound
      }
    }
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
      <WorkoutControlsSection
        isPaused={isPaused}
        onPause={handlePause}
        onResume={handleResume}
        onStop={handleStopWorkout}
      />

      <ExerciseHeaderSection
        exercise={currentExercise}
        onShowSubstitutions={() => setShowSubstitutions(!showSubstitutions)}
        isSubstituting={isSubstituting}
      />

      {showSubstitutions && hasSubstitutions(currentExercise.name) && (
        <ExerciseSubstitutionSection
          exerciseName={currentExercise.name}
          isSubstituting={isSubstituting}
          onSubstitute={handleSubstituteExercise}
          onCancel={() => setShowSubstitutions(false)}
        />
      )}

      <CurrentSetsSection
        sets={sets}
        onDeleteSet={handleDeleteSet}
      />

      {(restTimerActive || restTimerCompleted) && settings?.restTimerEnabled !== false && (
        <RestTimerSection
          isActive={restTimerActive}
          isCompleted={restTimerCompleted}
          secondsLeft={restTimerSecondsLeft}
          duration={restTimerDuration}
          onStart={startRestTimer}
          onSkip={skipRestTimer}
          onAddTime={addRestTime}
        />
      )}

      {!restTimerActive && !restTimerCompleted && settings?.restTimerEnabled !== false && sets.length > 0 && (
        <RestTimerSection
          isActive={false}
          isCompleted={false}
          secondsLeft={0}
          duration={restTimerDuration}
          onStart={startRestTimer}
          onSkip={skipRestTimer}
          onAddTime={addRestTime}
        />
      )}

      <SetLoggerSection
        weightText={weightText}
        repsText={repsText}
        rpeText={rpeText}
        onWeightChange={setWeightText}
        onRepsChange={setRepsText}
        onRpeChange={setRpeText}
        onLogSet={handleLogSet}
        suggestion={suggestion}
        onApplySuggestion={handleApplySuggestion}
      />

      <PreviousWorkoutsSection
        history={previousHistory}
        onPrefillSet={handlePrefillSet}
      />

      <WorkoutStatsSection stats={stats} />

      <ExerciseNavigationSection
        currentIndex={currentIndex}
        totalExercises={exercises.length}
        onPrevious={goPrevious}
        onNext={goNext}
      />

      {currentIndex === exercises.length - 1 && (
        <FinishWorkoutButton onFinish={handleFinishWorkout} />
      )}
    </div>
  );
}
