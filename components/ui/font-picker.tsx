'use client';

import { FONTS, FONT_ORDER } from '@/lib/fonts';
import type { FontId } from '@/lib/types';

const FONT_COLORS = ['var(--c-pink)','var(--c-yellow)','var(--c-blue)','var(--c-green)','var(--c-lilac)','var(--c-coral)'];

export function FontPicker({
  selected,
  onChange,
}: {
  selected: FontId;
  onChange: (f: FontId) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {FONT_ORDER.map((id, i) => {
        const f = FONTS[id];
        const active = selected === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="px-3 py-3 rounded-xl text-left transition-transform active:scale-[0.97]"
            style={{
              background: active ? FONT_COLORS[i % FONT_COLORS.length] : '#fff',
              boxShadow: active
                ? '0 0 0 2px var(--c-ink), 3px 3px 0 0 var(--c-ink)'
                : '0 0 0 2px var(--c-ink)',
            }}
          >
            <div
              className="text-2xl leading-tight"
              style={{
                fontFamily: f.family,
                fontWeight: f.weight,
                color: 'var(--c-ink)',
              }}
            >
              Aa
            </div>
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] mt-1"
                 style={{ color: 'var(--c-ink)' }}>
              {f.name}
            </div>
            <div className="font-mono text-[9px] capitalize"
                 style={{ color: 'rgba(21,19,28,0.6)' }}>
              {f.category}
            </div>
          </button>
        );
      })}
    </div>
  );
}
