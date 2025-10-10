import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: any) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error: any) {
      console.log('SW registration error', error);
    },
  });

  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (needRefresh) {
      setShowPrompt(true);
    }
  }, [needRefresh]);

  const handleUpdate = () => {
    updateServiceWorker(true);
    setShowPrompt(false);
    setNeedRefresh(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setNeedRefresh(false);
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed top-20 left-4 right-4 md:left-auto md:right-4 md:w-96 card p-5 border-2 border-green-400 shadow-lg z-50 animate-slideDown bg-white">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
          <RefreshCw className="w-7 h-7 text-white" />
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg mb-2">Update Available</h3>
          <p className="text-sm text-gray-700 mb-4 font-medium">
            A new version of LiftTracker is available. Update now to get the latest features and
            improvements.
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Update Now
            </button>
            <button
              onClick={handleDismiss}
              className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 font-semibold rounded-xl transition-all text-sm border-2 border-gray-200"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
