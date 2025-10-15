import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Program, Workout } from '../types/models';

interface AppState {
  activeProgram: Program | null;
  activeWorkout: Workout | null;
  selectedDayIndex: number;
  weekNumber: number;
  showSplash: boolean;
  darkMode: boolean;

  setActiveProgram: (program: Program | null) => void;
  setActiveWorkout: (workout: Workout | null) => void;
  setSelectedDayIndex: (index: number) => void;
  setWeekNumber: (week: number) => void;
  setShowSplash: (show: boolean) => void;
  setDarkMode: (enabled: boolean) => void;
  toggleDarkMode: () => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
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
      refreshTrigger: 0,

      setActiveProgram: (program) => set({ activeProgram: program }),
      setActiveWorkout: (workout) => set({ activeWorkout: workout }),
      setSelectedDayIndex: (index) => set({ selectedDayIndex: index }),
      setWeekNumber: (week) => set({ weekNumber: week }),
      setShowSplash: (show) => set({ showSplash: show }),
      setDarkMode: (enabled) => set({ darkMode: enabled }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({ darkMode: state.darkMode }),
    }
  )
);
