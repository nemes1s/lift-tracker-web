/**
 * Google Analytics utility functions
 * Uses environment variable VITE_GA_ID for the measurement ID
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

/**
 * Initialize Google Analytics with the measurement ID from environment variables
 */
export function initializeGoogleAnalytics(): void {
  const measurementId = import.meta.env.VITE_GA_ID;

  // Skip initialization if GA ID is not configured
  if (!measurementId) {
    console.debug('Google Analytics not configured (VITE_GA_ID not set)');
    return;
  }

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];

  // Define gtag function
  function gtag(..._args: any[]): void {
    window.dataLayer.push(arguments);
  }

  window.gtag = gtag;

  // Initialize GA
  gtag('js', new Date());
  gtag('config', measurementId, {
    allow_google_signals: false,
    anonymize_ip: true,
  });

  // Load GA script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
}

/**
 * Track a custom event in Google Analytics
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, any>
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
}

/**
 * Track page view (call on route change)
 */
export function trackPageView(pagePath: string, pageTitle?: string): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', import.meta.env.VITE_GA_ID, {
      page_path: pagePath,
      page_title: pageTitle || document.title,
    });
  }
}
