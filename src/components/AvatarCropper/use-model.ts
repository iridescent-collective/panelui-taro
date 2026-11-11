import { getCurrentInstance } from "@tarojs/taro";
import {
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Ref } from "react";

import { useThemeToken } from "../../theme/use-theme";
import type { CropperContextValue } from "./context";
import {
  IDENTITY,
  baseSize,
  coversMask,
  nextQuarterTurn,
  present,
  rotateAbout,
  settle,
  sourceCrop,
  zoomAbout,
} from "./math";
import type { CropState, Size } from "./math";
import { exportAvatarCrop, measureAvatarImage } from "./native";
import type { AvatarCropperHandle, AvatarCropperProps } from "./types";
import { useCropMotion } from "./use-motion";
import type { CropMotionKind } from "./use-motion";

export const useAvatarCropperModel = (
  {
    source,
    shape = "circle",
    maxZoom = 5,
    cover = true,
    minZoom = 0.5,
    background,
    inset = 24,
  }: Pick<
    AvatarCropperProps,
    | "source"
    | "shape"
    | "maxZoom"
    | "cover"
    | "minZoom"
    | "background"
    | "inset"
  >,
  ref: Ref<AvatarCropperHandle>
) => {
  const [canvas, setCanvasState] = useState<Size | null>(null);
  const [measured, setMeasured] = useState<Size | null>(null);
  const motion = useCropMotion();
  const raw = useRef<CropState>(IDENTITY);
  const [scope] = useState(() => getCurrentInstance().page);
  const exportId = `panel-avatar-export-${useId().replaceAll(":", "")}`;
  const themeBackground = useThemeToken("background");
  const fill = background ?? themeBackground;
  const bounds = useMemo(
    () => ({ cover, maxZoom, minZoom, shape }),
    [shape, maxZoom, cover, minZoom]
  );
  const sourceSize =
    source.width && source.height && source.width > 0 && source.height > 0
      ? { height: source.height, width: source.width }
      : measured;
  const mask = canvas
    ? Math.max(0, Math.min(canvas.width, canvas.height) - inset * 2)
    : 0;
  const frame = useMemo(
    () =>
      sourceSize && mask > 0
        ? { image: baseSize(sourceSize, mask), mask }
        : null,
    [sourceSize?.width, sourceSize?.height, mask]
  );
  useEffect(() => {
    let live = true;
    setMeasured(null);
    if (!source.width || !source.height) {
      void (async () => {
        try {
          const value = await measureAvatarImage(source);
          if (live) {
            setMeasured(value);
          }
        } catch {
          if (live) {
            setMeasured(null);
          }
        }
      })();
    }
    raw.current = IDENTITY;
    motion.write(IDENTITY, "immediate");
    return () => {
      live = false;
    };
  }, [source.uri, source.width, source.height, motion.write]);
  const setCanvas = useCallback(
    (size: Size) =>
      setCanvasState((previous) =>
        previous?.width === size.width && previous.height === size.height
          ? previous
          : size
      ),
    []
  );
  const write = useCallback(
    (target: CropState, settled = false, kind: CropMotionKind = "spring") => {
      if (!frame) {
        return;
      }
      const bounded = {
        ...target,
        scale: Math.min(
          Math.max(target.scale, 0.05),
          Math.max(0.05, maxZoom) * 2
        ),
      };
      const limit =
        Math.max(frame.image.width, frame.image.height) * bounded.scale;
      bounded.x = Math.min(Math.max(bounded.x, -limit), limit);
      bounded.y = Math.min(Math.max(bounded.y, -limit), limit);
      const next = settled ? settle(bounded, bounds, frame) : bounded;
      raw.current = next;
      motion.write(next, settled ? kind : "immediate");
    },
    [frame, bounds, maxZoom, motion.write]
  );
  useEffect(() => {
    if (frame) {
      write(raw.current, true);
    }
  }, [write, frame]);
  const rotate = useCallback(
    (direction: 1 | -1 = 1) => {
      const current = motion.read();
      const turn = nextQuarterTurn(current.rotation, direction);
      write(
        rotateAbout(current, turn - current.rotation, 0, 0),
        true,
        "timing"
      );
    },
    [write, motion.read]
  );
  const reset = useCallback(
    () =>
      write(
        {
          ...IDENTITY,
          rotation: Math.round(motion.read().rotation / 360) * 360,
        },
        true,
        "timing"
      ),
    [write, motion.read]
  );
  const zoomBy = useCallback(
    (factor: number) => write(zoomAbout(motion.read(), factor, 0, 0), true),
    [write, motion.read]
  );
  const getCrop = useCallback(() => {
    if (!frame || !sourceSize) {
      return null;
    }
    const current = settle(motion.read(), bounds, frame);
    return sourceCrop(
      current,
      frame,
      sourceSize,
      coversMask(current, shape, frame)
    );
  }, [frame, sourceSize, bounds, shape, motion.read]);
  const queue = useRef(Promise.resolve(true));
  useImperativeHandle(
    ref,
    () => ({
      crop(options) {
        if (!frame || !sourceSize) {
          return Promise.reject(
            new Error(
              "AvatarCropper.crop: the photo has not been measured and laid out yet."
            )
          );
        }
        const current = settle(motion.read(), bounds, frame);
        const previous = queue.current;
        const pending = (async () => {
          await previous;
          return exportAvatarCrop(
            exportId,
            scope,
            source,
            sourceCrop(
              current,
              frame,
              sourceSize,
              coversMask(current, shape, frame)
            ),
            sourceSize,
            fill,
            options
          );
        })();
        queue.current = (async () => {
          try {
            await pending;
            return true;
          } catch {
            return false;
          }
        })();
        return pending;
      },
      getCrop,
      reset,
      rotate,
    }),
    [
      getCrop,
      rotate,
      reset,
      frame,
      sourceSize,
      bounds,
      motion.read,
      shape,
      exportId,
      scope,
      source,
      fill,
    ]
  );

  const context: CropperContextValue = {
    begin: () => {
      raw.current = motion.stop();
    },
    bounds,
    fill,
    frame,
    raw,
    reset,
    rotate,
    setCanvas,
    shape,
    source,
    state: frame ? present(motion.values, bounds, frame) : motion.values,
    write,
    zoomBy,
  };
  return { context, exportId };
};
