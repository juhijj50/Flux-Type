'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { SCENES, SCENE_ORDER } from '@/lib/scenes';
import { EFFECTS, EFFECT_ORDER } from '@/lib/effects';
import { FONTS } from '@/lib/fonts';
import { BackgroundPicker } from './background-picker';
import { FontPicker } from './font-picker';
import { OutputControls } from './output-controls';
import { AudioPicker } from './audio-picker';
import type { AudioAnalyzer } from '@/lib/audio/audio-analyzer';

type Tab = 'text' | 'style' | 'bg' | 'gesture' | 'output';

type Props = {
  analyzer: AudioAnalyzer | null;
  audioReady: boolean;
  onAudioLoad: (file: File) => Promise<void>;
};

const TAB_COLORS: Record<Tab, string> = {
  text:    'var(--c-pink)',
  style:   'var(--c-yellow)',
  bg:      'var(--c-blue)',
  gesture: 'var(--c-green)',
  output:  'var(--c-lilac)',
};

export function StudioPanel({ analyzer, audioReady, onAudioLoad }: Props) {
  const [tab, setTab] = useState<Tab>('text');
  const {
    text, setText,
    scene, setScene,
    effect, setEffect,
    font, setFont,
    performMode, setPerformMode,
    watermark, setWatermark,
    depthZoom, setDepthZoom,
    fistFade, setFistFade,
  } = useStore();

  return (
    <div className="text-xs">
      {/* Tab pills */}
      <div
        className="px-4 pt-4 pb-3 flex flex-wrap gap-2 border-b-2 sticky top-0 z-10"
        style={{ background: '#fff', borderColor: 'var(--c-ink)' }}
      >
        {(['text', 'style', 'bg', 'gesture', 'output'] as Tab[]).map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="font-mono uppercase tracking-[0.25em] text-[11px] px-4 py-2.5 rounded-full transition-transform active:scale-95"
              style={{
                background: active ? TAB_COLORS[t] : '#fff',
                color: 'var(--c-ink)',
                boxShadow: active
                  ? '0 0 0 2px var(--c-ink), 3px 3px 0 0 var(--c-ink)'
                  : '0 0 0 2px var(--c-ink)',
                transform: active ? 'translate(-1px,-1px)' : 'none',
                fontWeight: active ? 700 : 400,
              }}
            >
              {t}
            </button>
          );
        })}
      </div>

      <div className="p-4 space-y-4">
        {tab === 'text' && (
          <PanelCard title="Your text">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="YOUR NAME"
              maxLength={20}
              className="w-full px-3 py-3 rounded-xl font-fun text-xl outline-none"
              style={{
                background: 'var(--c-yellow)',
                color: 'var(--c-ink)',
                boxShadow: 'inset 0 0 0 2px var(--c-ink)',
                fontFamily: FONTS[font].family,
              }}
            />
            <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.25em] flex justify-between"
                 style={{ color: 'rgba(21,19,28,0.6)' }}>
              <span>{text.length}/20 chars</span>
              <span>auto-fits the frame ✓</span>
            </div>
          </PanelCard>
        )}

        {tab === 'style' && (
          <>
            <PanelCard title="Font">
              <FontPicker selected={font} onChange={setFont} />
            </PanelCard>

            <PanelCard title="Scene">
              <div className="grid grid-cols-3 gap-2">
                {SCENE_ORDER.map((id) => {
                  const s = SCENES[id];
                  const active = scene === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setScene(id)}
                      className="relative aspect-[4/3] rounded-xl overflow-hidden"
                      style={{
                        background: s.bgColor,
                        boxShadow: active
                          ? '0 0 0 3px var(--c-pink), 3px 3px 0 0 var(--c-ink)'
                          : '0 0 0 2px var(--c-ink)',
                      }}
                    >
                      <span
                        className="absolute inset-0 flex items-center justify-center text-lg font-bold"
                        style={{ color: s.textColor }}
                      >
                        Aa
                      </span>
                      <span
                        className="absolute bottom-1 left-1.5 font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.85)', color: 'var(--c-ink)' }}
                      >
                        {s.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </PanelCard>

            <PanelCard title="Gesture effect">
              <div className="space-y-2">
                {EFFECT_ORDER.map((id) => {
                  const e = EFFECTS[id];
                  const active = effect === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setEffect(id)}
                      className="w-full text-left px-3 py-2.5 rounded-xl transition-transform active:scale-[0.98]"
                      style={{
                        background: active ? 'var(--c-blue)' : '#fff',
                        boxShadow: active
                          ? '0 0 0 2px var(--c-ink), 3px 3px 0 0 var(--c-ink)'
                          : '0 0 0 2px var(--c-ink)',
                      }}
                    >
                      <div className="font-fun text-base">{e.name}</div>
                      <div className="text-[11px] mt-0.5 leading-snug" style={{ color: 'rgba(21,19,28,0.7)' }}>
                        {e.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </PanelCard>
          </>
        )}

        {tab === 'bg' && (
          <PanelCard title="Background">
            <BackgroundPicker />
          </PanelCard>
        )}

        {tab === 'gesture' && (
          <>
            <PanelCard title="Perform mode">
              <div className="grid grid-cols-3 gap-2">
                {(['hands','auto','audio'] as const).map((m) => {
                  const active = performMode === m;
                  const color = m === 'hands' ? 'var(--c-pink)' : m === 'audio' ? 'var(--c-blue)' : 'var(--c-green)';
                  return (
                    <button
                      key={m}
                      onClick={() => setPerformMode(m)}
                      className="font-mono text-[11px] uppercase tracking-[0.2em] py-3 rounded-xl"
                      style={{
                        background: active ? color : '#fff',
                        boxShadow: active
                          ? '0 0 0 2px var(--c-ink), 3px 3px 0 0 var(--c-ink)'
                          : '0 0 0 2px var(--c-ink)',
                        fontWeight: active ? 700 : 400,
                      }}
                    >
                      {m === 'hands' ? '✋ Hands' : m === 'audio' ? '♫ Audio' : '✦ Auto'}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] mt-3 leading-relaxed" style={{ color: 'rgba(21,19,28,0.7)' }}>
                {performMode === 'hands' && 'Webcam-driven. Your hand controls the motion.'}
                {performMode === 'auto'  && 'No webcam needed. The studio performs for you.'}
                {performMode === 'audio' && 'Upload music below. Bass kicks pulse the text. Mids and treble sway it.'}
              </p>
            </PanelCard>

            {performMode === 'audio' && (
              <PanelCard title="Audio">
                <AudioPicker analyzer={analyzer} audioReady={audioReady} onLoad={onAudioLoad} />
              </PanelCard>
            )}

            {performMode !== 'audio' && (
              <PanelCard title="Universal gestures">
                <ToggleRow
                  label="Depth → Zoom"
                  hint="Hand closer to camera = bigger text. Hand farther = smaller."
                  value={depthZoom}
                  onChange={setDepthZoom}
                  color="var(--c-pink)"
                />
                <ToggleRow
                  label="Fist → Fade"
                  hint="Close fist to fade text away. Open hand to bring it back."
                  value={fistFade}
                  onChange={setFistFade}
                  color="var(--c-yellow)"
                />
              </PanelCard>
            )}

            <PanelCard title="Watermark">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-fun text-base">"made with flux type"</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.25em] mt-1"
                       style={{ color: 'rgba(21,19,28,0.6)' }}>
                    Bottom-right corner of export
                  </div>
                </div>
                <Toggle on={watermark} onChange={setWatermark} color="var(--c-pink)" />
              </div>
            </PanelCard>
          </>
        )}

        {tab === 'output' && <OutputControls />}
      </div>
    </div>
  );
}

function PanelCard({ title, children, color }: { title: string; children: React.ReactNode; color?: string }) {
  return (
    <div
      className="rounded-2xl p-4 sticker-xs"
      style={{ background: color || '#fff' }}
    >
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] mb-3"
           style={{ color: 'rgba(21,19,28,0.8)' }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function ToggleRow({
  label, hint, value, onChange, color,
}: {
  label: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
  color: string;
}) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b last:border-b-0"
         style={{ borderColor: 'rgba(21,19,28,0.08)' }}>
      <div className="flex-1 pr-3">
        <div className="font-fun text-base">{label}</div>
        <div className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'rgba(21,19,28,0.7)' }}>
          {hint}
        </div>
      </div>
      <Toggle on={value} onChange={onChange} color={color} />
    </div>
  );
}

export function Toggle({
  on, onChange, color,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  color: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className="relative shrink-0 rounded-full"
      style={{
        width: 52, height: 28,
        background: on ? color : '#ddd',
        boxShadow: '0 0 0 2px var(--c-ink)',
      }}
    >
      <span
        className="absolute top-0.5 rounded-full bg-white transition-all"
        style={{
          width: 22, height: 22,
          left: on ? 26 : 2,
          boxShadow: '0 0 0 1.5px var(--c-ink)',
        }}
      />
    </button>
  );
}
