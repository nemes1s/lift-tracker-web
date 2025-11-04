import { useState, useRef } from 'react';
import { Copy, Download, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import type { Workout, ExerciseInstance, SetRecord } from '../../types/models';
import { formatWorkoutAsText, generateWorkoutHTML } from '../../utils/workoutExporter';
import { copyToClipboard } from '../../utils/workoutExporter';

interface ExerciseWithSets {
  exercise: ExerciseInstance;
  sets: SetRecord[];
}

interface WorkoutExportMenuProps {
  workout: Workout;
  exercisesWithSets: ExerciseWithSets[];
}

export function WorkoutExportMenu({ workout, exercisesWithSets }: WorkoutExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCopyToClipboard = async () => {
    const text = formatWorkoutAsText(workout, exercisesWithSets);
    const success = await copyToClipboard(text);

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadImage = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      // Create a temporary container
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'fixed';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.innerHTML = generateWorkoutHTML(workout, exercisesWithSets);
      document.body.appendChild(tempDiv);

      // Wait for fonts and images to load
      await new Promise(resolve => setTimeout(resolve, 500));

      const element = tempDiv.querySelector('#workout-export-card') as HTMLElement;
      if (!element) {
        console.error('Export card not found');
        return;
      }

      // Convert to canvas
      const canvas = await html2canvas(element, {
        backgroundColor: '#111827',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      // Download
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `workout-${workout.startedAt.toISOString().split('T')[0]}.png`;
      link.click();

      // Cleanup
      document.body.removeChild(tempDiv);
    } catch (error) {
      console.error('Failed to generate image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
      >
        <Download size={16} />
        Export Stats
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
          {/* Copy to Clipboard */}
          <button
            onClick={() => {
              handleCopyToClipboard();
              setIsOpen(false);
            }}
            className="w-full px-4 py-3 text-left text-sm text-gray-100 hover:bg-slate-700 transition-colors flex items-center gap-2 border-b border-slate-700"
          >
            {copied ? (
              <>
                <Check size={16} className="text-green-500" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>

          {/* Download Image */}
          <button
            onClick={handleDownloadImage}
            disabled={isGenerating}
            className="w-full px-4 py-3 text-left text-sm text-gray-100 hover:bg-slate-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            <span>{isGenerating ? 'Generating...' : 'Download as Image'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
