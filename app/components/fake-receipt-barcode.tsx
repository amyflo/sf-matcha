"use client";

type Props = {
  seed: string;
  className?: string;
};

function buildBars(seed: string) {
  const source = seed || "matcha-receipt";
  const bars: Array<{ width: number; opacity: number }> = [];

  for (let index = 0; index < 36; index += 1) {
    const charCode = source.charCodeAt(index % source.length) || 77;
    bars.push({
      width: (charCode % 3) + 1,
      opacity: 0.5 + ((charCode % 5) * 0.1),
    });
  }

  return bars;
}

export function FakeReceiptBarcode({ seed, className }: Props) {
  const bars = buildBars(seed);
  const code = seed
    .replace(/[^a-z0-9]/gi, "")
    .toUpperCase()
    .slice(0, 16)
    .padEnd(16, "0");

  return (
    <div className={className}>
      <div className="flex h-10 items-end justify-center gap-[1px] px-2 py-1">
        {bars.map((bar, index) => (
          <span
            key={`${code}-${index}`}
            className="h-full bg-ink"
            style={{
              width: `${bar.width}px`,
              opacity: bar.opacity,
            }}
          />
        ))}
      </div>
      <p className="mt-1 text-center font-receipt text-[9px] tracking-[0.18em] text-ink-soft">
        {code}
      </p>
    </div>
  );
}
