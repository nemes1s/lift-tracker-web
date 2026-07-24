import { Activity, Flame, Zap, Clock } from 'lucide-react';
import { formatVolume, formatRPE, formatDuration } from '../../utils/workoutStats';

interface WorkoutStats {
  totalVolume: number;
  estimatedCalories: number;
  averageRPE: number;
  duration: number;
}

interface WorkoutStatsSectionProps {
  stats: WorkoutStats;
}

export function WorkoutStatsSection({ stats }: WorkoutStatsSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <h4 className="col-span-2 font-bold text-gray-900 text-lg">Workout Stats:</h4>
      <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-3 border-2 border-primary-100 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-4 h-4 text-primary-600" />
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Volume</span>
        </div>
        <p className="text-xl font-bold text-primary-700">{formatVolume(stats.totalVolume)} kg</p>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl p-3 border-2 border-orange-100 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Flame className="w-4 h-4 text-orange-600" />
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Calories</span>
        </div>
        <p className="text-xl font-bold text-orange-700">~{stats.estimatedCalories}</p>
      </div>

      {stats.averageRPE > 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-3 border-2 border-purple-100 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Avg RPE</span>
          </div>
          <p className="text-xl font-bold text-purple-700">{formatRPE(stats.averageRPE)}</p>
        </div>
      )}

      <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-3 border-2 border-blue-100 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Duration</span>
        </div>
        <p className="text-xl font-bold text-blue-700">{formatDuration(stats.duration)}</p>
      </div>
    </div>
  );
}
