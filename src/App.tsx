import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SplashScreen } from './components/SplashScreen';
import { Layout } from './components/Layout';
import { Tour } from './components/Tour';
import { TodayView } from './pages/TodayView';
import { CalendarView, WorkoutDetail } from './pages/CalendarView';
import { ProgressView } from './pages/ProgressView';
import { SettingsView } from './pages/SettingsView';
import { ProgramPreviewView } from './pages/ProgramPreviewView';
import { NotFoundView } from './pages/NotFoundView';
import { InstallPrompt } from './components/InstallPrompt';
import { UpdatePrompt } from './components/UpdatePrompt';
import { DisclaimerModal } from './components/DisclaimerModal';
import { WhatsNewModal } from './components/WhatsNewModal';
import { useAppStore } from './store/appStore';
import { initializePersistence } from './utils/persistence';
import { parseAllVersions, type VersionChanges } from './utils/changelogParser';
import { APP_VERSION } from './version';
import { db } from './db/database';
import { v4 as uuidv4 } from 'uuid';
import { initAudioContext } from './utils/audio';

function App() {
  const showSplash = useAppStore((state) => state.showSplash);
  const darkMode = useAppStore((state) => state.darkMode);
  const whatsNewOpen = useAppStore((state) => state.whatsNewOpen);
  const lastSeenVersion = useAppStore((state) => state.lastSeenVersion);
  const tourCompleted = useAppStore((state) => state.tourCompleted);
  const tourActive = useAppStore((state) => state.tourActive);
  const setWhatsNewOpen = useAppStore((state) => state.setWhatsNewOpen);
  const setLastSeenVersion = useAppStore((state) => state.setLastSeenVersion);

  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [changelogData, setChangelogData] = useState<VersionChanges[]>([]);

  useEffect(() => {
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    // Initialize audio context and set up unlock listeners for iOS
    initAudioContext();

    // Request persistent storage on app load
    const initPersistence = async () => {
      const result = await initializePersistence();
      if (result.persisted) {
        console.log('✅ Persistent storage granted');
      } else if (result.requested) {
        console.log('⚠️ Persistent storage denied');
      }
    };

    // Check if disclaimer should be shown
    const checkDisclaimer = async () => {
      let settings = await db.settings.toCollection().first();

      // Create default settings if they don't exist
      if (!settings) {
        settings = {
          id: uuidv4(),
          useEpley: true,
        };
        await db.settings.add(settings);
      }

      // Show disclaimer if:
      // 1. User hasn't permanently dismissed it, AND
      // 2. Either never shown before, OR last shown more than 24 hours ago
      if (!settings.disclaimerAccepted) {
        const now = new Date();
        const lastShown = settings.lastDisclaimerShown;

        if (!lastShown) {
          // Never shown before
          setShowDisclaimer(true);
        } else {
          // Check if more than 24 hours have passed
          const hoursSinceLastShown = (now.getTime() - new Date(lastShown).getTime()) / (1000 * 60 * 60);
          if (hoursSinceLastShown >= 24) {
            setShowDisclaimer(true);
          }
        }
      }
    };

    // Check if there's a new version and show What's New modal
    const checkWhatsNew = async () => {
      // If version has changed, show the What's New modal
      if (lastSeenVersion !== APP_VERSION) {
        const allVersions = await parseAllVersions();
        if (allVersions.length > 0) {
          setChangelogData(allVersions);
          setWhatsNewOpen(true);
          setLastSeenVersion(APP_VERSION);
        }
      }
    };

    initPersistence();
    checkDisclaimer();
    checkWhatsNew();
  }, [lastSeenVersion, setWhatsNewOpen, setLastSeenVersion]);

  // Auto-start tour on first app launch (only once when not completed and other modals are closed)
  useEffect(() => {
    if (!showSplash && !tourCompleted && !tourActive && !showDisclaimer && !whatsNewOpen) {
      // Wait a bit for the page to fully render before starting the tour
      const timer = setTimeout(() => {
        useAppStore.getState().startTour();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showSplash, tourCompleted, showDisclaimer, whatsNewOpen]);

  const handleDisclaimerAccept = async (dontShowAgain: boolean) => {
    const settings = await db.settings.toCollection().first();
    if (settings) {
      await db.settings.update(settings.id, {
        disclaimerAccepted: dontShowAgain,
        lastDisclaimerShown: new Date(),
      });
    }
    setShowDisclaimer(false);
  };

  const handleDisclaimerDismiss = async () => {
    // Update last shown time but don't mark as accepted
    const settings = await db.settings.toCollection().first();
    if (settings) {
      await db.settings.update(settings.id, {
        lastDisclaimerShown: new Date(),
      });
    }
    setShowDisclaimer(false);
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <BrowserRouter>
      <Tour />
      <InstallPrompt />
      <UpdatePrompt />
      {showDisclaimer && (
        <DisclaimerModal
          onAccept={handleDisclaimerAccept}
          onDismiss={handleDisclaimerDismiss}
        />
      )}
      {whatsNewOpen && changelogData.length > 0 && (
        <WhatsNewModal
          changes={changelogData}
          onClose={() => setWhatsNewOpen(false)}
        />
      )}
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<TodayView />} />
          <Route path="calendar" element={<CalendarView />} />
          <Route path="workout/:id" element={<WorkoutDetail />} />
          <Route path="progress" element={<ProgressView />} />
          <Route path="settings" element={<SettingsView />} />
          <Route path="program/preview" element={<ProgramPreviewView />} />
          <Route path="*" element={<NotFoundView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
