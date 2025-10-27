import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface ExerciseNavigationSectionProps {
  currentIndex: number;
  totalExercises: number;
  onPrevious: () => void;
  onNext: () => void;
  onAddCustomExercise?: () => void;
}

export function ExerciseNavigationSection({
  currentIndex,
  totalExercises,
  onPrevious,
  onNext,
  onAddCustomExercise
}: ExerciseNavigationSectionProps) {
  return (
    <div className="card p-4 bg-white dark:bg-slate-800">
      <div className="text-center mb-4">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
          Exercise {currentIndex + 1} of {totalExercises}
        </span>
      </div>
      <div className="flex items-center justify-between gap-4 mb-4">
        <button
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className="btn-secondary flex flex-1 items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </button>

        <button
          onClick={onNext}
          disabled={currentIndex === totalExercises - 1}
          className="btn-primary flex flex-1 items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          Next
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {onAddCustomExercise && (
        <button
          onClick={onAddCustomExercise}
          className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Custom Exercise
        </button>
      )}
    </div>
  );
}
