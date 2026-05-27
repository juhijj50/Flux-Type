// AudioAnalyzer: Web Audio API + AnalyserNode wrapper.
//
// Loads an audio file, plays it, and extracts real-time frequency information.
// The output is split into three meaningful bands (bass/mid/treble) plus a
// transient detector ("kick") and overall energy.
//
// Used by the canvas to drive physics in 'audio' perform mode.

import { EMPTY_AUDIO, type AudioFrame } from '../types';

export class AudioAnalyzer {
  private context: AudioContext | null = null;
  private source: AudioBufferSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private buffer: AudioBuffer | null = null;
  private startTime = 0;
  private pauseOffset = 0;
  private isPlaying = false;
  private freqData: Uint8Array = new Uint8Array(0);

  // Running state for kick detection (compare bass to recent average)
  private bassHistory: number[] = [];
  private historySize = 30; // ~0.5 sec at 60fps

  public frame: AudioFrame = { ...EMPTY_AUDIO };

  async loadFromFile(file: File): Promise<void> {
    this.cleanup();
    this.context = new AudioContext();
    const arrayBuffer = await file.arrayBuffer();
    this.buffer = await this.context.decodeAudioData(arrayBuffer);
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 1024; // gives 512 frequency bins
    this.analyser.smoothingTimeConstant = 0.6;
    this.gainNode = this.context.createGain();
    this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
  }

  // Returns a MediaStream of the audio output that can be muxed into recordings
  getMediaStream(): MediaStream | null {
    if (!this.context || !this.gainNode) return null;
    const dest = this.context.createMediaStreamDestination();
    this.gainNode.connect(dest);
    return dest.stream;
  }

  play(fromStart = true) {
    if (!this.context || !this.buffer || !this.analyser || !this.gainNode) return;
    if (this.isPlaying) this.stop();

    // Each play creates a new BufferSourceNode (they're one-shot in Web Audio)
    this.source = this.context.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.connect(this.analyser);
    this.analyser.connect(this.gainNode);
    this.gainNode.connect(this.context.destination);

    const offset = fromStart ? 0 : this.pauseOffset;
    this.source.start(0, offset);
    this.startTime = this.context.currentTime - offset;
    this.isPlaying = true;

    this.source.onended = () => {
      this.isPlaying = false;
      this.pauseOffset = 0;
    };
  }

  pause() {
    if (!this.context || !this.source || !this.isPlaying) return;
    this.pauseOffset = this.context.currentTime - this.startTime;
    this.source.stop();
    this.isPlaying = false;
  }

  stop() {
    if (this.source) {
      try { this.source.stop(); } catch {}
      this.source.disconnect();
      this.source = null;
    }
    this.pauseOffset = 0;
    this.isPlaying = false;
  }

  cleanup() {
    this.stop();
    if (this.analyser) this.analyser.disconnect();
    if (this.gainNode) this.gainNode.disconnect();
    if (this.context && this.context.state !== 'closed') {
      this.context.close();
    }
    this.context = null;
    this.analyser = null;
    this.gainNode = null;
    this.buffer = null;
    this.bassHistory = [];
  }

  get duration(): number {
    return this.buffer?.duration ?? 0;
  }

  get currentTime(): number {
    if (!this.context || !this.isPlaying) return this.pauseOffset;
    return this.context.currentTime - this.startTime;
  }

  // Read the latest frequency data and update this.frame.
  // Call this every render frame.
  analyze(): void {
    if (!this.analyser || !this.context) {
      this.frame = { ...EMPTY_AUDIO };
      return;
    }
    this.analyser.getByteFrequencyData(this.freqData);

    // The frequency bins span 0Hz to sampleRate/2 (Nyquist).
    // sampleRate is usually 48000, so each bin = ~46Hz (48000/2/512).
    const sampleRate = this.context.sampleRate;
    const binCount = this.analyser.frequencyBinCount;
    const binHz = sampleRate / 2 / binCount;

    // Average values within each frequency band
    const avgRange = (loHz: number, hiHz: number): number => {
      const loBin = Math.floor(loHz / binHz);
      const hiBin = Math.min(binCount, Math.ceil(hiHz / binHz));
      let sum = 0;
      let n = 0;
      for (let i = loBin; i < hiBin; i++) {
        sum += this.freqData[i];
        n++;
      }
      return n > 0 ? sum / n / 255 : 0; // normalize to 0..1
    };

    const bass = avgRange(20, 200);
    const mid = avgRange(200, 2000);
    const treble = avgRange(2000, 8000);

    // Overall RMS-like energy
    let energySum = 0;
    for (let i = 0; i < binCount; i++) energySum += this.freqData[i];
    const energy = energySum / binCount / 255;

    // Kick detection: current bass vs recent average.
    // If current bass exceeds the rolling average by a threshold, it's a "hit."
    let avgBass = 0;
    if (this.bassHistory.length > 0) {
      avgBass = this.bassHistory.reduce((a, b) => a + b, 0) / this.bassHistory.length;
    }
    const kickRaw = Math.max(0, bass - avgBass - 0.05);
    const kick = Math.min(1, kickRaw * 4);

    this.bassHistory.push(bass);
    if (this.bassHistory.length > this.historySize) this.bassHistory.shift();

    this.frame = {
      bass,
      mid,
      treble,
      kick,
      energy,
      time: this.currentTime,
      playing: this.isPlaying,
    };
  }
}
