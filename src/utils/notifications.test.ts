import { describe, it, expect } from 'vitest';
import {
  shouldShowWorkoutReminder,
  shouldShowStreakReminder,
} from './notifications';

describe('Notification Scheduling Logic', () => {
  describe('shouldShowWorkoutReminder', () => {
    it('should return true if current time is past reminder time and today is a reminder day', () => {
      const today = new Date('2024-01-15T10:00:00'); // Monday 10 AM
      const reminderTime = '09:00';
      const reminderDays = [1, 2, 3, 4, 5]; // Mon-Fri
      const lastNotificationDate = undefined;

      // Mock Date.now() to return our test date
      const originalDate = global.Date;
      global.Date = class extends originalDate {
        constructor(...args: any[]) {
          if (args.length === 0) {
            super(today.getTime());
          } else {
            super(...args);
          }
        }
        static now() {
          return today.getTime();
        }
      } as any;

      const result = shouldShowWorkoutReminder(lastNotificationDate, reminderTime, reminderDays);

      global.Date = originalDate;
      expect(result).toBe(true);
    });

    it('should return false if current time is before reminder time', () => {
      const today = new Date('2024-01-15T08:00:00'); // Monday 8 AM
      const reminderTime = '09:00';
      const reminderDays = [1, 2, 3, 4, 5];
      const lastNotificationDate = undefined;

      const originalDate = global.Date;
      global.Date = class extends originalDate {
        constructor(...args: any[]) {
          if (args.length === 0) {
            super(today.getTime());
          } else {
            super(...args);
          }
        }
        static now() {
          return today.getTime();
        }
      } as any;

      const result = shouldShowWorkoutReminder(lastNotificationDate, reminderTime, reminderDays);

      global.Date = originalDate;
      expect(result).toBe(false);
    });

    it('should return false if today is not a reminder day', () => {
      const today = new Date('2024-01-14T10:00:00'); // Sunday 10 AM
      const reminderTime = '09:00';
      const reminderDays = [1, 2, 3, 4, 5]; // Mon-Fri only
      const lastNotificationDate = undefined;

      const originalDate = global.Date;
      global.Date = class extends originalDate {
        constructor(...args: any[]) {
          if (args.length === 0) {
            super(today.getTime());
          } else {
            super(...args);
          }
        }
        static now() {
          return today.getTime();
        }
      } as any;

      const result = shouldShowWorkoutReminder(lastNotificationDate, reminderTime, reminderDays);

      global.Date = originalDate;
      expect(result).toBe(false);
    });

    it('should return false if notification was already shown today', () => {
      const today = new Date('2024-01-15T10:00:00'); // Monday 10 AM
      const reminderTime = '09:00';
      const reminderDays = [1, 2, 3, 4, 5];
      const lastNotificationDate = new Date('2024-01-15T09:05:00'); // Already shown today

      const originalDate = global.Date;
      global.Date = class extends originalDate {
        constructor(...args: any[]) {
          if (args.length === 0) {
            super(today.getTime());
          } else {
            super(...args);
          }
        }
        static now() {
          return today.getTime();
        }
      } as any;

      const result = shouldShowWorkoutReminder(lastNotificationDate, reminderTime, reminderDays);

      global.Date = originalDate;
      expect(result).toBe(false);
    });

    it('should return true if notification was shown yesterday but not today', () => {
      const today = new Date('2024-01-15T10:00:00'); // Monday 10 AM
      const reminderTime = '09:00';
      const reminderDays = [1, 2, 3, 4, 5];
      const lastNotificationDate = new Date('2024-01-14T09:05:00'); // Shown yesterday

      const originalDate = global.Date;
      global.Date = class extends originalDate {
        constructor(...args: any[]) {
          if (args.length === 0) {
            super(today.getTime());
          } else {
            super(...args);
          }
        }
        static now() {
          return today.getTime();
        }
      } as any;

      const result = shouldShowWorkoutReminder(lastNotificationDate, reminderTime, reminderDays);

      global.Date = originalDate;
      expect(result).toBe(true);
    });
  });

  describe('shouldShowStreakReminder', () => {
    it('should return true if user hasnt worked out in 2+ days', () => {
      const today = new Date('2024-01-15T10:00:00');
      const lastWorkoutDate = new Date('2024-01-13T10:00:00'); // 2 days ago
      const lastStreakReminderDate = undefined;

      const originalDate = global.Date;
      global.Date = class extends originalDate {
        constructor(...args: any[]) {
          if (args.length === 0) {
            super(today.getTime());
          } else {
            super(...args);
          }
        }
        static now() {
          return today.getTime();
        }
      } as any;

      const result = shouldShowStreakReminder(lastWorkoutDate, lastStreakReminderDate, 2);

      global.Date = originalDate;
      expect(result).toBe(true);
    });

    it('should return false if user worked out recently (< 2 days)', () => {
      const today = new Date('2024-01-15T10:00:00');
      const lastWorkoutDate = new Date('2024-01-14T10:00:00'); // 1 day ago
      const lastStreakReminderDate = undefined;

      const originalDate = global.Date;
      global.Date = class extends originalDate {
        constructor(...args: any[]) {
          if (args.length === 0) {
            super(today.getTime());
          } else {
            super(...args);
          }
        }
        static now() {
          return today.getTime();
        }
      } as any;

      const result = shouldShowStreakReminder(lastWorkoutDate, lastStreakReminderDate, 2);

      global.Date = originalDate;
      expect(result).toBe(false);
    });

    it('should return false if no workout history exists', () => {
      const lastWorkoutDate = undefined;
      const lastStreakReminderDate = undefined;

      const result = shouldShowStreakReminder(lastWorkoutDate, lastStreakReminderDate, 2);

      expect(result).toBe(false);
    });

    it('should return false if streak reminder was already shown today', () => {
      const today = new Date('2024-01-15T10:00:00');
      const lastWorkoutDate = new Date('2024-01-13T10:00:00'); // 2 days ago
      const lastStreakReminderDate = new Date('2024-01-15T09:00:00'); // Already shown today

      const originalDate = global.Date;
      global.Date = class extends originalDate {
        constructor(...args: any[]) {
          if (args.length === 0) {
            super(today.getTime());
          } else {
            super(...args);
          }
        }
        static now() {
          return today.getTime();
        }
      } as any;

      const result = shouldShowStreakReminder(lastWorkoutDate, lastStreakReminderDate, 2);

      global.Date = originalDate;
      expect(result).toBe(false);
    });

    it('should return true if streak reminder was shown yesterday but not today', () => {
      const today = new Date('2024-01-15T10:00:00');
      const lastWorkoutDate = new Date('2024-01-13T10:00:00'); // 2 days ago
      const lastStreakReminderDate = new Date('2024-01-14T09:00:00'); // Shown yesterday

      const originalDate = global.Date;
      global.Date = class extends originalDate {
        constructor(...args: any[]) {
          if (args.length === 0) {
            super(today.getTime());
          } else {
            super(...args);
          }
        }
        static now() {
          return today.getTime();
        }
      } as any;

      const result = shouldShowStreakReminder(lastWorkoutDate, lastStreakReminderDate, 2);

      global.Date = originalDate;
      expect(result).toBe(true);
    });

    it('should respect custom targetDaysWithoutWorkout parameter', () => {
      const today = new Date('2024-01-15T10:00:00');
      const lastWorkoutDate = new Date('2024-01-12T10:00:00'); // 3 days ago
      const lastStreakReminderDate = undefined;

      const originalDate = global.Date;
      global.Date = class extends originalDate {
        constructor(...args: any[]) {
          if (args.length === 0) {
            super(today.getTime());
          } else {
            super(...args);
          }
        }
        static now() {
          return today.getTime();
        }
      } as any;

      // Should return false with 4-day threshold
      const resultWithHighThreshold = shouldShowStreakReminder(lastWorkoutDate, lastStreakReminderDate, 4);
      expect(resultWithHighThreshold).toBe(false);

      // Should return true with 3-day threshold
      const resultWithLowThreshold = shouldShowStreakReminder(lastWorkoutDate, lastStreakReminderDate, 3);
      expect(resultWithLowThreshold).toBe(true);

      global.Date = originalDate;
    });
  });
});
