import { useState } from 'react';
import { RefreshCw, Zap, Maximize2 } from 'lucide-react';
import type { ExerciseInstance } from '../../types/models';
import { hasSubstitutions } from '../../data/exerciseSubstitutions';
import { TechniqueInfoModal } from '../shared/TechniqueInfoModal';

interface ExerciseHeaderSectionProps {
  exercise: ExerciseInstance;
  onShowSubstitutions: () => void;
  isSubstituting: boolean;
}

export function ExerciseHeaderSection({
  exercise,
  onShowSubstitutions,
  isSubstituting
}: ExerciseHeaderSectionProps) {
  const [showTechniqueModal, setShowTechniqueModal] = useState<'myoreps' | 'lengthened' | null>(null);

  return (
    <>
      <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-primary-700 dark:text-primary-300">
              {exercise.name}
            </h3>
            {exercise.targetReps && (
              <p className="text-gray-700 dark:text-gray-300 font-medium mt-2">
                <span className="text-primary-600 dark:text-primary-400 font-bold">{exercise.targetSets}</span> sets × <span className="text-primary-600 dark:text-primary-400 font-bold">{exercise.targetReps}</span> reps
              </p>
            )}
            {/* Technique badges */}
            {(exercise.isMyoreps || exercise.isLengthenedPartials) && (
              <div className="flex flex-wrap gap-2 mt-3">
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
          </div>
          {hasSubstitutions(exercise.name) && (
            <button
              onClick={onShowSubstitutions}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 hover:bg-primary-100 dark:hover:bg-primary-900 text-primary-700 dark:text-primary-300 font-semibold rounded-lg shadow-sm transition-all duration-200 transform hover:scale-105"
              disabled={isSubstituting}
            >
              <RefreshCw className={`w-4 h-4 ${isSubstituting ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
        {exercise.notes && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 bg-white/60 dark:bg-slate-800/60 rounded-lg p-3">{exercise.notes}</p>
        )}
      </div>

      {/* Technique Info Modal */}
      {showTechniqueModal && (
        <TechniqueInfoModal
          technique={showTechniqueModal}
          onClose={() => setShowTechniqueModal(null)}
        />
      )}
    </>
  );
}
