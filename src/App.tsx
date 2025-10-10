import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SplashScreen } from './components/SplashScreen';
import { Layout } from './components/Layout';
import { TodayView } from './pages/TodayView';
import { CalendarView, WorkoutDetail } from './pages/CalendarView';
import { ProgressView } from './pages/ProgressView';
import { SettingsView } from './pages/SettingsView';
import { InstallPrompt } from './components/InstallPrompt';
import { UpdatePrompt } from './components/UpdatePrompt';
import { useAppStore } from './store/appStore';
import { initializePersistence } from './utils/persistence';

function App() {
  const showSplash = useAppStore((state) => state.showSplash);

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

    initPersistence();
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <BrowserRouter>
      <InstallPrompt />
      <UpdatePrompt />
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
