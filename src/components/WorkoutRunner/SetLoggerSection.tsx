import { CheckCircle } from 'lucide-react';

interface SetLoggerSectionProps {
  weightText: string;
  repsText: string;
  rpeText: string;
  onWeightChange: (value: string) => void;
  onRepsChange: (value: string) => void;
  onRpeChange: (value: string) => void;
  onLogSet: () => void;
}

export function SetLoggerSection({
  weightText,
  repsText,
  rpeText,
  onWeightChange,
  onRepsChange,
  onRpeChange,
  onLogSet
}: SetLoggerSectionProps) {
  return (
    <div className="card p-5 bg-white">
      <p className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Log New Set</p>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Weight (kg)</label>
          <input
            type="number"
            step="0.5"
            placeholder="0"
            value={weightText}
            onChange={(e) => onWeightChange(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Reps</label>
          <input
            type="number"
            placeholder="0"
            value={repsText}
            onChange={(e) => onRepsChange(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">RPE</label>
          <input
            type="number"
            step="0.5"
            placeholder="0"
            value={rpeText}
            onChange={(e) => onRpeChange(e.target.value)}
            className="input-field"
          />
        </div>
      </div>
      <button
        onClick={onLogSet}
        disabled={!weightText || !repsText}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        <CheckCircle className="w-5 h-5" />
        Log Set
      </button>
    </div>
  );
}
