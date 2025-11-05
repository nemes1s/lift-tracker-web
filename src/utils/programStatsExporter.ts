import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { ProgramStats } from './programStatsAggregator';
import { formatDate, formatVolume } from './programStatsAggregator';

/**
 * Export program stats as plain text
 */
export function exportAsText(stats: ProgramStats): string {
  const { program, totalWorkouts, totalVolume, totalSets, dateRange, exerciseStats } = stats;

  let text = '';
  text += `${program.name} - Training Statistics\n`;
  text += '='.repeat(50) + '\n\n';

  // Overall stats
  text += `Program Duration: ${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}\n`;
  text += `Total Workouts: ${totalWorkouts}\n`;
  text += `Total Sets: ${totalSets}\n`;
  text += `Total Volume: ${formatVolume(totalVolume)} kg\n`;
  text += `Total Weeks: ${program.totalWeeks}\n\n`;

  // Per-exercise stats
  text += `Exercise Statistics (${exerciseStats.length} exercises)\n`;
  text += '-'.repeat(50) + '\n\n';

  for (const exercise of exerciseStats) {
    text += `${exercise.exerciseName}\n`;
    text += `  Workouts: ${exercise.totalWorkouts}\n`;
    text += `  Total Sets: ${exercise.totalSets}\n`;
    text += `  Total Volume: ${formatVolume(exercise.totalVolume)} kg\n`;
    text += `  Best Weight: ${exercise.bestWeight} kg\n`;
    text += `  Best 1RM: ${exercise.best1RM.toFixed(1)} kg\n`;
    text += `  First: ${formatDate(exercise.firstWorkoutDate)} | Last: ${formatDate(exercise.lastWorkoutDate)}\n`;

    // Progress summary (first and last performance)
    if (exercise.progressData.length > 0) {
      const first = exercise.progressData[0];
      const last = exercise.progressData[exercise.progressData.length - 1];
      const improvement1RM = ((last.oneRepMax - first.oneRepMax) / first.oneRepMax * 100);

      text += `  Progress: ${first.weight}kg x ${first.reps} → ${last.weight}kg x ${last.reps}`;
      if (improvement1RM > 0) {
        text += ` (+${improvement1RM.toFixed(1)}% 1RM)`;
      }
      text += '\n';
    }
    text += '\n';
  }

  text += '\nExported from LiftTracker\n';
  return text;
}

/**
 * Generate HTML for program stats (used for image and PDF export)
 */
export function generateProgramStatsHTML(stats: ProgramStats): string {
  const { program, totalWorkouts, totalVolume, totalSets, dateRange, exerciseStats } = stats;

  return `
    <div id="program-stats-export" style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      width: 1200px;
      background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
      color: #f3f4f6;
      padding: 48px;
      box-sizing: border-box;
    ">
      <!-- Header -->
      <div style="margin-bottom: 40px; border-bottom: 2px solid #374151; padding-bottom: 24px;">
        <h1 style="
          font-size: 36px;
          font-weight: 700;
          margin: 0 0 16px 0;
          color: #fff;
        ">${program.name}</h1>
        <h2 style="
          font-size: 20px;
          font-weight: 400;
          margin: 0 0 24px 0;
          color: #9ca3af;
        ">Training Statistics</h2>

        <!-- Overall Stats Grid -->
        <div style="
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-top: 24px;
        ">
          <div style="
            background: rgba(255, 255, 255, 0.05);
            padding: 16px;
            border-radius: 8px;
          ">
            <div style="color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Duration</div>
            <div style="color: #fff; font-size: 16px; font-weight: 600;">${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}</div>
          </div>
          <div style="
            background: rgba(255, 255, 255, 0.05);
            padding: 16px;
            border-radius: 8px;
          ">
            <div style="color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Total Workouts</div>
            <div style="color: #fff; font-size: 24px; font-weight: 700;">${totalWorkouts}</div>
          </div>
          <div style="
            background: rgba(255, 255, 255, 0.05);
            padding: 16px;
            border-radius: 8px;
          ">
            <div style="color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Total Volume</div>
            <div style="color: #fff; font-size: 24px; font-weight: 700;">${formatVolume(totalVolume)} kg</div>
          </div>
          <div style="
            background: rgba(255, 255, 255, 0.05);
            padding: 16px;
            border-radius: 8px;
          ">
            <div style="color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Total Sets</div>
            <div style="color: #fff; font-size: 24px; font-weight: 700;">${totalSets}</div>
          </div>
        </div>
      </div>

      <!-- Exercise Stats -->
      <div>
        <h3 style="
          font-size: 24px;
          font-weight: 600;
          margin: 0 0 24px 0;
          color: #fff;
        ">Exercise Progress (${exerciseStats.length} exercises)</h3>

        ${exerciseStats.map((exercise, idx) => {
          const first = exercise.progressData[0];
          const last = exercise.progressData[exercise.progressData.length - 1];
          const improvement1RM = first && last ? ((last.oneRepMax - first.oneRepMax) / first.oneRepMax * 100) : 0;
          const hasImprovement = improvement1RM > 0;

          return `
            <div style="
              background: rgba(255, 255, 255, 0.03);
              padding: 20px;
              margin-bottom: 16px;
              border-radius: 8px;
              border-left: 4px solid ${hasImprovement ? '#10b981' : '#374151'};
            ">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                <div>
                  <h4 style="
                    font-size: 18px;
                    font-weight: 600;
                    margin: 0 0 8px 0;
                    color: #fff;
                  ">${idx + 1}. ${exercise.exerciseName}</h4>
                  <div style="color: #9ca3af; font-size: 13px;">
                    ${exercise.totalWorkouts} workouts • ${exercise.totalSets} sets
                  </div>
                </div>
                ${hasImprovement ? `
                  <div style="
                    background: rgba(16, 185, 129, 0.2);
                    color: #10b981;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 600;
                  ">+${improvement1RM.toFixed(1)}% 1RM</div>
                ` : ''}
              </div>

              <!-- Stats Grid -->
              <div style="
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 16px;
                margin-bottom: 12px;
              ">
                <div>
                  <div style="color: #6b7280; font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">Volume</div>
                  <div style="color: #fff; font-size: 15px; font-weight: 600;">${formatVolume(exercise.totalVolume)} kg</div>
                </div>
                <div>
                  <div style="color: #6b7280; font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">Best Weight</div>
                  <div style="color: #fff; font-size: 15px; font-weight: 600;">${exercise.bestWeight} kg</div>
                </div>
                <div>
                  <div style="color: #6b7280; font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">Best 1RM</div>
                  <div style="color: #fff; font-size: 15px; font-weight: 600;">${exercise.best1RM.toFixed(1)} kg</div>
                </div>
                <div>
                  <div style="color: #6b7280; font-size: 11px; text-transform: uppercase; margin-bottom: 4px;">Frequency</div>
                  <div style="color: #fff; font-size: 15px; font-weight: 600;">${(exercise.totalWorkouts / totalWorkouts * 100).toFixed(0)}%</div>
                </div>
              </div>

              ${first && last ? `
                <div style="
                  background: rgba(0, 0, 0, 0.2);
                  padding: 12px;
                  border-radius: 6px;
                  font-size: 13px;
                  color: #d1d5db;
                ">
                  <strong style="color: #fff;">Progress:</strong>
                  ${first.weight}kg × ${first.reps} (${formatDate(exercise.firstWorkoutDate)}) →
                  ${last.weight}kg × ${last.reps} (${formatDate(exercise.lastWorkoutDate)})
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>

      <!-- Footer -->
      <div style="
        text-align: center;
        padding-top: 32px;
        margin-top: 32px;
        border-top: 1px solid #374151;
        font-size: 12px;
        color: #6b7280;
      ">
        Exported from LiftTracker • ${formatDate(new Date())}
      </div>
    </div>
  `;
}

/**
 * Export program stats as PNG image
 */
export async function exportAsImage(stats: ProgramStats): Promise<Blob> {
  // Create a temporary container
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.innerHTML = generateProgramStatsHTML(stats);
  document.body.appendChild(container);

  try {
    // Generate canvas from HTML
    const canvas = await html2canvas(container.querySelector('#program-stats-export')! as HTMLElement, {
      backgroundColor: '#111827',
      scale: 2, // Higher quality
      logging: false,
    });

    // Convert to blob
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create image blob'));
        }
      }, 'image/png');
    });
  } finally {
    // Cleanup
    document.body.removeChild(container);
  }
}

/**
 * Export program stats as PDF
 */
export async function exportAsPDF(stats: ProgramStats): Promise<Blob> {
  // Create a temporary container
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.innerHTML = generateProgramStatsHTML(stats);
  document.body.appendChild(container);

  try {
    // Generate canvas from HTML
    const canvas = await html2canvas(container.querySelector('#program-stats-export')! as HTMLElement, {
      backgroundColor: '#111827',
      scale: 2,
      logging: false,
    });

    // Calculate PDF dimensions
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Create PDF
    const pdf = new jsPDF({
      orientation: imgHeight > imgWidth ? 'portrait' : 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Add image to PDF
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    // Return as blob
    return pdf.output('blob');
  } finally {
    // Cleanup
    document.body.removeChild(container);
  }
}

/**
 * Download a file with the given content
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Generate a safe filename for export
 */
export function generateFilename(programName: string, format: 'txt' | 'pdf' | 'png'): string {
  const safeName = programName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const date = new Date().toISOString().split('T')[0];
  return `${safeName}_stats_${date}.${format}`;
}
