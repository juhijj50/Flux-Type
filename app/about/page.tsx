import Link from 'next/link';

export default function About() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--c-paper)', color: 'var(--c-ink)' }}>
      <header className="px-6 md:px-10 py-5 flex items-center justify-between border-b-2"
              style={{ borderColor: 'var(--c-ink)' }}>
        <Link
          href="/"
          className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] hover:opacity-80 transition-opacity"
        >
          <span className="w-9 h-9 rounded-xl flex items-center justify-center font-fun text-white text-lg sticker-sm"
                style={{ background: 'var(--c-pink)' }}>←</span>
          <span className="font-display text-xl font-bold normal-case tracking-normal">Flux Type</span>
        </Link>
        <Link
          href="/intro"
          className="font-fun px-5 py-3 rounded-2xl text-white sticker"
          style={{ background: 'var(--c-ink)' }}
        >
          Open Studio →
        </Link>
      </header>

      <article className="max-w-3xl mx-auto px-6 md:px-10 py-16 md:py-24 space-y-12">
        <div>
          <div className="inline-block font-mono text-xs uppercase tracking-[0.35em] mb-6 px-3 py-1.5 rounded-full sticker-sm"
               style={{ background: 'var(--c-yellow)' }}>
            ✦ Note from the maker ✦
          </div>
          <h1 className="font-fun text-5xl md:text-7xl leading-[0.92]">
            Software took something small. <br />
            <span className="italic" style={{ color: 'var(--c-pink)' }}>This is me giving it back.</span>
          </h1>
        </div>

        <div className="font-display text-xl leading-relaxed space-y-6"
             style={{ color: 'rgba(21,19,28,0.85)' }}>
          <p>
            Every intro animation you've ever seen on YouTube was hand-animated by someone, somewhere —
            and then templated, packaged, sold, and rendered identical a million times over.
          </p>
          <p>
            Flux Type asks a quieter question:{' '}
            <span className="px-2 py-0.5 rounded-lg" style={{ background: 'var(--c-yellow)' }}>
              what if you animated it yourself?
            </span>{' '}
            Not by learning After Effects. Not by buying a template. By <span className="italic" style={{ color: 'var(--c-pink)' }}>moving</span>.
          </p>
          <p>
            The webcam watches your hand. A small machine-learning model in your browser turns 21 joints of
            bone and skin into a stream of numbers. Those numbers nudge letters around. You record five seconds
            of yourself shaping language with motion. That's the intro.
          </p>
          <p>
            It's a small reclaiming. The artifact is yours because you performed it.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 pt-8">
          {[
            {
              bg: 'var(--c-pink)',
              title: 'Privacy',
              body: 'The webcam stream stays in your browser. Nothing is uploaded. The hand-tracking model runs on your device.',
              icon: '🔒',
            },
            {
              bg: 'var(--c-blue)',
              title: 'How it works',
              body: 'MediaPipe Hand Landmarker → One-Euro filter → React Three Fiber → kinetic typography → captured to WebM.',
              icon: '⚙',
            },
            {
              bg: 'var(--c-green)',
              title: 'No webcam?',
              body: 'Use Auto mode. The studio performs a gesture timeline for you. Same scenes, same effects.',
              icon: '✦',
            },
          ].map((c, i) => (
            <div
              key={c.title}
              className="rounded-3xl p-5 sticker"
              style={{ background: c.bg, transform: `rotate(${i % 2 === 0 ? -1.4 : 1.4}deg)` }}
            >
              <div className="font-fun text-3xl mb-2">{c.icon}</div>
              <div className="font-fun text-2xl mb-2">{c.title}</div>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(21,19,28,0.85)' }}>{c.body}</p>
            </div>
          ))}
        </div>

        <div className="pt-12 flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.3em]"
             style={{ color: 'rgba(21,19,28,0.6)' }}>
          <span>© Flux Type · Made for performers</span>
          <Link
            href="/intro"
            className="font-fun text-base px-5 py-3 rounded-2xl sticker normal-case tracking-normal"
            style={{ background: 'var(--c-pink)', color: '#fff' }}
          >
            Start performing →
          </Link>
        </div>
      </article>
    </main>
  );
}
