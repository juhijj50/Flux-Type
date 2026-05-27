import type { HandPoint } from '../types';

export class AutoPerformer {
  private start = performance.now();

  point(): HandPoint {
    const t = (performance.now() - this.start) / 1000;
    const x = 0.5 + 0.25 * Math.sin(t * 0.9) + 0.08 * Math.sin(t * 2.3);
    const y = 0.5 + 0.2 * Math.cos(t * 0.7) + 0.06 * Math.sin(t * 3.1);
    const z = 0.5 + 0.3 * Math.sin(t * 0.5);
    const pinch = 0.5 + 0.5 * Math.sin(t * 1.4);
    const fist = Math.max(0, Math.sin(t * 0.6) * 0.7);
    return { x, y, z, pinch, fist, active: true, age: 0 };
  }

  reset() {
    this.start = performance.now();
  }
}
