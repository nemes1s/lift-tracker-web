import { X, Zap, Maximize2 } from 'lucide-react';

type TechniqueType = 'myoreps' | 'lengthened';

interface TechniqueInfoModalProps {
  technique: TechniqueType;
  onClose: () => void;
}

export function TechniqueInfoModal({ technique, onClose }: TechniqueInfoModalProps) {
  const isMyoreps = technique === 'myoreps';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="card p-6 max-w-lg w-full bg-white dark:bg-slate-800 animate-slideUp max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 ${isMyoreps ? 'bg-amber-100 dark:bg-amber-900' : 'bg-purple-100 dark:bg-purple-900'} rounded-lg`}>
              {isMyoreps ? (
                <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              ) : (
                <Maximize2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {isMyoreps ? 'Myoreps Technique' : 'Lengthened Partials'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {isMyoreps ? (
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">What are Myoreps?</h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                Myoreps are a rest-pause training technique that builds muscle efficiently with less time.
                Instead of traditional sets with long rest periods, you do one activation set followed by
                multiple mini-sets with very short rest.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">How to Perform</h4>
              <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex gap-2">
                  <span className="font-bold text-amber-600 dark:text-amber-400 min-w-[1.5rem]">1.</span>
                  <span><strong>Activation Set:</strong> Perform 10-20 reps close to failure</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-amber-600 dark:text-amber-400 min-w-[1.5rem]">2.</span>
                  <span><strong>Short Rest:</strong> Rest 10-15 seconds (take 3-5 deep breaths)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-amber-600 dark:text-amber-400 min-w-[1.5rem]">3.</span>
                  <span><strong>Mini-Sets:</strong> Perform 3-5 reps per mini-set</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-amber-600 dark:text-amber-400 min-w-[1.5rem]">4.</span>
                  <span><strong>Repeat:</strong> Continue mini-sets with 10-15 second rest until you can't hit your target reps</span>
                </li>
              </ol>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
              <h4 className="font-bold text-amber-900 dark:text-amber-300 mb-2 text-sm">Example</h4>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                Lateral Raises: 15 reps (activation) → rest 15s → 5 reps → rest 15s → 5 reps →
                rest 15s → 5 reps → rest 15s → 4 reps (stop, can't hit 5)
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Best For</h4>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Isolation/accessory exercises (curls, raises, extensions)</li>
                <li>• Time-efficient muscle building</li>
                <li>• Later exercises in your workout</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">What are Lengthened Partials?</h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                Lengthened partials focus on the stretched (bottom) portion of an exercise's range of motion.
                Research shows training muscles in their lengthened position can produce up to 5-43% more muscle growth
                compared to full ROM or shortened partials.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">How to Perform</h4>
              <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex gap-2">
                  <span className="font-bold text-purple-600 dark:text-purple-400 min-w-[1.5rem]">1.</span>
                  <span><strong>Start Position:</strong> Begin at the fully stretched position (bottom of the movement)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-purple-600 dark:text-purple-400 min-w-[1.5rem]">2.</span>
                  <span><strong>Partial ROM:</strong> Move only through the bottom half to middle of the range</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-purple-600 dark:text-purple-400 min-w-[1.5rem]">3.</span>
                  <span><strong>Control:</strong> Maintain constant tension and controlled tempo</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-purple-600 dark:text-purple-400 min-w-[1.5rem]">4.</span>
                  <span><strong>Feel the Stretch:</strong> Focus on the deep stretch at the bottom of each rep</span>
                </li>
              </ol>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <h4 className="font-bold text-purple-900 dark:text-purple-300 mb-2 text-sm">Examples</h4>
              <ul className="text-xs text-purple-800 dark:text-purple-300 space-y-1">
                <li>• <strong>Bicep Curls:</strong> Bottom half only (arms extended to 90°)</li>
                <li>• <strong>Leg Curls:</strong> Fully stretched to mid-range</li>
                <li>• <strong>Leg Press:</strong> Deep stretch to midpoint</li>
                <li>• <strong>Romanian Deadlifts:</strong> Bottom stretch to knee level</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Recommendations</h4>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>• Use for 25-50% of your sets (not every set)</li>
                <li>• Best for exercises with good stretch positions</li>
                <li>• Can be added after reaching failure on full ROM sets</li>
                <li>• Great for curls, leg curls, calf raises, flyes, RDLs</li>
              </ul>
            </div>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full btn-primary"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
