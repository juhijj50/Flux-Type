import type { FontConfig, FontId } from "./types";

export const FONTS: Record<FontId, FontConfig> = {
  crimson: {
    id: "crimson",
    name: "Crimson",
    family: "Crimson Text",
    cssVar: "--font-crimson",
    weight: 600,
    letterSpacing: -0.02,
    baseSize: 1.2,
    category: "serif",
  },
  playfair: {
    id: "playfair",
    name: "Playfair",
    family: "Playfair Display",
    cssVar: "--font-playfair",
    weight: 800,
    letterSpacing: -0.01,
    baseSize: 1.2,
    category: "serif",
  },
  anton: {
    id: "anton",
    name: "Anton",
    family: "Anton",
    cssVar: "--font-anton",
    weight: 400,
    letterSpacing: 0.02,
    baseSize: 1.4,
    category: "display",
  },
  bebas: {
    id: "bebas",
    name: "Bebas",
    family: "Bebas Neue",
    cssVar: "--font-bebas",
    weight: 400,
    letterSpacing: 0.04,
    baseSize: 1.4,
    category: "display",
  },
  "space-grotesk": {
    id: "space-grotesk",
    name: "Space Grotesk",
    family: "Space Grotesk",
    cssVar: "--font-space",
    weight: 700,
    letterSpacing: -0.02,
    baseSize: 1.15,
    category: "sans",
  },
  jetbrains: {
    id: "jetbrains",
    name: "JetBrains",
    family: "JetBrains Mono",
    cssVar: "--font-jetbrains",
    weight: 700,
    letterSpacing: 0,
    baseSize: 1.0,
    category: "mono",
  },
  caveat: {
    id: "caveat",
    name: "Caveat",
    family: "Caveat",
    cssVar: "--font-caveat",
    weight: 700,
    letterSpacing: 0,
    baseSize: 1.6,
    category: "script",
  },
  bungee: {
    id: "bungee",
    name: "Bungee",
    family: "Bungee",
    cssVar: "--font-bungee",
    weight: 400,
    letterSpacing: 0,
    baseSize: 1.1,
    category: "display",
  },
};

export const FONT_ORDER: FontId[] = [
  "crimson",
  "playfair",
  "anton",
  "bebas",
  "space-grotesk",
  "jetbrains",
  "caveat",
  "bungee",
];

// Map FontId to URL of the font file we use for troika MSDF rendering.
// We host these via Google Fonts so no setup needed.
export const FONT_URLS: Record<FontId, string> = {
  // Notice the @main added to the URL
  crimson:
    "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/crimsontext/CrimsonText-SemiBold.ttf",
  playfair:
    "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/playfairdisplay/PlayfairDisplay%5Bwght%5D.ttf",
  anton:
    "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/anton/Anton-Regular.ttf",
  bebas:
    "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/bebasneue/BebasNeue-Regular.ttf",
  "space-grotesk":
    "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/spacegrotesk/SpaceGrotesk%5Bwght%5D.ttf",
  jetbrains:
    "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf",
  caveat:
    "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/caveat/Caveat%5Bwght%5D.ttf",
  bungee:
    "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/bungee/Bungee-Regular.ttf",
};
