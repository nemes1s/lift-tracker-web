import { X, Star } from 'lucide-react';
import type { SetRecord } from '../../types/models';
import { formatWeight, type WeightUnit } from '../../utils/weightUnit';

interface CurrentSetsSectionProps {
  sets: SetRecord[];
  onDeleteSet: (setId: string) => void;
  weightUnit?: WeightUnit;
}

export function CurrentSetsSection({ sets, onDeleteSet, weightUnit = 'kg' }: CurrentSetsSectionProps) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Today's Sets</p>
      {sets.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {sets.map((set) => (
            <div
              key={set.id}
              className={`group relative px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all ${
                set.isPR
                  ? 'bg-amber-50 border-2 border-amber-300 text-amber-800'
                  : 'bg-green-50 border-2 border-green-200 text-gray-800'
              }`}
            >
              {set.isPR && (
                <div className="absolute -top-3 -left-2 bg-amber-400 text-white rounded-full p-1 shadow-lg">
                  <Star className="w-3 h-3 fill-current" />
                </div>
              )}
              <button
                onClick={() => onDeleteSet(set.id)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg"
                title="Delete set"
              >
                <X className="w-4 h-4" />
              </button>
              <span className={set.isPR ? 'text-amber-700' : 'text-green-700'}>{formatWeight(set.weight, weightUnit)}</span> ×{' '}
              <span className={set.isPR ? 'text-amber-700' : 'text-green-700'}>{set.reps}</span>
              {set.rpe && <span className="text-orange-600 ml-1">@{Math.round(set.rpe)}</span>}
              {set.isPR && <span className="text-amber-700 ml-2 font-semibold">PR!</span>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">No sets logged yet - let's get started!</p>
      )}
    </div>
  );
}
