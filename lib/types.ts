// Hand point from MediaPipe (used in 'hands' mode)
export type HandPoint = {
  x: number;
  y: number;
  z: number;
  pinch: number;
  fist: number;
  active: boolean;
  age: number;
};

export const EMPTY_HAND: HandPoint = {
  x: 0.5, y: 0.5, z: 0.5, pinch: 0.5, fist: 0, active: false, age: 999,
};

// Audio analysis result (used in 'audio' mode)
export type AudioFrame = {
  bass: number;      // 0..1, low frequencies (0-200Hz)
  mid: number;       // 0..1, mids (200-2000Hz)
  treble: number;    // 0..1, highs (2000Hz+)
  kick: number;      // 0..1, transient detection (bass attack)
  energy: number;    // 0..1, overall RMS energy
  time: number;      // current playback time in seconds
  playing: boolean;
};

export const EMPTY_AUDIO: AudioFrame = {
  bass: 0, mid: 0, treble: 0, kick: 0, energy: 0, time: 0, playing: false,
};

export type SceneId = 'ink' | 'neon' | 'vapor';
export type EffectId = 'magnetize' | 'shatter';
export type FontId =
  | 'crimson' | 'playfair' | 'anton' | 'bebas'
  | 'space-grotesk' | 'jetbrains' | 'caveat' | 'bungee';

export type FontConfig = {
  id: FontId;
  name: string;
  family: string;
  cssVar: string;
  weight: number;
  letterSpacing: number;
  baseSize: number;
  category: 'serif' | 'sans' | 'display' | 'mono' | 'script';
};

export type PhotoSource = 'unsplash' | 'pexels';
export type BackgroundMode = 'scene' | 'gradient' | 'image' | 'photo';

export type GradientConfig = {
  from: string;
  to: string;
  angle: number;
};

export type BackgroundState = {
  mode: BackgroundMode;
  gradient: GradientConfig;
  imageUrl: string | null;
  photoUrl: string | null;
  photoSource: PhotoSource;
};

export type SceneConfig = {
  id: SceneId;
  name: string;
  description: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  bloom: number;
  grain: number;
  particleColor: string;
  particleSize: number;
};

export type EffectConfig = {
  id: EffectId;
  name: string;
  description: string;
};

// NEW v0.3 types
export type PerformMode = 'hands' | 'auto' | 'audio';

export type AspectRatioId = '16:9' | '9:16' | '1:1' | '4:5';

export type AspectRatioConfig = {
  id: AspectRatioId;
  label: string;
  width: number;
  height: number;
  description: string;
};

export type AppMode = 'idle' | 'calibrating' | 'countdown' | 'recording' | 'preview';
