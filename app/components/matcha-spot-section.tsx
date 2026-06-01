import {
  googleMapsEmbedUrl,
  googleMapsOpenUrl,
} from "@/lib/maps-embed";
import type { MatchaCafe } from "@/lib/types";

type Props = {
  cafe: MatchaCafe;
  onDesk?: boolean;
};

export function MatchaSpotSection({ cafe, onDesk = false }: Props) {
  if (!cafe.address) {
    return null;
  }

  const mapsEmbed = googleMapsEmbedUrl(cafe.address, cafe.link, cafe.name);
  const mapsOpen = googleMapsOpenUrl(cafe.address, cafe.link, cafe.name);

  return (
    <div className="mt-4 overflow-hidden rounded-xl border-2 border-dashed border-matcha/35 bg-white p-1.5">
      <iframe
        title={`Map of ${cafe.name}`}
        src={mapsEmbed}
        className={`w-full border-0 ${onDesk ? "h-32" : "h-28"}`}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
      <a
        href={mapsOpen}
        target="_blank"
        rel="noopener noreferrer"
        className="block border-t border-dashed border-ink/10 bg-matcha-light/40 py-1.5 text-center font-receipt text-[10px] uppercase tracking-widest text-matcha hover:underline"
      >
        maps
      </a>
    </div>
  );
}
