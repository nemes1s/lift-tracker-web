import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Upload, HelpCircle, Download, X } from 'lucide-react';
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
  const [showHelpModal, setShowHelpModal] = useState(false);
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

          {/* Import Button with Help */}
          <div className="flex gap-2">
            <button
              onClick={handleImportClick}
              disabled={isCreating || isImporting}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-650 dark:disabled:bg-gray-700"
            >
              <Upload className="h-5 w-5" />
              {isImporting ? 'Importing...' : 'Import Your Own (CSV)'}
            </button>
            <button
              onClick={() => setShowHelpModal(true)}
              disabled={isCreating || isImporting}
              className="flex items-center justify-center rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-650 dark:disabled:bg-gray-700"
              title="CSV Format Help"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
          </div>

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

      {/* CSV Format Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                CSV Import Format Guide
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="rounded-lg p-1 text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Download Examples */}
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/30">
                <h4 className="mb-2 font-semibold text-blue-900 dark:text-blue-300">
                  Download Example Files
                </h4>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <a
                    href="/example-program-simple.csv"
                    download
                    className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm transition hover:bg-blue-50 dark:bg-gray-700 dark:text-blue-300 dark:hover:bg-gray-600"
                  >
                    <Download className="h-4 w-4" />
                    Simple Format Example
                  </a>
                  <a
                    href="/example-program-advanced.csv"
                    download
                    className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm transition hover:bg-blue-50 dark:bg-gray-700 dark:text-blue-300 dark:hover:bg-gray-600"
                  >
                    <Download className="h-4 w-4" />
                    Advanced Format Example
                  </a>
                </div>
              </div>

              {/* Format 1: Simple */}
              <div>
                <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  Format 1: Simple (Comma-Delimited)
                </h4>
                <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                  Best for basic programs without week-specific variations. All exercises repeat throughout the program.
                </p>
                <div className="rounded-lg bg-gray-50 p-3 font-mono text-xs dark:bg-gray-900">
                  <div className="text-gray-800 dark:text-gray-200">
                    Program Name,My Training Program<br />
                    Total Weeks,12<br />
                    Day Index,Day Name,Exercise Name,Sets,Reps,Notes,Is Myoreps,Is Lengthened Partials<br />
                    0,Push Day,Barbell Bench Press,4,6-8,,,<br />
                    0,Push Day,Lateral Raise,3,12-15,,true,<br />
                    1,Pull Day,Barbell Row,4,6-8,,,<br />
                  </div>
                </div>
                <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>• First line: Program name</li>
                  <li>• Second line: Total weeks (will be asked to confirm)</li>
                  <li>• Third line: Column headers (required)</li>
                  <li>• Day Index: 0=Day 1, 1=Day 2, etc.</li>
                  <li>• Is Myoreps/Lengthened Partials: Leave empty or use "true"</li>
                </ul>
              </div>

              {/* Format 2: Advanced */}
              <div>
                <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  Format 2: Advanced (Semicolon-Delimited)
                </h4>
                <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                  For programs with periodization - different exercises for different weeks (e.g., weeks 1-4 strength, weeks 5-8 hypertrophy).
                </p>
                <div className="rounded-lg bg-gray-50 p-3 font-mono text-xs dark:bg-gray-900">
                  <div className="text-gray-800 dark:text-gray-200">
                    week;day_index;workout_name;exercise_name;target_sets;target_reps;notes;is_myoreps;is_lengthened_partials<br />
                    1;0;Push (Strength);Barbell Bench Press;4;5-6;Heavy;;<br />
                    1;0;Push (Strength);Lateral Raise;3;12-15;;true;<br />
                    5;0;Push (Hypertrophy);Dumbbell Bench Press;3;8-10;More volume;;<br />
                  </div>
                </div>
                <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Week: Starting week number for this phase (1, 5, 9, etc.)</li>
                  <li>• Day Index: 0=Day 1, 1=Day 2, etc.</li>
                  <li>• Use semicolons (;) instead of commas</li>
                  <li>• Exercises with week=1 apply to weeks 1-4, week=5 to weeks 5-8, etc.</li>
                </ul>
              </div>

              {/* Tips */}
              <div className="rounded-lg border-2 border-gray-200 p-4 dark:border-gray-700">
                <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                  Tips
                </h4>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Download the example files above to see the exact format</li>
                  <li>• Edit in Excel, Google Sheets, or any spreadsheet app</li>
                  <li>• Save as CSV (Comma Separated Values) or CSV UTF-8</li>
                  <li>• Reps can be ranges like "8-10" or single numbers like "5"</li>
                  <li>• Leave optional columns empty if not needed</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
