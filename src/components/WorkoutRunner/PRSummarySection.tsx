import { Star, TrendingUp } from 'lucide-react';
import type { SetRecord } from '../../types/models';

interface PRSummarySectionProps {
  sets: SetRecord[];
}

export function PRSummarySection({ sets }: PRSummarySectionProps) {
  const prSets = sets.filter(s => s.isPR);
  const prCount = prSets.length;

  if (prCount === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border-2 border-amber-300 shadow-md">
      <div className="flex items-center gap-2 mb-3">
        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
        <h4 className="font-bold text-amber-900 text-lg">Personal Records!</h4>
        <TrendingUp className="w-5 h-5 text-amber-500 ml-auto" />
      </div>

      <div className="space-y-2">
        {prSets.map((set) => (
          <div key={set.id} className="flex items-center justify-between bg-white rounded-lg p-2 border border-amber-200">
            <span className="font-semibold text-amber-900">{set.weight}kg × {set.reps}</span>
            {set.rpe && <span className="text-sm text-orange-600">@{Math.round(set.rpe)} RPE</span>}
          </div>
        ))}
      </div>

      <p className="text-sm text-amber-800 mt-3 font-semibold text-center">
        🎉 Great job! {prCount} new record{prCount !== 1 ? 's' : ''}!
      </p>
    </div>
  );
}
