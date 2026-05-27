'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';

// Shows the recorded video as an overlay on the stage during preview mode.
// Auto-loops so creators can judge the result.
export function PreviewPlayer() {
  const { mode, recordedBlob } = useStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (recordedBlob) {
      const u = URL.createObjectURL(recordedBlob);
      setUrl(u);
      return () => URL.revokeObjectURL(u);
    }
    setUrl(null);
  }, [recordedBlob]);

  if (mode !== 'preview' || !url) return null;

  return (
    <div className="absolute inset-4 z-10 rounded-3xl overflow-hidden sticker-sm" style={{ background: '#000' }}>
      <video
        ref={videoRef}
        src={url}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-contain"
      />
      <div
        className="absolute top-4 left-4 font-mono text-[10px] uppercase tracking-[0.3em] px-2 py-1 rounded-full sticker-xs"
        style={{ background: 'var(--c-green)', color: 'var(--c-ink)' }}
      >
        ● Preview · looping
      </div>
    </div>
  );
}
