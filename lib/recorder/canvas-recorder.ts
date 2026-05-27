// CanvasRecorder: captures the WebGL canvas to a WebM video.
// v0.3: supports optional audio stream muxing (for audio-driven mode)
//       and uses VP9 codec for alpha channel support when needed.

export type RecordResult = { blob: Blob; mimeType: string; durationMs: number };

export class CanvasRecorder {
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private startTime = 0;
  private mimeType = '';

  private pickMime(needsAlpha: boolean): string {
    // VP9 supports alpha. VP8 has limited support. Avoid MP4 when alpha is needed.
    const alphaCandidates = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
    ];
    const standardCandidates = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4;codecs=avc1',
      'video/mp4',
    ];
    const candidates = needsAlpha ? alphaCandidates : standardCandidates;
    for (const m of candidates) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) {
        return m;
      }
    }
    return '';
  }

  start(canvas: HTMLCanvasElement, opts: {
    fps?: number;
    audioStream?: MediaStream | null;
    needsAlpha?: boolean;
  } = {}) {
    const { fps = 60, audioStream = null, needsAlpha = false } = opts;
    const mime = this.pickMime(needsAlpha);
    if (!mime) throw new Error('No supported video MIME type for MediaRecorder.');
    this.mimeType = mime;

    const videoStream = canvas.captureStream(fps);

    // Combine canvas video + optional audio into one stream
    let combinedStream: MediaStream;
    if (audioStream && audioStream.getAudioTracks().length > 0) {
      combinedStream = new MediaStream([
        ...videoStream.getVideoTracks(),
        ...audioStream.getAudioTracks(),
      ]);
    } else {
      combinedStream = videoStream;
    }

    this.recorder = new MediaRecorder(combinedStream, {
      mimeType: mime,
      videoBitsPerSecond: 8_000_000,
      audioBitsPerSecond: audioStream ? 128_000 : undefined,
    });
    this.chunks = [];
    this.recorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };
    this.startTime = performance.now();
    this.recorder.start();
  }

  stop(): Promise<RecordResult> {
    return new Promise((resolve, reject) => {
      if (!this.recorder) return reject(new Error('Recorder not started'));
      this.recorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: this.mimeType });
        resolve({
          blob,
          mimeType: this.mimeType,
          durationMs: performance.now() - this.startTime,
        });
      };
      this.recorder.stop();
    });
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
