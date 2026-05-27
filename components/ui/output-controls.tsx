'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { ASPECT_RATIOS, ASPECT_ORDER } from '@/lib/aspect-ratios';
import { buildPresetURL } from '@/lib/presets';
import { Toggle } from './studio-panel';

const ASPECT_COLORS: Record<string, string> = {
  '16:9': 'var(--c-pink)',
  '9:16': 'var(--c-yellow)',
  '1:1':  'var(--c-blue)',
  '4:5':  'var(--c-green)',
};

export function OutputControls() {
  const {
    aspectRatio, setAspectRatio,
    transparent, setTransparent,
    scene, effect, font, background,
    depthZoom, fistFade,
  } = useStore();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const url = buildPresetURL({
      scene, effect, font, background,
      depthZoom, fistFade, aspectRatio, transparent,
    });
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <Card title="Aspect ratio">
        <div className="grid grid-cols-4 gap-2">
          {ASPECT_ORDER.map((id) => {
            const r = ASPECT_RATIOS[id];
            const active = aspectRatio === id;
            // Mini thumbnail
            const max = 36;
            let mw, mh;
            if (r.width >= r.height) { mw = max; mh = (max * r.height) / r.width; }
            else                     { mh = max; mw = (max * r.width) / r.height; }
            return (
              <button
                key={id}
                onClick={() => setAspectRatio(id)}
                className="relative rounded-xl py-3 px-2 flex flex-col items-center gap-2 transition-transform active:scale-95"
                style={{
                  background: active ? ASPECT_COLORS[id] : '#fff',
                  boxShadow: active
                    ? '0 0 0 3px var(--c-ink), 3px 3px 0 0 var(--c-ink)'
                    : '0 0 0 2px var(--c-ink)',
                }}
              >
                <div className="flex items-center justify-center" style={{ width: 40, height: 40 }}>
                  <div style={{
                    width: mw, height: mh,
                    background: active ? 'var(--c-ink)' : 'transparent',
                    boxShadow: 'inset 0 0 0 2px var(--c-ink)',
                    borderRadius: 4,
                  }} />
                </div>
                <div className="font-mono text-[10px] tracking-[0.2em]">{r.label}</div>
              </button>
            );
          })}
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] mt-3"
           style={{ color: 'rgba(21,19,28,0.7)' }}>
          {ASPECT_RATIOS[aspectRatio].description}
        </p>
      </Card>

      <Card title="Background">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-3">
            <div className="font-fun text-base">Transparent</div>
            <div className="text-[11px] mt-1 leading-relaxed" style={{ color: 'rgba(21,19,28,0.7)' }}>
              Export WebM with alpha channel. Perfect for After Effects, DaVinci Resolve, Final Cut.
            </div>
          </div>
          <Toggle on={transparent} onChange={setTransparent} color="var(--c-green)" />
        </div>
        {transparent && (
          <div className="mt-3 px-3 py-2 rounded-lg font-mono text-[10px] uppercase tracking-[0.2em] leading-snug"
               style={{ background: 'var(--c-yellow)', boxShadow: 'inset 0 0 0 1.5px var(--c-ink)', color: 'var(--c-ink)' }}>
            ⚠ Premiere Pro and CapCut don't support alpha WebM natively. Use After Effects, DaVinci, or Final Cut.
          </div>
        )}
      </Card>

      <Card title="Share this style" color="var(--c-lilac)">
        <button
          onClick={handleCopyLink}
          className="w-full font-fun text-white text-base py-3 rounded-xl transition-transform active:scale-[0.98]"
          style={{
            background: copied ? 'var(--c-green)' : 'var(--c-ink)',
            color: copied ? 'var(--c-ink)' : '#fff',
            boxShadow: '0 0 0 2px var(--c-ink), 3px 3px 0 0 var(--c-ink)',
          }}
        >
          {copied ? '✓ Link copied!' : '↗ Copy style link'}
        </button>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] mt-3 leading-snug"
           style={{ color: 'rgba(21,19,28,0.75)' }}>
          Includes font, scene, effect & gestures. Recipients add their own text.
        </p>
      </Card>
    </div>
  );
}

function Card({ title, color, children }: { title: string; color?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-4 sticker-xs" style={{ background: color || '#fff' }}>
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] mb-3"
           style={{ color: 'rgba(21,19,28,0.8)' }}>
        {title}
      </div>
      {children}
    </div>
  );
}
