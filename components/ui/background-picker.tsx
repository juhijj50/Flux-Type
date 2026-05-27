'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import {
  searchUnsplash,
  getFeaturedUnsplash,
  type UnsplashPhoto,
} from '@/lib/backgrounds/unsplash';
import { searchPexels, getFeaturedPexels } from '@/lib/backgrounds/pexels';
import type { BackgroundMode, PhotoSource } from '@/lib/types';

const MODES: { id: BackgroundMode; label: string; color: string }[] = [
  { id: 'scene',    label: 'Scene',    color: 'var(--c-pink)'   },
  { id: 'gradient', label: 'Gradient', color: 'var(--c-yellow)' },
  { id: 'image',    label: 'Upload',   color: 'var(--c-blue)'   },
  { id: 'photo',    label: 'Photos',   color: 'var(--c-green)'  },
];

const GRADIENT_PRESETS = [
  { from: '#FF4FB1', to: '#FFD93D', angle: 135 },
  { from: '#4DA8FF', to: '#B197FC', angle: 135 },
  { from: '#5BE49B', to: '#4DA8FF', angle: 135 },
  { from: '#FF7A59', to: '#FFD93D', angle: 90 },
  { from: '#B197FC', to: '#FF4FB1', angle: 135 },
  { from: '#15131C', to: '#4DA8FF', angle: 180 },
];

export function BackgroundPicker() {
  const {
    background,
    setBackgroundMode,
    setGradient,
    setImageUrl,
    setPhotoUrl,
    setPhotoSource,
  } = useStore();
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (background.mode !== 'photo') return;
    setPhotos(
      background.photoSource === 'unsplash'
        ? getFeaturedUnsplash()
        : getFeaturedPexels()
    );
  }, [background.mode, background.photoSource]);

  const handleSearch = async () => {
    const fn = background.photoSource === 'unsplash' ? searchUnsplash : searchPexels;
    if (!query.trim()) {
      setPhotos(
        background.photoSource === 'unsplash'
          ? getFeaturedUnsplash()
          : getFeaturedPexels()
      );
      return;
    }
    setLoading(true);
    try {
      const res = await fn(query);
      setPhotos(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const hasUnsplashKey = !!process.env.NEXT_PUBLIC_UNSPLASH_KEY;
  const hasPexelsKey   = !!process.env.NEXT_PUBLIC_PEXELS_KEY;
  const currentHasKey =
    background.photoSource === 'unsplash' ? hasUnsplashKey : hasPexelsKey;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        {MODES.map((m) => {
          const active = background.mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setBackgroundMode(m.id)}
              className="font-mono text-[10px] uppercase tracking-[0.2em] py-2.5 rounded-xl transition-transform active:scale-95"
              style={{
                background: active ? m.color : '#fff',
                boxShadow: active
                  ? '0 0 0 2px var(--c-ink), 3px 3px 0 0 var(--c-ink)'
                  : '0 0 0 2px var(--c-ink)',
                fontWeight: active ? 700 : 400,
              }}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {background.mode === 'scene' && (
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] leading-relaxed"
           style={{ color: 'rgba(21,19,28,0.65)' }}>
          Using scene preset. Pick a scene in the Style tab.
        </p>
      )}

      {background.mode === 'gradient' && (
        <div className="space-y-3">
          <div>
            <Label>Presets</Label>
            <div className="grid grid-cols-3 gap-2">
              {GRADIENT_PRESETS.map((g, i) => (
                <button
                  key={i}
                  onClick={() => setGradient(g)}
                  className="h-14 rounded-xl"
                  style={{
                    background: `linear-gradient(${g.angle}deg, ${g.from}, ${g.to})`,
                    boxShadow: '0 0 0 2px var(--c-ink)',
                  }}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <ColorInput label="From" value={background.gradient.from} onChange={(v) => setGradient({ from: v })} />
            <ColorInput label="To"   value={background.gradient.to}   onChange={(v) => setGradient({ to: v })}   />
          </div>
          <div>
            <Label>Angle: {background.gradient.angle}°</Label>
            <input
              type="range"
              min={0}
              max={360}
              value={background.gradient.angle}
              onChange={(e) => setGradient({ angle: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      )}

      {background.mode === 'image' && (
        <div className="space-y-3">
          <label className="block">
            <Label>Upload your image</Label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="block w-full text-[11px] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:uppercase file:tracking-wider file:cursor-pointer file:font-mono"
              style={{
                color: 'rgba(21,19,28,0.7)',
              }}
            />
          </label>
          {background.imageUrl && (
            <div className="relative aspect-video rounded-xl overflow-hidden"
                 style={{ boxShadow: '0 0 0 2px var(--c-ink)' }}>
              <img
                src={background.imageUrl}
                alt="uploaded"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setImageUrl(null)}
                className="absolute top-2 right-2 font-mono text-[10px] uppercase tracking-[0.2em] px-2 py-1 rounded-full text-white"
                style={{ background: 'var(--c-ink)', boxShadow: '0 0 0 1.5px var(--c-ink)' }}
              >
                ✕ Remove
              </button>
            </div>
          )}
        </div>
      )}

      {background.mode === 'photo' && (
        <div className="space-y-3">
          <div>
            <Label>Source</Label>
            <div className="grid grid-cols-2 gap-2">
              {(['unsplash', 'pexels'] as PhotoSource[]).map((src) => {
                const active = background.photoSource === src;
                return (
                  <button
                    key={src}
                    onClick={() => setPhotoSource(src)}
                    className="font-mono text-[10px] uppercase tracking-[0.2em] py-2 rounded-xl"
                    style={{
                      background: active ? 'var(--c-blue)' : '#fff',
                      boxShadow: active
                        ? '0 0 0 2px var(--c-ink), 3px 3px 0 0 var(--c-ink)'
                        : '0 0 0 2px var(--c-ink)',
                      fontWeight: active ? 700 : 400,
                    }}
                  >
                    {src}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="search photos…"
              className="flex-1 px-3 py-2 rounded-xl font-mono text-[12px] outline-none"
              style={{
                background: '#fff',
                color: 'var(--c-ink)',
                boxShadow: 'inset 0 0 0 2px var(--c-ink)',
              }}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-4 py-2 font-fun text-base rounded-xl text-white disabled:opacity-50"
              style={{
                background: 'var(--c-ink)',
                boxShadow: '0 0 0 2px var(--c-ink), 3px 3px 0 0 var(--c-ink)',
              }}
            >
              {loading ? '…' : 'Go'}
            </button>
          </div>

          {!currentHasKey && (
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] leading-relaxed px-3 py-2 rounded-lg"
               style={{ background: 'var(--c-yellow)', boxShadow: 'inset 0 0 0 1.5px var(--c-ink)', color: 'var(--c-ink)' }}>
              No {background.photoSource} API key — showing curated photos. Add{' '}
              {background.photoSource === 'unsplash' ? 'NEXT_PUBLIC_UNSPLASH_KEY' : 'NEXT_PUBLIC_PEXELS_KEY'}{' '}
              to .env.local for live search.
            </p>
          )}

          <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto scroll-thin pr-1">
            {photos.map((p) => {
              const active = background.photoUrl === p.full;
              return (
                <button
                  key={p.id}
                  onClick={() => setPhotoUrl(p.full)}
                  className="relative aspect-video rounded-lg overflow-hidden transition-transform active:scale-95"
                  style={{
                    boxShadow: active
                      ? '0 0 0 3px var(--c-pink), 3px 3px 0 0 var(--c-ink)'
                      : '0 0 0 2px var(--c-ink)',
                  }}
                >
                  <img src={p.thumb} alt={p.author} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 left-0 right-0 font-mono text-[9px] px-1.5 py-0.5 truncate"
                        style={{ background: 'rgba(21,19,28,0.85)', color: '#fff' }}>
                    {p.author}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="font-mono text-[9px] uppercase tracking-[0.2em]"
             style={{ color: 'rgba(21,19,28,0.55)' }}>
            Photos from {background.photoSource === 'unsplash' ? 'Unsplash' : 'Pexels'} contributors.
          </p>
        </div>
      )}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-mono text-[10px] uppercase tracking-[0.25em] mb-2"
           style={{ color: 'rgba(21,19,28,0.7)' }}>
      {children}
    </label>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <div className="flex items-center gap-2 rounded-xl px-2 py-1.5"
           style={{ background: '#fff', boxShadow: 'inset 0 0 0 2px var(--c-ink)' }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 bg-transparent cursor-pointer"
        />
        <span className="font-mono text-[11px]" style={{ color: 'var(--c-ink)' }}>{value}</span>
      </div>
    </label>
  );
}
