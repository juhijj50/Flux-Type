'use client';

import { useEffect, useRef } from 'react';
import type { HandPoint } from '@/lib/types';

type Props = {
  videoRef: React.RefObject<HTMLVideoElement>;
  handRef: React.MutableRefObject<HandPoint>;
  compact?: boolean;
};

// Small webcam preview with a dot showing where the tracker thinks
// your fingertip is. Mirrored horizontally so it behaves like a mirror.
export function WebcamPreview({ videoRef, handRef, compact = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let raf = 0;
    const draw = () => {
      const c = canvasRef.current;
      if (c) {
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, c.width, c.height);
          const h = handRef.current;
          if (h.active) {
            ctx.fillStyle = `rgba(255, 79, 177, ${0.9 - h.age * 0.05})`;
            const x = h.x * c.width;
            const y = h.y * c.height;
            ctx.beginPath();
            ctx.arc(x, y, 8 + h.fist * 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.7)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(x, y, 16, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [handRef]);

  const size = compact ? 'w-40 h-[120px]' : 'w-72 h-[216px]';
  return (
    <div
      className={`relative ${size} rounded-2xl overflow-hidden sticker-sm`}
      style={{ background: '#000' }}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover scale-x-[-1] opacity-80"
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        width={300}
        height={225}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      <div
        className="absolute bottom-2 left-2 font-mono text-[9px] uppercase tracking-[0.3em] text-white px-2 py-0.5 rounded-full"
        style={{ background: 'var(--c-pink)' }}
      >
        ● live
      </div>
    </div>
  );
}
