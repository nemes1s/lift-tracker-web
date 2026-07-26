/**
 * Google Analytics utility functions
 * Uses environment variable VITE_GA_ID for the measurement ID
 *
 * GA must only be initialized after the user has granted cookie consent
 * (see CookieConsentModal / SettingsModel.cookieConsent). Callers are
 * responsible for gating initializeGoogleAnalytics() on that consent.
 */

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

let gaScriptElement: HTMLScriptElement | null = null;

/**
 * Initialize Google Analytics with the measurement ID from environment variables.
 * Only call this once the user has granted cookie consent.
 */
export function initializeGoogleAnalytics(): void {
  const measurementId = import.meta.env.VITE_GA_ID;

  // Skip initialization if GA ID is not configured
  if (!measurementId) {
    console.debug('Google Analytics not configured (VITE_GA_ID not set)');
    return;
  }

  // Already initialized
  if (window.gtag) {
    return;
  }

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];

  // Define gtag function
  function gtag(..._args: any[]): void {
    window.dataLayer!.push(arguments);
  }

  window.gtag = gtag;

  // Initialize GA
  gtag('js', new Date());
  gtag('config', measurementId, {
    allow_google_signals: false,
    anonymize_ip: true,
  });

  // Load GA script
  gaScriptElement = document.createElement('script');
  gaScriptElement.async = true;
  gaScriptElement.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(gaScriptElement);
}

/**
 * Tear down Google Analytics: removes the loaded script, clears the gtag
 * shim so tracking calls become no-ops, and deletes any GA cookies already
 * set. Call this when the user declines or revokes cookie consent.
 */
export function disableGoogleAnalytics(): void {
  if (gaScriptElement) {
    gaScriptElement.remove();
    gaScriptElement = null;
  }

  window.gtag = undefined;
  window.dataLayer = [];

  deleteGoogleAnalyticsCookies();
}

function deleteGoogleAnalyticsCookies(): void {
  const gaCookieNames = document.cookie
    .split(';')
    .map((cookie) => cookie.trim().split('=')[0])
    .filter((name) => name === '_ga' || name === '_gid' || name === '_gat' || name.startsWith('_ga_'));

  gaCookieNames.forEach((name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
  });
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
