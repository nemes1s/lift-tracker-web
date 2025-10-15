import { getExerciseSubstitutions, getExerciseNotes } from '../../data/exerciseSubstitutions';

interface ExerciseSubstitutionSectionProps {
  exerciseName: string;
  isSubstituting: boolean;
  onSubstitute: (newExerciseName: string) => void;
  onCancel: () => void;
}

export function ExerciseSubstitutionSection({
  exerciseName,
  isSubstituting,
  onSubstitute,
  onCancel
}: ExerciseSubstitutionSectionProps) {
  const substitutions = getExerciseSubstitutions(exerciseName);

  return (
    <div className="card p-5 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-gray-900 text-lg">Alternative Exercises</h4>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 font-semibold text-sm"
        >
          Cancel
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Switch to a different exercise. This will update your exercise history to track the new exercise going forward.
      </p>
      <div className="space-y-2">
        {substitutions.map((substitution) => {
          const notes = getExerciseNotes(substitution);
          return (
            <button
              key={substitution}
              onClick={() => onSubstitute(substitution)}
              disabled={isSubstituting}
              className="w-full text-left p-4 bg-white hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-400 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="font-bold text-gray-900">{substitution}</div>
              {notes && (
                <div className="text-sm text-gray-600 mt-1">{notes}</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
