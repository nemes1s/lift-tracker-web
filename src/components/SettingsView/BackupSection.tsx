import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Download, Upload, AlertTriangle } from 'lucide-react';
import { exportBackup, parseBackupFile, getBackupStats, importBackup } from '../../utils/backup';
import type { BackupData, BackupStats } from '../../utils/backup';

interface Props {
  onImportComplete: () => void;
}

export function BackupSection({ onImportComplete }: Props) {
  const [exporting, setExporting] = useState(false);
  const [pending, setPending] = useState<BackupData | null>(null);
  const [pendingStats, setPendingStats] = useState<BackupStats | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportBackup();
    } finally {
      setExporting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!fileInputRef.current) return;
    fileInputRef.current.value = '';
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = parseBackupFile(ev.target?.result as string);
        setPending(data);
        setPendingStats(getBackupStats(data));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to read backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    if (!pending) return;
    setImporting(true);
    try {
      await importBackup(pending);
      setPending(null);
      setPendingStats(null);
      onImportComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <div className="py-4 first:pt-0 last:pb-0">
        <div className="mb-3">
          <span className="font-bold text-gray-900 dark:text-gray-100 block">Backup & Restore</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Export your full workout history or restore from a backup</span>
          {error && <span className="block text-sm text-red-600 dark:text-red-400 mt-1">{error}</span>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting…' : 'Export'}
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {pending && pendingStats && createPortal(
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="p-5 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Restore Backup</h2>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                This will permanently replace all current workout data.
              </p>

              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Backup contains
                </p>
                <Row label="Programs" value={pendingStats.programs} />
                <Row label="Workouts" value={pendingStats.workouts} />
                <Row label="Sets logged" value={pendingStats.setRecords} />
                <Row label="Personal records" value={pendingStats.personalRecords} />
                {pending.exportedAt && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 pt-1">
                    Exported {new Date(pending.exportedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-gray-200 dark:border-slate-700 flex gap-3">
              <button
                onClick={() => { setPending(null); setPendingStats(null); }}
                disabled={importing}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={importing}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
              >
                {importing ? 'Restoring…' : 'Restore'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{value.toLocaleString()}</span>
    </div>
  );
}
