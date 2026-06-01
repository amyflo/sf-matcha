"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

type Props = {
  address: string;
};

export function CopyAddressButton({ address }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Address copied" : "Copy address"}
      title={copied ? "Copied" : "Copy address"}
      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-matcha/30 bg-matcha-light/50 text-matcha-dark transition hover:bg-matcha-light"
    >
      {copied ? (
        <Check className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Copy className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
