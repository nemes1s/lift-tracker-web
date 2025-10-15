import { X } from 'lucide-react';
import type { SetRecord } from '../../types/models';

interface CurrentSetsSectionProps {
  sets: SetRecord[];
  onDeleteSet: (setId: string) => void;
}

export function CurrentSetsSection({ sets, onDeleteSet }: CurrentSetsSectionProps) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Today's Sets</p>
      {sets.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {sets.map((set) => (
            <div
              key={set.id}
              className="group relative px-4 py-2 bg-green-50 border-2 border-green-200 rounded-xl text-sm font-bold text-gray-800 shadow-sm"
            >
              <button
                onClick={() => onDeleteSet(set.id)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg"
                title="Delete set"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="text-green-700">{set.weight}kg</span> × <span className="text-green-700">{set.reps}</span>
              {set.rpe && <span className="text-orange-600 ml-1">@{set.rpe}</span>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">No sets logged yet - let's get started!</p>
      )}
    </div>
  );
}
