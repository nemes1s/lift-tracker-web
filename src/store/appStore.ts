import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Program, Workout } from '../types/models';

interface RestTimerState {
  isActive: boolean;
  secondsLeft: number;
  duration: number;
  isCompleted: boolean;
}

interface AppState {
  activeProgram: Program | null;
  activeWorkout: Workout | null;
  selectedDayIndex: number;
  weekNumber: number;
  showSplash: boolean;
  darkMode: boolean;
  whatsNewOpen: boolean;
  lastSeenVersion: string | null;
  restTimer: RestTimerState;
  tourCompleted: boolean;
  tourActive: boolean;
  isHydrated: boolean;

  setActiveProgram: (program: Program | null) => void;
  setActiveWorkout: (workout: Workout | null) => void;
  setSelectedDayIndex: (index: number) => void;
  setWeekNumber: (week: number) => void;
  setShowSplash: (show: boolean) => void;
  setDarkMode: (enabled: boolean) => void;
  toggleDarkMode: () => void;
  setWhatsNewOpen: (open: boolean) => void;
  setLastSeenVersion: (version: string) => void;
  setTourCompleted: (completed: boolean) => void;
  setTourActive: (active: boolean) => void;
  startTour: () => void;
  completeTour: () => void;
  setIsHydrated: (hydrated: boolean) => void;
  refreshTrigger: number;
  triggerRefresh: () => void;

  // Timer actions
  setRestTimer: (timer: Partial<RestTimerState>) => void;
  startRestTimer: (duration: number) => void;
  skipRestTimer: () => void;
  addRestTime: (seconds: number) => void;
  tickRestTimer: () => void;
  resetRestTimer: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeProgram: null,
      activeWorkout: null,
      selectedDayIndex: 0,
      weekNumber: 1,
      showSplash: true,
      darkMode: false,
      whatsNewOpen: false,
      lastSeenVersion: null,
      tourCompleted: false,
      tourActive: false,
      isHydrated: false,
      refreshTrigger: 0,
      restTimer: {
        isActive: false,
        secondsLeft: 0,
        duration: 90,
        isCompleted: false,
      },

      setActiveProgram: (program) => set({ activeProgram: program }),
      setActiveWorkout: (workout) => set({ activeWorkout: workout }),
      setSelectedDayIndex: (index) => set({ selectedDayIndex: index }),
      setWeekNumber: (week) => set({ weekNumber: week }),
      setShowSplash: (show) => set({ showSplash: show }),
      setDarkMode: (enabled) => set({ darkMode: enabled }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setWhatsNewOpen: (open) => set({ whatsNewOpen: open }),
      setLastSeenVersion: (version) => set({ lastSeenVersion: version }),
      setTourCompleted: (completed) => {
        console.log('[AppStore] setTourCompleted:', completed);
        set({ tourCompleted: completed });
      },
      setTourActive: (active) => set({ tourActive: active }),
      setIsHydrated: (hydrated) => {
        console.log('[AppStore] setIsHydrated:', hydrated);
        set({ isHydrated: hydrated });
      },
      startTour: () => {
        console.log('[AppStore] startTour called');
        set({ tourActive: true, tourCompleted: false });
      },
      completeTour: () => {
        console.log('[AppStore] completeTour called');
        set({ tourActive: false, tourCompleted: true });
        // Verify persistence after state change
        setTimeout(() => {
          const state = useAppStore.getState();
          const stored = localStorage.getItem('app-storage');
          console.log('[AppStore] After completeTour:', { stateValue: state.tourCompleted, storageValue: stored });
        }, 100);
      },
      triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),

      // Timer actions
      setRestTimer: (timer) => set((state) => ({
        restTimer: { ...state.restTimer, ...timer },
      })),
      startRestTimer: (duration) => set({
        restTimer: {
          isActive: true,
          secondsLeft: duration,
          duration,
          isCompleted: false,
        },
      }),
      skipRestTimer: () => set({
        restTimer: {
          isActive: false,
          secondsLeft: 0,
          duration: 90,
          isCompleted: false,
        },
      }),
      addRestTime: (seconds) => set((state) => ({
        restTimer: {
          ...state.restTimer,
          secondsLeft: state.restTimer.secondsLeft + seconds,
        },
      })),
      tickRestTimer: () => set((state) => ({
        restTimer: {
          ...state.restTimer,
          secondsLeft: Math.max(0, state.restTimer.secondsLeft - 1),
        },
      })),
      resetRestTimer: () => set({
        restTimer: {
          isActive: false,
          secondsLeft: 0,
          duration: 90,
          isCompleted: false,
        },
      }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({ darkMode: state.darkMode, lastSeenVersion: state.lastSeenVersion, tourCompleted: state.tourCompleted }),
      onRehydrateStorage: () => (state) => {
        // Mark the store as hydrated after localStorage has been loaded
        // Return modified state to set isHydrated flag
        console.log('[AppStore] onRehydrateStorage callback:', state);
        if (state) {
          state.isHydrated = true;
          console.log('[AppStore] tourCompleted loaded from storage:', state.tourCompleted);
        }
        return state;
      },
    }
  )
);
