import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';

export function SplashScreen() {
  const setShowSplash = useAppStore((state) => state.setShowSplash);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [setShowSplash]);

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50 animate-fadeIn">
      <div className="text-center space-y-4">
        <div className="w-40 h-40 mx-auto bg-primary-600 rounded-3xl flex items-center justify-center transform transition-transform duration-700 scale-100">
          <svg
            className="w-24 h-24 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <h1 className="text-5xl font-bold text-gray-900">LiftTracker</h1>
        <p className="text-lg text-gray-600 tracking-widest">Track. Progress. Achieve.</p>
      </div>
    </div>
  );
}
