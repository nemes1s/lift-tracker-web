import { CheckCircle, Lightbulb } from 'lucide-react';
import type { ProgressiveOverloadSuggestion } from '../../utils/programLogic';

interface SetLoggerSectionProps {
  weightText: string;
  repsText: string;
  rpeText: string;
  onWeightChange: (value: string) => void;
  onRepsChange: (value: string) => void;
  onRpeChange: (value: string) => void;
  onLogSet: () => void;
  suggestion?: ProgressiveOverloadSuggestion;
  onApplySuggestion?: (weight?: number, reps?: string) => void;
}

export function SetLoggerSection({
  weightText,
  repsText,
  rpeText,
  onWeightChange,
  onRepsChange,
  onRpeChange,
  onLogSet,
  suggestion,
  onApplySuggestion
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
      {suggestion && suggestion.hasData && (suggestion.suggestedWeight || suggestion.suggestedReps) && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-blue-900 mb-2">{suggestion.reason}</p>
            {suggestion.suggestedWeight && (
              <button
                onClick={() => onApplySuggestion?.(suggestion.suggestedWeight, undefined)}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
              >
                Apply weight: {suggestion.suggestedWeight}
              </button>
            )}
            {suggestion.suggestedReps && (
              <button
                onClick={() => onApplySuggestion?.(undefined, suggestion.suggestedReps)}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors ml-2"
              >
                Apply reps: {suggestion.suggestedReps}
              </button>
            )}
          </div>
        </div>
      )}
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
