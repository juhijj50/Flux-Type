// URL preset encoding.
//
// Encodes the user's current style (NOT their text) into a compact Base64
// string that can be shared as a URL parameter. When someone opens the
// URL, the app decodes it and applies the style — they just type their
// own text.
//
// We deliberately exclude:
//   - text (every user types their own)
//   - imageUrl (uploaded photos are local-only)
//   - recordedBlob (transient)
//   - useWebcam / mode (UI state, not style)

import type {
  SceneId, EffectId, FontId, BackgroundState,
  AspectRatioId,
} from './types';

export type StylePreset = {
  scene: SceneId;
  effect: EffectId;
  font: FontId;
  background: BackgroundState;
  depthZoom: boolean;
  fistFade: boolean;
  aspectRatio: AspectRatioId;
  transparent: boolean;
};

// Use a tiny version field so we can evolve the format without breaking old links
const PRESET_VERSION = 1;

export function encodePreset(p: StylePreset): string {
  const payload = { v: PRESET_VERSION, ...p };
  const json = JSON.stringify(payload);
  // Base64 encode. encodeURIComponent first to handle any unicode safely.
  return btoa(unescape(encodeURIComponent(json)));
}

export function decodePreset(encoded: string): StylePreset | null {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    const data = JSON.parse(json);
    if (data.v !== PRESET_VERSION) {
      console.warn(`Preset version mismatch (got ${data.v}, expected ${PRESET_VERSION})`);
      // Still attempt to use it — at worst, some fields will be missing
    }
    const { v, ...preset } = data;
    return preset as StylePreset;
  } catch (err) {
    console.error('Failed to decode preset:', err);
    return null;
  }
}

export function getPresetFromURL(): StylePreset | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const p = params.get('p');
  if (!p) return null;
  return decodePreset(p);
}

export function buildPresetURL(p: StylePreset): string {
  if (typeof window === 'undefined') return '';
  const encoded = encodePreset(p);
  const url = new URL(window.location.href);
  url.searchParams.set('p', encoded);
  return url.toString();
}
