import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ExerciseNavigationSectionProps {
  currentIndex: number;
  totalExercises: number;
  onPrevious: () => void;
  onNext: () => void;
}

export function ExerciseNavigationSection({
  currentIndex,
  totalExercises,
  onPrevious,
  onNext
}: ExerciseNavigationSectionProps) {
  return (
    <div className="card p-4 bg-white">
      <div className="text-center mb-4">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
          Exercise {currentIndex + 1} of {totalExercises}
        </span>
      </div>
      <div className="flex items-center justify-between gap-4">
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
    </div>
  );
}
