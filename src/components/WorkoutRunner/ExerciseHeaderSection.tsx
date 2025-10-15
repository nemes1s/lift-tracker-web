import { RefreshCw } from 'lucide-react';
import type { ExerciseInstance } from '../../types/models';
import { hasSubstitutions } from '../../data/exerciseSubstitutions';

interface ExerciseHeaderSectionProps {
  exercise: ExerciseInstance;
  onShowSubstitutions: () => void;
  isSubstituting: boolean;
}

export function ExerciseHeaderSection({
  exercise,
  onShowSubstitutions,
  isSubstituting
}: ExerciseHeaderSectionProps) {
  return (
    <div className="bg-primary-50 rounded-xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-primary-700">
            {exercise.name}
          </h3>
          {exercise.targetReps && (
            <p className="text-gray-700 font-medium mt-2">
              <span className="text-primary-600 font-bold">{exercise.targetSets}</span> sets × <span className="text-primary-600 font-bold">{exercise.targetReps}</span> reps
            </p>
          )}
        </div>
        {hasSubstitutions(exercise.name) && (
          <button
            onClick={onShowSubstitutions}
            className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-primary-100 text-primary-700 font-semibold rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105"
            disabled={isSubstituting}
          >
            <RefreshCw className={`w-4 h-4 ${isSubstituting ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
      {exercise.notes && (
        <p className="text-sm text-gray-600 mt-3 bg-white/60 rounded-lg p-3">{exercise.notes}</p>
      )}
    </div>
  );
}
