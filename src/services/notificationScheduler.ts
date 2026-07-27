// Service to handle workout reminder scheduling and checks

import { db } from '../db/database';
import {
  shouldShowWorkoutReminder,
  shouldShowStreakReminder,
  showWorkoutReminder,
  showStreakReminder,
  getNotificationPermission,
} from '../utils/notifications';
import { recommendedDay, selectTemplate, currentWeek } from '../utils/programLogic';

/**
 * Check and show workout reminders if needed
 * Should be called when the app opens
 */
export async function checkAndShowWorkoutReminders(): Promise<void> {
  // Get settings
  const settings = await db.settings.toCollection().first();
  if (!settings) return;

  // Check if master notifications switch is enabled
  if (!settings.notificationsEnabled) return;

  // Check permission
  const permission = getNotificationPermission();
  if (permission !== 'granted') return;

  // Check if we should show a workout reminder
  if (settings.workoutRemindersEnabled === true) {
    const shouldShowReminder = shouldShowWorkoutReminder(
      settings.lastWorkoutReminderShown,
      settings.workoutReminderTime ?? '09:00',
      settings.workoutReminderDays ?? [1, 2, 3, 4, 5]
    );

    if (shouldShowReminder) {
      await showWorkoutReminderNotification(settings.activeProgramId);
      // Update last shown timestamp
      await db.settings.update(settings.id, {
        lastWorkoutReminderShown: new Date(),
      });
    }
  }

  // Check if we should show a streak reminder
  if (settings.streakRemindersEnabled === true) {
    await checkAndShowStreakReminder();
  }
}

/**
 * Show workout reminder with exercises from recommended day
 */
async function showWorkoutReminderNotification(activeProgramId?: string): Promise<void> {
  if (!activeProgramId) {
    // No active program, show generic reminder
    await showWorkoutReminder('Your Workout', ['Time to train!']);
    return;
  }

  try {
    // Get the active program
    const program = await db.programs.get(activeProgramId);
    if (!program) {
      await showWorkoutReminder('Your Workout', ['Time to train!']);
      return;
    }

    // Find recommended day
    const recDay = await recommendedDay(program);

    // Calculate current week
    const weekNumber = currentWeek(program.startDate, program.totalWeeks);

    // Get the workout template for this day
    const template = await selectTemplate(activeProgramId, weekNumber, recDay);
    if (!template) {
      await showWorkoutReminder('Your Workout', ['Time to train!']);
      return;
    }

    // Get exercises for this template
    const exercises = await db.exerciseTemplates
      .where('workoutTemplateId')
      .equals(template.id)
      .sortBy('orderIndex');

    const exerciseNames = exercises.map((e) => e.name);

    // Show notification with workout details
    await showWorkoutReminder(template.name, exerciseNames);
  } catch (error) {
    console.error('Error showing workout reminder:', error);
    // Fallback to generic reminder
    await showWorkoutReminder('Your Workout', ['Time to train!']);
  }
}

/**
 * Check and show streak reminder if user hasn't worked out in a while
 */
async function checkAndShowStreakReminder(): Promise<void> {
  const settings = await db.settings.toCollection().first();
  if (!settings) return;

  // Get the most recent workout
  const recentWorkouts = await db.workouts
    .orderBy('startedAt')
    .reverse()
    .limit(1)
    .toArray();

  const lastWorkout = recentWorkouts[0];
  const lastWorkoutDate = lastWorkout?.startedAt;

  const shouldShowReminder = shouldShowStreakReminder(
    lastWorkoutDate,
    settings.lastStreakReminderShown,
    2 // Days without workout before reminder
  );

  if (shouldShowReminder && lastWorkoutDate) {
    const daysSinceWorkout = Math.floor(
      (new Date().getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    await showStreakReminder(daysSinceWorkout);

    // Update last shown timestamp
    await db.settings.update(settings.id, {
      lastStreakReminderShown: new Date(),
    });
  }
}

/**
 * Check if user has already worked out today
 * Used to avoid showing reminders if they've already trained
 */
export async function hasWorkedOutToday(): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayWorkouts = await db.workouts
    .where('startedAt')
    .above(today)
    .toArray();

  return todayWorkouts.length > 0;
}
