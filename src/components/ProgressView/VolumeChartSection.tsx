import { BarChart3 } from 'lucide-react';
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

interface ChartDataPoint {
  date: string;
  fullDate: string;
  weight: number;
  volume: number;
  oneRepMax: number;
  reps: number;
}

interface VolumeChartSectionProps {
  chartData: ChartDataPoint[];
}

export function VolumeChartSection({ chartData }: VolumeChartSectionProps) {
  if (chartData.length === 0) return null;

  return (
    <CollapsibleCard
      title="Volume per Workout"
      icon={<BarChart3 className="w-6 h-6" />}
      defaultOpen={false}
    >
      <div className="mt-2">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis
              label={{ value: 'Volume (kg)', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '2px solid #f97316',
                borderRadius: '0.75rem',
                fontWeight: 'bold',
              }}
              formatter={(value: number) => [`${value}kg`, 'Volume (Weight × Reps)']}
              labelFormatter={(label) => {
                const entry = chartData.find((d) => d.date === label);
                return entry ? entry.fullDate : label;
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="volume"
              stroke="#f97316"
              strokeWidth={3}
              dot={{ fill: '#f97316', r: 5 }}
              name="Volume"
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
          Volume = Weight × Reps (best set per workout)
        </p>
      </div>
    </CollapsibleCard>
  );
}
