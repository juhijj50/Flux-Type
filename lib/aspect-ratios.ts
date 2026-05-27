import type { AspectRatioConfig, AspectRatioId } from './types';

export const ASPECT_RATIOS: Record<AspectRatioId, AspectRatioConfig> = {
  '16:9': {
    id: '16:9',
    label: '16:9',
    width: 1920,
    height: 1080,
    description: 'YouTube, standard video',
  },
  '9:16': {
    id: '9:16',
    label: '9:16',
    width: 1080,
    height: 1920,
    description: 'TikTok, Reels, Shorts',
  },
  '1:1': {
    id: '1:1',
    label: '1:1',
    width: 1080,
    height: 1080,
    description: 'Instagram feed',
  },
  '4:5': {
    id: '4:5',
    label: '4:5',
    width: 1080,
    height: 1350,
    description: 'Instagram portrait',
  },
};

export const ASPECT_ORDER: AspectRatioId[] = ['16:9', '9:16', '1:1', '4:5'];
