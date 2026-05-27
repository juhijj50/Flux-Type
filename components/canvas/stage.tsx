"use client";

import { Canvas } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise,
} from "@react-three/postprocessing";
import { KineticText } from "./kinetic-text";
import { SceneBackground } from "./scene-background";
import { CustomBackground } from "./custom-background";
import { SCENES } from "@/lib/scenes";
import { FONTS } from "@/lib/fonts";
import { ASPECT_RATIOS } from "@/lib/aspect-ratios";
import type {
  HandPoint,
  AudioFrame,
  SceneId,
  EffectId,
  FontId,
  BackgroundState,
  PerformMode,
  AspectRatioId,
} from "@/lib/types";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

type Props = {
  text: string;
  sceneId: SceneId;
  effect: EffectId;
  fontId: FontId;
  background: BackgroundState;
  performMode: PerformMode;
  handRef: React.MutableRefObject<HandPoint>;
  audioRef: React.MutableRefObject<AudioFrame>;
  depthZoom: boolean;
  fistFade: boolean;
  aspectRatio: AspectRatioId;
  transparent: boolean;
  watermark?: boolean;
};

export type StageHandle = { getCanvas: () => HTMLCanvasElement | null };

export const Stage = forwardRef<StageHandle, Props>(function Stage(
  {
    text,
    sceneId,
    effect,
    fontId,
    background,
    performMode,
    handRef,
    audioRef,
    depthZoom,
    fistFade,
    aspectRatio,
    transparent,
    watermark = true,
  },
  ref,
) {
  const outerRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const scene = SCENES[sceneId];
  const font = FONTS[fontId];
  const aspect = ASPECT_RATIOS[aspectRatio];

  useImperativeHandle(ref, () => ({
    getCanvas: () => wrapRef.current?.querySelector("canvas") ?? null,
  }));

  // ──────────────────────────────────────────────────────────────
  // Aspect-ratio fit: measure available space and pick the largest
  // box that fits BOTH width and height with the requested ratio.
  // This is what makes 9:16 actually become a vertical rectangle
  // (and not just stretch the canvas to fill the panel).
  // ──────────────────────────────────────────────────────────────
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const PAD = 16;
    const fit = () => {
      const r = el.getBoundingClientRect();
      const availW = Math.max(0, r.width  - PAD * 2);
      const availH = Math.max(0, r.height - PAD * 2);
      let w = availW;
      let h = (availW * aspect.height) / aspect.width;
      if (h > availH) {
        h = availH;
        w = (availH * aspect.width) / aspect.height;
      }
      setBox({ w: Math.round(w), h: Math.round(h) });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [aspect.width, aspect.height]);

  // When transparent mode is on, we skip the background mesh entirely
  // and set the canvas to alpha.
  const fallbackBg = transparent
    ? null
    : background.mode === "scene"
      ? scene.bgColor
      : "#000000";

  return (
    <div
      ref={outerRef}
      className="w-full h-full flex items-center justify-center checker"
    >
      <div
        ref={wrapRef}
        className="relative overflow-hidden bg-black"
        style={{
          width: box.w || 1,
          height: box.h || 1,
          borderRadius: 18,
          boxShadow: "0 0 0 3px #15131C, 10px 10px 0 0 rgba(21,19,28,0.85)",
        }}
      >
        {/* Transparency checkerboard hint */}
        {transparent && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(45deg, #1a1a1a 25%, transparent 25%), linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a1a 75%), linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)",
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
            }}
          />
        )}

        <Canvas
          camera={{ position: [0, 0, 8], fov: 35 }}
          gl={{
            preserveDrawingBuffer: true,
            antialias: true,
            alpha: transparent,
            premultipliedAlpha: false,
          }}
          dpr={[1, 2]}
        >
          {fallbackBg && <color attach="background" args={[fallbackBg]} />}

          {/* Scene shader background (only if scene mode + not transparent) */}
          {!transparent && background.mode === "scene" && (
            <SceneBackground scene={scene} />
          )}

          {/* Custom backgrounds (gradient/image/photo, not transparent) */}
          {!transparent && background.mode !== "scene" && (
            <CustomBackground bg={background} />
          )}

          <KineticText
            text={text}
            scene={scene}
            effect={effect}
            font={font}
            performMode={performMode}
            handRef={handRef}
            audioRef={audioRef}
            depthZoom={depthZoom}
            fistFade={fistFade}
            aspectRatio={aspectRatio}
          />

          {!transparent && (
            <EffectComposer>
              <Bloom
                intensity={background.mode === "scene" ? scene.bloom : 0.3}
                luminanceThreshold={0.2}
                luminanceSmoothing={0.9}
                mipmapBlur
              />
              <Noise
                opacity={background.mode === "scene" ? scene.grain : 0.05}
              />
              <Vignette eskil={false} offset={0.1} darkness={0.5} />
            </EffectComposer>
          )}
        </Canvas>

        {/* Corner ratio badge */}
        <div className="pointer-events-none absolute top-3 left-3 font-mono text-[10px] uppercase tracking-[0.3em] bg-white/90 text-[#15131C] px-2 py-1 rounded-full">
          {aspect.label} · {box.w}×{box.h}
        </div>

        {watermark && (
          <div className="pointer-events-none absolute bottom-3 right-3 font-mono text-[10px] uppercase tracking-[0.2em] bg-black/40 text-white px-2 py-1 rounded-full">
            made with flux type
          </div>
        )}
      </div>
    </div>
  );
});
