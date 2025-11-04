import type { Workout, ExerciseInstance, SetRecord } from '../types/models';
import { calculateWorkoutStats } from './workoutStats';
import { formatVolume, formatDuration } from './workoutStats';

export interface ExerciseWithSets {
  exercise: ExerciseInstance;
  sets: SetRecord[];
}

/**
 * Format a workout as plain text for clipboard sharing
 * Minimal detail: exercise name, sets, reps, weight, total volume, duration
 */
export function formatWorkoutAsText(
  workout: Workout,
  exercisesWithSets: ExerciseWithSets[]
): string {
  const stats = calculateWorkoutStats(exercisesWithSets, workout.startedAt, workout.endedAt, workout.totalPausedMs);

  const dateStr = workout.startedAt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  let text = `${workout.name}\n`;
  text += `${dateStr} • ${formatDuration(stats.duration)} • ${formatVolume(stats.totalVolume)} kg\n\n`;

  for (const { exercise, sets } of exercisesWithSets) {
    const workingSets = sets.filter(s => !s.isWarmup);
    if (workingSets.length === 0) continue;

    // Group sets by weight
    const setsByWeight = new Map<string, number>();
    for (const set of workingSets) {
      const key = `${set.weight}kg`;
      setsByWeight.set(key, (setsByWeight.get(key) || 0) + 1);
    }

    // Format as "3x8 @ 100kg" or similar
    const setLines: string[] = [];
    for (const set of workingSets) {
      setLines.push(`${set.reps}@${set.weight}kg`);
    }

    text += `${exercise.name}\n`;
    text += `${workingSets.length}x${workingSets[0]?.reps || '?'} @ ${workingSets[0]?.weight || 0}kg`;

    // Add additional set weights if varied
    if (new Set(workingSets.map(s => s.weight)).size > 1) {
      const weights = [...new Set(workingSets.map(s => s.weight))].sort((a, b) => a - b);
      text += ` (${weights.join(', ')}kg)`;
    }
    text += '\n\n';
  }

  return text.trim();
}

/**
 * Generate HTML for rendering a workout summary (for image export)
 */
export function generateWorkoutHTML(
  workout: Workout,
  exercisesWithSets: ExerciseWithSets[]
): string {
  const stats = calculateWorkoutStats(exercisesWithSets, workout.startedAt, workout.endedAt, workout.totalPausedMs);

  const dateStr = workout.startedAt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  let html = `
    <div id="workout-export-card" style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      width: 800px;
      background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
      color: #f3f4f6;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
    ">
      <!-- Header -->
      <div style="margin-bottom: 32px;">
        <h1 style="
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 16px 0;
          color: #fff;
        ">${workout.name}</h1>
        <div style="
          display: flex;
          gap: 24px;
          font-size: 14px;
          color: #d1d5db;
        ">
          <span>📅 ${dateStr}</span>
          <span>⏱️ ${formatDuration(stats.duration)}</span>
          <span>🏋️ ${formatVolume(stats.totalVolume)} kg</span>
        </div>
      </div>

      <!-- Exercises -->
      <div style="margin-bottom: 24px;">
  `;

  for (const { exercise, sets } of exercisesWithSets) {
    const workingSets = sets.filter(s => !s.isWarmup);
    if (workingSets.length === 0) continue;

    const setInfo = workingSets.map(s => `${s.reps}@${s.weight}kg`).join(' • ');

    html += `
      <div style="
        margin-bottom: 20px;
        padding-bottom: 20px;
        border-bottom: 1px solid #374151;
      ">
        <h3 style="
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: #fff;
        ">${exercise.name}</h3>
        <p style="
          font-size: 14px;
          margin: 0;
          color: #9ca3af;
        ">${workingSets.length} sets • ${setInfo}</p>
      </div>
    `;
  }

  html += `
      </div>

      <!-- Footer -->
      <div style="
        text-align: center;
        padding-top: 16px;
        border-top: 1px solid #374151;
        font-size: 12px;
        color: #6b7280;
      ">
        Exported from LiftTracker
      </div>
    </div>
  `;

  return html;
}

/**
 * Copy text to clipboard with fallback for older browsers
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
