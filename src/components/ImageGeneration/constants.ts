import type { ImageGenerationStatus } from "./types";

export const STILL_FRAME = 900;
export const FIELD_OPACITY: Record<ImageGenerationStatus, number> = {
  complete: 0,
  error: 0,
  generating: 1,
  queued: 1,
  refining: 0.48,
};
export const MEDIA_OPACITY: Record<ImageGenerationStatus, number> = {
  complete: 1,
  error: 0.28,
  generating: 0,
  queued: 0,
  refining: 0.62,
};
export const MEDIA_SCALE: Record<ImageGenerationStatus, number> = {
  complete: 1,
  error: 1,
  generating: 1.02,
  queued: 1.02,
  refining: 1.008,
};
export const STATUS_TEXT: Record<ImageGenerationStatus, string> = {
  complete: "Image ready",
  error: "Generation failed",
  generating: "Creating image",
  queued: "Waiting to generate",
  refining: "Refining details",
};
export const FRAME_INTERVAL = 16;
export const MAX_FRAME_DELTA = 48;
