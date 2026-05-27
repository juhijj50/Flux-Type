'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import type { SceneConfig } from '@/lib/types';

// A full-bleed background plane with a per-scene treatment.
// We use ShaderMaterial here because background gradients with noise are the
// one place a tiny shader pays off hugely (single uniform color = boring).
// You don't need to write GLSL — these three shaders are written for you.

const VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Three scene-specific fragment shaders. Picked at compile time.
const FRAG_INK = `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uBg;

  // cheap hash noise
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    float a = hash(i); float b = hash(i + vec2(1.0,0.0));
    float c = hash(i + vec2(0.0,1.0)); float d = hash(i + vec2(1.0,1.0));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
  }

  void main() {
    vec2 uv = vUv;
    float grain = (hash(uv * 1024.0 + uTime * 0.001) - 0.5) * 0.04;
    // subtle radial vignette
    float v = distance(uv, vec2(0.5)) * 0.9;
    vec3 col = uBg + vec3(grain) - v * 0.15;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const FRAG_NEON = `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uBg;
  uniform vec3 uAccent;
  void main() {
    vec2 uv = vUv;
    // moving radial glow
    float d = distance(uv, vec2(0.5 + sin(uTime*0.3)*0.1, 0.5 + cos(uTime*0.4)*0.08));
    float glow = exp(-d * 4.0) * 0.35;
    // horizontal scanlines for CRT feel
    float scan = sin(uv.y * 800.0) * 0.02;
    vec3 col = uBg + uAccent * glow + scan;
    // chromatic vignette
    col -= distance(uv, vec2(0.5)) * 0.25;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const FRAG_VAPOR = `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uBg;
  uniform vec3 uAccent;
  void main() {
    vec2 uv = vUv;
    // gradient from bottom-left (deep) to top-right (accent)
    vec3 g = mix(uBg, uAccent, smoothstep(0.0, 1.4, uv.x + uv.y));
    // gentle horizontal bands like sun lines
    float band = sin((uv.y - 0.4) * 40.0 + uTime * 0.2) * 0.5 + 0.5;
    band = smoothstep(0.95, 1.0, band) * step(uv.y, 0.45) * 0.3;
    g += band * uAccent;
    // grain
    float n = fract(sin(dot(uv * 1000.0, vec2(12.9898,78.233))) * 43758.5453);
    g += (n - 0.5) * 0.05;
    gl_FragColor = vec4(g, 1.0);
  }
`;

export function SceneBackground({ scene }: { scene: SceneConfig }) {
  const material = useMemo(() => {
    const frag =
      scene.id === 'ink' ? FRAG_INK : scene.id === 'neon' ? FRAG_NEON : FRAG_VAPOR;
    return new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: frag,
      uniforms: {
        uTime: { value: 0 },
        uBg: { value: new THREE.Color(scene.bgColor) },
        uAccent: { value: new THREE.Color(scene.accentColor) },
      },
      depthWrite: false,
      depthTest: false,
    });
  }, [scene.id, scene.bgColor, scene.accentColor]);

  // Animate uTime
  useMemo(() => {
    const start = performance.now();
    const id = setInterval(() => {
      material.uniforms.uTime.value = (performance.now() - start) / 1000;
    }, 1000 / 60);
    return () => clearInterval(id);
  }, [material]);

  return (
    <mesh position={[0, 0, -5]} renderOrder={-1}>
      <planeGeometry args={[30, 20]} />
      <primitive attach="material" object={material} />
    </mesh>
  );
}
