export const MAX_COMMENTARY_VIDEO_BYTES = 150_000_000;
export const MAX_COMMENTARY_DURATION_SECONDS = 600;
export const COMMENTARY_FRAME_COUNT = 8;

export interface SampledVideoFrame {
  timeSeconds: number;
  imageDataUrl: string;
}

export interface SampledClip {
  name: string;
  type: string;
  sizeBytes: number;
  durationSeconds: number;
  width: number;
  height: number;
  sampledFrames: SampledVideoFrame[];
}

export function commentarySampleTimes(durationSeconds: number, count = COMMENTARY_FRAME_COUNT) {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) throw new Error("The clip duration could not be read.");
  const safeCount = Math.max(4, Math.min(8, Math.round(count)));
  const edgePadding = Math.min(0.2, durationSeconds * 0.02);
  const usableDuration = Math.max(0, durationSeconds - edgePadding * 2);
  return Array.from({ length: safeCount }, (_, index) => {
    const ratio = safeCount === 1 ? 0 : index / (safeCount - 1);
    return Number((edgePadding + usableDuration * ratio).toFixed(3));
  });
}

export function validateCommentaryVideo(file: File) {
  if (!file.type.startsWith("video/")) throw new Error("Choose a video file such as MP4, MOV, or WEBM.");
  if (file.size > MAX_COMMENTARY_VIDEO_BYTES) throw new Error("Choose a clip smaller than 150 MB for this local MVP.");
}

function waitFor(target: HTMLVideoElement, eventName: "loadedmetadata" | "seeked") {
  return new Promise<void>((resolve, reject) => {
    const onSuccess = () => { cleanup(); resolve(); };
    const onError = () => { cleanup(); reject(new Error("The browser could not decode this video.")); };
    const cleanup = () => {
      target.removeEventListener(eventName, onSuccess);
      target.removeEventListener("error", onError);
    };
    target.addEventListener(eventName, onSuccess, { once: true });
    target.addEventListener("error", onError, { once: true });
  });
}

export async function sampleVideoFrames(file: File): Promise<SampledClip> {
  validateCommentaryVideo(file);
  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.preload = "metadata";
  video.muted = true;
  video.playsInline = true;
  video.src = objectUrl;

  try {
    if (video.readyState < 1) await waitFor(video, "loadedmetadata");
    if (!Number.isFinite(video.duration) || video.duration <= 0) throw new Error("The clip duration could not be read.");
    if (video.duration > MAX_COMMENTARY_DURATION_SECONDS) throw new Error("Choose a finished clip under 10 minutes.");

    const maxWidth = 640;
    const scale = Math.min(1, maxWidth / video.videoWidth);
    const width = Math.max(1, Math.round(video.videoWidth * scale));
    const height = Math.max(1, Math.round(video.videoHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("The browser could not prepare video frames.");

    const sampledFrames: SampledVideoFrame[] = [];
    for (const timeSeconds of commentarySampleTimes(video.duration)) {
      if (Math.abs(video.currentTime - timeSeconds) > 0.01) {
        const seeked = waitFor(video, "seeked");
        video.currentTime = timeSeconds;
        await seeked;
      }
      context.drawImage(video, 0, 0, width, height);
      sampledFrames.push({ timeSeconds, imageDataUrl: canvas.toDataURL("image/jpeg", 0.65) });
    }

    return {
      name: file.name,
      type: file.type,
      sizeBytes: file.size,
      durationSeconds: Number(video.duration.toFixed(2)),
      width: video.videoWidth,
      height: video.videoHeight,
      sampledFrames,
    };
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(objectUrl);
  }
}
