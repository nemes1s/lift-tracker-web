import { StopCircle, Pause, Play } from 'lucide-react';

interface WorkoutControlsSectionProps {
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export function WorkoutControlsSection({
  isPaused,
  onPause,
  onResume,
  onStop
}: WorkoutControlsSectionProps) {
  return (
    <div className={`card p-4 transition-all duration-200 ${isPaused ? 'bg-yellow-50 border-2 border-yellow-300' : 'bg-white'}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-3 h-3 rounded-full animate-pulse ${isPaused ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
            <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${isPaused ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
          </div>
          <h2 className={`text-lg font-bold ${isPaused ? 'text-yellow-700' : 'text-green-700'}`}>
            {isPaused ? 'Paused' : 'Running'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {!isPaused ? (
            <button
              onClick={onPause}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-3 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Pause className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={onResume}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Play className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={onStop}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <StopCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
