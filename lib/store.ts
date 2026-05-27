import { create } from 'zustand';
import type {
  SceneId, EffectId, AppMode, FontId,
  BackgroundMode, BackgroundState, GradientConfig, PhotoSource,
  PerformMode, AspectRatioId,
} from './types';

type Store = {
  text: string;
  setText: (t: string) => void;

  scene: SceneId;
  setScene: (s: SceneId) => void;
  effect: EffectId;
  setEffect: (e: EffectId) => void;
  font: FontId;
  setFont: (f: FontId) => void;

  background: BackgroundState;
  setBackgroundMode: (m: BackgroundMode) => void;
  setGradient: (g: Partial<GradientConfig>) => void;
  setImageUrl: (u: string | null) => void;
  setPhotoUrl: (u: string | null) => void;
  setPhotoSource: (s: PhotoSource) => void;

  performMode: PerformMode;
  setPerformMode: (m: PerformMode) => void;

  depthZoom: boolean;
  setDepthZoom: (v: boolean) => void;
  fistFade: boolean;
  setFistFade: (v: boolean) => void;

  // v0.3 new fields
  aspectRatio: AspectRatioId;
  setAspectRatio: (r: AspectRatioId) => void;
  transparent: boolean;
  setTransparent: (v: boolean) => void;
  audioFileName: string | null;
  setAudioFileName: (n: string | null) => void;

  mode: AppMode;
  setMode: (m: AppMode) => void;
  recordedBlob: Blob | null;
  setRecordedBlob: (b: Blob | null) => void;
  watermark: boolean;
  setWatermark: (v: boolean) => void;

  // Apply a preset all at once (used when loading from URL)
  applyPreset: (p: Partial<Store>) => void;
};

export const useStore = create<Store>((set) => ({
  text: 'FLUX TYPE',
  setText: (t) => set({ text: t.slice(0, 20).toUpperCase() }),

  scene: 'ink',
  setScene: (s) => set({ scene: s }),
  effect: 'magnetize',
  setEffect: (e) => set({ effect: e }),
  font: 'crimson',
  setFont: (f) => set({ font: f }),

  background: {
    mode: 'scene',
    gradient: { from: '#ff2bd6', to: '#2bf0ff', angle: 135 },
    imageUrl: null,
    photoUrl: null,
    photoSource: 'pexels', // pexels default since unsplash often blocked
  },
  setBackgroundMode: (m) => set((s) => ({ background: { ...s.background, mode: m } })),
  setGradient: (g) => set((s) => ({
    background: { ...s.background, gradient: { ...s.background.gradient, ...g } },
  })),
  setImageUrl: (u) => set((s) => ({ background: { ...s.background, imageUrl: u } })),
  setPhotoUrl: (u) => set((s) => ({ background: { ...s.background, photoUrl: u } })),
  setPhotoSource: (src) => set((s) => ({
    background: { ...s.background, photoSource: src, photoUrl: null },
  })),

  performMode: 'hands',
  setPerformMode: (m) => set({ performMode: m }),

  depthZoom: true,
  setDepthZoom: (v) => set({ depthZoom: v }),
  fistFade: true,
  setFistFade: (v) => set({ fistFade: v }),

  aspectRatio: '16:9',
  setAspectRatio: (r) => set({ aspectRatio: r }),
  transparent: false,
  setTransparent: (v) => set({ transparent: v }),
  audioFileName: null,
  setAudioFileName: (n) => set({ audioFileName: n }),

  mode: 'idle',
  setMode: (m) => set({ mode: m }),
  recordedBlob: null,
  setRecordedBlob: (b) => set({ recordedBlob: b }),
  watermark: true,
  setWatermark: (v) => set({ watermark: v }),

  applyPreset: (p) => set((state) => ({ ...state, ...p })),
}));
