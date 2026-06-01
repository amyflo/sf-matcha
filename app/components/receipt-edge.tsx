type Props = {
  position: "top" | "bottom";
};

export function ReceiptEdge({ position }: Props) {
  const tearClass =
    "h-full bg-[length:18px_12px] bg-[radial-gradient(circle_at_9px_-2px,transparent_7px,#f9f5ec_7.3px)]";
  const printLineClass =
    position === "top"
      ? "absolute inset-x-0 bottom-0 border-b border-dashed border-ink/20"
      : "absolute inset-x-0 top-0 border-t border-dashed border-ink/20";

  return (
    <div aria-hidden="true" className="relative h-3 overflow-hidden bg-[#f9f5ec]">
      <div
        className={position === "top" ? `${tearClass} rotate-180` : tearClass}
      />
      <div className={printLineClass} />
    </div>
  );
}
