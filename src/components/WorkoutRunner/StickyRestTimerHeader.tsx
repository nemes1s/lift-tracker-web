import { Timer, SkipForward } from 'lucide-react';

interface StickyRestTimerHeaderProps {
  isActive: boolean;
  isCompleted: boolean;
  secondsLeft: number;
  duration: number;
  onSkip: () => void;
}

export function StickyRestTimerHeader({
  isActive,
  isCompleted,
  secondsLeft,
  duration,
  onSkip
}: StickyRestTimerHeaderProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Only show sticky header when timer is active or completed
  if (!isActive && !isCompleted) {
    return null;
  }

  return (
    <div className={`transition-all duration-300 ${
      isCompleted
        ? 'bg-gradient-to-br from-green-50 to-white border-b-2 border-green-300'
        : secondsLeft <= duration * 0.2
        ? 'bg-gradient-to-br from-red-50 to-white border-b-2 border-red-300'
        : secondsLeft <= duration * 0.5
        ? 'bg-gradient-to-br from-yellow-50 to-white border-b-2 border-yellow-300'
        : 'bg-gradient-to-br from-blue-50 to-white border-b-2 border-blue-300'
    }`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Timer className={`w-5 h-5 ${
              isCompleted ? 'text-green-600' : 'text-blue-600'
            }`} />
            <h4 className="font-bold text-gray-900">
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

        <div className="text-center mb-2">
          <div className={`text-5xl font-bold ${
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
      </div>
    </div>
  );
}
