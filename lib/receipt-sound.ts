import {
  getAudioContext,
  isAudioUnlocked,
  touchAudioContextForGesture,
  unlockAudioContext,
} from "@/lib/audio-context";
import { getReceiptPrintDurationMs } from "@/lib/receipt-print-timing";

const RECEIPT_PRINTER_URL = "/audio/receipt-printer.mp3";
const PAPER_COLLECT_URL = "/audio/paper-collect.mp3";
const PAPER_DOWN_URL = "/audio/paper-down.mp3";
const ORDER_PROCESSING_URL = "/audio/order-processing.mp3";
const PRINT_VOLUME = 0.72;
const PAPER_COLLECT_VOLUME = 0.58;
const PAPER_DOWN_VOLUME = 0.58;
const ORDER_PROCESSING_VOLUME = 0.65;
const MIN_PLAYBACK_RATE = 0.5;
const MAX_PLAYBACK_RATE = 2.5;

type ReceiptSoundOptions = {
  cardCount: number;
  durationMs?: number;
  volume?: number;
};

export class ReceiptSoundPlayer {
  private buffer: AudioBuffer | null = null;
  private preloadPromise: Promise<AudioBuffer | null> | null = null;
  private paperBuffer: AudioBuffer | null = null;
  private paperPreloadPromise: Promise<AudioBuffer | null> | null = null;
  private paperDownBuffer: AudioBuffer | null = null;
  private paperDownPreloadPromise: Promise<AudioBuffer | null> | null = null;
  private orderProcessingBuffer: AudioBuffer | null = null;
  private orderProcessingPreloadPromise: Promise<AudioBuffer | null> | null = null;
  private activeSource: AudioBufferSourceNode | null = null;

  async unlock(): Promise<void> {
    const ctx = await unlockAudioContext();
    if (ctx) {
      await Promise.all([
        this.preload(ctx),
        this.preloadPaper(ctx),
        this.preloadPaperDown(ctx),
        this.preloadOrderProcessing(ctx),
      ]);
    }
  }

  isUnlocked(): boolean {
    return isAudioUnlocked();
  }

  playPrintSequence({
    cardCount,
    durationMs = getReceiptPrintDurationMs(cardCount),
    volume = PRINT_VOLUME,
  }: ReceiptSoundOptions): void {
    if (!isAudioUnlocked() || cardCount <= 0 || durationMs <= 0) {
      return;
    }

    if (this.buffer) {
      this.playSample(volume, durationMs);
      return;
    }

    const ctx = getAudioContext();
    if (!ctx) {
      return;
    }

    void this.preload(ctx).then((buffer) => {
      if (buffer) {
        this.playSample(volume, durationMs);
      }
    });
  }

  playPaperCollect(): void {
    this.playPaperEffect(() => this.paperBuffer, (ctx) => this.preloadPaper(ctx), () =>
      this.playPaperSample(),
    );
  }

  playPaperDown(): void {
    this.playPaperEffect(
      () => this.paperDownBuffer,
      (ctx) => this.preloadPaperDown(ctx),
      () => this.playPaperDownSample(),
    );
  }

  playOrderProcessing(): void {
    this.playPaperEffect(
      () => this.orderProcessingBuffer,
      (ctx) => this.preloadOrderProcessing(ctx),
      () => this.playOrderProcessingSample(),
    );
  }

  private playPaperEffect(
    getBuffer: () => AudioBuffer | null,
    preload: (ctx: AudioContext) => Promise<AudioBuffer | null>,
    play: () => void,
  ): void {
    const ctx = touchAudioContextForGesture() ?? getAudioContext();
    if (!ctx) {
      void unlockAudioContext().then((unlockedCtx) => {
        if (unlockedCtx) {
          this.playPaperEffect(getBuffer, preload, play);
        }
      });
      return;
    }

    if (ctx.state === "suspended") {
      void ctx.resume().then(() => {
        void unlockAudioContext().then((unlockedCtx) => {
          if (unlockedCtx) {
            this.playPaperEffect(getBuffer, preload, play);
          }
        });
      });
      return;
    }

    if (ctx.state !== "running") {
      return;
    }

    if (getBuffer()) {
      play();
      return;
    }

    void preload(ctx).then((buffer) => {
      if (buffer) {
        play();
      }
    });
  }

  private async preload(ctx: AudioContext): Promise<AudioBuffer | null> {
    if (this.buffer) {
      return this.buffer;
    }

    if (!this.preloadPromise) {
      this.preloadPromise = fetch(RECEIPT_PRINTER_URL)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to load receipt sound (${response.status})`);
          }
          return response.arrayBuffer();
        })
        .then((arrayBuffer) => ctx.decodeAudioData(arrayBuffer))
        .then((decoded) => {
          this.buffer = decoded;
          return decoded;
        })
        .catch(() => null);
    }

    return this.preloadPromise;
  }

  private async preloadPaper(ctx: AudioContext): Promise<AudioBuffer | null> {
    if (this.paperBuffer) {
      return this.paperBuffer;
    }

    if (!this.paperPreloadPromise) {
      this.paperPreloadPromise = fetch(PAPER_COLLECT_URL)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to load paper sound (${response.status})`);
          }
          return response.arrayBuffer();
        })
        .then((arrayBuffer) => ctx.decodeAudioData(arrayBuffer))
        .then((decoded) => {
          this.paperBuffer = decoded;
          return decoded;
        })
        .catch(() => null);
    }

    return this.paperPreloadPromise;
  }

  private async preloadPaperDown(ctx: AudioContext): Promise<AudioBuffer | null> {
    if (this.paperDownBuffer) {
      return this.paperDownBuffer;
    }

    if (!this.paperDownPreloadPromise) {
      this.paperDownPreloadPromise = fetch(PAPER_DOWN_URL)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to load paper down sound (${response.status})`);
          }
          return response.arrayBuffer();
        })
        .then((arrayBuffer) => ctx.decodeAudioData(arrayBuffer))
        .then((decoded) => {
          this.paperDownBuffer = decoded;
          return decoded;
        })
        .catch(() => null);
    }

    return this.paperDownPreloadPromise;
  }

  private async preloadOrderProcessing(
    ctx: AudioContext,
  ): Promise<AudioBuffer | null> {
    if (this.orderProcessingBuffer) {
      return this.orderProcessingBuffer;
    }

    if (!this.orderProcessingPreloadPromise) {
      this.orderProcessingPreloadPromise = fetch(ORDER_PROCESSING_URL)
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `Failed to load order processing sound (${response.status})`,
            );
          }
          return response.arrayBuffer();
        })
        .then((arrayBuffer) => ctx.decodeAudioData(arrayBuffer))
        .then((decoded) => {
          this.orderProcessingBuffer = decoded;
          return decoded;
        })
        .catch(() => null);
    }

    return this.orderProcessingPreloadPromise;
  }

  private stopActiveSource(): void {
    if (!this.activeSource) {
      return;
    }

    try {
      this.activeSource.stop();
    } catch {
      // Already stopped.
    }

    this.activeSource = null;
  }

  private playSample(volume: number, durationMs: number): void {
    const ctx = getAudioContext();
    if (!ctx || !this.buffer) {
      return;
    }

    this.stopActiveSource();

    const targetSec = durationMs / 1000;
    const bufferSec = this.buffer.duration;
    const rawRate = bufferSec / targetSec;
    const playbackRate = Math.min(
      MAX_PLAYBACK_RATE,
      Math.max(MIN_PLAYBACK_RATE, rawRate),
    );

    const source = ctx.createBufferSource();
    source.buffer = this.buffer;
    source.playbackRate.value = playbackRate;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);

    source.connect(gain);
    gain.connect(ctx.destination);

    const start = ctx.currentTime;
    source.start(start);
    source.stop(start + targetSec);

    this.activeSource = source;
    source.onended = () => {
      if (this.activeSource === source) {
        this.activeSource = null;
      }
    };
  }

  private playPaperSample(): void {
    const ctx = getAudioContext();
    if (!ctx || !this.paperBuffer) {
      return;
    }

    const source = ctx.createBufferSource();
    source.buffer = this.paperBuffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(PAPER_COLLECT_VOLUME, ctx.currentTime);

    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(ctx.currentTime);
  }

  private playPaperDownSample(): void {
    const ctx = getAudioContext();
    if (!ctx || !this.paperDownBuffer) {
      return;
    }

    const source = ctx.createBufferSource();
    source.buffer = this.paperDownBuffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(PAPER_DOWN_VOLUME, ctx.currentTime);

    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(ctx.currentTime);
  }

  private playOrderProcessingSample(): void {
    const ctx = getAudioContext();
    if (!ctx || !this.orderProcessingBuffer) {
      return;
    }

    const source = ctx.createBufferSource();
    source.buffer = this.orderProcessingBuffer;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(ORDER_PROCESSING_VOLUME, ctx.currentTime);

    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(ctx.currentTime);
  }
}

export const receiptSoundPlayer = new ReceiptSoundPlayer();
