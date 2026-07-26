import { Cookie } from 'lucide-react';

interface CookieConsentModalProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function CookieConsentModal({ onAccept, onDecline }: CookieConsentModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="card p-6 max-w-md w-full bg-white animate-slideUp max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <Cookie className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Cookie Preferences</h2>
            <p className="text-sm text-gray-600">We only use analytics cookies</p>
          </div>
        </div>

        {/* Copy */}
        <div className="space-y-3 text-sm text-gray-700 mb-6">
          <p>
            LiftTracker uses <strong>Google Analytics</strong> to understand how the app is used
            (e.g. page views), so we can improve it. This sets a cookie in your browser.
          </p>
          <p>
            We don't use any other cookies, and this data is never used for advertising. All of
            your workout data stays on your device regardless of this choice.
          </p>
          <p>
            You can change this decision anytime in <strong>Settings</strong>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onDecline}
            className="flex-1 px-4 py-3 text-gray-700 hover:bg-gray-100 font-semibold rounded-xl transition-all border-2 border-gray-200 hover:border-gray-300"
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
