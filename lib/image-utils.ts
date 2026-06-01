export function normalizeImageUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url.split("?")[0] ?? url;
  }
}

export function isSameImage(a: string, b: string): boolean {
  return normalizeImageUrl(a) === normalizeImageUrl(b);
}

export function isLikelyPhoto(url: string): boolean {
  const lower = url.toLowerCase();
  if (/\.(jpg|jpeg|png|webp|gif|avif)(\?|$)/.test(lower)) {
    return true;
  }
  return (
    lower.includes("yelpcdn.com") ||
    lower.includes("bphoto") ||
    lower.includes("/photo") ||
    lower.includes("/image")
  );
}

export function isLikelyDrinkPhoto(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.includes("bphoto") ||
    lower.includes("food") ||
    lower.includes("drink") ||
    lower.includes("matcha") ||
    lower.includes("latte") ||
    lower.includes("tea") ||
    lower.includes("dish") ||
    lower.includes("menu")
  );
}

export function isLikelyStorefrontPhoto(url: string): boolean {
  const lower = url.toLowerCase();
  if (
    lower.includes("avatar") ||
    lower.includes("logo") ||
    lower.includes("icon") ||
    lower.includes("badge")
  ) {
    return false;
  }
  return (
    lower.includes("exterior") ||
    lower.includes("storefront") ||
    lower.includes("interior") ||
    lower.includes("yelpcdn.com/o") ||
    (!isLikelyDrinkPhoto(url) && lower.includes("yelpcdn.com"))
  );
}
