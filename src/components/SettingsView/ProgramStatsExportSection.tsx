import { useState, useEffect } from 'react';
import { FileText, Image, FileDown } from 'lucide-react';
import type { Program } from '../../types/models';
import { aggregateProgramStats, countProgramWorkouts } from '../../utils/programStatsAggregator';
import {
  exportAsText,
  exportAsImage,
  exportAsPDF,
  downloadFile,
  copyToClipboard,
  generateFilename,
} from '../../utils/programStatsExporter';

interface ProgramStatsExportSectionProps {
  programs: Program[];
}

export function ProgramStatsExportSection({ programs }: ProgramStatsExportSectionProps) {
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);
  const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [workoutCounts, setWorkoutCounts] = useState<Map<string, number>>(new Map());

  // Count workouts for each program
  useEffect(() => {
    const loadWorkoutCounts = async () => {
      const counts = new Map<string, number>();
      for (const program of programs) {
        const count = await countProgramWorkouts(program.id);
        counts.set(program.id, count);
      }
      setWorkoutCounts(counts);
    };

    if (programs.length > 0) {
      loadWorkoutCounts();
    }
  }, [programs]);

  const handleExport = async (format: 'text' | 'pdf' | 'image') => {
    if (!selectedProgramId) {
      setExportMessage({
        type: 'error',
        text: 'Please select a program first',
      });
      setTimeout(() => setExportMessage(null), 3000);
      return;
    }

    setExportingFormat(format);

    try {
      // Aggregate stats
      const stats = await aggregateProgramStats(selectedProgramId);

      if (stats.totalWorkouts === 0) {
        setExportMessage({
          type: 'error',
          text: 'No workout data found for this program',
        });
        setTimeout(() => setExportMessage(null), 3000);
        setExportingFormat(null);
        return;
      }

      // Export based on format
      switch (format) {
        case 'text': {
          const textContent = exportAsText(stats);
          const success = await copyToClipboard(textContent);

          if (success) {
            setExportMessage({
              type: 'success',
              text: 'Stats copied to clipboard!',
            });
          } else {
            // Fallback: download as file
            const blob = new Blob([textContent], { type: 'text/plain' });
            const filename = generateFilename(stats.program.name, 'txt');
            downloadFile(blob, filename);

            setExportMessage({
              type: 'success',
              text: 'Stats downloaded as text file',
            });
          }
          break;
        }

        case 'image': {
          const imageBlob = await exportAsImage(stats);
          const filename = generateFilename(stats.program.name, 'png');
          downloadFile(imageBlob, filename);

          setExportMessage({
            type: 'success',
            text: 'Stats exported as PNG image',
          });
          break;
        }

        case 'pdf': {
          const pdfBlob = await exportAsPDF(stats);
          const filename = generateFilename(stats.program.name, 'pdf');
          downloadFile(pdfBlob, filename);

          setExportMessage({
            type: 'success',
            text: 'Stats exported as PDF',
          });
          break;
        }
      }

      setTimeout(() => setExportMessage(null), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      setExportMessage({
        type: 'error',
        text: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      setTimeout(() => setExportMessage(null), 5000);
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <div>
      {programs.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400 text-sm italic">
          No programs available. Create a program to export stats.
        </p>
      ) : (
        <div className="space-y-4">
          {/* Program selection */}
          <div>
            <label
              htmlFor="program-select"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Select Program
            </label>
            <select
              id="program-select"
              value={selectedProgramId}
              onChange={(e) => setSelectedProgramId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">-- Choose a program --</option>
              {programs.map((program) => {
                const workoutCount = workoutCounts.get(program.id) ?? 0;
                return (
                  <option key={program.id} value={program.id}>
                    {program.name} ({workoutCount} workout{workoutCount !== 1 ? 's' : ''})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Export message */}
          {exportMessage && (
            <div
              className={`p-4 rounded-xl font-bold text-sm ${
                exportMessage.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-2 border-red-200 dark:border-red-800'
              }`}
            >
              {exportMessage.text}
            </div>
          )}

          {/* Export format buttons */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Export Format
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Text format */}
              <button
                onClick={() => handleExport('text')}
                disabled={!selectedProgramId || exportingFormat !== null}
                className="flex flex-col items-center gap-2 p-4 border-2 border-gray-300 dark:border-slate-600 rounded-xl hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 dark:disabled:hover:border-slate-600"
              >
                <FileText className={`w-6 h-6 ${exportingFormat === 'text' ? 'animate-pulse' : ''} text-gray-700 dark:text-gray-300`} />
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                    {exportingFormat === 'text' ? 'Exporting...' : 'Text'}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Copy to clipboard</div>
                </div>
              </button>

              {/* Image format */}
              <button
                onClick={() => handleExport('image')}
                disabled={!selectedProgramId || exportingFormat !== null}
                className="flex flex-col items-center gap-2 p-4 border-2 border-gray-300 dark:border-slate-600 rounded-xl hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 dark:disabled:hover:border-slate-600"
              >
                <Image className={`w-6 h-6 ${exportingFormat === 'image' ? 'animate-pulse' : ''} text-gray-700 dark:text-gray-300`} />
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                    {exportingFormat === 'image' ? 'Exporting...' : 'Image'}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">PNG format</div>
                </div>
              </button>

              {/* PDF format */}
              <button
                onClick={() => handleExport('pdf')}
                disabled={!selectedProgramId || exportingFormat !== null}
                className="flex flex-col items-center gap-2 p-4 border-2 border-gray-300 dark:border-slate-600 rounded-xl hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 dark:disabled:hover:border-slate-600"
              >
                <FileDown className={`w-6 h-6 ${exportingFormat === 'pdf' ? 'animate-pulse' : ''} text-gray-700 dark:text-gray-300`} />
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                    {exportingFormat === 'pdf' ? 'Exporting...' : 'PDF'}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Document format</div>
                </div>
              </button>
            </div>
          </div>

          {/* Info text */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>What's included:</strong> Total workout stats, per-exercise progress tracking, volume trends, best weights, 1RM estimates, and progression timelines.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
