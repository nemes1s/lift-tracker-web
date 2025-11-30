import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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
import { InitialProgramSelection } from './components/InitialProgramSelection';
import { useAppStore } from './store/appStore';
import { initializePersistence } from './utils/persistence';
import { parseAllVersions, type VersionChanges } from './utils/changelogParser';
import { APP_VERSION } from './version';
import { db } from './db/database';
import { v4 as uuidv4 } from 'uuid';
import { initAudioContext } from './utils/audio';
import { migrateTechniqueFlagsToExistingPrograms, needsTechniqueMigration } from './utils/migrateTechniques';
import { trackPageView } from './utils/analytics';

/**
 * Component that tracks page views whenever the location changes
 * Must be inside BrowserRouter
 */
function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname, document.title);
  }, [location.pathname]);

  return null;
}

/**
 * Component that scrolls to top whenever the route changes
 * Must be inside BrowserRouter
 */
function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return null;
}
import { runMigrations as runDataMigrations } from './utils/migrations';

function App() {
  const showSplash = useAppStore((state) => state.showSplash);
  const darkMode = useAppStore((state) => state.darkMode);
  const whatsNewOpen = useAppStore((state) => state.whatsNewOpen);
  const lastSeenVersion = useAppStore((state) => state.lastSeenVersion);
  const tourCompleted = useAppStore((state) => state.tourCompleted);
  const tourActive = useAppStore((state) => state.tourActive);
  const isHydrated = useAppStore((state) => state.isHydrated);
  const setWhatsNewOpen = useAppStore((state) => state.setWhatsNewOpen);
  const setLastSeenVersion = useAppStore((state) => state.setLastSeenVersion);
  const refreshTrigger = useAppStore((state) => state.refreshTrigger);

  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [changelogData, setChangelogData] = useState<VersionChanges[]>([]);
  const [hasActiveProgram, setHasActiveProgram] = useState<boolean | null>(null);
  const [showProgramSelection, setShowProgramSelection] = useState(false);

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

    // Migrate existing programs to add technique flags and programId to workouts
    const runMigrations = async () => {
      // Run technique flags migration
      const needsMigration = await needsTechniqueMigration();
      if (needsMigration) {
        console.log('🔄 Running technique flags migration...');
        await migrateTechniqueFlagsToExistingPrograms();
      }

      // Run programId migration for workouts
      await runDataMigrations();
    };

    initPersistence();
    checkDisclaimer();
    checkWhatsNew();
    runMigrations();
  }, [lastSeenVersion, setWhatsNewOpen, setLastSeenVersion]);

  // Recheck active program when data changes
  useEffect(() => {
    const checkActiveProgram = async () => {
      const settings = await db.settings.toCollection().first();
      const hasProgram = !!(settings?.activeProgramId);
      setHasActiveProgram(hasProgram);
    };

    if (isHydrated) {
      checkActiveProgram();
    }
  }, [refreshTrigger, isHydrated]);

  // Show initial program selection or auto-start tour
  useEffect(() => {
    // Only proceed if the store has been hydrated from localStorage
    // This ensures tourCompleted value is accurate on mobile
    if (!isHydrated || showSplash || tourCompleted || tourActive || showDisclaimer || whatsNewOpen) {
      return;
    }

    // If we haven't checked for active program yet, wait
    if (hasActiveProgram === null) {
      return;
    }

    console.log('[App] Tour/Program selection check:', { isHydrated, showSplash, tourCompleted, tourActive, showDisclaimer, whatsNewOpen, hasActiveProgram });

    // If no active program, show program selection instead of tour
    if (!hasActiveProgram) {
      console.log('[App] No active program, showing program selection');
      setShowProgramSelection(true);
      return;
    }

    // If has active program and tour not completed, start tour
    console.log('[App] Conditions met, starting tour');
    const timer = setTimeout(() => {
      console.log('[App] Calling startTour');
      useAppStore.getState().startTour();
    }, 1000);
    return () => clearTimeout(timer);
  }, [isHydrated, showSplash, tourCompleted, tourActive, showDisclaimer, whatsNewOpen, hasActiveProgram]);

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

  const handleProgramSelectionComplete = () => {
    // User has selected a program, close modal and update state
    setShowProgramSelection(false);
    setHasActiveProgram(true);
    // Tour will auto-start via the useEffect hook
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <BrowserRouter>
      <PageTracker />
      <ScrollToTop />
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
      {showProgramSelection && (
        <InitialProgramSelection
          onComplete={handleProgramSelectionComplete}
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
