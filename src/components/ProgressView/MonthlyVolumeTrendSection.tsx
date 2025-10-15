import { TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CollapsibleCard } from '../CollapsibleCard';
import { formatVolume } from '../../utils/workoutStats';
import type { MonthlyVolume } from '../../utils/globalStats';

interface MonthlyVolumeTrendSectionProps {
  monthlyTrend: MonthlyVolume[];
}

export function MonthlyVolumeTrendSection({ monthlyTrend }: MonthlyVolumeTrendSectionProps) {
  if (monthlyTrend.length === 0 || !monthlyTrend.some(m => m.volume > 0)) return null;

  return (
    <CollapsibleCard
      title="Monthly Volume Trend"
      icon={<TrendingUp className="w-6 h-6" />}
      defaultOpen={false}
    >
      <div className="mt-2">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '2px solid #2563eb',
                borderRadius: '0.75rem',
                fontWeight: 'bold',
              }}
              formatter={(value: number) => [`${formatVolume(value)} kg`, 'Volume']}
            />
            <Bar dataKey="volume" fill="#2563eb" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CollapsibleCard>
  );
}
