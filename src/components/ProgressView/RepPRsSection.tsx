import { Award } from 'lucide-react';
import { CollapsibleCard } from '../CollapsibleCard';
import type { RepPR } from '../../utils/globalStats';

interface RepPRsSectionProps {
  repPRs: RepPR[];
}

export function RepPRsSection({ repPRs }: RepPRsSectionProps) {
  if (repPRs.length === 0) return null;

  return (
    <CollapsibleCard
      title="Rep PRs"
      icon={<Award className="w-6 h-6" />}
      defaultOpen={false}
      badge={repPRs.length}
    >
      <div className="space-y-2 mt-2">
        {repPRs.map((pr) => (
          <div
            key={pr.reps}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors"
          >
            <div>
              <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">{pr.reps} reps</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {pr.date.toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">{pr.weight} kg</p>
            </div>
          </div>
        ))}
      </div>
    </CollapsibleCard>
  );
}
