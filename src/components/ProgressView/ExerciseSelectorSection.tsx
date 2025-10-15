interface ExerciseSelectorSectionProps {
  exercises: string[];
  selectedExercise: string;
  onExerciseChange: (exercise: string) => void;
}

export function ExerciseSelectorSection({
  exercises,
  selectedExercise,
  onExerciseChange
}: ExerciseSelectorSectionProps) {
  if (exercises.length === 0) return null;

  return (
    <div className="card p-6 bg-white dark:bg-slate-800">
      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
        Select Exercise
      </label>
      <select
        value={selectedExercise}
        onChange={(e) => onExerciseChange(e.target.value)}
        className="input-field"
      >
        {exercises.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
}
