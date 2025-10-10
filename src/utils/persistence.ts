// Storage Persistence API utilities

/**
 * Request persistent storage from the browser
 * This prevents the browser from clearing IndexedDB data
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage || !navigator.storage.persist) {
    console.warn('Storage API not supported');
    return false;
  }

  try {
    const isPersisted = await navigator.storage.persist();
    console.log(`Persistent storage: ${isPersisted ? 'granted' : 'denied'}`);
    return isPersisted;
  } catch (error) {
    console.error('Error requesting persistent storage:', error);
    return false;
  }
}

/**
 * Check if storage is currently persisted
 */
export async function isPersisted(): Promise<boolean> {
  if (!navigator.storage || !navigator.storage.persisted) {
    return false;
  }

  try {
    return await navigator.storage.persisted();
  } catch (error) {
    console.error('Error checking persistence:', error);
    return false;
  }
}

/**
 * Get storage usage estimate
 */
export async function getStorageEstimate(): Promise<{
  usage: number;
  quota: number;
  usageInMB: number;
  quotaInMB: number;
  percentUsed: number;
} | null> {
  if (!navigator.storage || !navigator.storage.estimate) {
    return null;
  }

  try {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;

    return {
      usage,
      quota,
      usageInMB: Math.round((usage / (1024 * 1024)) * 100) / 100,
      quotaInMB: Math.round((quota / (1024 * 1024)) * 100) / 100,
      percentUsed: quota > 0 ? Math.round((usage / quota) * 100) : 0,
    };
  } catch (error) {
    console.error('Error getting storage estimate:', error);
    return null;
  }
}

/**
 * Initialize persistence on app load
 */
export async function initializePersistence(): Promise<{
  persisted: boolean;
  requested: boolean;
}> {
  const alreadyPersisted = await isPersisted();

  if (alreadyPersisted) {
    return { persisted: true, requested: false };
  }

  // Request persistence if not already granted
  const granted = await requestPersistentStorage();

  return { persisted: granted, requested: true };
}
