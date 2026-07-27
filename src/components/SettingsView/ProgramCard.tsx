import { Pencil, Check, X, Eye, Download, Trash2, CheckCircle } from 'lucide-react';
import type { Program } from '../../types/models';
import { currentWeek } from '../../utils/programLogic';

interface ProgramCardProps {
  program: Program;
  isActive: boolean;
  isEditing: boolean;
  editingName: string;
  isExporting: boolean;
  onSetActive: () => void;
  onStartRename: () => void;
  onSaveRename: () => void;
  onCancelRename: () => void;
  onNameChange: (name: string) => void;
  onDateChange: (date: Date) => void;
  onWeeksChange: (weeks: number) => void;
  onView: () => void;
  onExport: () => void;
  onDelete: () => void;
}

export function ProgramCard({
  program,
  isActive,
  isEditing,
  editingName,
  isExporting,
  onSetActive,
  onStartRename,
  onSaveRename,
  onCancelRename,
  onNameChange,
  onDateChange,
  onWeeksChange,
  onView,
  onExport,
  onDelete
}: ProgramCardProps) {
  const week = currentWeek(program.startDate, program.totalWeeks);

  return (
    <div
      className={`bg-white dark:bg-slate-900 border-2 rounded-xl p-5 shadow-sm ${
        isActive ? 'border-primary-300 dark:border-primary-700' : 'border-gray-200 dark:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editingName}
                onChange={(e) => onNameChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSaveRename();
                  if (e.key === 'Escape') onCancelRename();
                }}
                className="input-field flex-1"
                autoFocus
              />
              <button
                onClick={onSaveRename}
                className="text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 p-2 rounded-lg transition-all"
                title="Save"
              >
                <Check className="w-5 h-5" />
              </button>
              <button
                onClick={onCancelRename}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 p-2 rounded-lg transition-all"
                title="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{program.name}</h3>
              <button
                onClick={onStartRename}
                className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 p-1.5 rounded-lg transition-all"
                title="Rename program"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          )}
          <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mt-1">
            Week <span className="text-primary-600 dark:text-primary-400">{week}</span> of <span className="text-primary-600 dark:text-primary-400">{program.totalWeeks}</span>
          </p>
        </div>

        {isActive ? (
          <span className="flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2.5 py-1 rounded-full shrink-0">
            <CheckCircle className="w-3.5 h-3.5" />
            Active
          </span>
        ) : (
          <button
            onClick={onSetActive}
            className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 px-2.5 py-1 rounded-full shrink-0 transition-colors"
          >
            Set Active
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider block mb-2">Start Date</label>
          <input
            type="date"
            value={
              program.startDate
                ? new Date(program.startDate).toISOString().split('T')[0]
                : ''
            }
            onChange={(e) => onDateChange(new Date(e.target.value))}
            className="input-field"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider block mb-2">Total Weeks</label>
          <input
            type="number"
            min="1"
            max="52"
            value={program.totalWeeks}
            onChange={(e) => onWeeksChange(parseInt(e.target.value))}
            className="input-field"
          />
        </div>

        <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3">
          <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-primary-600 dark:bg-primary-500 transition-all duration-500 shadow-glow"
              style={{
                width: `${(week / Math.max(program.totalWeeks, 1)) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="flex gap-2 ml-2 justify-between">
          <button
            onClick={onView}
            className="text-primary-600 dark:text-primary-400 cursor-pointer hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 p-2 rounded-lg transition-all"
            title="View program details"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={onExport}
            disabled={isExporting}
            data-tour="export-program"
            className="text-primary-600 dark:text-primary-400 cursor-pointer hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export program as CSV"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 dark:text-red-500 cursor-pointer hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-lg transition-all"
            title="Delete program"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
