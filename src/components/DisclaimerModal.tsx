import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface DisclaimerModalProps {
  onAccept: (dontShowAgain: boolean) => void;
  onDismiss: () => void;
}

export function DisclaimerModal({ onAccept, onDismiss }: DisclaimerModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleAccept = () => {
    onAccept(dontShowAgain);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="card p-6 max-w-md w-full bg-white animate-slideUp max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <AlertTriangle className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Health & Safety Disclaimer</h2>
            <p className="text-sm text-gray-600">Please read carefully</p>
          </div>
        </div>

        {/* Disclaimer Text */}
        <div className="space-y-4 text-sm text-gray-700 mb-6">
          <p className="font-semibold text-gray-900">
            Important: Read Before Using This App
          </p>

          <p>
            <strong>Consult Your Healthcare Provider:</strong> Before starting any new exercise program or
            making changes to your current fitness routine, consult with a qualified healthcare professional,
            especially if you have any pre-existing medical conditions, injuries, or health concerns.
          </p>

          <p>
            <strong>Stop if You Experience Discomfort:</strong> If you experience pain, dizziness,
            shortness of breath, or any other unusual symptoms during exercise, stop immediately and
            seek medical attention if necessary. Listen to your body and never push through pain.
          </p>

          <p>
            <strong>Individual Results May Vary:</strong> The information and programs provided in this
            app are for general informational purposes only. Results will vary based on individual factors
            including genetics, effort, nutrition, rest, and overall health.
          </p>

          <p>
            <strong>Not Medical Advice:</strong> This app is not intended to diagnose, treat, cure, or
            prevent any disease or medical condition. It is not a substitute for professional medical
            advice, diagnosis, or treatment.
          </p>

          <p>
            <strong>Use at Your Own Risk:</strong> By using this app, you acknowledge that you are
            participating in physical activities at your own risk. The developers of LiftTracker assume
            no liability for any injuries or damages that may occur from use of this application.
          </p>

          <p>
            <strong>Proper Form and Technique:</strong> Always use proper form and technique when
            performing exercises. If you are unsure about any exercise, seek guidance from a qualified
            fitness professional or certified personal trainer.
          </p>

          <p className="font-semibold text-gray-900 pt-2">
            By continuing to use LiftTracker, you acknowledge that you have read and understood this
            disclaimer and agree to exercise safely and responsibly.
          </p>
        </div>

        {/* Don't Show Again Checkbox */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-amber-300 transition-all">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-5 h-5 text-amber-600 rounded"
            />
            <span className="text-sm font-medium text-gray-900">
              Don't show this anymore (you can view it again in Settings)
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 px-4 py-3 text-gray-700 hover:bg-gray-100 font-semibold rounded-xl transition-all border-2 border-gray-200 hover:border-gray-300"
          >
            View Later
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
