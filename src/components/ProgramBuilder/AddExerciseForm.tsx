import { useState, useEffect, useRef } from 'react';
import { Plus, X } from 'lucide-react';

interface AddExerciseFormProps {
  exerciseNames: string[];
  onAdd: (name: string, sets: number, reps: string, notes?: string) => void;
  onCancel: () => void;
}

export function AddExerciseForm({ exerciseNames, onAdd, onCancel }: AddExerciseFormProps) {
  const [exerciseName, setExerciseName] = useState('');
  const [targetSets, setTargetSets] = useState('3');
  const [targetReps, setTargetReps] = useState('8-10');
  const [notes, setNotes] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const justSelectedRef = useRef(false);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Filter suggestions as user types
  useEffect(() => {
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }

    if (exerciseName.trim()) {
      const filtered = exerciseNames.filter(name =>
        name.toLowerCase().includes(exerciseName.toLowerCase())
      );
      setFilteredSuggestions(filtered.slice(0, 8));
      setShowSuggestions(filtered.length > 0);
      setSelectedSuggestionIndex(-1);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [exerciseName, exerciseNames]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showSuggestions) {
        if (e.key === 'Enter' && exerciseName.trim()) {
          e.preventDefault();
          handleAdd();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          onCancel();
        }
        return;
      }

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
          handleAdd();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowSuggestions(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [exerciseName, showSuggestions, selectedSuggestionIndex, filteredSuggestions, onCancel]);

  const handleSelectSuggestion = (suggestion: string) => {
    justSelectedRef.current = true;
    setExerciseName(suggestion);
    setFilteredSuggestions([]);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleAdd = () => {
    if (!exerciseName.trim()) return;

    const sets = parseInt(targetSets) || 3;
    const reps = targetReps.trim() || '8-10';

    onAdd(exerciseName.trim(), sets, reps, notes.trim() || undefined);

    // Reset form
    setExerciseName('');
    setTargetSets('3');
    setTargetReps('8-10');
    setNotes('');
    setFilteredSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border-2 border-primary-200 dark:border-primary-800">
      <div className="flex items-center gap-2 mb-3">
        <Plus className="w-4 h-4 text-primary-600 dark:text-primary-400" />
        <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Add Exercise</h4>
      </div>

      <div className="space-y-3">
        {/* Exercise Name with Autocomplete */}
        <div className="relative">
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
            Exercise Name
          </label>
          <input
            ref={inputRef}
            type="text"
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
            onFocus={() => {
              if (!justSelectedRef.current && exerciseName.trim()) {
                setShowSuggestions(true);
              }
            }}
            placeholder="e.g., Bench Press, Squat..."
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 rounded-lg focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none text-gray-900 dark:text-gray-100"
          />

          {/* Suggestions Dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-slate-600 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto"
            >
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className={`w-full text-left px-3 py-2 hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors ${
                    index === selectedSuggestionIndex
                      ? 'bg-primary-100 dark:bg-primary-900'
                      : ''
                  } ${index > 0 ? 'border-t border-gray-200 dark:border-slate-600' : ''}`}
                >
                  <span className="text-gray-900 dark:text-gray-100 text-sm">
                    {suggestion}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sets & Reps */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
              Target Sets
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={targetSets}
              onChange={(e) => setTargetSets(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 rounded-lg focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
              Target Reps
            </label>
            <input
              type="text"
              value={targetReps}
              onChange={(e) => setTargetReps(e.target.value)}
              placeholder="e.g., 8-10"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 rounded-lg focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
            Notes (optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Focus on form, tempo work..."
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 rounded-lg focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all font-bold text-sm"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          <button
            onClick={handleAdd}
            disabled={!exerciseName.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 text-white rounded-lg transition-all font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
