// Unsplash API client.
//
// To use: get a free Access Key from https://unsplash.com/developers
// Then set NEXT_PUBLIC_UNSPLASH_KEY in .env.local
//
// If the key isn't set, we fall back to a curated list of known-good
// Unsplash photo IDs so the app still works for demos.

export type UnsplashPhoto = {
  id: string;
  thumb: string;
  full: string;
  author: string;
  authorUrl: string;
};

const UNSPLASH_KEY = process.env.NEXT_PUBLIC_UNSPLASH_KEY ?? '';

// Curated fallback photos (Unsplash CDN URLs, no API key needed)
// These render directly from Unsplash's image CDN
const FALLBACK_PHOTOS: UnsplashPhoto[] = [
  {
    id: 'mountain-sunset',
    thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=70',
    full: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=85',
    author: 'eberhard grossgasteiger',
    authorUrl: 'https://unsplash.com/@eberhardgross',
  },
  {
    id: 'neon-city',
    thumb: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=200&q=70',
    full: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1920&q=85',
    author: 'Anton Repponen',
    authorUrl: 'https://unsplash.com/@repponen',
  },
  {
    id: 'pink-sky',
    thumb: 'https://images.unsplash.com/photo-1492551557933-34265f7af79e?w=200&q=70',
    full: 'https://images.unsplash.com/photo-1492551557933-34265f7af79e?w=1920&q=85',
    author: 'Jakob Owens',
    authorUrl: 'https://unsplash.com/@jakobowens1',
  },
  {
    id: 'forest-fog',
    thumb: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=200&q=70',
    full: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=85',
    author: 'Sergei Akulich',
    authorUrl: 'https://unsplash.com/@sakulich',
  },
  {
    id: 'ocean-waves',
    thumb: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=200&q=70',
    full: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&q=85',
    author: 'Jeremy Bishop',
    authorUrl: 'https://unsplash.com/@jeremybishop',
  },
  {
    id: 'desert-dunes',
    thumb: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=200&q=70',
    full: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=1920&q=85',
    author: 'Wolfgang Hasselmann',
    authorUrl: 'https://unsplash.com/@wolfgang_hasselmann',
  },
  {
    id: 'city-lights',
    thumb: 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=200&q=70',
    full: 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=1920&q=85',
    author: 'JOSHUA COLEMAN',
    authorUrl: 'https://unsplash.com/@joshstyle',
  },
  {
    id: 'abstract-paint',
    thumb: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=200&q=70',
    full: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1920&q=85',
    author: 'Pawel Czerwinski',
    authorUrl: 'https://unsplash.com/@pawel_czerwinski',
  },
  {
    id: 'galaxy',
    thumb: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=200&q=70',
    full: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=85',
    author: 'Jeremy Thomas',
    authorUrl: 'https://unsplash.com/@jeremythomasphoto',
  },
  {
    id: 'rain-window',
    thumb: 'https://images.unsplash.com/photo-1428592953211-077101b2021b?w=200&q=70',
    full: 'https://images.unsplash.com/photo-1428592953211-077101b2021b?w=1920&q=85',
    author: 'Daniel Cheung',
    authorUrl: 'https://unsplash.com/@danielkcheung',
  },
  {
    id: 'forest-light',
    thumb: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=200&q=70',
    full: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1920&q=85',
    author: 'Lukasz Szmigiel',
    authorUrl: 'https://unsplash.com/@szmigieldesign',
  },
  {
    id: 'pastel-clouds',
    thumb: 'https://images.unsplash.com/photo-1517242810446-cc8951b2be40?w=200&q=70',
    full: 'https://images.unsplash.com/photo-1517242810446-cc8951b2be40?w=1920&q=85',
    author: 'Casey Horner',
    authorUrl: 'https://unsplash.com/@mischievous_penguins',
  },
];

export async function searchUnsplash(query: string): Promise<UnsplashPhoto[]> {
  if (!UNSPLASH_KEY) {
    // Filter fallback photos by query string match (best effort)
    const q = query.toLowerCase();
    const filtered = FALLBACK_PHOTOS.filter(
      (p) => p.id.includes(q) || p.author.toLowerCase().includes(q)
    );
    return filtered.length > 0 ? filtered : FALLBACK_PHOTOS;
  }
  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12&orientation=landscape`,
    { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
  );
  if (!res.ok) throw new Error(`Unsplash error ${res.status}`);
  const data = await res.json();
  return (data.results ?? []).map((r: any) => ({
    id: r.id,
    thumb: r.urls.thumb,
    full: r.urls.regular,
    author: r.user.name,
    authorUrl: r.user.links.html,
  }));
}

export function getFeaturedUnsplash(): UnsplashPhoto[] {
  return FALLBACK_PHOTOS;
}
