import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ExerciseStats } from '../utils/programStatsAggregator';

interface ExportChartsRendererProps {
  exerciseStats: ExerciseStats[];
  programName: string;
  programVolume: number;
}

// Colors for the pie chart
const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

/**
 * Component that renders charts for export (used in hidden DOM for html2canvas)
 * This component is designed to be rendered off-screen and captured as an image
 */
export function ExportChartsRenderer({ exerciseStats, programName }: ExportChartsRendererProps) {
  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div id="export-charts-container" style={{
      background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
      color: '#f3f4f6',
      padding: '32px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <h2 style={{
        fontSize: '28px',
        fontWeight: '700',
        marginBottom: '40px',
        color: '#fff',
        textAlign: 'center',
        borderBottom: '2px solid #374151',
        paddingBottom: '16px',
      }}>
        {programName} - Progress Charts
      </h2>

      {/* Individual Exercise Progress Charts */}
      {exerciseStats.map((exercise, idx) => {
        // Prepare chart data from progressData
        const chartData = exercise.progressData.map(point => ({
          date: formatDate(point.date),
          fullDate: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          weight: point.weight,
          volume: point.volume,
          oneRepMax: Math.round(point.oneRepMax * 10) / 10,
          reps: point.reps,
        }));

        const hasData = chartData.length > 0;
        const first = exercise.progressData[0];
        const last = exercise.progressData[exercise.progressData.length - 1];
        const improvement1RM = first && last ? ((last.oneRepMax - first.oneRepMax) / first.oneRepMax * 100) : 0;

        return (
          <div key={idx} style={{
            marginBottom: '48px',
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #374151',
          }}>
            {/* Exercise Header */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#fff',
                  margin: 0,
                }}>
                  {idx + 1}. {exercise.exerciseName}
                </h3>
                {improvement1RM > 0 && (
                  <span style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#10b981',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}>
                    +{improvement1RM.toFixed(1)}% 1RM
                  </span>
                )}
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                fontSize: '13px',
              }}>
                <div>
                  <span style={{ color: '#9ca3af' }}>Workouts: </span>
                  <span style={{ color: '#fff', fontWeight: '600' }}>{exercise.totalWorkouts}</span>
                </div>
                <div>
                  <span style={{ color: '#9ca3af' }}>Sets: </span>
                  <span style={{ color: '#fff', fontWeight: '600' }}>{exercise.totalSets}</span>
                </div>
                <div>
                  <span style={{ color: '#9ca3af' }}>Best Weight: </span>
                  <span style={{ color: '#fff', fontWeight: '600' }}>{exercise.bestWeight}kg</span>
                </div>
                <div>
                  <span style={{ color: '#9ca3af' }}>Best 1RM: </span>
                  <span style={{ color: '#fff', fontWeight: '600' }}>{exercise.best1RM.toFixed(1)}kg</span>
                </div>
              </div>
            </div>

            {/* Weight & 1RM Progress Chart */}
            {hasData && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#9ca3af',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Weight & 1RM Progression
                </h4>
                <div style={{ width: '100%', height: '250px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="date"
                        stroke="#9ca3af"
                        style={{ fontSize: '11px' }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        style={{ fontSize: '11px' }}
                        label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft', fill: '#9ca3af', style: { fontSize: '11px' } }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#f3f4f6',
                          fontSize: '12px',
                        }}
                        labelFormatter={(label, payload) => {
                          if (payload && payload[0]) {
                            return payload[0].payload.fullDate;
                          }
                          return label;
                        }}
                        formatter={(value: number, name: string) => {
                          if (name === 'weight') return [`${value}kg`, 'Weight'];
                          if (name === 'oneRepMax') return [`${value}kg`, 'Est. 1RM'];
                          return value;
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                        iconType="line"
                      />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', r: 3 }}
                        name="Weight"
                      />
                      <Line
                        type="monotone"
                        dataKey="oneRepMax"
                        stroke="#10b981"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: '#10b981', r: 3 }}
                        name="Est. 1RM"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Volume Progress Chart */}
            {hasData && (
              <div>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#9ca3af',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  Volume Progression
                </h4>
                <div style={{ width: '100%', height: '220px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="date"
                        stroke="#9ca3af"
                        style={{ fontSize: '11px' }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        style={{ fontSize: '11px' }}
                        label={{ value: 'Volume (kg)', angle: -90, position: 'insideLeft', fill: '#9ca3af', style: { fontSize: '11px' } }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#f3f4f6',
                          fontSize: '12px',
                        }}
                        labelFormatter={(label, payload) => {
                          if (payload && payload[0]) {
                            return payload[0].payload.fullDate;
                          }
                          return label;
                        }}
                        formatter={(value: number) => [`${value}kg`, 'Volume']}
                      />
                      <Bar
                        dataKey="volume"
                        fill="#f59e0b"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Exercise Volume Distribution Pie Chart */}
      {exerciseStats.length > 0 && (
        <div style={{
          marginTop: '48px',
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '32px',
          borderRadius: '12px',
          border: '1px solid #374151',
        }}>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#fff',
            marginBottom: '32px',
            textAlign: 'center',
          }}>
            Exercise Volume Distribution
          </h3>

          <div style={{ width: '100%', height: '550px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={exerciseStats.map(ex => ({
                    name: ex.exerciseName,
                    value: Math.round(ex.totalVolume),
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={180}
                  paddingAngle={2}
                  dataKey="value"
                  label={(entry: any) => {
                    const percent = typeof entry.percent === 'number' ? entry.percent : 0;
                    if (percent < 0.03) return '';
                    return `${(percent * 100).toFixed(1)}%`;
                  }}
                  labelLine={{
                    stroke: '#9ca3af',
                    strokeWidth: 2,
                  }}
                >
                  {exerciseStats.map((_exercise, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                      stroke="#1f2937"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6',
                    fontSize: '14px',
                  }}
                  formatter={(value: number, _name: string, props: any) => {
                    const percent = props.payload.percent || 0;
                    return [`${value.toLocaleString()} kg (${(percent * 100).toFixed(1)}%)`, props.payload.name];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend with percentages */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '12px',
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid #374151',
          }}>
            {exerciseStats.map((exercise, index) => {
              const totalVolume = exerciseStats.reduce((sum, ex) => sum + ex.totalVolume, 0);
              const percent = (exercise.totalVolume / totalVolume) * 100;

              return (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  fontSize: '14px',
                  padding: '8px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '6px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '4px',
                      backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                      flexShrink: 0,
                    }} />
                    <span style={{ color: '#d1d5db', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {exercise.exerciseName}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
                    <span style={{ color: '#9ca3af', fontSize: '13px' }}>
                      {exercise.totalVolume.toLocaleString()}kg
                    </span>
                    <span style={{
                      color: '#fff',
                      fontWeight: '700',
                      fontSize: '14px',
                      minWidth: '50px',
                      textAlign: 'right',
                    }}>
                      {percent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
