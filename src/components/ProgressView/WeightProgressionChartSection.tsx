import { TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CollapsibleCard } from '../CollapsibleCard';
import { convertWeight, getUnitLabel, type WeightUnit } from '../../utils/weightUnit';

interface ChartDataPoint {
  date: string;
  fullDate: string;
  weight: number;
  volume: number;
  oneRepMax: number;
  reps: number;
  isQuickWorkout?: boolean;
}

interface WeightProgressionChartSectionProps {
  chartData: ChartDataPoint[];
  weightUnit?: WeightUnit;
}

export function WeightProgressionChartSection({ chartData, weightUnit = 'kg' }: WeightProgressionChartSectionProps) {
  if (chartData.length === 0) return null;

  const unitLabel = getUnitLabel(weightUnit);

  // Convert chart data to display unit
  const displayData = chartData.map(point => ({
    ...point,
    weight: Math.round(convertWeight(point.weight, weightUnit) * 10) / 10,
    oneRepMax: Math.round(convertWeight(point.oneRepMax, weightUnit) * 10) / 10,
  }));

  return (
    <CollapsibleCard
      title="Weight Progression"
      icon={<TrendingUp className="w-6 h-6" />}
      defaultOpen={true}
    >
      <div className="mt-2">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={displayData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis
              label={{ value: `Weight (${unitLabel})`, angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '2px solid #2563eb',
                borderRadius: '0.75rem',
                fontWeight: 'bold',
              }}
              formatter={(value: number | undefined, name: string | undefined) => {
                if (value === undefined) return ['-', name ?? ''];
                if (name === 'weight') return [`${value}${unitLabel}`, 'Weight'];
                if (name === 'oneRepMax') return [`${value}${unitLabel}`, 'Est. 1RM'];
                return [value, name ?? ''];
              }}
              labelFormatter={(label) => {
                const entry = chartData.find((d) => d.date === label);
                if (entry) {
                  const dateStr = entry.fullDate;
                  const badge = entry.isQuickWorkout ? ' ⚡ Quick Workout' : '';
                  return dateStr + badge;
                }
                return label;
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ fill: '#2563eb', r: 5 }}
              name="Weight"
            />
            <Line
              type="monotone"
              dataKey="oneRepMax"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#10b981', r: 4 }}
              name="Est. 1RM"
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
          Showing best set from each workout session
        </p>
      </div>
    </CollapsibleCard>
  );
}
