import { Image } from "@tarojs/components";
import { getImageInfo } from "@tarojs/taro";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { useViewer } from "./context";
import type { Rect, Size } from "./geometry";
import type { ImageViewerSource, ImageViewerTriggerProps } from "./types";

export const viewerUri = (source: ImageViewerSource) =>
  typeof source === "string" ? source : source.uri;
export const ImageViewerTrigger = ({
  className,
  source,
  fullSource,
  alt,
  caption,
  index,
  radius = 0,
  width,
  height,
  disabled = false,
  children,
  onPress,
  onClick,
  ...props
}: ImageViewerTriggerProps) => {
  const { store, hiddenId, openItem } = useViewer();
  const id = useId();
  const order = useRef<number | null>(null);
  order.current ??= store.nextOrder();
  const [size, setSize] = useState<Size | null>(
    width && height ? { height, width } : null
  );
  const measured = useElementLayout(true, children ?? source, props.id, false);
  const uri = viewerUri(source);
  useEffect(() => {
    if (width && height) {
      setSize({ height, width });
      return;
    }
    let live = true;
    const load = async () => {
      try {
        const result = await getImageInfo({ src: uri });
        if (live && result.width > 0 && result.height > 0) {
          setSize({ height: result.height, width: result.width });
        }
      } catch {
        return false;
      }
    };
    void load();
    return () => {
      live = false;
    };
  }, [uri, width, height]);
  const measure = useCallback(
    (done: (rect: Rect | null) => void) =>
      measured.refresh(
        () => true,
        (rect) =>
          done(
            rect && rect.width > 0 && rect.height > 0
              ? {
                  height: rect.height,
                  width: rect.width,
                  x: rect.left,
                  y: rect.top,
                }
              : null
          )
      ),
    [measured.refresh]
  );
  useLayoutEffect(() => {
    store.set({
      alt,
      caption,
      fullSource,
      id,
      index,
      measure,
      order: order.current ?? 0,
      radius,
      size: size ?? measured.layout,
      source,
    });
  }, [
    store,
    id,
    index,
    source,
    fullSource,
    alt,
    caption,
    radius,
    size,
    measured.layout,
    measure,
  ]);
  useLayoutEffect(() => () => store.delete(id), [store, id]);
  return (
    <AnimatedPressable
      {...props}
      id={measured.id}
      accessibilityRole="button"
      accessibilityLabel={alt}
      accessibilityHint="Opens the image"
      disabled={disabled}
      pressScale={1}
      className={cn("overflow-hidden", className)}
      style={{
        borderRadius: `${radius * 2}rpx`,
        opacity: hiddenId === id ? 0 : 1,
      }}
      onPress={(event) => {
        onPress?.(event);
        onClick?.(event);
        openItem(id);
      }}
    >
      {children ?? (
        <Image
          src={uri}
          mode="aspectFill"
          aria-hidden
          className="absolute inset-0 h-full w-full"
          onLoad={(event) => {
            if (size) {
              return;
            }
            const loaded = {
              height: Number(event.detail.height),
              width: Number(event.detail.width),
            };
            if (loaded.width > 0 && loaded.height > 0) {
              setSize({ height: loaded.height, width: loaded.width });
            }
          }}
        />
      )}
    </AnimatedPressable>
  );
};
ImageViewerTrigger.displayName = "ImageViewer.Trigger";
