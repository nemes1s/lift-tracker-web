interface DeleteConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({ onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="card p-6 max-w-sm w-full bg-white dark:bg-slate-800 animate-slideUp">
        <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-3">
          Delete Workout?
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-6 font-medium">
          This will permanently delete this workout and all its data. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
