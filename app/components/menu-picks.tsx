"use client";

type Props = {
  items: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onDesk?: boolean;
};

export function MenuPicks({ items, activeIndex, onSelect, onDesk = false }: Props) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-1.5 rounded-[0.85rem] border-2 border-double border-matcha/45 bg-gradient-to-b from-[#fffdf9] to-[#f5f0e4] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
      <div className="border-b border-dashed border-matcha/35 pb-2 text-center">
        <p className="font-hand text-[1.65rem] leading-none text-matcha-dark">
          today&apos;s menu
        </p>
        <p className="mt-0.5 font-receipt text-[9px] uppercase tracking-[0.2em] text-ink-soft">
          tap a pick to preview
        </p>
      </div>

      <ul className="mt-2 flex flex-col gap-0.5">
        {items.map((item, index) => {
          const isActive = index === activeIndex;

          return (
            <li key={item}>
              <button
                type="button"
                onClick={() => onSelect(index)}
                className={`flex w-full min-w-0 items-baseline gap-1.5 rounded-lg border-0 px-1 py-1.5 text-left transition-colors ${
                  isActive
                    ? "bg-matcha-light/65 text-ink"
                    : "bg-transparent text-ink hover:bg-matcha-light/45"
                }`}
                aria-current={isActive ? "true" : undefined}
              >
                <span className="font-receipt text-[10px] tracking-wider text-ink-soft">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={`min-w-0 flex-1 font-hand leading-tight break-words ${
                    onDesk ? "text-[1.35rem]" : "text-xl"
                  }`}
                >
                  {item}
                </span>
                <span
                  className={`mb-1 min-w-4 shrink-0 flex-1 border-b-2 border-dotted border-matcha/35 ${
                    onDesk ? "block" : "hidden sm:block"
                  }`}
                  aria-hidden="true"
                />
                <span
                  className={`font-receipt text-[9px] uppercase tracking-wider ${
                    isActive ? "font-bold text-matcha-dark" : "text-matcha"
                  }`}
                >
                  {isActive ? "viewing" : "*"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
