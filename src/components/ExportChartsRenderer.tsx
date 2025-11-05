import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ExerciseStats } from '../utils/programStatsAggregator';

interface ExportChartsRendererProps {
  exerciseStats: ExerciseStats[];
  programName: string;
  programVolume: number;
}

/**
 * Component that renders charts for export (used in hidden DOM for html2canvas)
 * This component is designed to be rendered off-screen and captured as an image
 */
export function ExportChartsRenderer({ exerciseStats, programName }: ExportChartsRendererProps) {
  // Prepare chart data for top exercises (up to 6 exercises)
  const topExercises = exerciseStats.slice(0, 6);

  return (
    <div id="export-charts-container" style={{
      background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
      color: '#f3f4f6',
      padding: '32px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: '700',
        marginBottom: '32px',
        color: '#fff',
        textAlign: 'center',
      }}>
        {programName} - Visual Progress
      </h2>

      {/* Exercise Volume Comparison Chart */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '16px',
          color: '#fff',
        }}>
          Total Volume by Exercise (Top 6)
        </h3>
        <div style={{ width: '100%', height: '350px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topExercises.map(ex => ({
                name: ex.exerciseName.length > 20 ? ex.exerciseName.substring(0, 20) + '...' : ex.exerciseName,
                volume: Math.round(ex.totalVolume),
              }))}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="name"
                stroke="#9ca3af"
                angle={-45}
                textAnchor="end"
                height={100}
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
                label={{ value: 'Volume (kg)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f3f4f6',
                }}
                formatter={(value: number) => `${value.toLocaleString()} kg`}
              />
              <Bar dataKey="volume" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 1RM Progress Comparison Chart */}
      <div style={{ marginBottom: '48px' }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '16px',
          color: '#fff',
        }}>
          Estimated 1RM Progress (Top 6)
        </h3>
        <div style={{ width: '100%', height: '350px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topExercises.map(ex => {
                const first = ex.progressData[0];
                const last = ex.progressData[ex.progressData.length - 1];
                const improvement = first && last ? ((last.oneRepMax - first.oneRepMax) / first.oneRepMax * 100) : 0;

                return {
                  name: ex.exerciseName.length > 20 ? ex.exerciseName.substring(0, 20) + '...' : ex.exerciseName,
                  start: first ? Math.round(first.oneRepMax * 10) / 10 : 0,
                  current: last ? Math.round(last.oneRepMax * 10) / 10 : 0,
                  improvement: Math.round(improvement * 10) / 10,
                };
              })}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="name"
                stroke="#9ca3af"
                angle={-45}
                textAnchor="end"
                height={100}
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
                label={{ value: '1RM (kg)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f3f4f6',
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'start') return [`${value} kg`, 'Starting 1RM'];
                  if (name === 'current') return [`${value} kg`, 'Current 1RM'];
                  if (name === 'improvement') return [`+${value}%`, 'Improvement'];
                  return value;
                }}
              />
              <Legend
                wrapperStyle={{ color: '#9ca3af', paddingTop: '16px' }}
                iconType="square"
              />
              <Bar dataKey="start" fill="#6b7280" name="Starting 1RM" radius={[8, 8, 0, 0]} />
              <Bar dataKey="current" fill="#10b981" name="Current 1RM" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Exercise Frequency */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '16px',
          color: '#fff',
        }}>
          Workout Frequency Distribution (Top 6)
        </h3>
        <div style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topExercises.map(ex => ({
                name: ex.exerciseName.length > 20 ? ex.exerciseName.substring(0, 20) + '...' : ex.exerciseName,
                workouts: ex.totalWorkouts,
              }))}
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              layout="horizontal"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="name"
                stroke="#9ca3af"
                angle={-45}
                textAnchor="end"
                height={100}
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
                label={{ value: 'Workouts', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f3f4f6',
                }}
                formatter={(value: number) => [`${value}`, 'Workouts']}
              />
              <Bar dataKey="workouts" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
