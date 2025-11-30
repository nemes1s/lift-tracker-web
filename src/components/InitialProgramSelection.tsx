import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Upload } from 'lucide-react';
import {
  create5DaySplit,
  create3DaySplit,
  createMinimalEffort4Day,
  createUpperLower4Day,
  generateProgramFromCSVData,
} from '../utils/programTemplates';
import { parseCSV, readCSVFile } from '../utils/csvParser';
import { db } from '../db/database';
import { useAppStore } from '../store/appStore';

interface InitialProgramSelectionProps {
  onComplete: () => void;
}

const BUILT_IN_PROGRAMS = [
  { id: '5day', name: '5-Day Split (PPL + Arms + Shoulders)', creator: create5DaySplit },
  { id: '3day', name: '3-Day Full Body Split', creator: create3DaySplit },
  { id: 'minimal', name: 'Minimal Effort 4-Day', creator: createMinimalEffort4Day },
  { id: 'upperlower', name: 'Upper/Lower 4-Day', creator: createUpperLower4Day },
];

export function InitialProgramSelection({ onComplete }: InitialProgramSelectionProps) {
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [pendingCSVData, setPendingCSVData] = useState<any>(null);
  const [selectedWeeks, setSelectedWeeks] = useState(12);
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const triggerRefresh = useAppStore((state) => state.triggerRefresh);

  const handleSelectProgram = async () => {
    if (!selectedProgram) return;

    setIsCreating(true);
    setErrorMessage(null);

    try {
      const program = BUILT_IN_PROGRAMS.find(p => p.id === selectedProgram);
      if (!program) {
        setErrorMessage('Invalid program selection');
        setIsCreating(false);
        return;
      }

      // Create the program in the database
      const newProgram = await program.creator();

      // Set it as the active program
      const settings = await db.settings.toCollection().first();
      if (settings) {
        await db.settings.update(settings.id, { activeProgramId: newProgram.id });
      }

      triggerRefresh();
      onComplete();
    } catch (error) {
      setErrorMessage(`Failed to create program: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsCreating(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setErrorMessage(null);

    try {
      const content = await readCSVFile(file);
      const parseResult = parseCSV(content);

      if (!parseResult.success || !parseResult.data) {
        setErrorMessage(parseResult.error || 'Failed to parse CSV file');
        setIsImporting(false);
        return;
      }

      // Store the parsed CSV data and show duration selection modal
      setPendingCSVData(parseResult.data);
      setSelectedWeeks(parseResult.data.totalWeeks || 12);
      setShowDurationModal(true);
      setIsImporting(false);
    } catch (error) {
      setErrorMessage(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsImporting(false);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDurationConfirm = () => {
    if (!pendingCSVData) return;

    const programData = generateProgramFromCSVData(pendingCSVData, selectedWeeks);

    setShowDurationModal(false);
    setPendingCSVData(null);

    // Navigate to program preview for confirmation
    // Note: We don't call onComplete() here because the user hasn't finished yet
    // They still need to confirm the program in the preview
    navigate('/program/preview', {
      state: {
        mode: 'preview',
        programData,
        returnToHome: true,
      },
    });
  };

  const handleDurationCancel = () => {
    setShowDurationModal(false);
    setPendingCSVData(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Dumbbell className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome to LiftTracker!
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Get started by selecting a workout program
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {errorMessage}
          </div>
        )}

        <div className="space-y-4">
          {/* Program Selector */}
          <div>
            <label htmlFor="program-select" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Choose a built-in program
            </label>
            <select
              id="program-select"
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
              disabled={isCreating || isImporting}
            >
              <option value="">-- Select a program --</option>
              {BUILT_IN_PROGRAMS.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
          </div>

          {/* Select Button */}
          <button
            onClick={handleSelectProgram}
            disabled={!selectedProgram || isCreating || isImporting}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400 dark:bg-blue-500 dark:hover:bg-blue-600 dark:disabled:bg-gray-600"
          >
            {isCreating ? 'Creating Program...' : 'Start with Selected Program'}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                or
              </span>
            </div>
          </div>

          {/* Import Button */}
          <button
            onClick={handleImportClick}
            disabled={isCreating || isImporting}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-650 dark:disabled:bg-gray-700"
          >
            <Upload className="h-5 w-5" />
            {isImporting ? 'Importing...' : 'Import Your Own Program (CSV)'}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Duration Selection Modal */}
      {showDurationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
              Program Duration
            </h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              How many weeks would you like this program to run?
            </p>
            <input
              type="number"
              min="1"
              max="52"
              value={selectedWeeks}
              onChange={(e) => setSelectedWeeks(parseInt(e.target.value) || 12)}
              className="mb-6 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <div className="flex gap-3">
              <button
                onClick={handleDurationCancel}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDurationConfirm}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
