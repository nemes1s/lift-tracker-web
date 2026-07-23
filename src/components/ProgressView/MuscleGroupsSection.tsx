import { useEffect, useState } from 'react';
import { Dumbbell } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { MuscleFrequency } from '../../utils/muscleGroupStats';
import { getMuscleFrequency } from '../../utils/muscleGroupStats';

const MUSCLE_COLORS: Record<string, string> = {
  chest: '#6366f1',
  'middle back': '#8b5cf6',
  'lower back': '#a78bfa',
  lats: '#7c3aed',
  shoulders: '#3b82f6',
  biceps: '#f59e0b',
  triceps: '#ef4444',
  forearms: '#f97316',
  quadriceps: '#10b981',
  hamstrings: '#059669',
  glutes: '#14b8a6',
  calves: '#06b6d4',
  abdominals: '#ec4899',
  neck: '#94a3b8',
  traps: '#64748b',
  abductors: '#22d3ee',
  adductors: '#4ade80',
};

function muscleColor(muscle: string): string {
  return MUSCLE_COLORS[muscle.toLowerCase()] ?? '#94a3b8';
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

interface Props {
  refreshKey?: number;
}

export function MuscleGroupsSection({ refreshKey }: Props) {
  const [window, setWindow] = useState<28 | 56 | 84>(28);
  const [data, setData] = useState<MuscleFrequency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getMuscleFrequency(window).then(d => {
      setData(d);
      setLoading(false);
    });
  }, [window, refreshKey]);

  const chartData = data.slice(0, 12).map(d => ({
    muscle: capitalize(d.muscle),
    count: d.workoutCount,
    color: muscleColor(d.muscle),
  }));

  const leastTrained = [...data].sort((a, b) => a.workoutCount - b.workoutCount).slice(0, 3);

  return (
    <div className="card p-6 bg-white dark:bg-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
            <Dumbbell className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Muscle Groups</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Workouts per muscle group</p>
          </div>
        </div>

        <div className="flex gap-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
          {([28, 56, 84] as const).map(w => (
            <button
              key={w}
              onClick={() => setWindow(w)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                window === w
                  ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {w === 28 ? '4w' : w === 56 ? '8w' : '12w'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-600" />
        </div>
      ) : data.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
          No muscle data yet — migrate exercises to the library first.
        </p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 40 }}>
              <XAxis
                dataKey="muscle"
                tick={{ fontSize: 11, fill: 'currentColor' }}
                angle={-35}
                textAnchor="end"
                interval={0}
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                formatter={(value: number | undefined) => [`${value ?? 0} workout${(value ?? 0) !== 1 ? 's' : ''}`, 'Trained']}
                contentStyle={{ fontSize: 12 }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {leastTrained.length > 0 && data.length >= 4 && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Least trained
              </p>
              <div className="flex flex-wrap gap-2">
                {leastTrained.map(m => (
                  <span
                    key={m.muscle}
                    className="text-xs px-2.5 py-1 rounded-full border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300"
                    style={{ borderColor: muscleColor(m.muscle) + '60' }}
                  >
                    {capitalize(m.muscle)}
                    <span className="ml-1 text-gray-400 dark:text-gray-500">{m.workoutCount}×</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
