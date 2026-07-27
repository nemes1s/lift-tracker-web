import { useState } from 'react';
import { Bell } from 'lucide-react';
import type { SettingsModel } from '../../types/models';
import {
  requestNotificationPermission,
  getNotificationPermission,
  isNotificationSupported,
  showWorkoutReminder,
} from '../../utils/notifications';
import { SettingsRows } from './SettingsRows';
import { SettingsToggle } from './SettingsToggle';

interface NotificationSettingsSectionProps {
  settings: SettingsModel | null;
  onToggle: (field: keyof SettingsModel, value: boolean) => void;
  onTimeChange: (time: string) => void;
  onDaysChange: (days: number[]) => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function NotificationSettingsSection({
  settings,
  onToggle,
  onTimeChange,
  onDaysChange,
}: NotificationSettingsSectionProps) {
  const [permissionStatus, setPermissionStatus] = useState(getNotificationPermission());
  const isSupported = isNotificationSupported();
  const selectedDays = settings?.workoutReminderDays ?? [1, 2, 3, 4, 5]; // Mon-Fri default

  const handleRequestPermission = async () => {
    const permission = await requestNotificationPermission();
    setPermissionStatus(permission);
    if (permission === 'granted') {
      // Enable notifications in settings
      onToggle('notificationsEnabled', true);
    }
  };

  const handleTestNotification = async () => {
    await showWorkoutReminder('Push Day', ['Bench Press', 'Overhead Press', 'Tricep Extensions']);
  };

  const toggleDay = (dayIndex: number) => {
    const newDays = selectedDays.includes(dayIndex)
      ? selectedDays.filter((d) => d !== dayIndex)
      : [...selectedDays, dayIndex].sort();
    onDaysChange(newDays);
  };

  return (
    <SettingsRows>
      {!isSupported && (
        <div className="py-4 first:pt-0 last:pb-0">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl p-4">
            Push notifications are not supported on this browser or device.
          </p>
        </div>
      )}

      {isSupported && permissionStatus === 'denied' && (
        <div className="py-4 first:pt-0 last:pb-0">
          <p className="text-sm text-red-800 dark:text-red-200 bg-red-50 dark:bg-red-900/30 rounded-xl p-4">
            Notifications are blocked. Please enable them in your browser settings.
          </p>
        </div>
      )}

      {isSupported && permissionStatus !== 'granted' && (
        <div className="py-4 first:pt-0 last:pb-0">
          <button
            onClick={handleRequestPermission}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all font-bold shadow-sm hover:shadow-md"
          >
            <Bell className="w-5 h-5" />
            <span>Enable Notifications</span>
          </button>
        </div>
      )}

      {isSupported && permissionStatus === 'granted' && (
        <div className="py-4 first:pt-0 last:pb-0">
          <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications enabled
          </p>
        </div>
      )}

      {permissionStatus === 'granted' && (
        <>
          <SettingsToggle
            label="Enable All Notifications"
            description="Master switch for all notification types"
            checked={settings?.notificationsEnabled === true}
            onChange={(checked) => onToggle('notificationsEnabled', checked)}
          />

          <SettingsToggle
            label="Workout Reminders"
            description="Daily reminder to work out"
            checked={settings?.workoutRemindersEnabled === true}
            onChange={(checked) => onToggle('workoutRemindersEnabled', checked)}
            disabled={!settings?.notificationsEnabled}
          />

          {settings?.notificationsEnabled && settings?.workoutRemindersEnabled && (
            <div className="py-4">
              <span className="font-bold text-gray-900 dark:text-gray-100 block mb-2">Reminder Time</span>
              <input
                type="time"
                value={settings?.workoutReminderTime ?? '09:00'}
                onChange={(e) => onTimeChange(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-100 rounded-lg font-bold text-gray-900 text-lg"
              />
            </div>
          )}

          {settings?.notificationsEnabled && settings?.workoutRemindersEnabled && (
            <div className="py-4">
              <span className="font-bold text-gray-900 dark:text-gray-100 block mb-2">Reminder Days</span>
              <div className="grid grid-cols-7 gap-2">
                {DAYS.map((day, index) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(index)}
                    className={`py-3 rounded-lg font-bold text-sm transition-all border-2 ${
                      selectedDays.includes(index)
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          <SettingsToggle
            label="Rest Timer Alerts"
            description="Push notification when timer completes"
            checked={settings?.restTimerNotifications === true}
            onChange={(checked) => onToggle('restTimerNotifications', checked)}
            disabled={!settings?.notificationsEnabled}
          />

          <SettingsToggle
            label="Streak Reminders"
            description="Remind me if I miss 2+ days"
            checked={settings?.streakRemindersEnabled === true}
            onChange={(checked) => onToggle('streakRemindersEnabled', checked)}
            disabled={!settings?.notificationsEnabled}
          />

          <div className="py-4 first:pt-0 last:pb-0">
            <button
              onClick={handleTestNotification}
              className="text-sm font-bold text-primary-600 dark:text-primary-400 hover:underline"
            >
              Test Notification
            </button>
          </div>
        </>
      )}
    </SettingsRows>
  );
}
