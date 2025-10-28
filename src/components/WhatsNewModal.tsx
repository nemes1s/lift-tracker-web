import { useState } from 'react';
import { X, Sparkles, Bug, Zap, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { type VersionChanges } from '../utils/changelogParser';

interface WhatsNewModalProps {
  changes: VersionChanges | VersionChanges[];
  onClose: () => void;
}

export function WhatsNewModal({ changes, onClose }: WhatsNewModalProps) {
  const allVersions = Array.isArray(changes) ? changes : [changes];
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentChange = allVersions[currentIndex];
  const hasMultipleVersions = allVersions.length > 1;
  const isFirstVersion = currentIndex === 0;
  const isLastVersion = currentIndex === allVersions.length - 1;

  const hasAnyChanges =
    currentChange.features.length > 0 ||
    currentChange.bugFixes.length > 0 ||
    currentChange.improvements.length > 0 ||
    currentChange.breakingChanges.length > 0;

  const handlePrevious = () => {
    if (!isLastVersion) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleNext = () => {
    if (!isFirstVersion) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (!hasAnyChanges) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 px-6 py-6 flex items-center justify-between border-b border-blue-600 dark:border-blue-700">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">What's New</h2>
              <p className="text-blue-100 text-sm">Version {currentChange.version}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-500 dark:hover:bg-blue-600 p-2 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Release Date */}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Released on {currentChange.date}
          </p>

          {/* Features Section */}
          {currentChange.features.length > 0 && (
            <Section
              icon={<Sparkles className="w-5 h-5" />}
              title="Features"
              items={currentChange.features}
              iconColor="text-green-600 dark:text-green-400"
              bgColor="bg-green-50 dark:bg-green-950/30"
            />
          )}

          {/* Bug Fixes Section */}
          {currentChange.bugFixes.length > 0 && (
            <Section
              icon={<Bug className="w-5 h-5" />}
              title="Bug Fixes"
              items={currentChange.bugFixes}
              iconColor="text-red-600 dark:text-red-400"
              bgColor="bg-red-50 dark:bg-red-950/30"
            />
          )}

          {/* Improvements Section */}
          {currentChange.improvements.length > 0 && (
            <Section
              icon={<Zap className="w-5 h-5" />}
              title="Improvements"
              items={currentChange.improvements}
              iconColor="text-yellow-600 dark:text-yellow-400"
              bgColor="bg-yellow-50 dark:bg-yellow-950/30"
            />
          )}

          {/* Breaking Changes Section */}
          {currentChange.breakingChanges.length > 0 && (
            <Section
              icon={<AlertCircle className="w-5 h-5" />}
              title="Breaking Changes"
              items={currentChange.breakingChanges}
              iconColor="text-purple-600 dark:text-purple-400"
              bgColor="bg-purple-50 dark:bg-purple-950/30"
            />
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-slate-800 px-6 py-4 border-t border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between gap-3">
            {/* Version Navigation */}
            {hasMultipleVersions && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleNext}
                  disabled={isFirstVersion}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  aria-label="Previous version"
                  title="Newer version"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {currentIndex + 1} of {allVersions.length}
                </span>
                <button
                  onClick={handlePrevious}
                  disabled={isLastVersion}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  aria-label="Next version"
                  title="Older version"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Got It!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  items: string[];
  iconColor: string;
  bgColor: string;
}

function Section({ icon, title, items, iconColor, bgColor }: SectionProps) {
  return (
    <div className={`${bgColor} rounded-lg p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={iconColor}>{icon}</div>
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex gap-2 text-gray-700 dark:text-gray-300 text-sm">
            <span className="text-gray-400 dark:text-gray-600 flex-shrink-0 mt-1">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
