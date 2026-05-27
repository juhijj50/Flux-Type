'use client';

import Link from 'next/link';
import { FloatingLetters } from '@/components/canvas/floating-letters';

const STEPS = [
  { n: '01', bg: 'var(--c-pink)',   title: 'Type your line',  body: 'Drop in a name, a tagline, a one-word brag. Up to 24 characters of glory.', icon: '✎' },
  { n: '02', bg: 'var(--c-yellow)', title: 'Pick a vibe',     body: 'Ink, Neon, or Vapor. Each scene is hand-tuned — type, color, bloom, grain.', icon: '✦' },
  { n: '03', bg: 'var(--c-blue)',   title: 'Perform it',      body: 'Move your hand. Hum a tune. Or hit Auto and let Flux do the choreography.', icon: '✺' },
  { n: '04', bg: 'var(--c-green)',  title: 'Export it',       body: 'Pick 16:9, 9:16, 1:1, 4:5 — your canvas snaps to fit, then renders to WebM.', icon: '↗' },
];

export default function Landing() {
  return (
    <main className="relative w-full" style={{ background: 'var(--c-paper)' }}>
      {/* Top bar */}
      <header className="relative z-20 flex items-center justify-between px-6 md:px-10 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-fun text-white text-lg sticker-sm"
               style={{ background: 'var(--c-pink)' }}>F</div>
          <div className="font-display text-2xl font-bold">Flux Type</div>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] px-2 py-1 rounded-full sticker-sm ml-2"
                style={{ background: 'var(--c-yellow)' }}>
            v0.2 · fresh
          </span>
        </div>
        <nav className="flex items-center gap-4 font-mono text-xs uppercase tracking-[0.2em]">
          <Link href="/about" className="hover:underline">About</Link>
          <Link
            href="/intro"
            className="font-fun px-5 py-3 rounded-2xl text-white sticker"
            style={{ background: 'var(--c-ink)' }}
          >
            Open Studio →
          </Link>
        </nav>
      </header>

      {/* HERO with floating letters */}
      <section className="relative min-h-[640px] h-[78vh] overflow-hidden border-y-2"
               style={{ borderColor: 'var(--c-ink)' }}>
        <FloatingLetters count={22} />

        <div className="relative z-10 h-full w-full pointer-events-none flex flex-col items-center justify-center text-center px-6">
          <div className="font-mono text-[11px] uppercase tracking-[0.4em] mb-5 px-3 py-1.5 rounded-full bg-white sticker-sm pointer-events-auto">
            ✦ A motion studio for creators ✦
          </div>

          <h1 className="font-fun leading-[0.88] text-[clamp(3.2rem,11vw,10rem)]">
            <span className="block">Type that</span>
            <span className="block">
              <span
                className="inline-block px-3 -mx-1 rounded-2xl wiggle"
                style={{ background: 'var(--c-pink)', color: '#fff' }}
              >moves</span>{' '}
              <span className="italic" style={{ color: 'var(--c-blue)' }}>with</span>{' '}
              <span
                className="inline-block px-3 rounded-2xl"
                style={{ background: 'var(--c-yellow)' }}
              >you.</span>
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-lg md:text-xl leading-snug pointer-events-auto"
             style={{ color: 'rgba(21,19,28,0.8)' }}>
            Perform an intro animation with your hands, audio, or auto. No software, no templates, no accounts. Just play.
          </p>

          <div className="mt-8 flex items-center gap-4 pointer-events-auto">
            <Link
              href="/intro"
              className="font-fun text-white text-lg px-7 py-4 rounded-2xl sticker"
              style={{ background: 'var(--c-ink)' }}
            >
              Start performing →
            </Link>
            <Link
              href="/about"
              className="font-fun text-lg px-6 py-4 rounded-2xl sticker-sm"
              style={{ background: 'var(--c-green)' }}
            >
              Watch a 20s demo
            </Link>
          </div>

          <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em]"
               style={{ color: 'rgba(21,19,28,0.5)' }}>
            ↑ try dragging the letters around ↑
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative px-6 md:px-10 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.4em] mb-3"
                   style={{ color: 'rgba(21,19,28,0.5)' }}>How it works</div>
              <h2 className="font-display font-extrabold text-5xl md:text-6xl tracking-tight"
                  style={{ letterSpacing: '-0.04em' }}>
                Four steps. <span className="italic" style={{ color: 'var(--c-pink)' }}>About a minute.</span>
              </h2>
            </div>
            <div className="font-mono text-xs uppercase tracking-[0.25em] px-3 py-1.5 rounded-full sticker-sm"
                 style={{ background: 'var(--c-lilac)' }}>
              No login · runs on-device
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((c, i) => (
              <div
                key={c.n}
                className="relative rounded-3xl p-6 sticker"
                style={{ background: c.bg, transform: `rotate(${i % 2 === 0 ? -1.4 : 1.4}deg)` }}
              >
                <div className="flex items-center justify-between mb-12">
                  <div className="font-mono text-xs uppercase tracking-[0.3em] bg-white/70 px-2 py-1 rounded-full">{c.n}</div>
                  <div className="font-fun text-3xl">{c.icon}</div>
                </div>
                <div className="font-fun text-3xl leading-[0.95] mb-3">{c.title}</div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(21,19,28,0.85)' }}>{c.body}</p>
                <div className="mt-6 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.3em] text-white px-2.5 py-1.5 rounded-full"
                     style={{ background: 'var(--c-ink)' }}>
                  Step {c.n} →
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recipe strip */}
      <section className="px-6 md:px-10 pb-24">
        <div className="max-w-6xl mx-auto rounded-3xl p-8 md:p-10 sticker overflow-hidden relative"
             style={{ background: 'var(--c-ink)', color: '#fff' }}>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.4em] mb-4"
                   style={{ color: 'var(--c-yellow)' }}>The recipe</div>
              <h3 className="font-fun text-5xl md:text-6xl leading-[0.95] mb-5">
                3 scenes ·<br />
                2 gestures ·<br />
                <span style={{ color: 'var(--c-pink)' }}>infinite</span> moves.
              </h3>
              <p className="text-white/70 max-w-md leading-relaxed">
                Magnetize pulls letters toward your hand. Shatter explodes them at the squeeze of a fist. Mix, match, and record up to 8 seconds.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {['Magnetize','Shatter','Bloom','Vapor','Ink','Neon'].map(t => (
                  <span key={t}
                        className="font-mono text-[11px] uppercase tracking-[0.25em] px-3 py-1.5 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative aspect-square md:aspect-[4/5] rounded-2xl overflow-hidden border-2 border-white/20"
                 style={{ background: 'linear-gradient(160deg, #B197FC, #FF4FB1 60%, #FFD93D)' }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="font-fun text-white text-[clamp(2.5rem,7vw,6rem)] leading-none drop-shadow-[0_8px_0_rgba(0,0,0,0.2)]">
                  <span className="inline-block -rotate-6">F</span>
                  <span className="inline-block rotate-3" style={{ color: 'var(--c-yellow)' }}>L</span>
                  <span className="inline-block -rotate-3">U</span>
                  <span className="inline-block rotate-6" style={{ color: 'var(--c-green)' }}>X</span>
                </div>
              </div>
              <div className="absolute bottom-3 right-3 font-mono text-[10px] uppercase tracking-[0.3em] bg-white/90 px-2 py-1 rounded-full"
                   style={{ color: 'var(--c-ink)' }}>
                preview · 1:1
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 md:px-10 pb-24">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="font-fun text-5xl md:text-7xl leading-[0.95]">
            Ready to <span className="italic" style={{ color: 'var(--c-blue)' }}>move?</span>
          </h3>
          <p className="mt-5 font-mono text-xs uppercase tracking-[0.3em]"
             style={{ color: 'rgba(21,19,28,0.6)' }}>
            No download · No account · Stays on your device
          </p>
          <Link
            href="/intro"
            className="font-fun inline-block mt-8 text-white text-xl px-10 py-5 rounded-2xl sticker"
            style={{ background: 'var(--c-pink)' }}
          >
            Open the studio →
          </Link>
        </div>
      </section>

      <footer className="px-6 md:px-10 py-8 border-t-2 flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.3em]"
              style={{ borderColor: 'var(--c-ink)' }}>
        <span>© Flux Type · Made for performers</span>
        <span className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--c-green)' }} />
          on-device · privacy-first
        </span>
      </footer>
    </main>
  );
}
