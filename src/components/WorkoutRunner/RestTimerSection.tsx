import { Timer, SkipForward } from 'lucide-react';

interface RestTimerSectionProps {
  isActive: boolean;
  isCompleted: boolean;
  secondsLeft: number;
  duration: number;
  onStart: (duration: number) => void;
  onSkip: () => void;
  onAddTime: (seconds: number) => void;
}

export function RestTimerSection({
  isActive,
  isCompleted,
  secondsLeft,
  duration,
  onStart,
  onSkip,
  onAddTime
}: RestTimerSectionProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Manual start button (when timer is not active)
  if (!isActive && !isCompleted) {
    return (
      <button
        onClick={() => onStart(duration)}
        className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition-all font-bold shadow-sm hover:shadow-md border-2 border-blue-200"
      >
        <Timer className="w-5 h-5" />
        <span>Start Rest Timer ({formatTime(duration)})</span>
      </button>
    );
  }

  return (
    <div className={`card p-5 transition-all duration-300 ${
      isCompleted
        ? 'bg-gradient-to-br from-green-50 to-white border-2 border-green-300 animate-pulse'
        : secondsLeft <= duration * 0.2
        ? 'bg-gradient-to-br from-red-50 to-white border-2 border-red-300'
        : secondsLeft <= duration * 0.5
        ? 'bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-300'
        : 'bg-gradient-to-br from-blue-50 to-white border-2 border-blue-300'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Timer className={`w-5 h-5 ${
            isCompleted ? 'text-green-600' : 'text-blue-600'
          }`} />
          <h4 className="font-bold text-gray-900 text-lg">
            {isCompleted ? 'Rest Complete!' : 'Rest Timer'}
          </h4>
        </div>
        <button
          onClick={onSkip}
          className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-red-600 transition-all"
        >
          <SkipForward className="w-4 h-4" />
          Skip
        </button>
      </div>

      <div className="text-center mb-4">
        <div className={`text-6xl font-bold ${
          isCompleted
            ? 'text-green-600'
            : secondsLeft <= duration * 0.2
            ? 'text-red-600'
            : 'text-blue-700'
        }`}>
          {isCompleted ? '00:00' : formatTime(secondsLeft)}
        </div>
        {!isCompleted && (
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                secondsLeft <= duration * 0.2
                  ? 'bg-red-500'
                  : secondsLeft <= duration * 0.5
                  ? 'bg-yellow-500'
                  : 'bg-blue-500'
              }`}
              style={{
                width: `${(secondsLeft / duration) * 100}%`,
              }}
            ></div>
          </div>
        )}
      </div>

      {!isCompleted && (
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => onStart(60)}
            className="px-3 py-2 bg-white hover:bg-blue-50 border-2 border-blue-200 rounded-lg text-sm font-bold text-gray-700 transition-all"
          >
            1:00
          </button>
          <button
            onClick={() => onStart(90)}
            className="px-3 py-2 bg-white hover:bg-blue-50 border-2 border-blue-200 rounded-lg text-sm font-bold text-gray-700 transition-all"
          >
            1:30
          </button>
          <button
            onClick={() => onStart(120)}
            className="px-3 py-2 bg-white hover:bg-blue-50 border-2 border-blue-200 rounded-lg text-sm font-bold text-gray-700 transition-all"
          >
            2:00
          </button>
          <button
            onClick={() => onStart(180)}
            className="px-3 py-2 bg-white hover:bg-blue-50 border-2 border-blue-200 rounded-lg text-sm font-bold text-gray-700 transition-all"
          >
            3:00
          </button>
        </div>
      )}

      {!isCompleted && isActive && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onAddTime(15)}
            className="flex-1 px-3 py-2 bg-white hover:bg-green-50 border-2 border-green-200 rounded-lg text-sm font-bold text-green-700 transition-all"
          >
            +15s
          </button>
          <button
            onClick={() => onAddTime(30)}
            className="flex-1 px-3 py-2 bg-white hover:bg-green-50 border-2 border-green-200 rounded-lg text-sm font-bold text-green-700 transition-all"
          >
            +30s
          </button>
        </div>
      )}
    </div>
  );
}
