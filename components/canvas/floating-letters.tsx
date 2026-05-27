'use client';

import { useEffect, useRef } from 'react';

type Props = {
  count?: number;
  palette?: string[];
};

/**
 * Floating alphabets that drift, bounce off walls, and collide with each other.
 * Cursor near-by repels them; mouse-down pushes harder.
 */
export function FloatingLetters({
  count = 22,
  palette,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    let W = 0;
    let H = 0;
    const resize = () => {
      const r = container.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * DPR; canvas.height = H * DPR;
      canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const ALPHA = 'FLUXTYPEABCDOMRSHK!?*&@';
    const colors = palette ?? [
      '#FF4FB1', '#FFD93D', '#4DA8FF', '#5BE49B', '#B197FC', '#FF7A59',
    ];
    const fonts = [
      "'Lilita One', system-ui",
      "'Bricolage Grotesque', system-ui",
      "'Fredoka', system-ui",
    ];

    type Body = {
      x: number; y: number;
      vx: number; vy: number;
      r: number;
      rot: number; vr: number;
      ch: string; color: string; font: string;
      shape: 'circle' | 'square';
    };
    const bodies: Body[] = [];
    for (let i = 0; i < count; i++) {
      const r = 28 + Math.random() * 36;
      bodies.push({
        x: Math.random() * Math.max(1, W - 2 * r) + r,
        y: Math.random() * Math.max(1, H - 2 * r) + r,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        r,
        rot: (Math.random() - 0.5) * 0.6,
        vr: (Math.random() - 0.5) * 0.02,
        ch: ALPHA[Math.floor(Math.random() * ALPHA.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        font: fonts[Math.floor(Math.random() * fonts.length)],
        shape: Math.random() < 0.5 ? 'circle' : 'square',
      });
    }

    const mouse = { x: -9999, y: -9999, down: false };
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onDown = () => { mouse.down = true; };
    const onUp   = () => { mouse.down = false; };
    const onLeave= () => { mouse.x = -9999; mouse.y = -9999; };
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    canvas.addEventListener('mouseleave', onLeave);

    let raf = 0;
    const step = () => {
      for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i];
        const dx = b.x - mouse.x;
        const dy = b.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 180 * 180) {
          const d = Math.sqrt(d2) || 0.01;
          const f = ((180 - d) / 180) * (mouse.down ? 2.2 : 0.9);
          b.vx += (dx / d) * f;
          b.vy += (dy / d) * f;
        }
        b.vx += (Math.random() - 0.5) * 0.04;
        b.vy += (Math.random() - 0.5) * 0.04;
        b.vx *= 0.985;
        b.vy *= 0.985;
        const sp = Math.hypot(b.vx, b.vy);
        const max = 3.4;
        if (sp > max) { b.vx = (b.vx / sp) * max; b.vy = (b.vy / sp) * max; }
        b.x += b.vx; b.y += b.vy;
        b.rot += b.vr;

        if (b.x - b.r < 0) { b.x = b.r;     b.vx = -b.vx * 0.9; }
        if (b.x + b.r > W) { b.x = W - b.r; b.vx = -b.vx * 0.9; }
        if (b.y - b.r < 0) { b.y = b.r;     b.vy = -b.vy * 0.9; }
        if (b.y + b.r > H) { b.y = H - b.r; b.vy = -b.vy * 0.9; }
      }

      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const a = bodies[i];
          const c = bodies[j];
          const dx = c.x - a.x;
          const dy = c.y - a.y;
          const dist = Math.hypot(dx, dy);
          const minD = a.r + c.r;
          if (dist > 0 && dist < minD) {
            const overlap = (minD - dist) / 2;
            const nx = dx / dist;
            const ny = dy / dist;
            a.x -= nx * overlap; a.y -= ny * overlap;
            c.x += nx * overlap; c.y += ny * overlap;
            const dvx = a.vx - c.vx;
            const dvy = a.vy - c.vy;
            const p = dvx * nx + dvy * ny;
            if (p > 0) {
              a.vx -= p * nx; a.vy -= p * ny;
              c.vx += p * nx; c.vy += p * ny;
            }
            a.vr += (Math.random() - 0.5) * 0.02;
            c.vr += (Math.random() - 0.5) * 0.02;
          }
        }
      }

      ctx.clearRect(0, 0, W, H);
      for (const b of bodies) {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rot);
        ctx.fillStyle = b.color;
        ctx.strokeStyle = '#15131C';
        ctx.lineWidth = 2.5;
        if (b.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, b.r, 0, Math.PI * 2);
          ctx.fill(); ctx.stroke();
        } else {
          const s = b.r * 1.55;
          const rad = 12;
          ctx.beginPath();
          ctx.moveTo(-s / 2 + rad, -s / 2);
          ctx.arcTo(s / 2, -s / 2, s / 2,  s / 2, rad);
          ctx.arcTo(s / 2,  s / 2, -s / 2, s / 2, rad);
          ctx.arcTo(-s / 2, s / 2, -s / 2, -s / 2, rad);
          ctx.arcTo(-s / 2, -s / 2, s / 2, -s / 2, rad);
          ctx.closePath();
          ctx.fill(); ctx.stroke();
        }
        ctx.fillStyle = '#15131C';
        ctx.font = `${Math.floor(b.r * 1.15)}px ${b.font}, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.ch, 0, 2);
        ctx.restore();
      }

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      canvas.removeEventListener('mouseleave', onLeave);
    };
  }, [count, palette]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="absolute inset-0 block" />
    </div>
  );
}
