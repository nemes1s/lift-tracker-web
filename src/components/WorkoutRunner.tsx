import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/database';
import { previousWorkoutInstances, getProgressiveOverloadSuggestion } from '../utils/programLogic';
import type { ProgressiveOverloadSuggestion } from '../utils/programLogic';
import { isSetAPR } from '../utils/globalStats';
import { useAppStore } from '../store/appStore';
import type { Workout, ExerciseInstance, SetRecord, SettingsModel } from '../types/models';
import { v4 as uuidv4 } from 'uuid';
import { calculateWorkoutStats } from '../utils/workoutStats';
import {
  getSupersetAdvance,
  getSupersetLabel,
  getSupersetMemberIndices,
  reorderForSuperset,
  isInSuperset,
  resolveRestDuration,
  DEFAULT_SUPERSET_REST,
} from '../utils/supersets';
import { convertToKg, convertWeight, type WeightUnit } from '../utils/weightUnit';
import { getExerciseNotes } from '../data/exerciseSubstitutions';
import { getAllDefinitionNames, areAntagonistExercises } from '../utils/exerciseLibrary';
import { playTimerNotification, initAudioContext, playCountdownBeep } from '../utils/audio';
import { showRestTimerComplete } from '../utils/notifications';
import { WorkoutControlsSection } from './WorkoutRunner/WorkoutControlsSection';
import { ExerciseDetailsSection } from './WorkoutRunner/ExerciseDetailsSection';
import { ExerciseSubstitutionSection } from './WorkoutRunner/ExerciseSubstitutionSection';
import { CurrentSetsSection } from './WorkoutRunner/CurrentSetsSection';
import { RestTimerSection } from './WorkoutRunner/RestTimerSection';
import { StickyRestTimerHeader } from './WorkoutRunner/StickyRestTimerHeader';
import { StickyExerciseHeader } from './WorkoutRunner/StickyExerciseHeader';
import { SetLoggerSection } from './WorkoutRunner/SetLoggerSection';
import { PreviousWorkoutsSection } from './WorkoutRunner/PreviousWorkoutsSection';
import { WorkoutOverviewSection } from './WorkoutRunner/WorkoutOverviewSection';
// import { PRSummarySection } from './WorkoutRunner/PRSummarySection';
import { ExerciseNavigationSection } from './WorkoutRunner/ExerciseNavigationSection';
import { FinishWorkoutButton } from './WorkoutRunner/FinishWorkoutButton';
import { AddCustomExerciseModal } from './shared/AddCustomExerciseModal';
import { SupersetSuggestionModal } from './shared/SupersetSuggestionModal';
import { WorkoutExportMenu } from './shared/WorkoutExportMenu';

interface WorkoutRunnerProps {
  workout: Workout;
}

export function WorkoutRunner({ workout }: WorkoutRunnerProps) {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<ExerciseInstance[]>([]);
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

  // Track previous exercise for form clearing logic
  const [previousExerciseId, setPreviousExerciseId] = useState<string | null>(null);

  // Per-exercise input drafts, so moving between exercises (especially inside a superset)
  // always shows the numbers belonging to the exercise the next set will be logged against.
  const draftsRef = useRef<Record<string, { weight: string; reps: string; rpe: string }>>({});

  // Mirror of the live inputs, so effects can read them without re-running on every keystroke
  const liveInputsRef = useRef({ weight: '', reps: '', rpe: '' });
  liveInputsRef.current = { weight: weightText, reps: repsText, rpe: rpeText };

  // Exercise substitution state
  const [showSubstitutions, setShowSubstitutions] = useState(false);
  const [isSubstituting, setIsSubstituting] = useState(false);

  // Custom exercise state
  const [showAddCustomExercise, setShowAddCustomExercise] = useState(false);
  const [exerciseSuggestions, setExerciseSuggestions] = useState<string[]>([]);
  const [supersetSuggestion, setSupersetSuggestion] = useState<{
    newExerciseId: string;
    newExerciseName: string;
    partnerId: string;
    partnerName: string;
  } | null>(null);

  // Rest timer state
  const [settings, setSettings] = useState<SettingsModel | null>(null);

  const {
    setActiveWorkout,
    triggerRefresh,
    currentExerciseIndex,
    setCurrentExerciseIndex,
    restTimer,
    setRestTimer,
    startRestTimer: zustandStartRestTimer,
    skipRestTimer: zustandSkipRestTimer,
    addRestTime: zustandAddRestTime,
    resetRestTimer,
  } = useAppStore();

  const currentExercise = exercises[currentExerciseIndex];

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      const sett = await db.settings.toCollection().first();
      if (sett) {
        setSettings(sett);
        // Set the default timer duration from settings
        if (restTimer.duration !== (sett.restTimerDuration || 90)) {
          setRestTimer({ duration: sett.restTimerDuration || 90 });
        }
      }
    };

    loadSettings();
  }, [setRestTimer]);

  // Load exercises
  useEffect(() => {
    const loadExercises = async () => {
      const exs = await db.exerciseInstances
        .where('workoutId')
        .equals(workout.id)
        .sortBy('orderIndex');

      setExercises(exs);

      // Ensure currentExerciseIndex is within valid bounds
      if (currentExerciseIndex >= exs.length) {
        setCurrentExerciseIndex(0);
      }
    };

    loadExercises();
  }, [workout.id, currentExerciseIndex, setCurrentExerciseIndex]);

  // Load exercise suggestions for autocomplete
  useEffect(() => {
    const loadSuggestions = async () => {
      const allExerciseNames = getAllDefinitionNames();

      // Also add current exercises in this workout
      const currentExerciseNames = exercises
        .map(ex => ex.name)
        .filter(name => !allExerciseNames.includes(name));

      // Combine and sort
      const combined = [...allExerciseNames, ...currentExerciseNames].sort();
      setExerciseSuggestions(combined);
    };

    loadSuggestions();
  }, [exercises]);

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

      // On a real exercise change, swap the inputs over to the incoming exercise so the
      // next logged set carries that exercise's own numbers. Prefer an explicit draft,
      // then the last set already logged for it in this workout (the common case on the
      // second round of a superset), otherwise start empty.
      if (previousExerciseId !== null && previousExerciseId !== currentExercise.id) {
        draftsRef.current[previousExerciseId] = { ...liveInputsRef.current };

        const draft = draftsRef.current[currentExercise.id];
        if (draft) {
          setWeightText(draft.weight);
          setRepsText(draft.reps);
          setRpeText(draft.rpe);
        } else if (s.length > 0) {
          const lastSet = s[s.length - 1];
          const weightUnit: WeightUnit = settings?.weightUnit || 'kg';
          const displayWeight = convertWeight(lastSet.weight, weightUnit);
          const rounded = weightUnit === 'lbs'
            ? Math.round(displayWeight)
            : Math.round(displayWeight * 2) / 2;
          setWeightText(rounded.toString());
          setRepsText(lastSet.reps.toString());
          setRpeText(lastSet.rpe ? Math.round(lastSet.rpe).toString() : '');
        } else {
          setWeightText('');
          setRepsText('');
          setRpeText('');
        }
      }

      // Update previous exercise ID
      setPreviousExerciseId(currentExercise.id);
    };

    loadSets();
    // Keep rest timer running when changing exercise
  }, [currentExercise, previousExerciseId, exercises, settings]);

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

  // Rest timer countdown - uses timestamp-based calculation for accuracy across app close/reopen
  useEffect(() => {
    if (!restTimer.isActive || isPaused || !restTimer.startTimestamp) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedMs = now - restTimer.startTimestamp!;
      const elapsedSeconds = Math.floor(elapsedMs / 1000);
      const remainingSeconds = Math.max(0, restTimer.duration - elapsedSeconds);

      if (remainingSeconds <= 0) {
        // Timer completed
        setRestTimer({ isActive: false, secondsLeft: 0, isCompleted: true, startTimestamp: null });

        // Play notification if enabled
        if (settings?.restTimerSound !== false) {
          playTimerNotification(true);
        }

        // Show push notification if enabled
        if (settings?.notificationsEnabled === true && settings?.restTimerNotifications === true) {
          showRestTimerComplete();
        }
      } else {
        // Update secondsLeft based on actual elapsed time
        if (restTimer.secondsLeft !== remainingSeconds) {
          setRestTimer({ secondsLeft: remainingSeconds });
        }

        // Play countdown beeps at 2 and 1 seconds remaining
        if ((remainingSeconds === 1 || remainingSeconds === 2) && settings?.restTimerSound !== false) {
          playCountdownBeep();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [restTimer.isActive, restTimer.startTimestamp, restTimer.duration, isPaused, setRestTimer, settings]);

  // Check timer state on mount/resume to handle app close/reopen
  useEffect(() => {
    if (restTimer.isActive && restTimer.startTimestamp && !isPaused) {
      const now = Date.now();
      const elapsedMs = now - restTimer.startTimestamp;
      const elapsedSeconds = Math.floor(elapsedMs / 1000);
      const remainingSeconds = Math.max(0, restTimer.duration - elapsedSeconds);

      if (remainingSeconds <= 0) {
        // Timer has already completed while app was closed
        setRestTimer({ isActive: false, secondsLeft: 0, isCompleted: true, startTimestamp: null });
        if (settings?.restTimerSound !== false) {
          playTimerNotification(true);
        }
        // Show push notification if enabled
        if (settings?.notificationsEnabled === true && settings?.restTimerNotifications === true) {
          showRestTimerComplete();
        }
      } else if (restTimer.secondsLeft !== remainingSeconds) {
        // Update to correct remaining time
        setRestTimer({ secondsLeft: remainingSeconds });
      }
    }
  }, []); // Run only on mount

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
    console.log('[WorkoutRunner] handleStopWorkout started', { workoutId: workout.id });

    // Check if any sets were logged
    const hasAnySets = allExercisesWithSets.some(ex => ex.sets.length > 0);
    console.log('[WorkoutRunner] Has any sets logged:', hasAnySets);

    if (!hasAnySets) {
      console.log('[WorkoutRunner] No sets logged, deleting workout');
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

      console.log('[WorkoutRunner] Clearing activeWorkout and triggering refresh');
      resetRestTimer();
      setActiveWorkout(null);
      setCurrentExerciseIndex(0);
      triggerRefresh();
      return;
    }

    // Sets were logged - save the workout
    console.log('[WorkoutRunner] Sets were logged, saving workout');
    if (isPaused && pauseStartTime) {
      const pausedDuration = new Date().getTime() - pauseStartTime.getTime();
      const newTotalPausedMs = totalPausedMs + pausedDuration;
      console.log('[WorkoutRunner] Saving with paused duration');
      await db.workouts.update(workout.id, {
        endedAt: new Date(),
        totalPausedMs: newTotalPausedMs
      });
    } else {
      console.log('[WorkoutRunner] Saving without paused duration');
      await db.workouts.update(workout.id, {
        endedAt: new Date(),
        totalPausedMs
      });
    }

    console.log('[WorkoutRunner] Clearing activeWorkout and triggering refresh');
    resetRestTimer();
    setActiveWorkout(null);
    setCurrentExerciseIndex(0);
    triggerRefresh();

    // Navigate to the completed workout detail page
    console.log('[WorkoutRunner] Navigating to workout detail page:', workout.id);
    navigate(`/workout/${workout.id}`);
  };

  const handleLogSet = async () => {
    if (!currentExercise) return;

    const weightInDisplayUnit = parseFloat(weightText);
    const reps = parseInt(repsText);
    const rpe = rpeText ? parseFloat(rpeText) : undefined;

    if (isNaN(weightInDisplayUnit) || isNaN(reps)) return;

    // Initialize audio context on user interaction (required for iOS)
    initAudioContext();

    // Convert weight to kg for database storage
    const weightUnit: WeightUnit = settings?.weightUnit || 'kg';
    const weightInKg = convertToKg(weightInDisplayUnit, weightUnit);

    // Check if this set is a PR
    const isPR = await isSetAPR(currentExercise.name, weightInKg, reps);

    const set: SetRecord = {
      id: uuidv4(),
      exerciseId: currentExercise.id,
      weight: weightInKg,
      reps,
      rpe,
      timestamp: new Date(),
      isWarmup: false,
      isPR,
    };

    await db.setRecords.add(set);

    // Reload sets
    const updatedSets = await db.setRecords
      .where('exerciseId')
      .equals(currentExercise.id)
      .sortBy('timestamp');

    setSets(updatedSets);

    // Reload all sets so stats and the exercise overview list reflect this set immediately
    await loadAllSets();

    // Don't clear inputs - form persists for same exercise
    // The form will be cleared only when exercise changes (see useEffect for currentExercise)

    // Supersets drive their own navigation: move straight to the next exercise in the
    // group so the following set lands on the right exercise, and use the short
    // intra-group rest until the round wraps.
    const inSuperset = isInSuperset(exercises, currentExerciseIndex);
    let supersetAdvance = null;

    if (inSuperset) {
      const setCounts: Record<string, number> = {};
      await Promise.all(
        exercises.map(async (ex) => {
          setCounts[ex.id] = await db.setRecords
            .where('exerciseId')
            .equals(ex.id)
            .count();
        })
      );

      supersetAdvance = getSupersetAdvance(exercises, currentExerciseIndex, setCounts);
    }

    // Start rest timer if enabled and auto-start is on
    if (settings?.restTimerEnabled !== false && settings?.restTimerAutoStart !== false) {
      const fullRest = settings?.restTimerDuration || 90;
      const duration = supersetAdvance
        ? resolveRestDuration(
            supersetAdvance,
            fullRest,
            settings?.supersetRestDuration ?? DEFAULT_SUPERSET_REST
          )
        : fullRest;
      startRestTimer(duration);
    }

    if (supersetAdvance && supersetAdvance.nextIndex !== null) {
      const target = supersetAdvance.nextIndex;
      setTimeout(() => {
        setCurrentExerciseIndex(target);
      }, 300);
      return;
    }

    // Auto-advance to next exercise once target sets are hit, if enabled
    if (
      settings?.autoAdvanceOnTargetSets &&
      updatedSets.length >= currentExercise.targetSets &&
      currentExerciseIndex < exercises.length - 1
    ) {
      setTimeout(() => {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
      }, 300);
    }
  };

  const handlePrefillSet = (weight: number, reps: number, rpe?: number) => {
    // Convert weight from kg to display unit
    const weightUnit: WeightUnit = settings?.weightUnit || 'kg';
    const weightInDisplayUnit = convertWeight(weight, weightUnit);
    // Round to appropriate precision based on unit
    const rounded = weightUnit === 'lbs' ? Math.round(weightInDisplayUnit) : Math.round(weightInDisplayUnit * 2) / 2;
    setWeightText(rounded.toString());
    setRepsText(reps.toString());
    setRpeText(rpe ? Math.round(rpe).toString() : '');
  };

  const handleApplySuggestion = (suggestedWeight?: number, suggestedReps?: string) => {
    if (suggestedWeight) {
      // Convert suggested weight (in kg) to display unit
      const weightUnit: WeightUnit = settings?.weightUnit || 'kg';
      const weightInDisplayUnit = convertWeight(suggestedWeight, weightUnit);
      // Round to appropriate precision based on unit
      const rounded = weightUnit === 'lbs' ? Math.round(weightInDisplayUnit) : Math.round(weightInDisplayUnit * 2) / 2;
      setWeightText(rounded.toString());
    }
    if (suggestedReps) {
      // Parse the rep range and use the lower bound as suggested reps
      const match = suggestedReps.match(/^(\d+)-(\d+)$/);
      if (match) {
        setRepsText(match[1]); // Use lower bound
      }
    }
  };

  // Rest timer functions (wrapped to use Zustand)
  const startRestTimer = (duration: number = restTimer.duration) => {
    // Initialize audio context on user interaction (required for iOS)
    initAudioContext();
    zustandStartRestTimer(duration);
  };

  const skipRestTimer = () => {
    zustandSkipRestTimer();
  };

  const addRestTime = (seconds: number) => {
    zustandAddRestTime(seconds);
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
    console.log('[WorkoutRunner] handleFinishWorkout started', { workoutId: workout.id });

    // Check if any sets were logged
    const hasAnySets = allExercisesWithSets.some(ex => ex.sets.length > 0);
    console.log('[WorkoutRunner] Has any sets logged:', hasAnySets);

    if (!hasAnySets) {
      console.log('[WorkoutRunner] No sets logged, deleting workout');
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

      console.log('[WorkoutRunner] Clearing activeWorkout and triggering refresh');
      resetRestTimer();
      setActiveWorkout(null);
      setCurrentExerciseIndex(0);
      triggerRefresh();
      alert('Workout cancelled - no sets were logged.');
      return;
    }

    // Sets were logged - save the workout
    console.log('[WorkoutRunner] Sets were logged, saving workout');
    if (isPaused && pauseStartTime) {
      const pausedDuration = new Date().getTime() - pauseStartTime.getTime();
      const newTotalPausedMs = totalPausedMs + pausedDuration;
      console.log('[WorkoutRunner] Saving with paused duration');
      await db.workouts.update(workout.id, {
        endedAt: new Date(),
        totalPausedMs: newTotalPausedMs
      });
    } else {
      console.log('[WorkoutRunner] Saving without paused duration');
      await db.workouts.update(workout.id, {
        endedAt: new Date(),
        totalPausedMs
      });
    }

    console.log('[WorkoutRunner] Clearing activeWorkout and triggering refresh');
    resetRestTimer();
    setActiveWorkout(null);
    setCurrentExerciseIndex(0);
    triggerRefresh();

    // Navigate to the completed workout detail page
    console.log('[WorkoutRunner] Navigating to workout detail page:', workout.id);
    navigate(`/workout/${workout.id}`);
  };

  const goNext = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const goPrevious = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  const handleSubstituteExercise = async (newExerciseName: string) => {
    if (!currentExercise) return;

    console.log('[WorkoutRunner] handleSubstituteExercise started', {
      oldExerciseId: currentExercise.id,
      oldExerciseName: currentExercise.name,
      newExerciseName,
      workoutId: workout.id,
    });

    setIsSubstituting(true);

    try {
      // Update only the current exercise instance
      console.log('[WorkoutRunner] Updating exercise in database');
      await db.exerciseInstances.update(currentExercise.id, {
        name: newExerciseName,
        notes: getExerciseNotes(newExerciseName) || currentExercise.notes
      });
      console.log('[WorkoutRunner] Exercise updated successfully');

      // Reload exercises to reflect the change
      console.log('[WorkoutRunner] Reloading exercises for workout:', workout.id);
      const updatedExercises = await db.exerciseInstances
        .where('workoutId')
        .equals(workout.id)
        .sortBy('orderIndex');

      console.log('[WorkoutRunner] Updated exercises loaded:', updatedExercises.length, 'exercises');
      setExercises(updatedExercises);

      // Close substitution menu
      setShowSubstitutions(false);

      // Trigger a refresh to update any other views
      console.log('[WorkoutRunner] Triggering refresh for other views');
      triggerRefresh();
    } catch (error) {
      console.error('Error substituting exercise:', error);
      alert('Failed to substitute exercise. Please try again.');
    } finally {
      setIsSubstituting(false);
    }
  };

  const handleAddCustomExercise = async (exerciseName: string, targetSets?: number, targetReps?: string) => {
    console.log('[WorkoutRunner] handleAddCustomExercise started', {
      exerciseName,
      targetSets,
      targetReps,
      workoutId: workout.id,
    });

    try {
      // Create new exercise instance
      const newExercise: ExerciseInstance = {
        id: uuidv4(),
        name: exerciseName,
        workoutId: workout.id,
        orderIndex: exercises.length,
        targetSets: targetSets || 3,
        targetReps: targetReps || '8-10',
        isCustom: true,
      };

      // Suggest pairing with an antagonist-muscle exercise already in the workout.
      // The exercise being viewed when "Add Custom Exercise" was clicked is the most
      // likely partner (e.g. adding Triceps Pushdown while on Bicep Curl).
      const candidates = currentExercise
        ? [currentExercise, ...exercises.filter((ex) => ex.id !== currentExercise.id)]
        : exercises;
      const partner = candidates.find((ex) => areAntagonistExercises(exerciseName, ex.name));

      console.log('[WorkoutRunner] Adding custom exercise to database');
      await db.exerciseInstances.add(newExercise);

      // Reload exercises
      console.log('[WorkoutRunner] Reloading exercises for workout:', workout.id);
      const updatedExercises = await db.exerciseInstances
        .where('workoutId')
        .equals(workout.id)
        .sortBy('orderIndex');

      console.log('[WorkoutRunner] Updated exercises loaded:', updatedExercises.length, 'exercises');
      setExercises(updatedExercises);

      // Navigate to the new exercise
      setCurrentExerciseIndex(updatedExercises.length - 1);

      // Close the add-exercise modal, then offer a superset suggestion if one applies.
      // triggerRefresh() causes the parent view to briefly unmount this component (it
      // gates on a loading flag), which would wipe the suggestion before it can render —
      // so it's deferred until the suggestion is resolved (see the confirm/dismiss handlers).
      setShowAddCustomExercise(false);
      if (partner) {
        setSupersetSuggestion({
          newExerciseId: newExercise.id,
          newExerciseName: newExercise.name,
          partnerId: partner.id,
          partnerName: partner.name,
        });
      } else {
        console.log('[WorkoutRunner] Triggering refresh for other views');
        triggerRefresh();
      }
    } catch (error) {
      console.error('Error adding custom exercise:', error);
      alert('Failed to add custom exercise. Please try again.');
    }
  };

  // Pairs `movingId` with `partnerId` as a superset, relocating `movingId` to sit right
  // after the partner's group so the members are contiguous — superset navigation (and
  // the plain exercise order) only runs back-to-back on adjacent exercises. Shared by the
  // add-exercise suggestion modal and the inline "pairs with X" hints in the overview list.
  const pairAsSuperset = async (movingId: string, partnerId: string) => {
    try {
      const viewedExerciseId = currentExercise?.id;
      const { order, group } = reorderForSuperset(exercises, movingId, partnerId);

      await Promise.all(
        order.map((ex, i) =>
          db.exerciseInstances.update(ex.id, {
            orderIndex: i,
            ...(ex.id === movingId || ex.id === partnerId ? { supersetGroup: group } : {}),
          })
        )
      );

      const updatedExercises = await db.exerciseInstances
        .where('workoutId')
        .equals(workout.id)
        .sortBy('orderIndex');
      setExercises(updatedExercises);

      // Reordering shifts array positions, so re-find whatever exercise was on screen
      // rather than assuming currentExerciseIndex still points at the same one.
      const preservedIndex = viewedExerciseId
        ? updatedExercises.findIndex((ex) => ex.id === viewedExerciseId)
        : -1;
      if (preservedIndex !== -1) setCurrentExerciseIndex(preservedIndex);

      triggerRefresh();
    } catch (error) {
      console.error('Error pairing superset:', error);
      alert('Failed to pair the superset. Please try again.');
    }
  };

  const handleConfirmSupersetSuggestion = async () => {
    if (!supersetSuggestion) return;
    await pairAsSuperset(supersetSuggestion.newExerciseId, supersetSuggestion.partnerId);
    setSupersetSuggestion(null);
  };

  const handleDismissSupersetSuggestion = () => {
    setSupersetSuggestion(null);
    triggerRefresh();
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
    <>
      <div className="sticky top-0 z-40">
        <StickyExerciseHeader
          name={currentExercise.name}
          currentIndex={currentExerciseIndex}
          totalExercises={exercises.length}
          setsLogged={sets.length}
          targetSets={currentExercise.targetSets}
          onShowSubstitutions={() => setShowSubstitutions(!showSubstitutions)}
          isSubstituting={isSubstituting}
          supersetLabel={getSupersetLabel(exercises, currentExerciseIndex)}
          supersetSize={getSupersetMemberIndices(exercises, currentExerciseIndex).length || undefined}
        />

        <StickyRestTimerHeader
          isActive={restTimer.isActive}
          isCompleted={restTimer.isCompleted}
          secondsLeft={restTimer.secondsLeft}
          duration={restTimer.duration}
          onSkip={skipRestTimer}
        />
      </div>

      <div className="space-y-6">
        <WorkoutControlsSection
          isPaused={isPaused}
          onPause={handlePause}
          onResume={handleResume}
          onStop={handleStopWorkout}
          isQuickWorkout={workout.isQuickWorkout}
        />

        <ExerciseDetailsSection exercise={currentExercise} />

        {showSubstitutions && (
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
          weightUnit={settings?.weightUnit || 'kg'}
          targetSets={currentExercise.targetSets}
          targetReps={currentExercise.targetReps}
        />

        {/* <PRSummarySection sets={sets} /> */}

        {!restTimer.isActive && !restTimer.isCompleted && settings?.restTimerEnabled !== false && sets.length > 0 && (
          <RestTimerSection
            isActive={false}
            isCompleted={false}
            secondsLeft={0}
            duration={restTimer.duration}
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
          weightUnit={settings?.weightUnit || 'kg'}
        />

        <PreviousWorkoutsSection
          history={previousHistory}
          onPrefillSet={handlePrefillSet}
          weightUnit={settings?.weightUnit || 'kg'}
        />


        <ExerciseNavigationSection
          currentIndex={currentExerciseIndex}
          totalExercises={exercises.length}
          onPrevious={goPrevious}
          onNext={goNext}
          onAddCustomExercise={() => setShowAddCustomExercise(true)}
        />

        {currentExerciseIndex === exercises.length - 1 && (
          <div className="space-y-3">
            <FinishWorkoutButton onFinish={handleFinishWorkout} />
            <div className="flex justify-center">
              <WorkoutExportMenu
                workout={workout}
                exercisesWithSets={allExercisesWithSets.map((exWithSets, idx) => ({
                  exercise: exercises[idx],
                  sets: exWithSets.sets,
                }))}
              />
            </div>
          </div>
        )}

        <WorkoutOverviewSection
          stats={stats}
          exercises={exercises}
          exercisesWithSets={allExercisesWithSets}
          currentIndex={currentExerciseIndex}
          onSelectExercise={setCurrentExerciseIndex}
          onPairSuperset={pairAsSuperset}
        />
        
        {showAddCustomExercise && (
          <AddCustomExerciseModal
            onConfirm={handleAddCustomExercise}
            onCancel={() => setShowAddCustomExercise(false)}
            suggestions={exerciseSuggestions}
          />
        )}

        {supersetSuggestion && (
          <SupersetSuggestionModal
            exerciseName={supersetSuggestion.newExerciseName}
            partnerName={supersetSuggestion.partnerName}
            onConfirm={handleConfirmSupersetSuggestion}
            onDismiss={handleDismissSupersetSuggestion}
          />
        )}
      </div>
    </>
  );
}
