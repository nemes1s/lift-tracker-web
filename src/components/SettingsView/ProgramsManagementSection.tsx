import { Plus, Trash2, Upload } from 'lucide-react';
import type { Program } from '../../types/models';
import { ProgramCard } from './ProgramCard';

interface ProgramsManagementSectionProps {
  programs: Program[];
  editingProgramId: string | null;
  editingProgramName: string;
  exportingProgramId: string | null;
  importMessage: { type: 'success' | 'error'; text: string } | null;
  isImporting: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onStartRename: (programId: string, currentName: string) => void;
  onSaveRename: () => void;
  onCancelRename: () => void;
  onEditingNameChange: (name: string) => void;
  onDateChange: (programId: string, date: Date) => void;
  onWeeksChange: (programId: string, weeks: number) => void;
  onView: (programId: string) => void;
  onExport: (programId: string, programName: string) => void;
  onDelete: (programId: string) => void;
  onImportClick: () => void;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCreateProgram: (type: string) => void;
  onDeleteAll: () => void;
}

export function ProgramsManagementSection({
  programs,
  editingProgramId,
  editingProgramName,
  exportingProgramId,
  importMessage,
  isImporting,
  fileInputRef,
  onStartRename,
  onSaveRename,
  onCancelRename,
  onEditingNameChange,
  onDateChange,
  onWeeksChange,
  onView,
  onExport,
  onDelete,
  onImportClick,
  onFileSelect,
  onCreateProgram,
  onDeleteAll
}: ProgramsManagementSectionProps) {
  return (
    <div className="card p-6 bg-white dark:bg-slate-800" data-tour="program-preview">
      <h2 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-4">Programs</h2>

      {programs.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 italic">No programs yet - create one below</p>
      ) : (
        <div className="space-y-4 mb-6">
          {programs.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              isEditing={editingProgramId === program.id}
              editingName={editingProgramName}
              isExporting={exportingProgramId === program.id}
              onStartRename={() => onStartRename(program.id, program.name)}
              onSaveRename={onSaveRename}
              onCancelRename={onCancelRename}
              onNameChange={onEditingNameChange}
              onDateChange={(date) => onDateChange(program.id, date)}
              onWeeksChange={(weeks) => onWeeksChange(program.id, weeks)}
              onView={() => onView(program.id)}
              onExport={() => onExport(program.id, program.name)}
              onDelete={() => onDelete(program.id)}
            />
          ))}
        </div>
      )}

      {/* Create New Programs */}
      <div className="space-y-3">
        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">Create New Program</p>

        {/* Import status message */}
        {importMessage && (
          <div
            className={`p-4 rounded-xl font-bold text-sm ${
              importMessage.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-2 border-red-200 dark:border-red-800'
            }`}
          >
            {importMessage.text}
          </div>
        )}

        {/* Import from CSV button */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={onFileSelect}
          className="hidden"
        />
        <button
          onClick={onImportClick}
          disabled={isImporting}
          data-tour="import-program"
          className="w-full flex items-center gap-3 px-5 py-3 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 rounded-xl transition-all font-bold shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-2 border-green-200 dark:border-green-800"
        >
          <Upload className="w-5 h-5" />
          <span>{isImporting ? 'Importing...' : 'Import from CSV'}</span>
        </button>

        <div className="border-t-2 border-gray-200 dark:border-slate-700 my-4"></div>

        <button
          onClick={() => onCreateProgram('5day')}
          className="w-full flex items-center gap-3 px-5 py-3 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 text-primary-700 dark:text-primary-400 rounded-xl transition-all font-bold shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          <span>5-Day Split</span>
        </button>

        <button
          onClick={() => onCreateProgram('3day')}
          className="w-full flex items-center gap-3 px-5 py-3 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 text-primary-700 dark:text-primary-400 rounded-xl transition-all font-bold shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          <span>3-Day Split</span>
        </button>

        <button
          onClick={() => onCreateProgram('minimal')}
          className="w-full flex items-center gap-3 px-5 py-3 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 text-primary-700 dark:text-primary-400 rounded-xl transition-all font-bold shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          <span>Minimal Effort (4-Day)</span>
        </button>

        <button
          onClick={() => onCreateProgram('upperlower')}
          className="w-full flex items-center gap-3 px-5 py-3 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 text-primary-700 dark:text-primary-400 rounded-xl transition-all font-bold shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          <span>Upper/Lower (4-Day)</span>
        </button>

        <div className="border-t-2 border-gray-200 dark:border-slate-700 my-4"></div>

        <button
          onClick={onDeleteAll}
          className="w-full flex items-center justify-center gap-3 px-5 py-3 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-xl transition-all font-bold shadow-sm hover:shadow-md border-2 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700"
        >
          <Trash2 className="w-5 h-5" />
          <span>Delete All Programs</span>
        </button>
      </div>
    </div>
  );
}
