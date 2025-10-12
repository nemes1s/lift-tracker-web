import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SplashScreen } from './components/SplashScreen';
import { Layout } from './components/Layout';
import { TodayView } from './pages/TodayView';
import { CalendarView, WorkoutDetail } from './pages/CalendarView';
import { ProgressView } from './pages/ProgressView';
import { SettingsView } from './pages/SettingsView';
import { InstallPrompt } from './components/InstallPrompt';
import { UpdatePrompt } from './components/UpdatePrompt';
import { DisclaimerModal } from './components/DisclaimerModal';
import { useAppStore } from './store/appStore';
import { initializePersistence } from './utils/persistence';
import { db } from './db/database';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const showSplash = useAppStore((state) => state.showSplash);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
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

    initPersistence();
    checkDisclaimer();
  }, []);

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
      <InstallPrompt />
      <UpdatePrompt />
      {showDisclaimer && (
        <DisclaimerModal
          onAccept={handleDisclaimerAccept}
          onDismiss={handleDisclaimerDismiss}
        />
      )}
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<TodayView />} />
          <Route path="calendar" element={<CalendarView />} />
          <Route path="workout/:id" element={<WorkoutDetail />} />
          <Route path="progress" element={<ProgressView />} />
          <Route path="settings" element={<SettingsView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
