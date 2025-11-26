import { useState } from 'react';
import { Bell } from 'lucide-react';
import type { SettingsModel } from '../../types/models';
import {
  requestNotificationPermission,
  getNotificationPermission,
  isNotificationSupported,
  showWorkoutReminder,
} from '../../utils/notifications';

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
    <div className="card p-6 bg-white dark:bg-slate-800">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        <h2 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Push Notifications</h2>
      </div>

      {!isSupported && (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Push notifications are not supported on this browser or device.
          </p>
        </div>
      )}

      {isSupported && permissionStatus === 'denied' && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-800 dark:text-red-200">
            Notifications are blocked. Please enable them in your browser settings.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {/* Permission Request */}
        {isSupported && permissionStatus !== 'granted' && (
          <button
            onClick={handleRequestPermission}
            className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all font-bold shadow-sm hover:shadow-md"
          >
            <Bell className="w-5 h-5" />
            <span>Enable Notifications</span>
          </button>
        )}

        {/* Permission Status */}
        {isSupported && permissionStatus === 'granted' && (
          <div className="p-4 bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-800 rounded-xl">
            <p className="text-sm text-green-800 dark:text-green-200 flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications enabled
            </p>
          </div>
        )}

        {/* Enable Workout Reminders */}
        {permissionStatus === 'granted' && (
          <>
            <label className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border-2 border-gray-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all cursor-pointer">
              <div>
                <span className="font-bold text-gray-900 dark:text-gray-100 block">Workout Reminders</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">Daily reminder to work out</span>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={settings?.notificationsEnabled === true}
                  onChange={(e) => onToggle('notificationsEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
              </div>
            </label>

            {/* Reminder Time */}
            {settings?.notificationsEnabled && (
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border-2 border-gray-200 dark:border-slate-700">
                <label className="block mb-3">
                  <span className="font-bold text-gray-900 dark:text-gray-100 block mb-1">Reminder Time</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">What time should we remind you?</span>
                </label>
                <input
                  type="time"
                  value={settings?.workoutReminderTime ?? '09:00'}
                  onChange={(e) => onTimeChange(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-100 rounded-lg font-bold text-gray-900 text-lg"
                />
              </div>
            )}

            {/* Reminder Days */}
            {settings?.notificationsEnabled && (
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border-2 border-gray-200 dark:border-slate-700">
                <label className="block mb-3">
                  <span className="font-bold text-gray-900 dark:text-gray-100 block mb-1">Reminder Days</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Which days should we remind you?</span>
                </label>
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

            {/* Rest Timer Notifications */}
            <label className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border-2 border-gray-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all cursor-pointer">
              <div>
                <span className="font-bold text-gray-900 dark:text-gray-100 block">Rest Timer Alerts</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">Push notification when timer completes</span>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={settings?.restTimerNotifications !== false}
                  onChange={(e) => onToggle('restTimerNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
              </div>
            </label>

            {/* Streak Reminders */}
            <label className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border-2 border-gray-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all cursor-pointer">
              <div>
                <span className="font-bold text-gray-900 dark:text-gray-100 block">Streak Reminders</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">Remind me if I miss 2+ days</span>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={settings?.streakRemindersEnabled !== false}
                  onChange={(e) => onToggle('streakRemindersEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
              </div>
            </label>

            {/* Test Notification Button */}
            <button
              onClick={handleTestNotification}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-xl transition-all font-bold shadow-sm hover:shadow-md border-2 border-blue-200 dark:border-blue-800"
            >
              <Bell className="w-5 h-5" />
              <span>Test Notification</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
