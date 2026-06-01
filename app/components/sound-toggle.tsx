"use client";

import { useReceiptSound } from "@/app/components/receipt-sound-provider";
import { Music2, Music4, Volume2, VolumeX } from "lucide-react";

const pillClassName =
  "inline-flex min-h-10 items-center gap-1.5 rounded-full border border-ink/20 bg-white/90 px-3 py-2 font-receipt text-[10px] uppercase tracking-[0.16em] text-ink shadow-[0_4px_12px_rgba(61,52,41,0.12)] transition hover:bg-white sm:min-h-0 sm:py-1.5";

export function SoundToggle() {
  const {
    soundEnabled,
    musicEnabled,
    setSoundEnabled,
    toggleMusic,
    unlockEffects,
  } = useReceiptSound();

  async function handleToggleEffects() {
    if (!soundEnabled) {
      await unlockEffects();
    }
    setSoundEnabled(!soundEnabled);
  }

  async function handleToggleMusic() {
    await toggleMusic();
  }

  return (
    <div className="flex max-w-[calc(100vw-1.5rem)] flex-col items-end gap-2 max-sm:flex-row max-sm:flex-wrap max-sm:justify-end">
      <button
        type="button"
        onClick={() => void handleToggleEffects()}
        aria-pressed={soundEnabled}
        aria-label={
          soundEnabled
            ? "Mute receipt sounds"
            : "Enable receipt sounds"
        }
        className={pillClassName}
      >
        {soundEnabled ? (
          <Volume2 aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} />
        ) : (
          <VolumeX aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} />
        )}
        sounds {soundEnabled ? "on" : "off"}
      </button>

      <button
        type="button"
        onClick={() => void handleToggleMusic()}
        aria-pressed={musicEnabled}
        aria-label={musicEnabled ? "Stop ambient music" : "Start ambient music"}
        className={pillClassName}
      >
        {musicEnabled ? (
          <Music4 aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} />
        ) : (
          <Music2 aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} />
        )}
        music {musicEnabled ? "on" : "off"}
      </button>
    </div>
  );
}
