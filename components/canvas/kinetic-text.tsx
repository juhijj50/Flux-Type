"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import type {
  HandPoint,
  AudioFrame,
  SceneConfig,
  EffectId,
  FontConfig,
  PerformMode,
  AspectRatioId,
} from "@/lib/types";
import { FONT_URLS } from "@/lib/fonts";

type Props = {
  text: string;
  scene: SceneConfig;
  effect: EffectId;
  font: FontConfig;
  performMode: PerformMode;
  handRef: React.MutableRefObject<HandPoint>;
  audioRef: React.MutableRefObject<AudioFrame>;
  depthZoom: boolean;
  fistFade: boolean;
  aspectRatio: AspectRatioId;
};

function useLetterLayout(text: string, fontSize: number, spacing: number) {
  return useMemo(() => {
    const letters = text.split("");
    const n = letters.length;
    const advance = fontSize * spacing;
    const totalWidth = (n - 1) * advance;
    return letters.map((ch, i) => ({
      char: ch,
      home: new THREE.Vector3(-totalWidth / 2 + i * advance, 0, 0),
      index: i,
    }));
  }, [text, fontSize, spacing]);
}

export function KineticText({
  text,
  scene,
  effect,
  font,
  performMode,
  handRef,
  audioRef,
  depthZoom,
  fistFade,
  aspectRatio,
}: Props) {
  // Scale font size down for portrait ratios and 1:1 since horizontal space is limited
  const aspectScale =
    aspectRatio === "9:16"
      ? 0.55
      : aspectRatio === "4:5"
        ? 0.65
        : aspectRatio === "1:1"
          ? 0.8
          : 1.0;
  const fontSize = font.baseSize * aspectScale;
  const spacing =
    font.category === "mono" ? 0.75 : font.category === "script" ? 0.5 : 0.62;
  const letters = useLetterLayout(text || " ", fontSize, spacing);
  const groupRef = useRef<THREE.Group>(null);
  const meshRefs = useRef<THREE.Mesh[]>([]);

  const state = useRef(
    letters.map(() => ({
      pos: new THREE.Vector3(),
      vel: new THREE.Vector3(),
      rot: 0,
      rotVel: 0,
      opacity: 1,
    })),
  );

  useEffect(() => {
    state.current = letters.map((l) => ({
      pos: l.home.clone(),
      vel: new THREE.Vector3(),
      rot: 0,
      rotVel: 0,
      opacity: 1,
    }));
  }, [letters]);

  const groupScale = useRef(1);
  // For audio mode: track last kick value to detect rising edge
  const lastKick = useRef(0);
  const audioPhase = useRef(0); // accumulator for organic motion in audio mode

  useFrame((_, dt) => {
    const isAudio = performMode === "audio";
    const hand = handRef.current;
    const audio = audioRef.current;

    // ---- Derive a "virtual hand" from audio if in audio mode ----
    let vx = 0,
      vy = 0,
      vz = 0.5,
      vFist = 0,
      vPinch = 0.5;
    if (isAudio && audio.playing) {
      audioPhase.current += dt * (0.4 + audio.energy * 1.5);
      // Mid frequencies sway the text horizontally
      vx = Math.sin(audioPhase.current * 0.9) * (0.3 + audio.mid * 0.4);
      // Treble bounces vertically
      vy = Math.sin(audioPhase.current * 1.7) * (0.2 + audio.treble * 0.5);
      // Energy controls depth (scale)
      vz = 0.3 + audio.energy * 0.7;
      // Bass controls fist (closes on bass hits)
      vFist = Math.min(1, audio.bass * 1.4);
      vPinch = 0.5;
    }

    // Effective signals (either from hand or from audio)
    const eX = isAudio ? vx + 0.5 : hand.x;
    const eY = isAudio ? vy + 0.5 : hand.y;
    const eZ = isAudio ? vz : hand.z;
    const eFist = isAudio ? vFist : hand.fist;
    const ePinch = isAudio ? vPinch : hand.pinch;
    const eActive = isAudio ? audio.playing : hand.active;

    const hx = (eX - 0.5) * 12;
    const hy = (eY - 0.5) * 7;
    const handPos = new THREE.Vector3(hx, hy, 0);

    // ---- Audio kick: pulse the entire group on each detected hit ----
    let kickImpulse = 0;
    if (isAudio) {
      // Rising edge: only trigger when kick increases above threshold
      if (audio.kick > 0.3 && lastKick.current < 0.3) {
        kickImpulse = audio.kick;
      }
      lastKick.current = audio.kick;
    }

    // ---- Global scale ----
    if (depthZoom && eActive) {
      const targetScale = 0.6 + eZ * 0.9 + (isAudio ? audio.energy * 0.15 : 0);
      groupScale.current += (targetScale - groupScale.current) * 5 * dt;
    } else {
      groupScale.current += (1 - groupScale.current) * 4 * dt;
    }
    if (groupRef.current) {
      groupRef.current.scale.setScalar(groupScale.current);
    }

    // ---- Per-letter fade ----
    const targetOpacity = fistFade && eActive ? 1 - Math.pow(eFist, 0.8) : 1;

    for (let i = 0; i < letters.length; i++) {
      const s = state.current[i];
      const home = letters[i].home;
      const mesh = meshRefs.current[i];
      if (!mesh) continue;

      const stagger = i * 0.04;
      const opacityTarget = Math.max(0, targetOpacity - stagger);
      s.opacity += (opacityTarget - s.opacity) * 8 * dt;

      const material = mesh.material as THREE.Material & { opacity: number };
      if (material) {
        material.transparent = true;
        material.opacity = s.opacity;
      }

      if (effect === "magnetize") {
        const toHand = handPos.clone().sub(home);
        const dist = toHand.length();
        const falloff = Math.exp(-dist * 0.25);
        const repel = (ePinch - 0.5) * 1.0;
        const targetOffset = toHand
          .clone()
          .normalize()
          .multiplyScalar(falloff * (3.5 - repel));
        const target = home.clone().add(targetOffset);

        const k = 35;
        const damp = 9;
        const force = target.clone().sub(s.pos).multiplyScalar(k);
        const drag = s.vel.clone().multiplyScalar(-damp);
        const accel = force.add(drag);
        s.vel.addScaledVector(accel, dt);

        // Add audio kick as outward impulse
        if (kickImpulse > 0) {
          const dirFromCenter = home.clone().normalize();
          if (dirFromCenter.lengthSq() < 0.01) {
            dirFromCenter.set(Math.cos(i), Math.sin(i), 0);
          }
          s.vel.addScaledVector(dirFromCenter, kickImpulse * 8);
        }

        s.pos.addScaledVector(s.vel, dt);

        const targetRot = s.vel.x * 0.15;
        s.rotVel += (targetRot - s.rot) * 12 * dt;
        s.rotVel *= 0.88;
        s.rot += s.rotVel * dt;

        mesh.position.copy(s.pos);
        mesh.rotation.z = s.rot;
        mesh.scale.setScalar(1);
      } else if (effect === "shatter") {
        // In audio mode: bass drives explosion
        const explode = Math.pow(eFist, 1.5);
        const seed = (i * 9301 + 49297) % 233280;
        const angle = (seed / 233280) * Math.PI * 2;
        const radius = 3 + ((seed * 31) % 100) / 30;
        const offset = new THREE.Vector3(
          Math.cos(angle) * radius * explode,
          Math.sin(angle) * radius * explode,
          ((seed % 7) - 3) * 0.3 * explode,
        );
        const target = home.clone().add(offset);

        const k = 40;
        const damp = 9;
        const force = target.clone().sub(s.pos).multiplyScalar(k);
        const drag = s.vel.clone().multiplyScalar(-damp);
        s.vel.addScaledVector(force.add(drag), dt);

        if (kickImpulse > 0) {
          s.vel.x += (Math.random() - 0.5) * kickImpulse * 10;
          s.vel.y += (Math.random() - 0.5) * kickImpulse * 10;
        }

        s.pos.addScaledVector(s.vel, dt);

        const targetRotVel = explode * (((seed % 13) - 6) * 0.4);
        s.rotVel += (targetRotVel - s.rotVel) * 4 * dt;
        s.rot += s.rotVel * dt;

        const distHome = s.pos.distanceTo(home);
        const sc = Math.max(0.5, 1 - distHome * 0.04);

        mesh.position.copy(s.pos);
        mesh.rotation.z = s.rot;
        mesh.scale.setScalar(sc);
      }
    }
  });

  return (
    <group ref={groupRef}>
      {letters.map((l, i) => (
        <Text
          ref={(el) => {
            if (el) meshRefs.current[i] = el as unknown as THREE.Mesh;
          }}
          key={`${i}-${l.char}-${font.id}`}
          font={FONT_URLS[font.id]}
          fontSize={fontSize}
          color={scene.textColor}
          anchorX="center"
          anchorY="middle"
          letterSpacing={font.letterSpacing}
        >
          {l.char === " " ? "\u00A0" : l.char}
        </Text>
      ))}
    </group>
  );
}
