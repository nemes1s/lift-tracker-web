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

interface WeeklyVolumeTrendSectionProps {
  weeklyTrend: MonthlyVolume[];
}

export function WeeklyVolumeTrendSection({ weeklyTrend }: WeeklyVolumeTrendSectionProps) {
  if (weeklyTrend.length === 0 || !weeklyTrend.some(w => w.volume > 0)) return null;

  return (
    <CollapsibleCard
      title="Weekly Volume Trend"
      icon={<TrendingUp className="w-6 h-6" />}
      defaultOpen={false}
    >
      <div className="mt-2">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={weeklyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '2px solid #10b981',
                borderRadius: '0.75rem',
                fontWeight: 'bold',
              }}
              formatter={(value: number | undefined) => value !== undefined ? [`${formatVolume(value)} kg`, 'Volume'] : ['-', 'Volume']}
            />
            <Bar dataKey="volume" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CollapsibleCard>
  );
}
