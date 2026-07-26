# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

LiftTracker Web is a Progressive Web App (PWA) for tracking weightlifting workouts. It's a React + TypeScript application that stores all data locally in IndexedDB using Dexie.js. The app is designed to work offline-first with no backend dependencies.

## Development Commands

```bash
# Start development server (http://localhost:5173)
pnpm run dev

# Build for production (runs tsc -b then vite build)
pnpm run build

# Type check only
tsc -b

# Lint
pnpm run lint

# Run tests in watch mode
pnpm test

# Run tests once (CI mode)
pnpm run test:run

# Run a single test file
pnpm test src/utils/programLogic.test.ts

# Run tests with coverage
pnpm run test:coverage
```

Pre-deployment: `pnpm run test:run && pnpm run build`

## Architecture Overview

### Data Layer

The app uses a **template-based workout system** with week-based progression:

1. **Programs** contain multiple **WorkoutTemplates** (one per day + week combination)
2. **WorkoutTemplates** have a `weekNumber` field (1, 5, 9…) to enable phase-based exercise variations
3. When a workout is started, templates are **instantiated** into live records: `Workout` → `ExerciseInstance` → `SetRecord`

**Key insight**: `selectTemplate()` (`src/utils/programLogic.ts`) finds the template with the highest `weekNumber <= currentWeek`. This means weeks 2–4 use the week-1 template, weeks 6–8 use the week-5 template, etc.

### Database Schema (Dexie.js) — `src/db/database.ts`

Currently at **version 9**. Tables:

| Table | Key fields |
|---|---|
| `programs` | `id`, `name`, `startDate`, `totalWeeks` |
| `workoutTemplates` | `id`, `programId`, `dayIndex`, `weekNumber`, compound index `[programId+weekNumber+dayIndex]` |
| `exerciseTemplates` | `id`, `workoutTemplateId`, `orderIndex` |
| `workouts` | `id`, `startedAt`, `endedAt`, `programId` |
| `exerciseInstances` | `id`, `workoutId`, `orderIndex` |
| `setRecords` | `id`, `exerciseId`, `timestamp` |
| `personalRecords` | `id`, `exerciseName`, `occurredAt` |
| `settings` | `id` (singleton row) |
| `programCompletions` | `id`, `programId`, `completionDate` |

New optional fields on existing records don't require a schema version bump — Dexie handles them automatically. Only add a new version when adding tables or indexes.

Query pattern: always filter by `programId` first, then `dayIndex` / `weekNumber` in memory.

### State Management — `src/store/appStore.ts`

Zustand store persisted to `localStorage` under key `app-storage`. Only these fields survive page reload:

- `darkMode`, `lastSeenVersion`, `tourCompleted`, `restTimer`, `progressPreferences`

Ephemeral (reset on reload): `activeProgram`, `activeWorkout`, `selectedDayIndex`, `currentExerciseIndex`, `weekNumber`, `refreshTrigger`.

After any database mutation, call `triggerRefresh()` to force component re-renders.

### App Startup Sequence — `src/App.tsx`

On mount, `App` runs in parallel:
1. `initializePersistence()` — requests browser persistent storage for IndexedDB
2. `checkDisclaimer()` — shows disclaimer modal if not permanently accepted (re-shows every 24h)
3. `checkWhatsNew()` — shows What's New modal when `APP_VERSION` differs from `lastSeenVersion`
4. `runMigrations()` — two data migrations run once and are tracked in `settings`: technique-flags backfill and `programId` backfill on workouts

After splash + hydration: if no active program → show `InitialProgramSelection`; else if tour not completed → auto-start `Tour` after 1 s.

### Workout Flow

1. User selects day in `TodayView` → `setSelectedDayIndex()`
2. "Start Workout" → `instantiateWorkout(template)` writes `Workout` + `ExerciseInstance` rows to DB; quick workout mode reduces sets to ~70%
3. `setActiveWorkout(workout)` stores in Zustand
4. `WorkoutRunner` shows exercises; user logs sets → creates `SetRecord` rows
5. "Finish Workout" → sets `workout.endedAt` → clears `activeWorkout`
6. `cleanupAbandonedWorkouts()` runs on app init to delete unfinished workouts from previous days

### Progressive Overload Logic

`getProgressiveOverloadSuggestion()` in `programLogic.ts` analyzes last 3 completed workouts:
- If consistently hitting upper rep bound (≥2 of 3 sessions) → suggest rep range increase
- If hit upper bound once → suggest adaptive weight increase (5% / 3.75% / 2.5% based on weight magnitude)
- If not yet hitting upper bound → suggest keeping weight

### Program Templates System

Programs support 3-phase periodization by having 3 template entries per day:
- **Week 1** — base phase
- **Week 5** — variation phase (higher volume, different exercises)
- **Week 9** — strength phase (heavy compounds, lower reps)

Built-in programs are defined in `src/utils/programTemplates.ts`. When creating new programs, always include all three `weekNumber` entries per day.

### CSV Import — `src/utils/csvParser.ts`

Two supported formats:

**Format 1** (comma-delimited, no week-specificity):
```csv
Program Name,My Program
Total Weeks,12
Day Index,Day Name,Exercise Name,Sets,Reps,Notes
0,Push Day,Bench Press,3,8-10,
```

**Format 2** (semicolon-delimited, week-specific for periodization):
```csv
week;day_index;workout_name;exercise_name;target_sets;target_reps;notes
1;0;Upper A;Bench Press;4;6-8;Focus on form
5;0;Upper A;Dumbbell Press;4;8-10;
```

### Exercise Substitutions — `src/data/exerciseSubstitutions.ts`

Contains `EXERCISE_SUBSTITUTIONS` map (40+ exercises, 2 substitutions each) plus helpers:
- `getExerciseSubstitutions(name)` — direct alternatives
- `getAllPossibleSubstitutions(name)` — bidirectional lookup
- `getExerciseNotes(name)` — form cues
- `searchExercises(query)` — partial name match

### Navigation — `src/App.tsx`

| Route | Component | Purpose |
|---|---|---|
| `/` | `TodayView` | Select day, start workout |
| `/calendar` | `CalendarView` | Workout history calendar |
| `/workout/:id` | `WorkoutDetail` | Single workout detail |
| `/progress` | `ProgressView` | Charts and PRs |
| `/settings` | `SettingsView` | Program management, preferences |
| `/program/preview` | `ProgramPreviewView` | View/create/import programs |

## Testing

Tests use **Vitest** + **React Testing Library**. IndexedDB is mocked with `fake-indexeddb` (configured in `src/test/setup.ts`).

Test files sit next to the files they test (`.test.ts` / `.test.tsx`), except integration tests which live in `src/test/`.

Always `clear()` all relevant DB tables in `beforeEach()` for isolation. Use helpers from `src/test/testUtils.tsx` (`createMockProgram`, `createMockWorkoutTemplate`, `createMockExerciseTemplate`, `renderWithProviders`).

Critical coverage areas: `programLogic.ts` (week calculation, template selection, instantiation, progressive overload), `csvParser.ts` (both formats, edge cases), and `src/test/workoutFlow.test.ts` (end-to-end workout lifecycle).

## Component Organization

Follow a **Page → Section → Component** hierarchy:

- **Pages** (`src/pages/*.tsx`) — route-level, 200–300 lines max; compose sections
- **Sections** (`src/components/[PageName]/*.tsx`) — major functional areas, 100–200 lines
- **Components** (`src/components/shared/*.tsx`) — reusable, presentational, 50–100 lines

Extract into a new section when a file exceeds 300 lines or a UI area has its own state.

## Key Patterns

### Querying templates

```typescript
const templates = await db.workoutTemplates
  .where({ programId, dayIndex })
  .toArray();

const validTemplates = templates.filter(t => t.weekNumber <= currentWeek);
validTemplates.sort((a, b) => b.weekNumber - a.weekNumber);
return validTemplates[0];
```

### Creating programs with week variations

Always include `weekNumber` from the data structure, not hardcoded to `1`:
```typescript
const template: WorkoutTemplate = {
  weekNumber: day.weekNumber,  // NOT hardcoded to 1
  ...
};
```

### Weight units

`SetRecord.weight` is always stored in **kilograms**. Convert for display using `src/utils/weightUnit.ts` based on `settings.weightUnit`.

## Tech Stack

- **React 19** + **TypeScript** — UI framework
- **Vite 7** + `vite-plugin-pwa` — build tool and PWA support
- **React Router v7** — client-side routing
- **Zustand 5** — state management (`persist` middleware for localStorage)
- **Dexie.js 4** — IndexedDB wrapper
- **Tailwind CSS v4** — styling (use `dark:` prefix for dark-mode variants)
- **Recharts** — progress charts
- **Lucide React** — icons
- **driver.js** — guided tour
- **html2canvas + jspdf** — PDF export

## Version Bumps

A `pre-push` git hook bumps `package.json` version and `src/version.ts` automatically based on a release tag in the latest commit message: `[release-major]`, `[release-minor]`, or `[release-patch]` (see `scripts/bump-version.js`). No tag means no bump.

**Before making a commit or opening a PR for a feature or fix, ask the user which bump level applies (or suggest one) and include the matching tag in the commit message.** Default guidance:
- `[release-patch]` — bug fixes, small tweaks
- `[release-minor]` — new features, non-breaking additions
- `[release-major]` — breaking changes

Skip asking for commits that don't ship user-facing behavior (docs, tests, CI/config-only changes).

## Changelog

`CHANGELOG.md` tracks only major and minor releases, not patches.
