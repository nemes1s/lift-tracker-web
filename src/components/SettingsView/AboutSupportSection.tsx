import { Shield } from 'lucide-react';
import { InstallButton } from '../InstallPrompt';
import { SettingsRows } from './SettingsRows';

interface AboutSupportSectionProps {
  persisted: boolean;
  storageInfo: {
    usageInMB: number;
    quotaInMB: number;
    percentUsed: number;
  } | null;
  onStartTour: () => void;
  onShowWhatsNew: () => void;
  onShowDisclaimer: () => void;
  cookieConsent?: 'granted' | 'denied';
  onShowCookieConsent: () => void;
}

export function AboutSupportSection({
  persisted,
  storageInfo,
  onStartTour,
  onShowWhatsNew,
  onShowDisclaimer,
  cookieConsent,
  onShowCookieConsent,
}: AboutSupportSectionProps) {
  return (
    <SettingsRows>
      <div className="py-4 first:pt-0 last:pb-0">
        <span className="font-bold text-gray-900 dark:text-gray-100 block mb-1">Install App</span>
        <span className="text-sm text-gray-600 dark:text-gray-400 block mb-3">
          Install as an app for offline access, faster loading, and a better experience
        </span>
        <InstallButton />
      </div>

      <div className="py-4 first:pt-0 last:pb-0">
        <span className="font-bold text-gray-900 dark:text-gray-100 block mb-3">Storage</span>

        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-xl">
          <div className="flex items-center gap-2">
            <Shield className={`w-5 h-5 ${persisted ? 'text-green-600 dark:text-green-500' : 'text-orange-600 dark:text-orange-500'}`} />
            <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Persistent Storage</span>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${persisted ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'}`}>
            {persisted ? 'Enabled' : 'Not Enabled'}
          </span>
        </div>

        {!persisted && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
            Storage may be cleared when device runs low on space. Install the app for guaranteed persistence.
          </p>
        )}

        {storageInfo && (
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-gray-600 dark:text-gray-400">Used</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {storageInfo.usageInMB} MB / {storageInfo.quotaInMB} MB
              </span>
            </div>
            <div className="bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary-600 dark:bg-primary-500 h-full transition-all duration-500"
                style={{ width: `${storageInfo.percentUsed}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
        <div>
          <span className="font-bold text-gray-900 dark:text-gray-100 block">Help & Tour</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Learn about LiftTracker's features</span>
        </div>
        <button
          onClick={onStartTour}
          className="shrink-0 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Start Tour
        </button>
      </div>

      <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
        <div>
          <span className="font-bold text-gray-900 dark:text-gray-100 block">Feedback</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Share suggestions or report issues</span>
        </div>
        <a
          href="https://forms.gle/u7c38AXatzfbBkuw9"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Send Feedback
        </a>
      </div>

      <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
        <div>
          <span className="font-bold text-gray-900 dark:text-gray-100 block">What's New</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Latest changes and improvements</span>
        </div>
        <button
          onClick={onShowWhatsNew}
          className="shrink-0 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          View Changes
        </button>
      </div>

      <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
        <div>
          <span className="font-bold text-gray-900 dark:text-gray-100 block">Disclaimer</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Health and safety information</span>
        </div>
        <button
          onClick={onShowDisclaimer}
          className="shrink-0 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          View
        </button>
      </div>

      <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
        <div>
          <span className="font-bold text-gray-900 dark:text-gray-100 block">Cookies & Analytics</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {cookieConsent === 'granted' ? 'Analytics enabled' : cookieConsent === 'denied' ? 'Analytics disabled' : 'Not decided yet'}
          </span>
        </div>
        <button
          onClick={onShowCookieConsent}
          className="shrink-0 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Change
        </button>
      </div>
    </SettingsRows>
  );
}
