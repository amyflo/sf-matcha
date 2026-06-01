/** Matches `.animate-receipt-print-card` in globals.css */
export const PRINT_CARD_ANIMATION_MS = 700;

/** Per-card delay; used in receipt-desk inline animationDelay */
export const PRINT_STAGGER_MS = 140;

/** Matches `.animate-receipt-print-sweep` in globals.css */
export const PRINT_SWEEP_ANIMATION_MS = 1100;

/** When the last receipt card finishes its print-in animation. */
export function getReceiptPrintDurationMs(cardCount: number): number {
  if (cardCount <= 0) {
    return 0;
  }

  return (cardCount - 1) * PRINT_STAGGER_MS + PRINT_CARD_ANIMATION_MS;
}

/** Full print phase: cards plus sweep overlay. */
export function getReceiptPrintPhaseMs(cardCount: number): number {
  return Math.max(getReceiptPrintDurationMs(cardCount), PRINT_SWEEP_ANIMATION_MS);
}
