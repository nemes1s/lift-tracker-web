import type { Config } from 'driver.js';

export const tourSteps: Config['steps'] = [
  {
    element: '[data-tour="welcome"]',
    popover: {
      title: 'Welcome to LiftTracker! 💪',
      description:
        'Track your weightlifting workouts with ease. This quick tour will show you the main features of the app.',
      side: 'bottom',
      align: 'start',
    },
  },
  {
    element: '[data-tour="select-day"]',
    popover: {
      title: 'Select Your Workout',
      description:
        'Choose which day of your program you want to work out. The recommended day is highlighted.',
      side: 'bottom',
      align: 'center',
    },
  },
  {
    element: '[data-tour="start-workout"]',
    popover: {
      title: 'Start Your Workout',
      description:
        'Click here to begin your workout. You can log sets, reps, and weight for each exercise.',
      side: 'left',
      align: 'center',
    },
  },
  {
    element: '[data-tour="nav-calendar"]',
    popover: {
      title: 'Workout Calendar',
      description: 'View your past workouts on a calendar and see your workout history.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '[data-tour="nav-progress"]',
    popover: {
      title: 'Track Progress',
      description:
        'View charts and analytics of your exercise performance over time.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '[data-tour="nav-settings"]',
    popover: {
      title: 'Settings',
      description: 'Manage your programs, import/export, and app preferences.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '[data-tour="settings-programs"]',
    popover: {
      title: 'Select Active Program',
      description:
        'Choose which training program you want to follow. You can have multiple programs stored.',
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '[data-tour="import-program"]',
    popover: {
      title: 'Import Programs',
      description:
        'Import custom workout programs from CSV files. Perfect for custom training plans!',
      side: 'left',
      align: 'center',
    },
  },
  {
    element: '[data-tour="export-program"]',
    popover: {
      title: 'Export Programs',
      description:
        'Export your programs to CSV format. Back up your data or share with training partners.',
      side: 'left',
      align: 'center',
    },
  },
  {
    element: '[data-tour="program-preview"]',
    popover: {
      title: 'Program Library',
      description:
        'Create new programs from templates or view detailed program information.',
      side: 'left',
      align: 'start',
    },
  },
];

export const tourConfigWithSteps: Config = {
  showProgress: true,
  steps: tourSteps,
  popoverClass: 'driver-tour-popover',
  overlayColor: 'rgba(0, 0, 0, 0.5)',
  allowClose: true,
  stagePadding: 8,
  stageRadius: 8,
};

export const settingsPageTourSteps: Config['steps'] = [
  {
    element: '[data-tour="settings-programs"]',
    popover: {
      title: 'Manage Programs',
      description:
        'Select your active training program. You can create custom programs or use built-in templates.',
      side: 'left',
      align: 'start',
    },
  },
  {
    element: '[data-tour="import-program"]',
    popover: {
      title: 'Import Programs',
      description:
        'Import custom workout programs from CSV files. Supports both simple and advanced formats.',
      side: 'left',
      align: 'center',
    },
  },
  {
    element: '[data-tour="export-program"]',
    popover: {
      title: 'Export Programs',
      description:
        'Export your programs to CSV format. Back up your programs or share with others.',
      side: 'left',
      align: 'center',
    },
  },
  {
    element: '[data-tour="program-preview"]',
    popover: {
      title: 'Program Library',
      description:
        'Browse all available programs, create new ones, and manage your training templates.',
      side: 'left',
      align: 'start',
    },
  },
];

export const extendedTourConfig: Config = {
  showProgress: true,
  popoverClass: 'driver-tour-popover',
  overlayColor: 'rgba(0, 0, 0, 0.5)',
  allowClose: true,
  stagePadding: 8,
  stageRadius: 8,
};
