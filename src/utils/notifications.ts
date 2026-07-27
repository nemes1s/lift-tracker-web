// Notification utilities for workout reminders and rest timer alerts

/**
 * Check if the browser supports notifications
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request notification permission from the user
 * Should only be called in response to user interaction
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
}

/**
 * Show a notification (works when app is open or closed if service worker is registered)
 */
export async function showNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return;
  }

  try {
    // Try to use service worker notification (works even when app is closed)
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        ...options,
      });
    } else {
      // Fallback to regular notification (only works when app is open)
      new Notification(title, {
        icon: '/icon-192.png',
        ...options,
      });
    }
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

/**
 * Show workout reminder notification
 */
export async function showWorkoutReminder(
  workoutName: string,
  exercises: string[]
): Promise<void> {
  const title = '🏋️ Time for your workout!';
  const exerciseList = exercises.slice(0, 3).join(', ');
  const moreCount = exercises.length > 3 ? ` +${exercises.length - 3} more` : '';

  await showNotification(title, {
    body: `${workoutName}\n${exerciseList}${moreCount}`,
    tag: 'workout-reminder',
    requireInteraction: false,
    data: {
      type: 'workout-reminder',
      url: '/',
    },
  });
}

/**
 * Show rest timer complete notification
 */
export async function showRestTimerComplete(): Promise<void> {
  const title = '⏰ Rest time over!';

  await showNotification(title, {
    body: 'Time for your next set',
    tag: 'rest-timer',
    requireInteraction: false,
    data: {
      type: 'rest-timer',
      url: '/',
    },
  });
}

/**
 * Show streak reminder notification
 */
export async function showStreakReminder(daysWithoutWorkout: number): Promise<void> {
  const title = '🔥 Keep your streak alive!';
  const body = `It's been ${daysWithoutWorkout} days since your last workout. Time to get back at it!`;

  await showNotification(title, {
    body,
    tag: 'streak-reminder',
    requireInteraction: false,
    data: {
      type: 'streak-reminder',
      url: '/',
    },
  });
}

/**
 * Schedule daily check for workout reminders
 * This should be called when the app opens
 */
export function shouldShowWorkoutReminder(
  lastNotificationDate: Date | undefined,
  reminderTime: string, // "09:00" format
  reminderDays: number[] // [0,1,2,3,4,5,6] for Sun-Sat
): boolean {
  const now = new Date();
  const today = now.getDay(); // 0 = Sunday, 6 = Saturday

  // Check if today is a reminder day
  if (!reminderDays.includes(today)) {
    return false;
  }

  // Parse reminder time
  const [hours, minutes] = reminderTime.split(':').map(Number);
  const reminderDateTime = new Date(now);
  reminderDateTime.setHours(hours, minutes, 0, 0);

  // Check if we've passed the reminder time today
  if (now < reminderDateTime) {
    return false;
  }

  // Check if we already showed a notification today
  if (lastNotificationDate) {
    const lastNotificationDay = new Date(lastNotificationDate);
    lastNotificationDay.setHours(0, 0, 0, 0);
    const todayDay = new Date(now);
    todayDay.setHours(0, 0, 0, 0);

    if (lastNotificationDay.getTime() === todayDay.getTime()) {
      return false; // Already showed today
    }
  }

  return true;
}

/**
 * Check if user needs a streak reminder
 */
export function shouldShowStreakReminder(
  lastWorkoutDate: Date | undefined,
  lastStreakReminderDate: Date | undefined,
  targetDaysWithoutWorkout: number = 2
): boolean {
  if (!lastWorkoutDate) {
    return false; // No workouts yet
  }

  const now = new Date();
  const daysSinceWorkout = Math.floor((now.getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24));

  // Check if enough days have passed without a workout
  if (daysSinceWorkout < targetDaysWithoutWorkout) {
    return false;
  }

  // Check if we already showed a streak reminder today
  if (lastStreakReminderDate) {
    const lastReminderDay = new Date(lastStreakReminderDate);
    lastReminderDay.setHours(0, 0, 0, 0);
    const todayDay = new Date(now);
    todayDay.setHours(0, 0, 0, 0);

    if (lastReminderDay.getTime() === todayDay.getTime()) {
      return false; // Already showed today
    }
  }

  return true;
}
