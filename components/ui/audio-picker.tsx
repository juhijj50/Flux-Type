'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import type { AudioAnalyzer } from '@/lib/audio/audio-analyzer';

type Props = {
  analyzer: AudioAnalyzer | null;
  audioReady: boolean;
  onLoad: (file: File) => Promise<void>;
};

export function AudioPicker({ analyzer, audioReady, onLoad }: Props) {
  const { audioFileName, setAudioFileName } = useStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (analyzer) {
        const dur = analyzer.duration;
        const t = analyzer.currentTime;
        setProgress(dur > 0 ? t / dur : 0);
        setIsPlaying(analyzer.frame.playing);
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [analyzer]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      await onLoad(file);
      setAudioFileName(file.name);
    } catch (err) {
      console.error('Audio load error', err);
      alert('Could not load that audio file. Try an MP3 or WAV.');
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (!analyzer) return;
    if (isPlaying) analyzer.pause();
    else analyzer.play(progress >= 0.99);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block font-mono text-[10px] uppercase tracking-[0.25em] mb-2"
               style={{ color: 'rgba(21,19,28,0.7)' }}>
          Audio file
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFile}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="w-full px-4 py-3 rounded-xl font-fun text-base text-left transition-transform active:scale-[0.98] disabled:opacity-60"
          style={{
            background: audioFileName ? 'var(--c-yellow)' : '#fff',
            color: 'var(--c-ink)',
            boxShadow: '0 0 0 2px var(--c-ink), 3px 3px 0 0 var(--c-ink)',
          }}
        >
          {loading ? 'Loading…' : audioFileName ? `♫ ${audioFileName}` : '+ Choose MP3 / WAV'}
        </button>
      </div>

      {audioReady && (
        <>
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full flex items-center justify-center text-lg transition-transform active:scale-95"
              style={{
                background: isPlaying ? 'var(--c-pink)' : 'var(--c-green)',
                color: 'var(--c-ink)',
                boxShadow: '0 0 0 2px var(--c-ink), 3px 3px 0 0 var(--c-ink)',
              }}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? '❚❚' : '▶'}
            </button>
            <div className="flex-1">
              <div
                className="h-2 overflow-hidden rounded-full"
                style={{ background: 'rgba(21,19,28,0.1)', boxShadow: 'inset 0 0 0 1.5px var(--c-ink)' }}
              >
                <div
                  className="h-full transition-[width] duration-75"
                  style={{ width: `${progress * 100}%`, background: 'var(--c-blue)' }}
                />
              </div>
              <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.2em] mt-1.5"
                   style={{ color: 'rgba(21,19,28,0.6)' }}>
                <span>{formatTime(analyzer?.currentTime ?? 0)}</span>
                <span>{formatTime(analyzer?.duration ?? 0)}</span>
              </div>
            </div>
          </div>

          <p className="px-3 py-2 rounded-lg text-[11px] leading-relaxed"
             style={{ background: 'var(--c-lilac)', boxShadow: 'inset 0 0 0 1.5px var(--c-ink)', color: 'var(--c-ink)' }}>
            ♫ Bass drives kicks. Mids sway the text. Treble adds bounce. Press play, then hit record.
          </p>
        </>
      )}
    </div>
  );
}

function formatTime(s: number): string {
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
