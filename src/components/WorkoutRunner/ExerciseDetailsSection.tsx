import { useState } from 'react';
import { Zap, Maximize2 } from 'lucide-react';
import type { ExerciseInstance } from '../../types/models';
import { TechniqueInfoModal } from '../shared/TechniqueInfoModal';

interface ExerciseDetailsSectionProps {
  exercise: ExerciseInstance;
}

export function ExerciseDetailsSection({ exercise }: ExerciseDetailsSectionProps) {
  const [showTechniqueModal, setShowTechniqueModal] = useState<'myoreps' | 'lengthened' | null>(null);

  const hasBadges = exercise.isMyoreps || exercise.isLengthenedPartials;
  if (!hasBadges && !exercise.notes) return null;

  return (
    <>
      <div className="space-y-2">
        {hasBadges && (
          <div className="flex flex-wrap gap-2">
            {exercise.isMyoreps && (
              <button
                onClick={() => setShowTechniqueModal('myoreps')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-bold rounded-full hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors cursor-pointer"
                title="Click to learn about Myoreps technique"
              >
                <Zap className="w-3.5 h-3.5" />
                MYOREPS
              </button>
            )}
            {exercise.isLengthenedPartials && (
              <button
                onClick={() => setShowTechniqueModal('lengthened')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-colors cursor-pointer"
                title="Click to learn about Lengthened Partials technique"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                LENGTHENED
              </button>
            )}
          </div>
        )}
        {exercise.notes && (
          <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
            {exercise.notes}
          </p>
        )}
      </div>

      {showTechniqueModal && (
        <TechniqueInfoModal
          technique={showTechniqueModal}
          onClose={() => setShowTechniqueModal(null)}
        />
      )}
    </>
  );
}
