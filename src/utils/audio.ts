// Audio and vibration utilities for rest timer

// Global AudioContext instance - reuse to avoid iOS issues
let audioContext: AudioContext | null = null;

/**
 * Initialize and unlock audio context for iOS
 * Must be called on user interaction
 */
export function initAudioContext() {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Failed to create AudioContext:', error);
      return;
    }
  }

  // Resume context if suspended (required for iOS)
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(err => {
      console.warn('Failed to resume AudioContext:', err);
    });
  }
}

/**
 * Play a single beep sound for countdown
 * Used during the last seconds of the timer
 */
export function playCountdownBeep() {
  try {
    // Initialize context if needed
    if (!audioContext) {
      initAudioContext();
    }

    if (!audioContext) {
      console.warn('AudioContext not available');
      return;
    }

    // Resume context if suspended (iOS requirement)
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(err => {
        console.warn('Failed to resume AudioContext:', err);
      });
    }

    // Create oscillator for a short beep
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure the sound - a short, simple beep
    oscillator.frequency.value = 600; // Hz - lower pitch than completion
    oscillator.type = 'sine';

    // Volume envelope for a quick beep
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    // Play beep
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);

  } catch (error) {
    console.warn('Failed to play countdown beep:', error);
  }
}

/**
 * Play a simple beep sound using Web Audio API
 * This creates a pleasant notification sound without external audio files
 */
export function playTimerCompleteSound() {
  try {
    // Initialize context if needed
    if (!audioContext) {
      initAudioContext();
    }

    if (!audioContext) {
      console.warn('AudioContext not available');
      return;
    }

    // Resume context if suspended (iOS requirement)
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(err => {
        console.warn('Failed to resume AudioContext:', err);
      });
    }

    // Create oscillator for the beep
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure the sound - a pleasant double beep
    oscillator.frequency.value = 800; // Hz
    oscillator.type = 'sine';

    // Volume envelope for a smooth beep
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

    // Play first beep
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);

    // Second beep slightly higher
    const oscillator2 = audioContext.createOscillator();
    const gainNode2 = audioContext.createGain();
    oscillator2.connect(gainNode2);
    gainNode2.connect(audioContext.destination);

    oscillator2.frequency.value = 1000; // Hz - higher pitch
    oscillator2.type = 'sine';

    gainNode2.gain.setValueAtTime(0, audioContext.currentTime + 0.2);
    gainNode2.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.21);
    gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.35);

    oscillator2.start(audioContext.currentTime + 0.2);
    oscillator2.stop(audioContext.currentTime + 0.35);

  } catch (error) {
    console.warn('Failed to play timer sound:', error);
  }
}

/**
 * Vibrate the device if supported
 * Uses a pattern: vibrate-pause-vibrate for notification
 */
export function vibrateDevice() {
  if ('vibrate' in navigator) {
    try {
      // Pattern: vibrate for 200ms, pause for 100ms, vibrate for 200ms
      navigator.vibrate([200, 100, 200]);
    } catch (error) {
      console.warn('Failed to vibrate device:', error);
    }
  }
}

/**
 * Play notification (sound + vibration)
 */
export function playTimerNotification(soundEnabled: boolean = true) {
  if (soundEnabled) {
    playTimerCompleteSound();
  }
  vibrateDevice();
}
