// Pexels API client.
//
// To use: get a free API key from https://www.pexels.com/api/
// Then set NEXT_PUBLIC_PEXELS_KEY in .env.local
//
// If the key isn't set, we fall back to a curated list of Pexels CDN URLs.

import type { UnsplashPhoto } from './unsplash';

export type ImagePhoto = UnsplashPhoto; // same shape

const PEXELS_KEY = process.env.NEXT_PUBLIC_PEXELS_KEY ?? '';

// Curated fallback photos from Pexels CDN — different aesthetic from Unsplash list
const FALLBACK_PEXELS: ImagePhoto[] = [
  {
    id: 'pexels-aurora',
    thumb: 'https://images.pexels.com/photos/1933239/pexels-photo-1933239.jpeg?auto=compress&cs=tinysrgb&w=200',
    full: 'https://images.pexels.com/photos/1933239/pexels-photo-1933239.jpeg?auto=compress&cs=tinysrgb&w=1920',
    author: 'Tobias Bjørkli',
    authorUrl: 'https://www.pexels.com/@tobiasbjorkli',
  },
  {
    id: 'pexels-purple-smoke',
    thumb: 'https://images.pexels.com/photos/1666779/pexels-photo-1666779.jpeg?auto=compress&cs=tinysrgb&w=200',
    full: 'https://images.pexels.com/photos/1666779/pexels-photo-1666779.jpeg?auto=compress&cs=tinysrgb&w=1920',
    author: 'rebcenter moscow',
    authorUrl: 'https://www.pexels.com/@rebcenter-moscow-65150',
  },
  {
    id: 'pexels-water',
    thumb: 'https://images.pexels.com/photos/1295138/pexels-photo-1295138.jpeg?auto=compress&cs=tinysrgb&w=200',
    full: 'https://images.pexels.com/photos/1295138/pexels-photo-1295138.jpeg?auto=compress&cs=tinysrgb&w=1920',
    author: 'Pixabay',
    authorUrl: 'https://www.pexels.com/@pixabay',
  },
  {
    id: 'pexels-night-sky',
    thumb: 'https://images.pexels.com/photos/1107717/pexels-photo-1107717.jpeg?auto=compress&cs=tinysrgb&w=200',
    full: 'https://images.pexels.com/photos/1107717/pexels-photo-1107717.jpeg?auto=compress&cs=tinysrgb&w=1920',
    author: 'Lucas Pezeta',
    authorUrl: 'https://www.pexels.com/@lucaspezeta',
  },
  {
    id: 'pexels-marble',
    thumb: 'https://images.pexels.com/photos/3617500/pexels-photo-3617500.jpeg?auto=compress&cs=tinysrgb&w=200',
    full: 'https://images.pexels.com/photos/3617500/pexels-photo-3617500.jpeg?auto=compress&cs=tinysrgb&w=1920',
    author: 'FWStudio',
    authorUrl: 'https://www.pexels.com/@fwstudio',
  },
  {
    id: 'pexels-pink-flowers',
    thumb: 'https://images.pexels.com/photos/56875/tulips-bright-colorful-cheerful-56875.jpeg?auto=compress&cs=tinysrgb&w=200',
    full: 'https://images.pexels.com/photos/56875/tulips-bright-colorful-cheerful-56875.jpeg?auto=compress&cs=tinysrgb&w=1920',
    author: 'Pixabay',
    authorUrl: 'https://www.pexels.com/@pixabay',
  },
  {
    id: 'pexels-bokeh',
    thumb: 'https://images.pexels.com/photos/776538/pexels-photo-776538.jpeg?auto=compress&cs=tinysrgb&w=200',
    full: 'https://images.pexels.com/photos/776538/pexels-photo-776538.jpeg?auto=compress&cs=tinysrgb&w=1920',
    author: 'Asad Photo Maldives',
    authorUrl: 'https://www.pexels.com/@asadphoto',
  },
  {
    id: 'pexels-architecture',
    thumb: 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=200',
    full: 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=1920',
    author: 'Picography',
    authorUrl: 'https://www.pexels.com/@picography',
  },
  {
    id: 'pexels-leaves',
    thumb: 'https://images.pexels.com/photos/172289/pexels-photo-172289.jpeg?auto=compress&cs=tinysrgb&w=200',
    full: 'https://images.pexels.com/photos/172289/pexels-photo-172289.jpeg?auto=compress&cs=tinysrgb&w=1920',
    author: 'Pixabay',
    authorUrl: 'https://www.pexels.com/@pixabay',
  },
  {
    id: 'pexels-mountains',
    thumb: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=200',
    full: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1920',
    author: 'Stephan Seeber',
    authorUrl: 'https://www.pexels.com/@stephan-seeber-1183359',
  },
  {
    id: 'pexels-stars',
    thumb: 'https://images.pexels.com/photos/957061/milky-way-starry-sky-night-sky-star-957061.jpeg?auto=compress&cs=tinysrgb&w=200',
    full: 'https://images.pexels.com/photos/957061/milky-way-starry-sky-night-sky-star-957061.jpeg?auto=compress&cs=tinysrgb&w=1920',
    author: 'Felix Mittermeier',
    authorUrl: 'https://www.pexels.com/@felixmittermeier',
  },
  {
    id: 'pexels-sand',
    thumb: 'https://images.pexels.com/photos/847402/pexels-photo-847402.jpeg?auto=compress&cs=tinysrgb&w=200',
    full: 'https://images.pexels.com/photos/847402/pexels-photo-847402.jpeg?auto=compress&cs=tinysrgb&w=1920',
    author: 'Pixabay',
    authorUrl: 'https://www.pexels.com/@pixabay',
  },
];

export async function searchPexels(query: string): Promise<ImagePhoto[]> {
  if (!PEXELS_KEY) {
    const q = query.toLowerCase();
    const filtered = FALLBACK_PEXELS.filter(
      (p) => p.id.includes(q) || p.author.toLowerCase().includes(q)
    );
    return filtered.length > 0 ? filtered : FALLBACK_PEXELS;
  }
  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=12&orientation=landscape`,
    { headers: { Authorization: PEXELS_KEY } }
  );
  if (!res.ok) throw new Error(`Pexels error ${res.status}`);
  const data = await res.json();
  return (data.photos ?? []).map((p: any) => ({
    id: String(p.id),
    thumb: p.src.tiny,
    full: p.src.large2x ?? p.src.large,
    author: p.photographer,
    authorUrl: p.photographer_url,
  }));
}

export function getFeaturedPexels(): ImagePhoto[] {
  return FALLBACK_PEXELS;
}
