'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import { CanvasRecorder, downloadBlob } from '@/lib/recorder/canvas-recorder';
import type { AudioAnalyzer } from '@/lib/audio/audio-analyzer';

type Props = {
  getCanvas: () => HTMLCanvasElement | null;
  analyzer: AudioAnalyzer | null;
};

const MAX_RECORD_MS = 8000;

export function RecordingControls({ getCanvas, analyzer }: Props) {
  const {
    mode, setMode, text, recordedBlob, setRecordedBlob,
    transparent, performMode,
  } = useStore();
  const [countdown, setCountdown] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const recorderRef = useRef<CanvasRecorder | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const beginCountdown = () => {
    setMode('countdown');
    setCountdown(3);
    const tick = (n: number) => {
      if (n <= 0) { startRecording(); return; }
      setCountdown(n);
      window.setTimeout(() => tick(n - 1), 800);
    };
    tick(3);
  };

  const startRecording = async () => {
    const canvas = getCanvas();
    if (!canvas) return;
    const rec = new CanvasRecorder();
    recorderRef.current = rec;
    let audioStream: MediaStream | null = null;
    if (performMode === 'audio' && analyzer) {
      audioStream = analyzer.getMediaStream();
      analyzer.play(true);
    }
    try {
      rec.start(canvas, { fps: 60, audioStream, needsAlpha: transparent });
    } catch (err) {
      console.error(err);
      alert('Recording not supported in this browser. Try Chrome or Firefox.');
      setMode('idle');
      return;
    }
    setMode('recording');
    setElapsed(0);
    const startedAt = performance.now();
    intervalRef.current = window.setInterval(() => {
      const t = performance.now() - startedAt;
      setElapsed(t);
      if (t >= MAX_RECORD_MS) stopRecording();
    }, 50);
  };

  const stopRecording = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (performMode === 'audio' && analyzer) analyzer.pause();
    const rec = recorderRef.current;
    if (!rec) return;
    const result = await rec.stop();
    setRecordedBlob(result.blob);
    setMode('preview');
  };

  const reset = () => {
    setRecordedBlob(null);
    setMode('idle');
    setElapsed(0);
  };

  const download = () => {
    if (!recordedBlob) return;
    const ext = recordedBlob.type.includes('mp4') ? 'mp4' : 'webm';
    const safe = (text || 'flux-type')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const tag = transparent ? '-alpha' : '';
    downloadBlob(recordedBlob, `${safe}${tag}-intro.${ext}`);
  };

  if (mode === 'idle') {
    return (
      <button
        onClick={beginCountdown}
        className="group w-full py-4 rounded-2xl font-fun text-white text-base transition-transform active:scale-[0.98]"
        style={{
          background: 'var(--c-ink)',
          boxShadow: '0 0 0 2px var(--c-ink), 4px 4px 0 0 var(--c-ink)',
        }}
      >
        ● Record · {MAX_RECORD_MS / 1000}s
      </button>
    );
  }

  if (mode === 'countdown') {
    return (
      <div
        className="w-full py-4 text-center font-fun text-6xl tabular-nums rounded-2xl"
        style={{
          background: 'var(--c-yellow)',
          color: 'var(--c-ink)',
          boxShadow: '0 0 0 2px var(--c-ink), 4px 4px 0 0 var(--c-ink)',
        }}
      >
        {countdown}
      </div>
    );
  }

  if (mode === 'recording') {
    const pct = Math.min(100, (elapsed / MAX_RECORD_MS) * 100);
    return (
      <div className="space-y-2">
        <button
          onClick={stopRecording}
          className="w-full py-4 rounded-2xl font-fun text-white text-base"
          style={{
            background: 'var(--c-pink)',
            boxShadow: '0 0 0 2px var(--c-ink), 4px 4px 0 0 var(--c-ink)',
          }}
        >
          ■ Stop · {((MAX_RECORD_MS - elapsed) / 1000).toFixed(1)}s
        </button>
        <div
          className="h-2 overflow-hidden rounded-full"
          style={{ background: 'rgba(21,19,28,0.1)', boxShadow: 'inset 0 0 0 1.5px var(--c-ink)' }}
        >
          <div
            className="h-full transition-[width] duration-75"
            style={{ width: `${pct}%`, background: 'var(--c-pink)' }}
          />
        </div>
      </div>
    );
  }

  if (mode === 'preview') {
    return (
      <div className="space-y-2">
        <button
          onClick={download}
          className="w-full py-4 rounded-2xl font-fun text-base transition-transform active:scale-[0.98]"
          style={{
            background: 'var(--c-green)',
            color: 'var(--c-ink)',
            boxShadow: '0 0 0 2px var(--c-ink), 4px 4px 0 0 var(--c-ink)',
          }}
        >
          ↓ Download {transparent ? '(transparent)' : ''}
        </button>
        <button
          onClick={reset}
          className="w-full py-3 rounded-2xl font-mono text-[11px] uppercase tracking-[0.3em]"
          style={{
            background: '#fff',
            color: 'var(--c-ink)',
            boxShadow: '0 0 0 2px var(--c-ink)',
          }}
        >
          ↻ Re-record
        </button>
      </div>
    );
  }

  return null;
}
