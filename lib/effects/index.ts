import type { EffectConfig } from '../types';

export const EFFECTS: Record<string, EffectConfig> = {
  magnetize: {
    id: 'magnetize',
    name: 'Magnetize',
    description: 'Letters orbit and follow your hand like iron filings.',
  },
  shatter: {
    id: 'shatter',
    name: 'Shatter',
    description: 'Close your fist to explode the text. Open hand reforms it.',
  },
};

export const EFFECT_ORDER: Array<keyof typeof EFFECTS> = ['magnetize', 'shatter'];
