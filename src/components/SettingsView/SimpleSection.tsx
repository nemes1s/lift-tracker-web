// Reusable components for simple settings sections

import { AlertTriangle } from 'lucide-react';
import { InstallButton } from '../InstallPrompt';

export function PWAInstallSection() {
  return (
    <div className="card p-6 bg-white dark:bg-slate-800">
      <h2 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-3">Install App</h2>
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
        Install LiftTracker as an app for offline access, faster loading, and a better experience.
      </p>
      <InstallButton />
    </div>
  );
}

export function DisclaimerSection({ onShowDisclaimer }: { onShowDisclaimer: () => void }) {
  return (
    <div className="card p-6 bg-white dark:bg-slate-800">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-500" />
        <h2 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Disclaimer</h2>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
        View important health and safety information about using this fitness tracking app.
      </p>
      <button
        onClick={onShowDisclaimer}
        className="w-full flex items-center justify-center gap-3 px-5 py-3 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-xl transition-all font-bold shadow-sm hover:shadow-md border-2 border-amber-200 dark:border-amber-800 hover:border-amber-300 dark:hover:border-amber-700"
      >
        <AlertTriangle className="w-5 h-5" />
        View Disclaimer
      </button>
    </div>
  );
}

export function FormulaSection({ useEpley, onUpdate }: { useEpley: boolean; onUpdate: (useEpley: boolean) => void }) {
  return (
    <div className="card p-6 bg-white dark:bg-slate-800">
      <h2 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-4">1RM Formula</h2>
      <div className="flex gap-3">
        <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer p-3 bg-white dark:bg-slate-900 rounded-xl border-2 border-gray-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all has-[:checked]:border-primary-500 dark:has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50 dark:has-[:checked]:bg-primary-900/30">
          <input
            type="radio"
            checked={useEpley === true}
            onChange={() => onUpdate(true)}
            className="w-5 h-5 text-primary-600"
          />
          <span className="font-bold text-gray-900 dark:text-gray-100">Epley</span>
        </label>
        <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer p-3 bg-white dark:bg-slate-900 rounded-xl border-2 border-gray-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all has-[:checked]:border-primary-500 dark:has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50 dark:has-[:checked]:bg-primary-900/30">
          <input
            type="radio"
            checked={useEpley === false}
            onChange={() => onUpdate(false)}
            className="w-5 h-5 text-primary-600"
          />
          <span className="font-bold text-gray-900 dark:text-gray-100">Brzycki</span>
        </label>
      </div>
    </div>
  );
}
