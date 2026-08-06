import { Link2 } from 'lucide-react';

interface SupersetSuggestionModalProps {
  exerciseName: string;
  partnerName: string;
  onConfirm: () => void;
  onDismiss: () => void;
}

export function SupersetSuggestionModal({
  exerciseName,
  partnerName,
  onConfirm,
  onDismiss,
}: SupersetSuggestionModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="card p-6 max-w-sm w-full bg-white dark:bg-slate-800 animate-slideUp">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
            <Link2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Superset Suggestion
          </h3>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-6 text-sm">
          <span className="font-bold">{exerciseName}</span> pairs well with{' '}
          <span className="font-bold">{partnerName}</span> as opposing muscle groups.
          Perform them back-to-back as a superset?
        </p>

        <div className="flex gap-3">
          <button onClick={onDismiss} className="btn-secondary flex-1">
            No Thanks
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Superset Them
          </button>
        </div>
      </div>
    </div>
  );
}
