let context: AudioContext | null = null;
let unlocked = false;

function getAudioContextClass(): typeof AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext ??
    null
  );
}

export function touchAudioContextForGesture(): AudioContext | null {
  const AudioContextClass = getAudioContextClass();
  if (!AudioContextClass) {
    return null;
  }

  if (!context) {
    context = new AudioContextClass();
  }

  if (context.state === "suspended") {
    void context.resume();
  }

  return context;
}

export async function unlockAudioContext(): Promise<AudioContext | null> {
  const AudioContextClass = getAudioContextClass();
  if (!AudioContextClass) {
    return null;
  }

  if (!context) {
    context = new AudioContextClass();
  }

  if (context.state === "suspended") {
    await context.resume();
  }

  if (context.state !== "running") {
    return null;
  }

  unlocked = true;
  return context;
}

export function getAudioContext(): AudioContext | null {
  return context;
}

export function isAudioUnlocked(): boolean {
  return unlocked;
}
