import { Check, RefreshCw } from 'lucide-react';

interface StickyExerciseHeaderProps {
  name: string;
  currentIndex: number;
  totalExercises: number;
  setsLogged: number;
  targetSets: number;
  onShowSubstitutions: () => void;
  isSubstituting: boolean;
}

export function StickyExerciseHeader({
  name,
  currentIndex,
  totalExercises,
  setsLogged,
  targetSets,
  onShowSubstitutions,
  isSubstituting,
}: StickyExerciseHeaderProps) {
  const targetMet = targetSets > 0 && setsLogged >= targetSets;
  const progress = targetSets > 0 ? Math.min(setsLogged / targetSets, 1) : 0;

  return (
    <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm">
      <div className="pl-4 pr-2 py-1.5 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Exercise {currentIndex + 1}/{totalExercises}
          </p>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
            {name}
          </h2>
        </div>
        <div className="shrink-0 flex items-center gap-1.5">
          <span
            className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
              targetMet
                ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30'
                : 'text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30'
            }`}
          >
            {targetMet && <Check className="w-3.5 h-3.5" />}
            {setsLogged}/{targetSets} sets
          </span>
          <button
            onClick={onShowSubstitutions}
            disabled={isSubstituting}
            title="Replace exercise"
            className="w-11 h-11 flex items-center justify-center text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSubstituting ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      <div className="h-0.5 bg-gray-100 dark:bg-slate-700">
        <div
          className={`h-full transition-all duration-300 ${targetMet ? 'bg-emerald-500' : 'bg-primary-600 dark:bg-primary-400'}`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
