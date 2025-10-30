import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { db } from '../db/database';
import {
  getActiveProgram,
  currentWeek,
  recommendedDay,
  selectTemplate,
  instantiateWorkout,
  findActiveWorkoutForToday,
} from '../utils/programLogic';
import { ensureDefaultProgram } from '../utils/programTemplates';
import { cleanupAbandonedWorkouts } from '../utils/workoutCleanup';
import type { WorkoutTemplate } from '../types/models';
import { WorkoutRunner } from '../components/WorkoutRunner';

export function TodayView() {
  const {
    activeProgram,
    setActiveProgram,
    selectedDayIndex,
    setSelectedDayIndex,
    weekNumber,
    setWeekNumber,
    activeWorkout,
    setActiveWorkout,
    refreshTrigger,
  } = useAppStore();

  const [template, setTemplate] = useState<WorkoutTemplate | null>(null);
  const [maxDayIndex, setMaxDayIndex] = useState(4);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeProgram = async () => {
      console.log('[TodayView] initializeProgram started, refreshTrigger:', refreshTrigger);
      setIsLoading(true);
      try {
        // Clean up abandoned workouts from previous days
        await cleanupAbandonedWorkouts();

        // Ensure we have at least one program
        await ensureDefaultProgram();

        // Get the active program
        const program = await getActiveProgram();
        if (!program) {
          console.log('[TodayView] No active program found');
          return;
        }

        console.log('[TodayView] Active program:', { id: program.id, name: program.name });
        setActiveProgram(program);

        // Calculate current week
        const week = currentWeek(program.startDate, program.totalWeeks);
        console.log('[TodayView] Current week:', week);
        setWeekNumber(week);

        // Get max day index
        const templates = await db.workoutTemplates
          .where('programId')
          .equals(program.id)
          .toArray();

        const maxIdx = Math.max(...templates.map((t) => t.dayIndex), 0);
        setMaxDayIndex(maxIdx);

        // Get recommended day
        const recDay = await recommendedDay(program);
        console.log('[TodayView] Recommended day:', recDay);
        setSelectedDayIndex(recDay);

        // Check for active workout
        const activeW = await findActiveWorkoutForToday();
        console.log('[TodayView] Found active workout:', activeW ? { id: activeW.id, name: activeW.name } : 'NONE');
        setActiveWorkout(activeW || null);
      } catch (error) {
        console.error('Error initializing program:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeProgram();
  }, [refreshTrigger, setActiveProgram, setSelectedDayIndex, setWeekNumber, setActiveWorkout]);

  useEffect(() => {
    const loadTemplate = async () => {
      if (!activeProgram) {
        console.log('[TodayView] loadTemplate skipped (no activeProgram)');
        return;
      }

      console.log('[TodayView] loadTemplate called', {
        selectedDayIndex,
        weekNumber,
        hasActiveWorkout: !!activeWorkout,
        activeWorkoutName: activeWorkout?.name,
      });

      // If there's an active workout, prioritize it over selectedDayIndex
      // The user should be able to continue their workout regardless of which day they've selected
      if (activeWorkout) {
        console.log('[TodayView] Active workout is in progress - prioritizing it over day selection', {
          workoutName: activeWorkout.name,
        });

        // Find the template that matches the active workout to display correct info
        // But don't use selectedDayIndex - search all days for a matching template
        const allTemplates = await db.workoutTemplates
          .where('programId')
          .equals(activeProgram.id)
          .toArray();

        // Find templates with the same name as the active workout
        const matchingTemplates = allTemplates.filter(t => t.name === activeWorkout.name);
        const workoutTemplate = matchingTemplates.length > 0 ? matchingTemplates[0] : null;

        console.log('[TodayView] Found matching template for active workout:', workoutTemplate ? { id: workoutTemplate.id, name: workoutTemplate.name, dayIndex: workoutTemplate.dayIndex } : 'NONE');
        setTemplate(workoutTemplate);

        // NEVER clear an active workout based on day selection
        return;
      }

      // Only load template based on selectedDayIndex if there's NO active workout
      const tmpl = await selectTemplate(activeProgram.id, weekNumber, selectedDayIndex);
      console.log('[TodayView] Selected template for day:', selectedDayIndex, ':', tmpl ? { id: tmpl.id, name: tmpl.name, dayIndex: tmpl.dayIndex } : 'NONE');
      setTemplate(tmpl || null);
    };

    loadTemplate();
  }, [activeProgram, weekNumber, selectedDayIndex, activeWorkout, setActiveWorkout]);

  const handleStartWorkout = async (isQuickWorkout: boolean = false) => {
    if (!template || !activeProgram) return;

    const workout = await instantiateWorkout(template, activeProgram.name, isQuickWorkout);
    setActiveWorkout(workout);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!activeProgram) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">No program found. Please create one in Settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Program Header */}
        <div className="card p-6 bg-white dark:bg-slate-800" data-tour="welcome">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary-600 rounded-2xl shadow-lg">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-700 dark:text-primary-400">
                {activeProgram.name}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5 dark:text-gray-400">Let's crush it today!</p>
            </div>
          </div>

          {/* Week Progress */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 mb-5 shadow-inner-lg dark:bg-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Training Week</span>
              <span className="font-bold text-lg text-primary-700 dark:text-primary-400">
                {weekNumber} of {activeProgram.totalWeeks}
              </span>
            </div>
            <div className="relative h-3 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-primary-600 rounded-full transition-all duration-500"
                style={{
                  width: `${(weekNumber / Math.max(activeProgram.totalWeeks, 1)) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Recommended Today */}
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 dark:text-gray-400">Recommended Today</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {template?.name || `Day ${selectedDayIndex + 1}`}
            </p>
          </div>

          {/* Day Picker */}
          <div className="flex gap-2" data-tour="select-day">
            {Array.from({ length: maxDayIndex + 1 }, (_, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedDayIndex(idx)}
                className={`flex-1 py-3 px-3 rounded-xl font-bold transition-all duration-200 transform ${
                  selectedDayIndex === idx
                    ? 'bg-primary-600 text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 hover:scale-105 shadow-md'
                }`}
              >
                Day {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Workout Section */}
        {activeWorkout && activeWorkout.name === template?.name ? (
          <div className="card p-6">
            <WorkoutRunner workout={activeWorkout} />
          </div>
        ) : (
          <div className="card p-6">
            {template ? (
              <div className="flex gap-2 sm:flex-row flex-col" data-tour="start-workout">
                <button
                  onClick={() => handleStartWorkout(false)}
                  className="btn-primary flex-1 text-lg flex items-center justify-center gap-3"
                >
                  <Activity className="w-6 h-6" />
                  Start {template.name}
                </button>
                <button
                  onClick={() => handleStartWorkout(true)}
                  className="flex-1 px-4 py-3 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  title="Quick workout with ~70% of the usual volume"
                >
                  ⚡ Quick (~70% volume)
                </button>
              </div>
            ) : (
              <p className="text-center text-gray-600 dark:text-gray-400 py-4">
                No workout template for Week {weekNumber}, Day {selectedDayIndex + 1}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
