import {
  touchAudioContextForGesture,
  unlockAudioContext,
} from "@/lib/audio-context";

const AMBIENT_JAZZ_URL = "/audio/ambient-jazz.mp3";
const MASTER_VOLUME = 0.28;
const FADE_IN_MS = 300;
const FADE_OUT_MS = 300;
const LOOP_CROSSFADE_MS = 200;
const LOOP_CROSSFADE_LEAD_MS = LOOP_CROSSFADE_MS;

type AudioSlot = "a" | "b";

export class AmbientMusicPlayer {
  private audioA: HTMLAudioElement | null = null;
  private audioB: HTMLAudioElement | null = null;
  private activeSlot: AudioSlot = "a";
  private running = false;
  private fadeFrame: number | null = null;
  private loopMonitorFrame: number | null = null;
  private loopCrossfadeFrame: number | null = null;
  private loopCrossfadeStarted = false;

  isRunning(): boolean {
    return this.running;
  }

  async preload(): Promise<void> {
    if (typeof window === "undefined") {
      return;
    }

    this.ensureAudioElements();
    if (this.running) {
      return;
    }

    this.audioA?.load();
    this.audioB?.load();
  }

  async start(): Promise<boolean> {
    if (typeof window === "undefined") {
      return false;
    }

    const active = this.ensureAudioElements();
    this.cancelFade();
    this.cancelLoopCrossfade();
    this.stopLoopMonitor();

    active.currentTime = 0;
    active.volume = 0;
    this.getInactiveAudio().pause();
    this.getInactiveAudio().currentTime = 0;
    this.getInactiveAudio().volume = 0;
    this.loopCrossfadeStarted = false;

    touchAudioContextForGesture();
    const playAttempt = active.play();

    await unlockAudioContext();

    try {
      await playAttempt;
    } catch {
      return false;
    }

    this.running = true;
    this.rampVolume(active, 0, MASTER_VOLUME, FADE_IN_MS);
    this.startLoopMonitor();
    return true;
  }

  stop(): void {
    if (!this.running) {
      return;
    }

    this.running = false;
    this.stopLoopMonitor();
    this.cancelLoopCrossfade();
    this.loopCrossfadeStarted = false;

    const elements = [this.audioA, this.audioB].filter(
      (audio): audio is HTMLAudioElement =>
        audio !== null && (!audio.paused || audio.volume > 0),
    );

    if (elements.length === 0) {
      return;
    }

    const startVolumes = elements.map((audio) => audio.volume);
    this.cancelFade();
    const fadeStart = performance.now();

    const step = (now: number) => {
      const progress = Math.min(1, (now - fadeStart) / FADE_OUT_MS);
      const scale = 1 - progress;

      for (let i = 0; i < elements.length; i += 1) {
        elements[i].volume = Math.max(
          0,
          Math.min(1, startVolumes[i] * scale),
        );
      }

      if (progress < 1) {
        this.fadeFrame = requestAnimationFrame(step);
        return;
      }

      this.fadeFrame = null;
      for (const audio of [this.audioA, this.audioB]) {
        audio?.pause();
        if (audio) {
          audio.currentTime = 0;
          audio.volume = 0;
        }
      }
    };

    this.fadeFrame = requestAnimationFrame(step);
  }

  dispose(): void {
    this.running = false;
    this.cancelFade();
    this.cancelLoopCrossfade();
    this.stopLoopMonitor();
    this.loopCrossfadeStarted = false;

    for (const audio of [this.audioA, this.audioB]) {
      if (!audio) {
        continue;
      }
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }

    this.audioA = null;
    this.audioB = null;
  }

  private ensureAudioElements(): HTMLAudioElement {
    if (!this.audioA) {
      this.audioA = this.createAudioElement();
    }
    if (!this.audioB) {
      this.audioB = this.createAudioElement();
    }
    return this.getActiveAudio();
  }

  private createAudioElement(): HTMLAudioElement {
    const audio = new Audio(AMBIENT_JAZZ_URL);
    audio.preload = "auto";
    return audio;
  }

  private getActiveAudio(): HTMLAudioElement {
    return this.activeSlot === "a" ? this.audioA! : this.audioB!;
  }

  private getInactiveAudio(): HTMLAudioElement {
    return this.activeSlot === "a" ? this.audioB! : this.audioA!;
  }

  private startLoopMonitor(): void {
    this.stopLoopMonitor();

    const tick = () => {
      if (!this.running || this.loopCrossfadeStarted) {
        this.loopMonitorFrame = requestAnimationFrame(tick);
        return;
      }

      const active = this.getActiveAudio();
      const durationSec = active.duration;
      if (Number.isFinite(durationSec) && durationSec > 0) {
        const remainingMs = (durationSec - active.currentTime) * 1000;
        const crossfadeMs = Math.min(
          LOOP_CROSSFADE_MS,
          Math.max(1000, durationSec * 1000 * 0.18),
        );

        if (remainingMs <= Math.min(LOOP_CROSSFADE_LEAD_MS, crossfadeMs)) {
          void this.beginLoopCrossfade(crossfadeMs);
        }
      }

      this.loopMonitorFrame = requestAnimationFrame(tick);
    };

    this.loopMonitorFrame = requestAnimationFrame(tick);
  }

  private stopLoopMonitor(): void {
    if (this.loopMonitorFrame === null) {
      return;
    }

    cancelAnimationFrame(this.loopMonitorFrame);
    this.loopMonitorFrame = null;
  }

  private async beginLoopCrossfade(crossfadeMs: number): Promise<void> {
    if (this.loopCrossfadeStarted || !this.running) {
      return;
    }

    this.loopCrossfadeStarted = true;
    const outgoing = this.getActiveAudio();
    const incoming = this.getInactiveAudio();

    incoming.currentTime = 0;
    incoming.volume = 0;

    try {
      await incoming.play();
    } catch {
      this.loopCrossfadeStarted = false;
      return;
    }

    const start = performance.now();

    const step = (now: number) => {
      if (!this.running) {
        this.loopCrossfadeFrame = null;
        return;
      }

      const progress = Math.min(1, (now - start) / crossfadeMs);
      const fadeOut = Math.cos(progress * Math.PI * 0.5);
      const fadeIn = Math.sin(progress * Math.PI * 0.5);

      outgoing.volume = Math.max(0, Math.min(1, MASTER_VOLUME * fadeOut));
      incoming.volume = Math.max(0, Math.min(1, MASTER_VOLUME * fadeIn));

      if (progress < 1) {
        this.loopCrossfadeFrame = requestAnimationFrame(step);
        return;
      }

      this.loopCrossfadeFrame = null;
      outgoing.pause();
      outgoing.currentTime = 0;
      outgoing.volume = 0;
      incoming.volume = MASTER_VOLUME;
      this.activeSlot = this.activeSlot === "a" ? "b" : "a";
      this.loopCrossfadeStarted = false;
    };

    this.cancelLoopCrossfade();
    this.loopCrossfadeFrame = requestAnimationFrame(step);
  }

  private cancelLoopCrossfade(): void {
    if (this.loopCrossfadeFrame === null) {
      return;
    }

    cancelAnimationFrame(this.loopCrossfadeFrame);
    this.loopCrossfadeFrame = null;
  }

  private rampVolume(
    audio: HTMLAudioElement,
    from: number,
    to: number,
    durationMs: number,
    onComplete?: () => void,
  ): void {
    this.cancelFade();
    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      audio.volume = Math.max(0, Math.min(1, from + (to - from) * progress));

      if (progress < 1) {
        this.fadeFrame = requestAnimationFrame(step);
        return;
      }

      this.fadeFrame = null;
      onComplete?.();
    };

    this.fadeFrame = requestAnimationFrame(step);
  }

  private cancelFade(): void {
    if (this.fadeFrame === null) {
      return;
    }

    cancelAnimationFrame(this.fadeFrame);
    this.fadeFrame = null;
  }
}

export const ambientMusicPlayer = new AmbientMusicPlayer();
