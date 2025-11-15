# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.11.0] - 2025-11-15

### Improvements
- Rest timer is always visible when running.
- Log set form clears only exercise change (easier logging).

## [0.10.0] - 2025-11-14

### Features
- **Program Completion Tracking**: Complete and restart training programs with milestone tracking
  - Automatic detection when a program cycle is complete (all weeks finished)
  - Completion banner in Today view with two options:
    - "Mark Complete & Restart": Saves achievement record and restarts program
    - "Just Restart": Restarts program without saving to history
  - Success notification after completion directing users to Progress view
  - Program automatically restarts with start date set to today
- **Training Milestones Section**: New section in Progress view displaying completion history
  - Shows all completed program cycles with achievement stats
  - Displays completion date, duration, total workouts, sets, and volume
  - Numbered achievements (#1, #2, etc.) for motivational tracking
  - Summary card showing total programs completed
- **Database Schema Update**: New `programCompletions` table (v9) for storing completion records
  - Tracks program name, dates, workouts completed, sets, and total volume
  - Uses `programId` for accurate workout matching with backwards compatibility

## [0.9.0] - 2025-11-11

### Features
- **Advanced Training Techniques**: Support for Myoreps and Lengthened Partials training methods
  - Visual badges appear during workouts for exercises marked with these techniques
  - Clickable badges open educational modals explaining how to perform each technique
  - Myoreps: Rest-pause training with activation set + mini-sets (10-20 reps, then 3-5 reps with 10-15s rest)
  - Lengthened Partials: Partial reps focusing on the stretched position for enhanced muscle growth
- **Technique Flag Editor**: New UI for marking exercises with training techniques
  - "Edit Techniques" button in program preview/view mode
  - Easy checkboxes to toggle Myoreps and Lengthened Partials flags per exercise
  - Changes saved directly to database and persist across workouts
- **Automatic Migration**: Existing programs automatically updated with technique flags
  - Smart detection of isolation and accessory exercises suitable for Myoreps
  - Automatic marking of exercises with good stretch positions for Lengthened Partials
  - One-time migration runs on app startup
- **CSV Import/Export Support**: Technique flags included in CSV format
  - New columns: `is_myoreps` and `is_lengthened_partials`
  - Full compatibility with both simple and advanced CSV formats

## [0.8.0] - 2025-11-11

### Features
- **Universal Exercise Substitution**: All exercises now show the substitute button during workouts, not just those with predefined alternatives
  - Exercises with predefined alternatives still show suggested alternatives at the top for quick access
  - Exercises without predefined alternatives now have full access to search through 400+ exercises
  - Improved flexibility for customizing workouts on the fly

### Bug Fixes
- Fixed rest timer to use timestamp-based calculation, ensuring it works correctly when app is closed and reopened
- Timer now properly tracks elapsed time across app sessions

## [0.7.0] - 2025-11-09

### Features
- **Enhanced Exercise Search**: Expanded exercise alternatives feature with comprehensive search functionality
  - Search through 100+ exercises from the entire exercise database
  - Results grouped by muscle group (chest, back, shoulders, biceps, triceps, quads, hamstrings, glutes, calves, core)
  - Maintained "Suggested Alternatives" section for quick access to recommended exercises
  - Real-time search filtering with visual muscle group organization
  - Full dark mode support for new UI elements

### Improvements
- Improved exercise substitution modal with scrollable interface
- Better visual distinction between suggested alternatives and search results

## [0.6.0] - 2024-11-04

### Features
- Streak badges system for consistent workout tracking
- Weekly volume trend chart alongside monthly volume trend
- Exercise state persistence across navigation (selected exercise no longer lost when navigating away)
- Celebration animation on set completion
- Workout export functionality (text and image formats)

### Improvements
- Improved progress tracking with additional trend visualization

## [0.5.0] - 2025-10-30

### Features
- **Interactive Tour**: New guided tour for first-time users showcasing all main features
- Comprehensive 10-step tour covering Today view, Calendar, Progress, and Settings
- Auto-starts on first app launch with proper modal coordination
- Manual restart available from Settings via "Help & Tour" section
- Automatic page navigation between tour steps for seamless experience

### Bug Fixes
- Fixed tour navigation to properly advance through all 10 steps
- Fixed tour state management to prevent accidental restarts
- Fixed element detection and refresh timing for dynamic page transitions

### Improvements
- Enhanced onboarding experience with visual tour guidance
- Better user guidance for discovering app features
- Improved tour completion tracking with localStorage persistence

## [0.4.0] - 2025-10-29

### Features
- **Quick Workout Mode**: New quick workout option that reduces volume by ~30% for busy/tired days
  - Dedicated "⚡ Quick" button on Today view for easy access
  - Automatically reduces set counts while keeping rep targets and exercises the same
  - Perfect for maintaining training consistency when time or energy is limited

### Improvements
- Better visual indicators for quick workouts throughout the app
  - Quick badge displays in active workout header
  - Calendar view shows "⚡ Quick" indicator for completed quick workouts
  - Progress tracking distinguishes quick vs full workouts in charts

## [0.3.0] - 2025-10-28

### Features
- **What's New Modal**: New feature to display changelog information with auto-show on version updates and manual access from Settings
- Organized changelog display with color-coded sections (Features, Bug Fixes, Improvements, Breaking Changes)

### Improvements
- Enhanced user awareness of app updates with beautiful modal interface
- Version tracking with localStorage persistence to avoid repeated notifications

## [0.2.1] - 2025-10-28

### Features
- **Custom Exercise Workflow**: Complete flow for creating and managing custom exercises within workouts
- **Progressive Overload Suggestions**: Smart recommendations for weight/rep progression on exercises
- **Improved Day Selection**: Flexible day selection with improved UI responsiveness

### Bug Fixes
- Fixed active workout selection behavior
- Resolved issue with exercise swap functionality
- Fixed layout issues with day buttons

### Improvements
- Enhanced UI adjustments for better visual consistency
- Improved workout preview display with clearer week indicators
- Better organization of workouts in the preview view

## [0.1.0] - 2025-09-15

### Features
- **Dark Mode**: Toggle between light and dark themes with persistent preference
- **Program Variations**: Support for periodized programs with exercise variations across weeks
- **Comprehensive Exercise Library**: Built-in exercises and custom exercise support
- **Offline-First PWA**: Full offline functionality with local IndexedDB storage
- **Workout Tracking**: Log sets, reps, and RPE for each exercise
- **Progress Analytics**: Track progress with charts and historical data
- **Calendar View**: Visual calendar of workout history

### Features (Initial Release)
- Core workout tracking system
- Template-based programs (3-Day, 5-Day, Upper/Lower, Minimal Effort)
- CSV import/export functionality
- Rest timer functionality
- Responsive mobile-first design
