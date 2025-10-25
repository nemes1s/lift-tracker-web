# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

LiftTracker Web is a Progressive Web App (PWA) for tracking weightlifting workouts. It's a React + TypeScript application that stores all data locally in IndexedDB using Dexie.js. The app is designed to work offline-first with no backend dependencies.

## Development Commands

```bash
# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Type check
tsc -b

# Lint code
npm run lint

# Preview production build
npm run preview

# Bump version (used in CI/CD)
npm run version:bump
```

## Architecture Overview

### Data Layer Architecture

The app uses a **template-based workout system** with week-based progression:

1. **Programs** contain multiple **WorkoutTemplates** (one per day + week combination)
2. **WorkoutTemplates** have a `weekNumber` field (1, 5, 9, etc.) to enable exercise variations
3. **ExerciseTemplates** define the exercises for each WorkoutTemplate
4. When a workout is started, templates are **instantiated** into:
   - **Workout** (the active/completed workout session)
   - **ExerciseInstance** (exercises for this specific workout)
   - **SetRecord** (individual logged sets)

**Key insight**: The `selectTemplate()` function (in `src/utils/programLogic.ts:33-53`) finds templates by querying for the highest `weekNumber <= currentWeek`. This allows week ranges to work (e.g., week 2-4 use the week 1 template, weeks 6-8 use the week 5 template).

### Database Schema (Dexie.js)

All data is stored in IndexedDB via `src/db/database.ts`:

- **programs** - Training program definitions
- **workoutTemplates** - Day templates with `weekNumber` for periodization
- **exerciseTemplates** - Exercise definitions within templates
- **workouts** - Workout instances (sessions)
- **exerciseInstances** - Exercise instances within workouts
- **setRecords** - Individual set logs (weight, reps, RPE)
- **personalRecords** - PR tracking
- **settings** - App settings (includes `activeProgramId`)

**Important indexes**:
- `workoutTemplates` has compound index `[programId+weekNumber+dayIndex]` for efficient template queries
- Query patterns: Always filter by `programId` first, then by `dayIndex` and/or `weekNumber`

### State Management

**Zustand** (`src/store/appStore.ts`) manages:
- `activeProgram` - Currently selected program
- `activeWorkout` - Currently active workout session (null when no workout in progress)
- `selectedDayIndex` - Which day (0-6) the user has selected
- `weekNumber` - Current week in the program (calculated from `program.startDate`)
- `darkMode` - Theme preference (persisted to localStorage)
- `refreshTrigger` - Counter to force re-renders when data changes

**Important**: Most state is ephemeral except `darkMode`. Database queries happen in components/pages.

### Program Templates System

Programs support **3-phase periodization** with exercise variations:

- **Weeks 1-4**: Base Phase (foundation exercises)
- **Weeks 5-8**: Variation Phase (different exercises, higher volume)
- **Weeks 9-12**: Strength Phase (heavy compounds, lower reps)

Built-in programs in `src/utils/programTemplates.ts`:
- 3-Day Split: 9 templates (3 days × 3 phases)
- 5-Day Split: 15 templates (5 days × 3 phases)
- Upper/Lower 4-Day: 12 templates (4 days × 3 phases)
- Minimal Effort 4-Day: 12 templates (4 days × 3 phases)

**When creating new templates**, always include:
1. Multiple entries with different `weekNumber` values (1, 5, 9)
2. Different exercises for each phase
3. Progressive overload (lower reps, higher sets in strength phase)

### CSV Import/Export

The app supports two CSV formats (see `src/utils/csvParser.ts`):

**Format 1** (Simple, comma-delimited):
```csv
Program Name,My Program
Total Weeks,12
Day Index,Day Name,Exercise Name,Sets,Reps,Notes
0,Push Day,Bench Press,3,8-10,
```

**Format 2** (Advanced, semicolon-delimited, week-specific):
```csv
week;day_index;workout_name;exercise_name;target_sets;target_reps;notes
1;0;Upper A;Bench Press;4;6-8;Focus on form
5;0;Upper A;Dumbbell Press;4;8-10;
```

Format 2 allows defining different exercises per week for periodization.

### Navigation Structure

5 main pages (see `src/App.tsx` for routing):

- **TodayView** (`/`) - Select and start workouts, shows recommended day
- **ProgressView** (`/progress`) - Charts and exercise history
- **CalendarView** (`/calendar`) - Workout history calendar
- **ProgramPreviewView** (`/programs`) - View/create/import programs
- **SettingsView** (`/settings`) - App settings, active program selection

### Key Utility Functions

**`src/utils/programLogic.ts`**:
- `currentWeek()` - Calculates current week from program start date
- `selectTemplate()` - Finds appropriate template for week + day (uses `weekNumber <= currentWeek` logic)
- `recommendedDay()` - Suggests next workout based on history
- `instantiateWorkout()` - Creates Workout + ExerciseInstances from template
- `previousWorkoutInstances()` - Fetches history for "last time" reference

**`src/utils/workoutCleanup.ts`**:
- `cleanupAbandonedWorkouts()` - Deletes unfinished workouts from previous days (runs on app init)

## Important Patterns

### Adding Exercise Variations

When updating programs with exercise variations across weeks:

1. Add `weekNumber` field to each day object (1, 5, 9 for 12-week programs)
2. Create multiple entries for the same `dayIndex` with different `weekNumber` values
3. Ensure the loop uses `day.weekNumber` instead of hardcoded `1`:
   ```typescript
   const template: WorkoutTemplate = {
     id: templateId,
     name: day.name,
     dayIndex: day.idx,
     weekNumber: day.weekNumber,  // NOT hardcoded to 1
     programId,
   };
   ```

### Querying Templates

Always query templates by `programId` first, then filter by `dayIndex` and `weekNumber`:

```typescript
const templates = await db.workoutTemplates
  .where({ programId, dayIndex })
  .toArray();

// Then filter by weekNumber in memory
const validTemplates = templates.filter(t => t.weekNumber <= currentWeek);
validTemplates.sort((a, b) => b.weekNumber - a.weekNumber);
return validTemplates[0];
```

### Triggering UI Refresh

After database mutations, trigger a refresh:
```typescript
const { triggerRefresh } = useAppStore();
// ... perform database operations
triggerRefresh();
```

### Workout Flow

1. User selects day in TodayView → `setSelectedDayIndex()`
2. Click "Start Workout" → `instantiateWorkout(template)` creates Workout + ExerciseInstances
3. `setActiveWorkout(workout)` stores in Zustand
4. WorkoutRunner component shows exercises, user logs sets → creates SetRecords
5. Click "Finish Workout" → sets `workout.endedAt` → clears `activeWorkout`

## Component Organization Guidelines

**Prefer small, focused component files over large monolithic ones.** Use a **Page → Section → Component** structure:

### Structure Hierarchy

1. **Pages** (`src/pages/*.tsx`) - Route-level components (200-300 lines max)
   - Handle routing, data fetching, and page-level state
   - Compose Sections together
   - Example: `TodayView`, `ProgressView`, `SettingsView`

2. **Sections** (`src/components/[PageName]/*.tsx`) - Major functional areas (100-200 lines max)
   - Represent distinct UI sections within a page
   - Handle section-specific logic and state
   - Example: `WorkoutHeader`, `ExerciseList`, `StatsPanel`, `ProgramSettings`

3. **Components** (`src/components/*.tsx` or `src/components/shared/*.tsx`) - Reusable UI elements (50-100 lines max)
   - Small, focused, reusable pieces
   - Minimal logic, mostly presentational
   - Example: `Button`, `Card`, `ExerciseCard`, `SetRow`, `Modal`

### When to Extract a Component

Extract when:
- A file exceeds 300 lines
- A logical section of UI can be named (e.g., "Exercise List Section")
- Code is repeated across pages
- A section has its own useState/useEffect
- Testing or debugging becomes difficult

### Example Structure

```
src/
├── pages/
│   ├── ProgressView.tsx          (Page - orchestrates sections)
│   └── SettingsView.tsx          (Page - orchestrates sections)
├── components/
│   ├── ProgressView/             (Sections for ProgressView)
│   │   ├── ExerciseStatsSection.tsx
│   │   ├── ProgressChartSection.tsx
│   │   └── WorkoutHistorySection.tsx
│   ├── SettingsView/             (Sections for SettingsView)
│   │   ├── ProgramSettingsSection.tsx
│   │   ├── RestTimerSection.tsx
│   │   └── DataManagementSection.tsx
│   ├── shared/                   (Reusable components)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   ├── WorkoutRunner.tsx         (Complex component - could be split)
│   └── Layout.tsx
```

### Current Large Files to Refactor

When working on these files, consider breaking them into sections:
- `WorkoutRunner.tsx` (847 lines) → Extract: ExerciseListSection, SetLoggerSection, WorkoutControlsSection
- `SettingsView.tsx` (863 lines) → Extract: ProgramSettingsSection, RestTimerSection, DataManagementSection
- `ProgressView.tsx` (552 lines) → Extract: ExerciseStatsSection, ProgressChartSection
- `CalendarView.tsx` (466 lines) → Extract: CalendarHeaderSection, WorkoutCalendarSection

## Tech Stack Details

- **React 19** + **TypeScript** - UI framework
- **Vite** - Build tool with PWA plugin
- **React Router v7** - Client-side routing
- **Zustand** - Lightweight state management
- **Dexie.js** - IndexedDB wrapper
- **Tailwind CSS v4** - Utility-first styling
- **Lucide React** - Icon library
- **Recharts** - Charts for progress tracking

## Database Versioning

Database schema versions are managed in `src/db/database.ts`:
- Version 1: Initial schema
- Version 2: Added compound index for workoutTemplates
- Version 3: Added disclaimer fields (no schema change)
- Version 4: Added rest timer fields (no schema change)

Dexie automatically handles schema migrations. New optional fields don't require schema changes.
