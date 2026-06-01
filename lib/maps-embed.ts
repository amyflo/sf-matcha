function googleMapsSearchQuery(name: string | undefined, address: string): string {
  const locationQuery = `${address}, San Francisco, CA`;
  const trimmedName = name?.trim();
  return trimmedName ? `${trimmedName}, ${locationQuery}` : locationQuery;
}

export function googleMapsEmbedUrl(
  address: string,
  link?: string,
  name?: string,
): string {
  const mapsLink = link?.toLowerCase().includes("google.com/maps") ? link : null;
  const query = mapsLink ?? googleMapsSearchQuery(name, address);
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&hl=en&z=16&output=embed`;
}

export function googleMapsOpenUrl(
  address: string,
  link?: string,
  name?: string,
): string {
  if (link?.toLowerCase().includes("google.com/maps")) {
    return link;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    googleMapsSearchQuery(name, address),
  )}`;
}
