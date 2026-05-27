// MediaPipe hand tracker wrapper.
// v0.2: now also derives depth (z) from hand size

import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { OneEuroFilter } from './one-euro';
import { EMPTY_HAND, type HandPoint } from '../types';

const WASM_BASE =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.17/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

export class HandTracker {
  private landmarker: HandLandmarker | null = null;
  private video: HTMLVideoElement | null = null;
  private stream: MediaStream | null = null;
  private rafId = 0;
  private running = false;

  // Filters
  private fx = new OneEuroFilter(4.0, 0.3);
  private fy = new OneEuroFilter(4.0, 0.3);
  private fz = new OneEuroFilter(2.0, 0.15);
  private fpinch = new OneEuroFilter(3.0, 0.2);
  private ffist = new OneEuroFilter(3.0, 0.2);

  public point: HandPoint = { ...EMPTY_HAND };

  async init() {
    const fileset = await FilesetResolver.forVisionTasks(WASM_BASE);
    this.landmarker = await HandLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
      runningMode: 'VIDEO',
      numHands: 1,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
  }

  async startCamera(video: HTMLVideoElement) {
    this.video = video;
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: 'user' },
      audio: false,
    });
    video.srcObject = this.stream;
    await video.play();
  }

  start() {
    if (!this.landmarker || !this.video) return;
    this.running = true;
    const loop = () => {
      if (!this.running) return;
      this.tick();
      this.rafId = requestAnimationFrame(loop);
    };
    loop();
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.rafId);
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
  }

  private tick() {
    if (!this.landmarker || !this.video) return;
    if (this.video.readyState < 2 || this.video.videoWidth === 0) return;
    const now = performance.now();
    let result;
    try {
      result = this.landmarker.detectForVideo(this.video, now);
    } catch {
      return;
    }
    if (result.landmarks && result.landmarks.length > 0) {
      const lm = result.landmarks[0];

      const rawX = 1 - lm[8].x;
      const rawY = 1 - lm[8].y;

      // Depth proxy: distance from wrist (0) to middle MCP (9).
      // Bigger distance = hand closer to camera.
      // Empirically, this ranges from ~0.1 (far) to ~0.5 (very close).
      const dxWrist = lm[0].x - lm[9].x;
      const dyWrist = lm[0].y - lm[9].y;
      const handSize = Math.hypot(dxWrist, dyWrist);
      // Map [0.1, 0.45] -> [0, 1]
      const depth = Math.max(0, Math.min(1, (handSize - 0.1) / 0.35));

      // Pinch: thumb-index distance, normalized by hand size for invariance
      const pdx = lm[4].x - lm[8].x;
      const pdy = lm[4].y - lm[8].y;
      const pinchRaw = Math.hypot(pdx, pdy) / Math.max(handSize, 0.01);
      const pinch = Math.max(0, Math.min(1, pinchRaw * 0.8));

      // Fist: how many fingertips are curled
      const tipIds = [8, 12, 16, 20];
      const mcpIds = [5, 9, 13, 17];
      let curl = 0;
      for (let i = 0; i < 4; i++) {
        if (lm[tipIds[i]].y > lm[mcpIds[i]].y) curl++;
      }
      const fist = curl / 4;

      this.point = {
        x: this.fx.filter(rawX, now),
        y: this.fy.filter(rawY, now),
        z: this.fz.filter(depth, now),
        pinch: this.fpinch.filter(pinch, now),
        fist: this.ffist.filter(fist, now),
        active: true,
        age: 0,
      };
    } else {
      this.point = { ...this.point, active: false, age: this.point.age + 1 };
    }
  }
}
