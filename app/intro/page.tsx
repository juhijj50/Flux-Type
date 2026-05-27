"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { HandTracker } from "@/lib/tracking/hand-tracker";
import { AutoPerformer } from "@/lib/tracking/auto-perform";
import { AudioAnalyzer } from "@/lib/audio/audio-analyzer";
import {
  EMPTY_HAND,
  EMPTY_AUDIO,
  type HandPoint,
  type AudioFrame,
} from "@/lib/types";
import { StudioPanel } from "@/components/ui/studio-panel";
import { RecordingControls } from "@/components/ui/recording-controls";
import { PreviewPlayer } from "@/components/ui/preview-player";
import type { StageHandle } from "@/components/canvas/stage";
import { Stage } from "@/components/canvas/stage";
import { getPresetFromURL } from "@/lib/presets";

type Status =
  | "init"
  | "asking-permission"
  | "permission-denied"
  | "loading-model"
  | "ready"
  | "error";

export default function StudioPage() {
  const {
    text,
    scene,
    effect,
    font,
    background,
    performMode,
    watermark,
    mode,
    depthZoom,
    fistFade,
    aspectRatio,
    transparent,
    applyPreset,
  } = useStore();

  const [status, setStatus] = useState<Status>("init");
  const [errorMsg, setErrorMsg] = useState("");
  const [audioReady, setAudioReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const trackerRef = useRef<HandTracker | null>(null);
  const autoRef = useRef<AutoPerformer>(new AutoPerformer());
  const audioRef = useRef<AudioAnalyzer | null>(null);
  const handRef = useRef<HandPoint>({ ...EMPTY_HAND });
  const audioFrameRef = useRef<AudioFrame>({ ...EMPTY_AUDIO });
  const stageRef = useRef<StageHandle>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const preset = getPresetFromURL();
    if (preset) {
      applyPreset(preset);
      console.log("[Preset] Applied from URL");
    }
  }, [applyPreset]);

  useEffect(() => {
    audioRef.current = new AudioAnalyzer();
    return () => {
      audioRef.current?.cleanup();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (performMode !== "hands") {
      if (trackerRef.current) {
        trackerRef.current.stop();
        trackerRef.current = null;
      }
      setStatus("ready");
      return;
    }
    let cancelled = false;
    let tracker: HandTracker | null = null;

    async function setup() {
      setStatus("asking-permission");
      let tries = 0;
      while (!videoRef.current && tries < 50) {
        await new Promise((r) => setTimeout(r, 50));
        tries++;
      }
      if (!videoRef.current) {
        setErrorMsg("Video element never mounted");
        setStatus("error");
        return;
      }
      try {
        tracker = new HandTracker();
        setStatus("loading-model");
        await tracker.init();
        if (cancelled) return;
        setStatus("asking-permission");
        await tracker.startCamera(videoRef.current);
        if (cancelled) return;
        tracker.start();
        trackerRef.current = tracker;
        setStatus("ready");
      } catch (err: any) {
        if (
          err?.name === "NotAllowedError" ||
          err?.name === "PermissionDeniedError"
        ) {
          setStatus("permission-denied");
        } else {
          console.error(err);
          setErrorMsg(err?.message ?? "Unknown error");
          setStatus("error");
        }
      }
    }

    setup();
    return () => {
      cancelled = true;
      if (tracker) tracker.stop();
      trackerRef.current = null;
    };
  }, [performMode, mounted]);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      if (performMode === "hands" && trackerRef.current) {
        const p = trackerRef.current.point;
        handRef.current.x = p.x;
        handRef.current.y = p.y;
        handRef.current.z = p.z;
        handRef.current.pinch = p.pinch;
        handRef.current.fist = p.fist;
        handRef.current.active = p.active;
        handRef.current.age = p.age;
      } else if (performMode === "auto") {
        const p = autoRef.current.point();
        handRef.current.x = p.x;
        handRef.current.y = p.y;
        handRef.current.z = p.z;
        handRef.current.pinch = p.pinch;
        handRef.current.fist = p.fist;
        handRef.current.active = p.active;
        handRef.current.age = p.age;
      }
      if (audioRef.current) {
        audioRef.current.analyze();
        const f = audioRef.current.frame;
        audioFrameRef.current.bass = f.bass;
        audioFrameRef.current.mid = f.mid;
        audioFrameRef.current.treble = f.treble;
        audioFrameRef.current.kick = f.kick;
        audioFrameRef.current.energy = f.energy;
        audioFrameRef.current.time = f.time;
        audioFrameRef.current.playing = f.playing;
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [performMode]);

  const handleAudioLoad = async (file: File) => {
    if (!audioRef.current) return;
    await audioRef.current.loadFromFile(file);
    setAudioReady(true);
  };

  return (
    <main
      className="h-screen w-screen overflow-hidden flex flex-col"
      style={{ background: "var(--c-paper)", color: "var(--c-ink)" }}
    >
      {/* HEADER */}
      <header
        className="flex items-center justify-between px-5 py-3 border-b-2"
        style={{ background: "#fff", borderColor: "var(--c-ink)" }}
      >
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <span
            className="w-9 h-9 rounded-xl flex items-center justify-center font-fun text-white text-lg sticker-sm"
            style={{ background: "var(--c-pink)" }}
          >
            F
          </span>
          <span className="font-display text-xl font-bold">Flux Type</span>
          <span
            className="font-mono text-[10px] uppercase tracking-[0.3em] px-2 py-1 rounded-full sticker-sm"
            style={{ background: "var(--c-yellow)" }}
          >
            Studio
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ModeBadge mode={performMode} status={status} />
          <Link
            href="/about"
            className="font-mono text-[10px] uppercase tracking-[0.3em] px-3 py-2 rounded-full sticker-sm"
            style={{ background: "#fff" }}
          >
            About
          </Link>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* STAGE */}
        <section className="flex-1 relative overflow-hidden p-4">
          <div
            className="h-full w-full rounded-3xl sticker-sm overflow-hidden"
            style={{ background: "#fff" }}
          >
            {mounted && (
              <Stage
                ref={stageRef}
                text={text}
                sceneId={scene}
                effect={effect}
                fontId={font}
                background={background}
                performMode={performMode}
                handRef={handRef}
                audioRef={audioFrameRef}
                depthZoom={depthZoom}
                fistFade={fistFade}
                aspectRatio={aspectRatio}
                transparent={transparent}
                watermark={watermark}
              />
            )}
          </div>

          <PreviewPlayer />

          {/* Webcam PiP */}
          <div
            className={`absolute top-7 right-7 w-48 h-36 rounded-2xl overflow-hidden sticker-sm bg-black z-40 transition-opacity ${
              performMode === "hands" && mode !== "preview"
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
              playsInline
              muted
              autoPlay
            />
            <DotOverlay handRef={handRef} />
            <div
              className="absolute bottom-2 left-2 font-mono text-[9px] uppercase tracking-[0.3em] text-white px-2 py-0.5 rounded-full"
              style={{ background: "var(--c-pink)" }}
            >
              ● live
            </div>
          </div>

          {performMode === "audio" && audioReady && mode !== "preview" && (
            <div
              className="absolute top-7 right-7 px-3 py-2 rounded-2xl sticker-sm z-20"
              style={{ background: "#fff" }}
            >
              <AudioVizMini audioRef={audioFrameRef} />
            </div>
          )}

          {performMode === "hands" &&
            (status === "asking-permission" || status === "loading-model") && (
              <Overlay>
                <div className="font-mono text-xs uppercase tracking-[0.3em]"
                     style={{ color: "rgba(21,19,28,0.7)" }}>
                  {status === "loading-model"
                    ? "Loading hand tracking model…"
                    : "Asking for camera permission…"}
                </div>
                <div className="mt-4 font-fun text-4xl">One moment.</div>
              </Overlay>
            )}
          {performMode === "hands" && status === "permission-denied" && (
            <Overlay>
              <div
                className="font-mono text-xs uppercase tracking-[0.3em]"
                style={{ color: "var(--c-pink)" }}
              >
                Camera blocked
              </div>
              <div className="mt-4 font-fun text-4xl max-w-md text-center">
                No problem. Try <span className="italic">Auto</span> or{" "}
                <span className="italic">Audio</span> mode.
              </div>
              <p
                className="mt-4 text-sm max-w-md text-center font-mono"
                style={{ color: "rgba(21,19,28,0.6)" }}
              >
                Switch in the Gesture tab.
              </p>
            </Overlay>
          )}
          {status === "error" && (
            <Overlay>
              <div
                className="font-mono text-xs uppercase tracking-[0.3em]"
                style={{ color: "var(--c-pink)" }}
              >
                Error
              </div>
              <div className="mt-4 font-fun text-3xl max-w-md text-center">
                {errorMsg}
              </div>
            </Overlay>
          )}
        </section>

        {/* PANEL */}
        <aside
          className="w-[380px] border-l-2 flex flex-col"
          style={{ borderColor: "var(--c-ink)", background: "var(--c-paper)" }}
        >
          <div className="flex-1 overflow-y-auto scroll-thin">
            <StudioPanel
              analyzer={audioRef.current}
              audioReady={audioReady}
              onAudioLoad={handleAudioLoad}
            />
          </div>
          <div
            className="p-4 border-t-2"
            style={{ borderColor: "var(--c-ink)", background: "#fff" }}
          >
            <RecordingControls
              getCanvas={() => stageRef.current?.getCanvas() ?? null}
              analyzer={audioRef.current}
            />
          </div>
        </aside>
      </div>
    </main>
  );
}

function ModeBadge({ mode, status }: { mode: string; status: Status }) {
  const label =
    mode === "hands"
      ? status === "ready"
        ? "Live"
        : status === "permission-denied"
          ? "Camera Off"
          : "Loading"
      : mode === "audio"
        ? "Audio"
        : "Auto";
  const bg =
    mode === "hands" && status === "ready"
      ? "var(--c-green)"
      : mode === "audio"
        ? "var(--c-blue)"
        : mode === "auto"
          ? "var(--c-lilac)"
          : "var(--c-yellow)";
  return (
    <div
      className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] px-3 py-1.5 rounded-full sticker-sm"
      style={{ background: bg }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ background: "var(--c-ink)" }}
      />
      {label}
    </div>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm z-10 px-6"
      style={{ background: "rgba(250,247,242,0.85)" }}
    >
      {children}
    </div>
  );
}

function DotOverlay({
  handRef,
}: {
  handRef: React.MutableRefObject<HandPoint>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let raf = 0;
    const draw = () => {
      const c = canvasRef.current;
      if (c) {
        const ctx = c.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, c.width, c.height);
          const h = handRef.current;
          if (h.active) {
            const x = h.x * c.width;
            const y = (1 - h.y) * c.height;
            ctx.fillStyle = "rgba(255, 80, 200, 0.9)";
            ctx.beginPath();
            ctx.arc(x, y, 8 + h.fist * 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "rgba(255,255,255,0.7)";
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
  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={225}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}

function AudioVizMini({
  audioRef,
}: {
  audioRef: React.MutableRefObject<AudioFrame>;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let raf = 0;
    const draw = () => {
      const c = ref.current;
      if (c) {
        const ctx = c.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, c.width, c.height);
          const a = audioRef.current;
          const bars = [
            { v: a.bass, color: "#FF4FB1", label: "B" },
            { v: a.mid, color: "#4DA8FF", label: "M" },
            { v: a.treble, color: "#FFD93D", label: "T" },
          ];
          const W = c.width / bars.length;
          bars.forEach((b, i) => {
            const h = b.v * c.height;
            ctx.fillStyle = b.color + "AA";
            ctx.fillRect(i * W + 6, c.height - h, W - 12, h);
            ctx.fillStyle = "#15131C";
            ctx.font = "9px monospace";
            ctx.fillText(b.label, i * W + 10, c.height - 4);
          });
          if (a.kick > 0.2) {
            ctx.strokeStyle = `rgba(255,80,200,${a.kick})`;
            ctx.lineWidth = 2;
            ctx.strokeRect(2, 2, c.width - 4, c.height - 4);
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [audioRef]);
  return <canvas ref={ref} width={120} height={60} className="block" />;
}
