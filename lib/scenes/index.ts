import type { SceneConfig, SceneId } from '../types';


export const SCENES: Record<SceneId, SceneConfig> = {
  ink: {
    id: 'ink',
    name: 'Ink',
    description: 'Black ink bleeding on paper. Calm, premium.',
    bgColor: '#0a0a0a',
    textColor: '#fafafa',
    accentColor: '#fafafa',
    bloom: 0.15,
    grain: 0.08,
    particleColor: '#fafafa',
    particleSize: 0.015,
  },
  neon: {
    id: 'neon',
    name: 'Neon',
    description: 'Glowing tube light. For streamers and gamers.',
    bgColor: '#08060f',
    textColor: '#ff2bd6',
    accentColor: '#2bf0ff',
    bloom: 0.85,
    grain: 0.04,
    particleColor: '#2bf0ff',
    particleSize: 0.018,
  },
  vapor: {
    id: 'vapor',
    name: 'Vapor',
    description: 'Pink/cyan gradient pixel dust. Music, vaporwave.',
    bgColor: '#1a0b2e',
    textColor: '#ffe5f8',
    accentColor: '#ff7ad9',
    bloom: 0.55,
    grain: 0.12,
    particleColor: '#7af0ff',
    particleSize: 0.022,
  },
};

export const SCENE_ORDER: SceneId[] = ['ink', 'neon', 'vapor'];
