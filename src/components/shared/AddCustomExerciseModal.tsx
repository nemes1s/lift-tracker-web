import { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';

interface AddCustomExerciseModalProps {
  onConfirm: (exerciseName: string) => void;
  onCancel: () => void;
  suggestions?: string[];
}

export function AddCustomExerciseModal({ onConfirm, onCancel, suggestions = [] }: AddCustomExerciseModalProps) {
  const [exerciseName, setExerciseName] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter suggestions as user types
  useEffect(() => {
    if (exerciseName.trim()) {
      const filtered = suggestions.filter(s =>
        s.toLowerCase().includes(exerciseName.toLowerCase())
      );
      setFilteredSuggestions(filtered.slice(0, 8)); // Limit to 8 suggestions
      setShowSuggestions(filtered.length > 0);
      setSelectedSuggestionIndex(-1);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [exerciseName, suggestions]);

  useEffect(() => {
    // Auto-focus input when modal opens
    inputRef.current?.focus();

    // Handle keyboard events
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showSuggestions) {
        if (e.key === 'Enter' && exerciseName.trim()) {
          handleConfirm();
        } else if (e.key === 'Escape') {
          onCancel();
        }
        return;
      }

      // Keyboard navigation for suggestions
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSelectSuggestion(filteredSuggestions[selectedSuggestionIndex]);
        } else if (exerciseName.trim()) {
          handleConfirm();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowSuggestions(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [exerciseName, onCancel, showSuggestions, selectedSuggestionIndex, filteredSuggestions]);

  const handleConfirm = () => {
    if (exerciseName.trim()) {
      onConfirm(exerciseName.trim());
      setExerciseName('');
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setExerciseName(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="card p-6 max-w-sm w-full bg-white dark:bg-slate-800 animate-slideUp">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
            <Plus className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Add Custom Exercise
          </h3>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">
          Enter the name of the exercise you want to add:
        </p>

        <div className="relative mb-6">
          <input
            ref={inputRef}
            type="text"
            placeholder="e.g., Machine Leg Press, Cable Flyes..."
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
            onFocus={() => exerciseName.trim() && setShowSuggestions(true)}
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-primary-500 dark:focus:border-primary-400 transition-colors"
          />

          {showSuggestions && filteredSuggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto"
            >
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className={`w-full text-left px-4 py-3 hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors ${
                    index === selectedSuggestionIndex
                      ? 'bg-primary-100 dark:bg-primary-900'
                      : ''
                  } ${index > 0 ? 'border-t border-gray-200 dark:border-slate-600' : ''}`}
                >
                  <span className="text-gray-900 dark:text-gray-100 text-sm font-medium">
                    {suggestion}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!exerciseName.trim()}
            className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none transition-all duration-200"
          >
            Add Exercise
          </button>
        </div>
      </div>
    </div>
  );
}
