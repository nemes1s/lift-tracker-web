import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import {
  getAllExerciseNames,
  getExerciseStats,
  getBestSetPerWorkout,
  type ExerciseProgressData,
  type ExerciseStats,
} from '../utils/progressTracking';
import {
  getGlobalStats,
  getWeeklyComparison,
  getMonthlyVolumeTrend,
  getRepPRs,
  getExerciseConsistency,
  type GlobalStats,
  type WeeklyComparison,
  type MonthlyVolume,
  type RepPR,
} from '../utils/globalStats';
import { GlobalOverviewSection } from '../components/ProgressView/GlobalOverviewSection';
import { WeeklyComparisonSection } from '../components/ProgressView/WeeklyComparisonSection';
import { MonthlyVolumeTrendSection } from '../components/ProgressView/MonthlyVolumeTrendSection';
import { ExerciseSelectorSection } from '../components/ProgressView/ExerciseSelectorSection';
import { ExerciseStatsSection } from '../components/ProgressView/ExerciseStatsSection';
import { RepPRsSection } from '../components/ProgressView/RepPRsSection';
import { WeightProgressionChartSection } from '../components/ProgressView/WeightProgressionChartSection';
import { VolumeChartSection } from '../components/ProgressView/VolumeChartSection';
import { EmptyStates } from '../components/ProgressView/EmptyStates';

export function ProgressView() {
  const [exercises, setExercises] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [progressData, setProgressData] = useState<ExerciseProgressData[]>([]);
  const [stats, setStats] = useState<ExerciseStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Global stats
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [weeklyComparison, setWeeklyComparison] = useState<WeeklyComparison | null>(null);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyVolume[]>([]);

  // Exercise-specific enhanced metrics
  const [repPRs, setRepPRs] = useState<RepPR[]>([]);
  const [consistency, setConsistency] = useState<number | null>(null);

  // Load all exercises and global stats
  useEffect(() => {
    const loadExercises = async () => {
      const names = await getAllExerciseNames();
      setExercises(names);

      // Auto-select first exercise if available
      if (names.length > 0 && !selectedExercise) {
        setSelectedExercise(names[0]);
      }

      // Load global stats
      const gStats = await getGlobalStats();
      setGlobalStats(gStats);

      const wComparison = await getWeeklyComparison();
      setWeeklyComparison(wComparison);

      const mTrend = await getMonthlyVolumeTrend();
      setMonthlyTrend(mTrend);

      setLoading(false);
    };

    loadExercises();
  }, []);

  // Load exercise data when selection changes
  useEffect(() => {
    const loadExerciseData = async () => {
      if (!selectedExercise) {
        setProgressData([]);
        setStats(null);
        setRepPRs([]);
        setConsistency(null);
        return;
      }

      setLoading(true);

      // Get best set per workout (cleaner chart)
      const data = await getBestSetPerWorkout(selectedExercise);
      setProgressData(data);

      // Get stats
      const exerciseStats = await getExerciseStats(selectedExercise);
      setStats(exerciseStats);

      // Get rep PRs
      const prs = await getRepPRs(selectedExercise);
      setRepPRs(prs);

      // Get consistency
      const consistencyScore = await getExerciseConsistency(selectedExercise);
      setConsistency(consistencyScore);

      setLoading(false);
    };

    loadExerciseData();
  }, [selectedExercise]);

  // Format data for charts
  const chartData = progressData.map((d) => ({
    date: d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    fullDate: d.date.toLocaleDateString(),
    weight: d.weight,
    volume: d.volume,
    oneRepMax: Math.round(d.oneRepMax * 10) / 10,
    reps: d.reps,
    isQuickWorkout: d.isQuickWorkout ?? false,
  }));

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="card p-6 bg-white dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-600 rounded-2xl shadow-lg">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-700 dark:text-primary-400">Progress</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Track your gains over time</p>
            </div>
          </div>
        </div>

        {/* Global Overview Stats */}
        <GlobalOverviewSection globalStats={globalStats} />

        {/* Weekly Comparison */}
        <WeeklyComparisonSection weeklyComparison={weeklyComparison} />

        {/* Monthly Volume Trend */}
        <MonthlyVolumeTrendSection monthlyTrend={monthlyTrend} />

        {/* Exercise Selector */}
        <ExerciseSelectorSection
          exercises={exercises}
          selectedExercise={selectedExercise}
          onExerciseChange={setSelectedExercise}
        />

        {/* Exercise-specific sections (only shown when exercise is selected and has data) */}
        {exercises.length > 0 && (
          <>
            {/* Exercise Stats */}
            <ExerciseStatsSection stats={stats} consistency={consistency} />

            {/* Rep PRs */}
            <RepPRsSection repPRs={repPRs} />

            {/* Weight Progression Chart */}
            <WeightProgressionChartSection chartData={chartData} />

            {/* Volume Chart */}
            <VolumeChartSection chartData={chartData} />
          </>
        )}

        {/* Empty States */}
        <EmptyStates
          hasExercises={exercises.length > 0}
          hasProgressData={progressData.length > 0}
          loading={loading}
        />
      </div>
    </div>
  );
}
