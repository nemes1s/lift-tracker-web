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
  getWeeklyVolumeTrend,
  getRepPRs,
  getExerciseConsistency,
  type GlobalStats,
  type WeeklyComparison,
  type MonthlyVolume,
  type RepPR,
} from '../utils/globalStats';
import { getProgramCompletions } from '../utils/programCompletion';
import type { ProgramCompletion } from '../types/models';
import { GlobalOverviewSection } from '../components/ProgressView/GlobalOverviewSection';
import { WeeklyComparisonSection } from '../components/ProgressView/WeeklyComparisonSection';
import { MonthlyVolumeTrendSection } from '../components/ProgressView/MonthlyVolumeTrendSection';
import { WeeklyVolumeTrendSection } from '../components/ProgressView/WeeklyVolumeTrendSection';
import { ProgramHistorySection } from '../components/ProgressView/ProgramHistorySection';
import { ExerciseSelectorSection } from '../components/ProgressView/ExerciseSelectorSection';
import { ExerciseStatsSection } from '../components/ProgressView/ExerciseStatsSection';
import { RepPRsSection } from '../components/ProgressView/RepPRsSection';
import { WeightProgressionChartSection } from '../components/ProgressView/WeightProgressionChartSection';
import { VolumeChartSection } from '../components/ProgressView/VolumeChartSection';
import { EmptyStates } from '../components/ProgressView/EmptyStates';
import { useAppStore } from '../store/appStore';
import { getExerciseVariants } from '../utils/exerciseMatching';

export function ProgressView() {
  const [exercises, setExercises] = useState<string[]>([]);
  const [progressData, setProgressData] = useState<ExerciseProgressData[]>([]);
  const [stats, setStats] = useState<ExerciseStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Get selected exercise and combine setting from persisted store
  const selectedExercise = useAppStore(state => state.progressPreferences.selectedExercise);
  const setSelectedExercise = useAppStore(state => state.setSelectedExercise);
  const combineSimilarExercises = useAppStore(state => state.progressPreferences.combineSimilarExercises);

  // Global stats
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [weeklyComparison, setWeeklyComparison] = useState<WeeklyComparison | null>(null);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyVolume[]>([]);
  const [weeklyTrend, setWeeklyTrend] = useState<MonthlyVolume[]>([]);

  // Exercise-specific enhanced metrics
  const [repPRs, setRepPRs] = useState<RepPR[]>([]);
  const [consistency, setConsistency] = useState<number | null>(null);

  // Program completions
  const [programCompletions, setProgramCompletions] = useState<ProgramCompletion[]>([]);

  // Load all exercises and global stats
  useEffect(() => {
    const loadExercises = async () => {
      const names = await getAllExerciseNames();
      setExercises(names);

      // Handle exercise selection: prefer persisted, fallback to first, or validate persisted still exists
      if (names.length > 0) {
        if (!selectedExercise) {
          // No exercise selected, select first one
          setSelectedExercise(names[0]);
        } else if (!names.includes(selectedExercise)) {
          // Previously selected exercise no longer exists (data deleted), select first one
          setSelectedExercise(names[0]);
        }
        // else: persisted exercise still exists, keep it selected
      }

      // Load global stats
      const gStats = await getGlobalStats();
      setGlobalStats(gStats);

      const wComparison = await getWeeklyComparison();
      setWeeklyComparison(wComparison);

      const mTrend = await getMonthlyVolumeTrend();
      setMonthlyTrend(mTrend);

      const wTrend = await getWeeklyVolumeTrend();
      setWeeklyTrend(wTrend);

      // Load program completions
      const completions = await getProgramCompletions();
      setProgramCompletions(completions);

      setLoading(false);
    };

    loadExercises();
  }, []); // Empty deps - only run on mount

  // Load exercise data when selection or combine setting changes
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

      // Get exercise variants (single or multiple based on combine setting)
      const exerciseNames = getExerciseVariants(selectedExercise, exercises, combineSimilarExercises);

      // Get best set per workout (cleaner chart)
      const data = await getBestSetPerWorkout(exerciseNames);
      setProgressData(data);

      // Get stats
      const exerciseStats = await getExerciseStats(exerciseNames);
      setStats(exerciseStats);

      // Get rep PRs
      const prs = await getRepPRs(exerciseNames);
      setRepPRs(prs);

      // Get consistency
      const consistencyScore = await getExerciseConsistency(exerciseNames);
      setConsistency(consistencyScore);

      setLoading(false);
    };

    loadExerciseData();
  }, [selectedExercise, exercises, combineSimilarExercises]);

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

        {/* Program Completion History */}
        <ProgramHistorySection completions={programCompletions} />

        {/* Monthly Volume Trend */}
        <MonthlyVolumeTrendSection monthlyTrend={monthlyTrend} />

        {/* Weekly Volume Trend */}
        <WeeklyVolumeTrendSection weeklyTrend={weeklyTrend} />

        {/* Exercise Selector */}
        <ExerciseSelectorSection
          exercises={exercises}
          selectedExercise={selectedExercise || ''}
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
