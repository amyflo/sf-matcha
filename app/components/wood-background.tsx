export function WoodBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
    >
      <div className="wood-surface absolute inset-0" />
      <div className="wood-desk-edge absolute inset-x-0 bottom-0 h-4 sm:h-5" />
    </div>
  );
}
