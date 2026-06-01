type Props = {
  position: "top" | "bottom";
};

const edgeClass =
  "h-2.5 bg-[#f9f5ec] bg-[length:20px_10px] bg-[radial-gradient(circle_at_10px_-2px,transparent_8px,#f9f5ec_8px)]";

export function ReceiptEdge({ position }: Props) {
  return (
    <div
      aria-hidden="true"
      className={position === "top" ? `${edgeClass} rotate-180` : edgeClass}
    />
  );
}
