# Flux Type — Patch (drop-in)

These files mirror the paths in your `flux-type-v3/` codebase. Replace the originals with these to get the colorful redesign **and** the aspect-ratio fix.

## What's in here

```
flux-type-v3-patch/
├── tailwind.config.js                       # +flux palette, +font-fun/font-display, +sticker shadows
├── app/
│   ├── globals.css                          # white paper bg, sticker utilities, color tokens
│   ├── layout.tsx                           # swaps fonts → Bricolage Grotesque + Lilita One + Fredoka + JetBrains Mono
│   ├── page.tsx                             # new colorful landing w/ floating letters + 4-step flow cards
│   ├── about/page.tsx                       # restyled about page (yellow banner, sticker cards)
│   └── intro/page.tsx                       # white-bg studio chrome (logic preserved, just restyled)
└── components/
    ├── canvas/
    │   ├── floating-letters.tsx             # NEW. Canvas physics: letters bounce off walls + each other
    │   └── stage.tsx                        # FIX. ResizeObserver-measured aspect-ratio fit
    └── ui/
        ├── studio-panel.tsx                 # colorful chunky tab pills + cards
        ├── output-controls.tsx              # colorful aspect picker + toggles
        ├── recording-controls.tsx           # fun chunky record/stop/download buttons
        ├── background-picker.tsx            # colorful mode pills + gradient/photo/upload UI
        ├── font-picker.tsx                  # colorful font swatches
        └── audio-picker.tsx                 # fun chunky file picker + play button (also fixes a stale useState→useEffect bug)
```

## Key changes

### 1. Aspect ratio actually clips the frame

Old `stage.tsx` set `width: 100% / height: auto` (or vice versa) which always filled the panel width — so 9:16, 1:1, 4:5 all looked the same. New version uses a **ResizeObserver** on the outer container and picks the largest `(w, h)` that fits both axes with the requested ratio.

The existing `KineticText` already scales font size down for portrait/square ratios (`aspectScale`), so once the canvas itself is sized correctly the text reflows for free.

### 2. New colorful identity

- **White paper bg** (`#FAF7F2`) replaces black everywhere
- **Fun font stack**: Lilita One (display/buttons), Bricolage Grotesque (headlines), Fredoka (soft), JetBrains Mono (utilities)
- **Vibrant accents** as CSS vars: `--c-pink`, `--c-yellow`, `--c-blue`, `--c-green`, `--c-lilac`, `--c-coral`
- **Sticker borders** — chunky 2-3px outline + offset shadow on every interactive surface

### 3. Floating letters hero

`<FloatingLetters count={22} />` renders a 2D canvas with circular bodies that drift, bounce off walls + each other, and get repelled by the cursor (mouse-down pushes harder).

## Drop-in steps

1. Delete the unused fonts from `next/font/google` (Crimson_Text, Playfair_Display, Anton, Bebas_Neue, Space_Grotesk, Caveat, Bungee) — they're no longer imported.
2. Copy each file in this patch over the corresponding file in `flux-type-v3/`.
3. Run `npm install` if you haven't pulled the new fonts yet (Next.js auto-fetches Google Fonts at build time — no action usually needed).
4. `npm run dev` and check `localhost:3000` + `localhost:3000/intro`.

## Notes

- `app/about/page.tsx` is unchanged — restyle to taste using the same `font-fun` + `sticker` vocabulary if you want consistency.
- `components/ui/background-picker.tsx`, `font-picker.tsx`, `audio-picker.tsx` are now restyled to match.
- If you want even fewer tabs in the studio sidebar (you have 5: Text/Style/BG/Gesture/Output), `studio-panel.tsx` is the place to consolidate.
