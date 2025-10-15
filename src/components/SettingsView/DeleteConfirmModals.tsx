import type { Program } from '../../types/models';

interface DeleteConfirmModalsProps {
  deletingProgramId: string | null;
  showDeleteConfirm: boolean;
  programs: Program[];
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDeleteAll: () => void;
  onConfirmDeleteAll: () => void;
}

export function DeleteConfirmModals({
  deletingProgramId,
  showDeleteConfirm,
  programs,
  onCancelDelete,
  onConfirmDelete,
  onCancelDeleteAll,
  onConfirmDeleteAll
}: DeleteConfirmModalsProps) {
  return (
    <>
      {/* Delete Single Program Confirmation Modal */}
      {deletingProgramId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="card p-6 max-w-sm w-full bg-white dark:bg-slate-800 animate-slideUp">
            <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-3">
              Delete Program?
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6 font-medium">
              This will delete "{programs.find(p => p.id === deletingProgramId)?.name}" and all its templates. Your workout history will be preserved.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onCancelDelete}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={onConfirmDelete}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Programs Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="card p-6 max-w-sm w-full bg-white dark:bg-slate-800 animate-slideUp">
            <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-3">
              Delete All Programs?
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6 font-medium">
              This will delete all programs and their templates. Your workout history will be preserved.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onCancelDeleteAll}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={onConfirmDeleteAll}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
