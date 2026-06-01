export function googleMapsEmbedUrl(address: string, link?: string): string {
  const mapsLink = link?.toLowerCase().includes("google.com/maps") ? link : null;
  const query = mapsLink ?? `${address}, San Francisco, CA`;
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&hl=en&z=16&output=embed`;
}

export function googleMapsOpenUrl(address: string, link?: string): string {
  if (link?.toLowerCase().includes("google.com/maps")) {
    return link;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, San Francisco, CA`)}`;
}
