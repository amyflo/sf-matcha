const SFX_STORAGE_KEY = "matcha-finder-sound-enabled";
const MUSIC_STORAGE_KEY = "matcha-finder-music-enabled";

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function readStoredBoolean(key: string): boolean | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(key);
  if (stored === "true") {
    return true;
  }
  if (stored === "false") {
    return false;
  }
  return null;
}

function persistBoolean(key: string, enabled: boolean) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(key, String(enabled));
}

function getInitialEnabled(key: string, defaultEnabled: boolean): boolean {
  const stored = readStoredBoolean(key);
  if (stored !== null) {
    return stored;
  }
  return defaultEnabled;
}

export function readSoundEnabled(): boolean | null {
  return readStoredBoolean(SFX_STORAGE_KEY);
}

export function getInitialSoundEnabled(): boolean {
  return getInitialEnabled(SFX_STORAGE_KEY, !prefersReducedMotion());
}

export function persistSoundEnabled(enabled: boolean) {
  persistBoolean(SFX_STORAGE_KEY, enabled);
}

export function readMusicEnabled(): boolean | null {
  return readStoredBoolean(MUSIC_STORAGE_KEY);
}

export function getInitialMusicEnabled(): boolean {
  return getInitialEnabled(MUSIC_STORAGE_KEY, !prefersReducedMotion());
}

export function persistMusicEnabled(enabled: boolean) {
  persistBoolean(MUSIC_STORAGE_KEY, enabled);
}
