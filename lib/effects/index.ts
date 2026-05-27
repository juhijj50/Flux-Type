import type { EffectConfig, EffectId } from '../types';


export const EFFECTS: Record<EffectId, EffectConfig> = {
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

export const EFFECT_ORDER: EffectId[] = ['magnetize', 'shatter'];
