import { CheckCircle } from 'lucide-react';

interface FinishWorkoutButtonProps {
  onFinish: () => void;
}

export function FinishWorkoutButton({ onFinish }: FinishWorkoutButtonProps) {
  return (
    <button
      onClick={onFinish}
      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
    >
      <CheckCircle className="w-6 h-6" />
      Finish Workout
    </button>
  );
}
