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

interface ChartDataPoint {
  date: string;
  fullDate: string;
  weight: number;
  volume: number;
  oneRepMax: number;
  reps: number;
}

interface WeightProgressionChartSectionProps {
  chartData: ChartDataPoint[];
}

export function WeightProgressionChartSection({ chartData }: WeightProgressionChartSectionProps) {
  if (chartData.length === 0) return null;

  return (
    <CollapsibleCard
      title="Weight Progression"
      icon={<TrendingUp className="w-6 h-6" />}
      defaultOpen={true}
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
              label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }}
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
              formatter={(value: number, name: string) => {
                if (name === 'weight') return [`${value}kg`, 'Weight'];
                if (name === 'oneRepMax') return [`${value}kg`, 'Est. 1RM'];
                return [value, name];
              }}
              labelFormatter={(label) => {
                const entry = chartData.find((d) => d.date === label);
                return entry ? entry.fullDate : label;
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
