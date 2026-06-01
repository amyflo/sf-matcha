"use client";

import { ambientMusicPlayer } from "@/lib/ambient-music";
import {
  touchAudioContextForGesture,
  unlockAudioContext,
} from "@/lib/audio-context";
import { receiptSoundPlayer } from "@/lib/receipt-sound";
import {
  getInitialMusicEnabled,
  getInitialSoundEnabled,
  persistMusicEnabled,
  persistSoundEnabled,
  prefersReducedMotion,
  readMusicEnabled,
  readSoundEnabled,
} from "@/lib/sound-preference";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ReceiptSoundContextValue = {
  soundEnabled: boolean;
  musicEnabled: boolean;
  previewOpen: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setPreviewOpen: (open: boolean) => void;
  toggleMusic: () => Promise<void>;
  unlockEffects: () => Promise<void>;
  playReceiptPrint: (cardCount: number) => void;
  playReceiptHandle: () => void;
  playPaperDown: () => void;
  playOrderProcessing: () => void;
};

const ReceiptSoundContext = createContext<ReceiptSoundContextValue | null>(
  null,
);

export function ReceiptSoundProvider({ children }: { children: ReactNode }) {
  const [soundEnabled, setSoundEnabledState] = useState(false);
  const [musicEnabled, setMusicEnabledState] = useState(false);
  const [previewOpen, setPreviewOpenState] = useState(false);
  const [soundPrefsLoaded, setSoundPrefsLoaded] = useState(false);

  useEffect(() => {
    setSoundEnabledState(getInitialSoundEnabled());
    setMusicEnabledState(getInitialMusicEnabled());
    setSoundPrefsLoaded(true);
    void ambientMusicPlayer.preload();
  }, []);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabledState(enabled);
    persistSoundEnabled(enabled);
  }, []);

  const setMusicEnabled = useCallback((enabled: boolean) => {
    setMusicEnabledState(enabled);
    persistMusicEnabled(enabled);
  }, []);

  const setPreviewOpen = useCallback((open: boolean) => {
    setPreviewOpenState(open);
  }, []);

  const effectsAllowed = soundEnabled && !previewOpen;

  const toggleMusic = useCallback(async () => {
    if (musicEnabled) {
      ambientMusicPlayer.stop();
      setMusicEnabled(false);
      return;
    }

    const started = await ambientMusicPlayer.start();
    if (started) {
      setMusicEnabled(true);
    }
  }, [musicEnabled, setMusicEnabled]);

  const unlockEffects = useCallback(async () => {
    await receiptSoundPlayer.unlock();
  }, []);

  const playReceiptPrint = useCallback(
    (cardCount: number) => {
      if (!effectsAllowed) {
        return;
      }
      receiptSoundPlayer.playPrintSequence({ cardCount });
    },
    [effectsAllowed],
  );

  const playReceiptHandle = useCallback(() => {
    if (!effectsAllowed) {
      return;
    }
    void receiptSoundPlayer.unlock();
    receiptSoundPlayer.playPaperCollect();
  }, [effectsAllowed]);

  const playPaperDown = useCallback(() => {
    if (!effectsAllowed) {
      return;
    }
    void receiptSoundPlayer.unlock();
    receiptSoundPlayer.playPaperDown();
  }, [effectsAllowed]);

  const playOrderProcessing = useCallback(() => {
    if (!effectsAllowed) {
      return;
    }
    receiptSoundPlayer.playOrderProcessing();
  }, [effectsAllowed]);

  useEffect(() => {
    if (!soundPrefsLoaded) {
      return;
    }

    function handleFirstInteraction() {
      touchAudioContextForGesture();

      const shouldStartMusic = getInitialMusicEnabled();
      const musicStartPromise = shouldStartMusic
        ? ambientMusicPlayer.start()
        : null;

      void unlockAudioContext().then(async (ctx) => {
        if (!ctx) {
          return;
        }

        await receiptSoundPlayer.unlock();
        await ambientMusicPlayer.preload();

        if (musicStartPromise) {
          const started = await musicStartPromise;
          if (started) {
            setMusicEnabledState(true);
          }
        }
      });
    }

    const interactionOptions = { capture: true, once: true } as const;

    window.addEventListener("pointerdown", handleFirstInteraction, interactionOptions);
    window.addEventListener("keydown", handleFirstInteraction, interactionOptions);

    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };
  }, [soundPrefsLoaded]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    function handleMotionPreferenceChange() {
      if (!prefersReducedMotion()) {
        return;
      }
      if (readSoundEnabled() === null) {
        setSoundEnabledState(false);
      }
      if (readMusicEnabled() === null) {
        ambientMusicPlayer.stop();
        setMusicEnabledState(false);
      }
    }

    media.addEventListener("change", handleMotionPreferenceChange);
    return () => media.removeEventListener("change", handleMotionPreferenceChange);
  }, []);

  useEffect(() => {
    return () => {
      ambientMusicPlayer.dispose();
    };
  }, []);

  const value = useMemo(
    () => ({
      soundEnabled,
      musicEnabled,
      previewOpen,
      setSoundEnabled,
      setMusicEnabled,
      setPreviewOpen,
      toggleMusic,
      unlockEffects,
      playReceiptPrint,
      playReceiptHandle,
      playPaperDown,
      playOrderProcessing,
    }),
    [
      soundEnabled,
      musicEnabled,
      previewOpen,
      setSoundEnabled,
      setMusicEnabled,
      setPreviewOpen,
      toggleMusic,
      unlockEffects,
      playReceiptPrint,
      playReceiptHandle,
      playPaperDown,
      playOrderProcessing,
    ],
  );

  return (
    <ReceiptSoundContext.Provider value={value}>
      {children}
    </ReceiptSoundContext.Provider>
  );
}

export function useReceiptSound() {
  const context = useContext(ReceiptSoundContext);
  if (!context) {
    throw new Error("useReceiptSound must be used within ReceiptSoundProvider");
  }
  return context;
}
