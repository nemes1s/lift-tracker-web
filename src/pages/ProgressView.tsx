import { useEffect, useState } from 'react';
import { TrendingUp, Award, Calendar, Dumbbell, BarChart3 } from 'lucide-react';
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
import {
  getAllExerciseNames,
  getExerciseStats,
  getBestSetPerWorkout,
  type ExerciseProgressData,
  type ExerciseStats,
} from '../utils/progressTracking';

export function ProgressView() {
  const [exercises, setExercises] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [progressData, setProgressData] = useState<ExerciseProgressData[]>([]);
  const [stats, setStats] = useState<ExerciseStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Load all exercises
  useEffect(() => {
    const loadExercises = async () => {
      const names = await getAllExerciseNames();
      setExercises(names);

      // Auto-select first exercise if available
      if (names.length > 0 && !selectedExercise) {
        setSelectedExercise(names[0]);
      }

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
        return;
      }

      setLoading(true);

      // Get best set per workout (cleaner chart)
      const data = await getBestSetPerWorkout(selectedExercise);
      setProgressData(data);

      // Get stats
      const exerciseStats = await getExerciseStats(selectedExercise);
      setStats(exerciseStats);

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
  }));

  return (
    <div className="h-full overflow-y-auto pb-20">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="card p-6 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-600 rounded-2xl shadow-lg">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary-700">Progress</h1>
              <p className="text-sm text-gray-500 mt-0.5">Track your gains over time</p>
            </div>
          </div>
        </div>

        {/* Exercise Selector */}
        {exercises.length > 0 ? (
          <>
            <div className="card p-6 bg-white">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                Select Exercise
              </label>
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="input-field"
              >
                {exercises.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Max Weight */}
                <div className="card p-4 bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-primary-600" />
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Max Weight
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-primary-700">{stats.maxWeight}kg</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.maxWeightDate.toLocaleDateString()}
                  </p>
                </div>

                {/* Best 1RM */}
                <div className="card p-4 bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Dumbbell className="w-5 h-5 text-green-600" />
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Est. 1RM
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    {Math.round(stats.bestOneRepMax)}kg
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.bestOneRepMaxDate.toLocaleDateString()}
                  </p>
                </div>

                {/* Total Volume */}
                <div className="card p-4 bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-orange-600" />
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Total Volume
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-orange-700">
                    {(stats.totalVolume / 1000).toFixed(1)}t
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{stats.totalSets} sets</p>
                </div>

                {/* Workouts */}
                <div className="card p-4 bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Workouts
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-purple-700">{stats.workoutCount}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.firstWorkoutDate.toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {/* Weight Progression Chart */}
            {progressData.length > 0 && (
              <div className="card p-6 bg-white">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Weight Progression</h2>
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
                <p className="text-xs text-gray-500 mt-4 text-center">
                  Showing best set from each workout session
                </p>
              </div>
            )}

            {/* Volume Chart */}
            {progressData.length > 0 && (
              <div className="card p-6 bg-white">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Volume per Workout</h2>
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
                <p className="text-xs text-gray-500 mt-4 text-center">
                  Volume = Weight × Reps (best set per workout)
                </p>
              </div>
            )}

            {/* No data message */}
            {progressData.length === 0 && !loading && (
              <div className="card p-12 text-center bg-white">
                <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-12 h-12 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-700 mb-3">No Data Yet</h2>
                <p className="text-gray-600">
                  Complete workouts to see your progress for this exercise.
                </p>
              </div>
            )}
          </>
        ) : (
          // No exercises at all
          <div className="card p-12 text-center bg-white">
            <div className="bg-primary-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <TrendingUp className="w-12 h-12 text-primary-700" />
            </div>
            <h2 className="text-2xl font-bold text-primary-700 mb-3">
              No Workout History
            </h2>
            <p className="text-gray-700 font-medium mb-2">
              Start tracking your workouts to see progress over time.
            </p>
            <p className="text-sm text-gray-600 bg-white/60 px-4 py-2 rounded-lg inline-block mt-4">
              Complete your first workout to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
