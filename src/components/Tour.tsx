import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { driver, type Driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useAppStore } from '../store/appStore';
import { tourConfigWithSteps } from '../utils/tourConfig';

// Custom styles for the tour
const tourStyles = `
  .driver-tour-popover {
    --driver-popover-bg-color: rgb(255, 255, 255);
    --driver-popover-text-color: rgb(0, 0, 0);
    --driver-popover-border-radius: 12px;
    --driver-popover-padding: 24px;
    --driver-popover-arrow-size: 8px;
    --driver-popover-box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .dark .driver-tour-popover {
    --driver-popover-bg-color: rgb(30, 41, 59);
    --driver-popover-text-color: rgb(241, 245, 249);
    --driver-popover-border-radius: 12px;
    --driver-popover-padding: 24px;
  }

  .driver-popover-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .driver-popover-description {
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 16px;
  }

  .driver-popover-footer {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .driver-popover-footer button {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }

  .driver-popover-footer button:focus {
    outline: none;
  }

  .dark .driver-popover-footer button:hover {
    opacity: 0.9;
  }

  .driver-popover-footer .driver-popover-next-btn {
    background-color: rgb(13, 110, 253);
    color: white;
    font-weight: 500;
  }

  .driver-popover-footer .driver-popover-next-btn:hover {
    background-color: rgb(12, 87, 198);
  }

  .dark .driver-popover-footer .driver-popover-next-btn {
    background-color: rgb(59, 130, 246);
  }

  .dark .driver-popover-footer .driver-popover-next-btn:hover {
    background-color: rgb(37, 99, 235);
  }

  .driver-popover-footer .driver-popover-prev-btn {
    background-color: rgb(229, 231, 235);
    color: rgb(17, 24, 39);
  }

  .dark .driver-popover-footer .driver-popover-prev-btn {
    background-color: rgb(55, 65, 81);
    color: rgb(243, 244, 246);
  }

  .driver-popover-footer .driver-popover-close-btn {
    background-color: transparent;
    color: rgb(107, 114, 128);
  }

  .dark .driver-popover-footer .driver-popover-close-btn {
    color: rgb(209, 213, 219);
  }

  .driver-highlighted-element {
    z-index: 10000 !important;
  }

  .driver-stage {
    z-index: 9999 !important;
  }

  .driver-overlay {
    z-index: 9998 !important;
  }
`;

export function Tour() {
  const navigate = useNavigate();
  const driverRef = useRef<Driver | null>(null);
  const { tourActive, completeTour, setTourActive } = useAppStore();
  const stylesInjected = useRef(false);
  const isCleaningUp = useRef(false);

  // Inject custom styles once
  useEffect(() => {
    if (!stylesInjected.current) {
      const styleElement = document.createElement('style');
      styleElement.innerHTML = tourStyles;
      document.head.appendChild(styleElement);
      stylesInjected.current = true;
    }
  }, []);

  // Helper function to handle step navigation (memoized to prevent effect re-triggers)
  const handleStepNavigation = useCallback((stepIndex: number) => {
    const step = tourConfigWithSteps.steps?.[stepIndex];
    if (!step || !step.element) {
      return;
    }

    const tourKey = (step.element as string)
      .replace('[data-tour="', '')
      .replace('"]', '');

    // Determine target path
    let targetPath: string | null = null;

    if (tourKey === 'welcome' || tourKey === 'select-day' || tourKey === 'start-workout') {
      targetPath = '/';
    } else if (tourKey === 'nav-calendar') {
      targetPath = '/calendar';
    } else if (tourKey === 'nav-progress') {
      targetPath = '/progress';
    } else if (
      tourKey === 'nav-settings' ||
      tourKey === 'settings-programs' ||
      tourKey === 'import-program' ||
      tourKey === 'export-program' ||
      tourKey === 'program-preview'
    ) {
      targetPath = '/settings';
    }

    // Navigate if needed
    if (targetPath) {
      navigate(targetPath);

      // Wait for element to appear, then refresh the driver
      let attempts = 0;
      const maxAttempts = 50; // Wait up to 5 seconds
      const waitAndRestart = () => {
        const element = document.querySelector(`[data-tour="${tourKey}"]`);
        if (element) {
          // Element found, give React a moment to finish rendering, then refresh
          setTimeout(() => {
            try {
              driverRef.current?.refresh();
            } catch (err) {
              console.error('[Tour] Could not refresh driver:', err);
            }
          }, 500);
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(waitAndRestart, 100);
        }
      };

      // Start waiting after giving React time to navigate
      setTimeout(waitAndRestart, 600);
    }
  }, [navigate]);

  // Initialize and manage the tour
  useEffect(() => {
    // Only create a new driver if we don't have one
    if (!driverRef.current) {
      driverRef.current = driver({
        ...tourConfigWithSteps,
        onHighlightStarted: () => {
          try {
            // Get the current step from the driver's internal state
            const state = (driverRef.current as any)?.getState?.();

            if (state && typeof state.activeIndex !== 'undefined') {
              handleStepNavigation(state.activeIndex);
            }
          } catch (err) {
            console.error('[Tour] Error in onHighlightStarted:', err);
          }
        },
        onCloseClick: () => {
          if (isCleaningUp.current) return;
          isCleaningUp.current = true;

          // Properly close and destroy the driver
          if (driverRef.current) {
            try {
              driverRef.current.destroy();
              driverRef.current = null;
            } catch (error) {
              console.error('Error destroying driver on close:', error);
            }
          }

          // Update state to mark tour as completed
          console.log('[Tour] Marking tour as completed');
          completeTour();
          setTourActive(false);

          // Verify the state was set correctly
          setTimeout(() => {
            const state = useAppStore.getState();
            console.log('[Tour] State after completion:', { tourCompleted: state.tourCompleted, tourActive: state.tourActive });
          }, 100);

          isCleaningUp.current = false;
        },
        onDestroyStarted: () => {
          console.log('[Tour] onDestroyStarted called, isCleaningUp:', isCleaningUp.current);
          // If we're not already cleaning up (from onCloseClick), mark tour as completed
          // This handles both explicit close (X button) and natural completion (finishing all steps)
          if (!isCleaningUp.current) {
            console.log('[Tour] Tour destroyed, marking as completed');
            completeTour();
            setTourActive(false);
          }
        },
      });
    }

    let startTourTimer: ReturnType<typeof setTimeout> | null = null;

    // Start tour if tourActive is true
    if (tourActive && driverRef.current && !isCleaningUp.current) {
      try {
        // First, navigate to the home page to ensure the first step's element exists
        navigate('/');

        // Wait for navigation to complete before starting the tour
        startTourTimer = setTimeout(() => {
          try {
            driverRef.current?.drive();
          } catch (error) {
            console.error('Error starting tour:', error);
            isCleaningUp.current = true;

            if (driverRef.current) {
              try {
                driverRef.current.destroy();
                driverRef.current = null;
              } catch (destroyError) {
                console.error('Error destroying driver on error:', destroyError);
              }
            }

            completeTour();
            setTourActive(false);
            isCleaningUp.current = false;
          }
        }, 600);
      } catch (error) {
        console.error('Error in tour setup:', error);
      }
    }

    // Cleanup on unmount
    return () => {
      if (startTourTimer) {
        clearTimeout(startTourTimer);
      }
      if (driverRef.current && !isCleaningUp.current) {
        try {
          driverRef.current.destroy();
        } catch (error) {
          console.error('Error destroying tour on unmount:', error);
        }
      }
    };
  }, [tourActive, completeTour, setTourActive]);

  return null;
}
