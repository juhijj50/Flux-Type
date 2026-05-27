'use client';

import { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { BackgroundState } from '@/lib/types';

const VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG_GRADIENT = `
  varying vec2 vUv;
  uniform vec3 uFrom;
  uniform vec3 uTo;
  uniform float uAngle;
  void main() {
    vec2 dir = vec2(cos(uAngle), sin(uAngle));
    float t = dot(vUv - 0.5, dir) + 0.5;
    t = clamp(t, 0.0, 1.0);
    vec3 col = mix(uFrom, uTo, t);
    float n = fract(sin(dot(vUv * 1000.0, vec2(12.9898,78.233))) * 43758.5453);
    col += (n - 0.5) * 0.02;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const FRAG_IMAGE = `
  varying vec2 vUv;
  uniform sampler2D uMap;
  uniform float uDarken;
  void main() {
    vec4 c = texture2D(uMap, vUv);
    c.rgb *= (1.0 - uDarken);
    gl_FragColor = vec4(c.rgb, 1.0);
  }
`;

export function CustomBackground({ bg }: { bg: BackgroundState }) {
  const gradientMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG_GRADIENT,
      uniforms: {
        uFrom: { value: new THREE.Color(bg.gradient.from) },
        uTo: { value: new THREE.Color(bg.gradient.to) },
        uAngle: { value: (bg.gradient.angle * Math.PI) / 180 },
      },
      depthWrite: false,
    });
  }, [bg.gradient.from, bg.gradient.to, bg.gradient.angle]);

  // Image (upload) or remote photo (unsplash/pexels)
  const url = bg.mode === 'image' ? bg.imageUrl : bg.mode === 'photo' ? bg.photoUrl : null;
  const textureRef = useRef<THREE.Texture | null>(null);
  const imageMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG_IMAGE,
      uniforms: {
        uMap: { value: null as THREE.Texture | null },
        uDarken: { value: 0.25 },
      },
      depthWrite: false,
    });
  }, []);

  useEffect(() => {
    if (!url) {
      imageMat.uniforms.uMap.value = null;
      return;
    }
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        const planeAspect = 30 / 20;
        const imageAspect = tex.image.width / tex.image.height;
        if (imageAspect > planeAspect) {
          tex.repeat.x = planeAspect / imageAspect;
          tex.offset.x = (1 - tex.repeat.x) / 2;
        } else {
          tex.repeat.y = imageAspect / planeAspect;
          tex.offset.y = (1 - tex.repeat.y) / 2;
        }
        imageMat.uniforms.uMap.value = tex;
        textureRef.current = tex;
      },
      undefined,
      (err) => console.error('Texture load error', err)
    );
    return () => {
      if (textureRef.current) {
        textureRef.current.dispose();
        textureRef.current = null;
      }
    };
  }, [url, imageMat]);

  if (bg.mode === 'gradient') {
    return (
      <mesh position={[0, 0, -5]} renderOrder={-1}>
        <planeGeometry args={[30, 20]} />
        <primitive attach="material" object={gradientMat} />
      </mesh>
    );
  }

  if ((bg.mode === 'image' || bg.mode === 'photo') && url) {
    return (
      <mesh position={[0, 0, -5]} renderOrder={-1}>
        <planeGeometry args={[30, 20]} />
        <primitive attach="material" object={imageMat} />
      </mesh>
    );
  }

  return null;
}
