import { showActionSheet } from "@tarojs/taro";
import type { Ref } from "react";
import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { useWindowMetrics } from "../../hooks/use-window-metrics";
import { readCanvasPoints } from "../../primitives/canvas-touch";
import { useThemeToken } from "../../theme/use-theme";
import {
  signatureAccessibilityActions,
  signatureAnnouncement,
} from "./accessibility";
import {
  copySignaturePng,
  signatureFilePath,
  signaturePngDataUrl,
  writeSignatureSvg,
} from "./files";
import { createSignatureHistory } from "./history";
import { strokePath } from "./math";
import type { SignatureHandle, SignatureProps } from "./types";
import { useSignatureCanvas } from "./use-canvas";
import { signatureVariants } from "./variants";

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("'", "&apos;");
const signatureTouchCentroid = (event: unknown) => {
  const points = readCanvasPoints(event);
  if (!points.length) {
    return null;
  }
  let x = 0;
  let y = 0;
  for (const point of points) {
    x += point.x;
    y += point.y;
  }
  return { x: x / points.length, y: y / points.length };
};
export const useSignatureModel = (
  {
    className,
    size = "md",
    strokeColor,
    strokeWidth = 2.5,
    minDistance = 1.5,
    guideline = false,
    guidelineLabel,
    placeholder,
    disabled = false,
    onRequestAlternative,
    onBegin,
    onEnd,
    onChange,
    padClassName,
    placeholderClassName,
    guideClassName,
    accessibilityLabel,
    accessibilityHint,
    accessibilityActions,
    onAccessibilityAction,
    ...props
  }: SignatureProps,
  ref: Ref<SignatureHandle>
) => {
  const [history] = useState(createSignatureHistory);
  const snapshot = useSyncExternalStore(
    history.signal.subscribe,
    history.signal.getSnapshot,
    history.signal.getSnapshot
  );
  const layout = useElementLayout(true, [size, padClassName], undefined, false);
  const width = layout.layout?.width ?? 0;
  const height = layout.layout?.height ?? 0;
  const { scale } = useWindowMetrics();
  const token = useThemeToken("foreground");
  const ink = strokeColor ?? token;
  const lineWidth =
    Number.isFinite(strokeWidth) && strokeWidth > 0
      ? Math.min(strokeWidth, 256)
      : 2.5;
  const distance =
    Number.isFinite(minDistance) && minDistance >= 0 ? minDistance : 1.5;
  const live = useRef<number[]>([]);
  const contact = useRef(false);
  const mounted = useRef(true);
  const menuRevision = useRef(0);
  const [drawing, setDrawing] = useState(false);
  const [fallbackPath, setFallbackPath] = useState("");
  const latest = useRef({
    disabled,
    onAccessibilityAction,
    onBegin,
    onChange,
    onEnd,
    onRequestAlternative,
  });
  latest.current = {
    disabled,
    onAccessibilityAction,
    onBegin,
    onChange,
    onEnd,
    onRequestAlternative,
  };
  const canvasId = `${layout.id}-ink`;
  const exportId = `${layout.id}-export`;
  const canvas = useSignatureCanvas(canvasId, exportId, {
    height,
    ink,
    live: live.current,
    strokeWidth: lineWidth,
    strokes: snapshot.strokes,
    width,
  });
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const reported = useRef(0);
  useEffect(() => {
    const count = snapshot.strokes.length;
    if (reported.current === count) {
      return;
    }
    const previous = reported.current;
    reported.current = count;
    latest.current.onChange?.(count);
    setAnnouncement(signatureAnnouncement(previous, count, snapshot.kind));
  }, [snapshot.strokes.length, snapshot.kind]);
  const publish = () => {
    canvas.draw(live.current, history.signal.value.strokes);
    if (canvas.fallback) {
      setFallbackPath(strokePath(live.current));
    }
  };
  const finish = () => {
    if (!contact.current) {
      return;
    }
    contact.current = false;
    const points = live.current;
    live.current = [];
    setDrawing(false);
    if (points.length) {
      history.commit(points);
      publish();
      latest.current.onEnd?.();
    } else publish();
  };
  useEffect(() => {
    if (disabled) {
      finish();
    }
  }, [disabled]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      menuRevision.current += 1;
      live.current = [];
      contact.current = false;
    };
  }, []);
  const start = (event: unknown) => {
    if (latest.current.disabled || contact.current) {
      return;
    }
    const point = signatureTouchCentroid(event);
    if (!point) {
      return;
    }
    contact.current = true;
    live.current = [point.x * scale, point.y * scale];
    setDrawing(true);
    publish();
    latest.current.onBegin?.();
  };
  const move = (event: unknown) => {
    if (!contact.current || latest.current.disabled) {
      return;
    }
    const point = signatureTouchCentroid(event);
    if (!point) {
      finish();
      return;
    }
    const points = live.current;
    const x = point.x * scale;
    const y = point.y * scale;
    const dx = x - (points.at(-2) ?? x);
    const dy = y - (points.at(-1) ?? y);
    if (dx * dx + dy * dy < distance * distance) {
      return;
    }
    live.current = [...points, x, y];
    publish();
  };
  const end = (event: unknown) => {
    if (readCanvasPoints(event).length === 0) {
      finish();
    }
  };
  const svgDocument = () => {
    const w = Math.round(width) || 1;
    const h = Math.round(height) || 1;
    const paths = history.signal.value.strokes
      .map(
        (points) =>
          `<path d="${strokePath(points)}" fill="none" stroke="${escapeXml(ink)}" stroke-width="${lineWidth}" stroke-linecap="round" stroke-linejoin="round"/>`
      )
      .join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${paths}</svg>`;
  };
  const clear = () => {
    contact.current = false;
    live.current = [];
    setDrawing(false);
    history.clear();
    publish();
  };
  useImperativeHandle(ref, () => ({
    clear,
    isEmpty: () => history.signal.value.strokes.length === 0,
    redo: () => {
      history.redo();
      publish();
    },
    save: async (options = {}) => {
      const format = options.format ?? "svg";
      const uri = signatureFilePath({ ...options, format });
      await (format === "svg"
        ? writeSignatureSvg(uri, svgDocument())
        : copySignaturePng(
            await canvas.rasterise(
              options.scale ?? 2,
              history.signal.value.strokes
            ),
            uri
          ));
      return {
        format,
        height: Math.round(height),
        uri,
        width: Math.round(width),
      };
    },
    strokeCount: () => history.signal.value.strokes.length,
    toDataURL: async (format = "svg") =>
      format === "svg"
        ? `data:image/svg+xml;utf8,${encodeURIComponent(svgDocument())}`
        : signaturePngDataUrl(
            await canvas.rasterise(2, history.signal.value.strokes)
          ),
    toSVG: svgDocument,
    undo: () => {
      history.undo();
      publish();
    },
  }));
  const actions = disabled
    ? []
    : [
        ...(accessibilityActions ?? []),
        ...signatureAccessibilityActions(
          snapshot.strokes.length,
          snapshot.undone.length,
          Boolean(onRequestAlternative),
          false
        ),
      ];
  const actionsKey = actions
    .map((action) => `${action.name}:${action.label}`)
    .join("\0");
  const latestActionsKey = useRef(actionsKey);
  latestActionsKey.current = actionsKey;
  const adjust = async () => {
    if (!actions.length || latest.current.disabled) {
      return;
    }
    menuRevision.current += 1;
    const request = menuRevision.current;
    const historyAtRequest = history.signal.value;
    try {
      const result = await showActionSheet({
        itemList: actions.map((action) => action.label),
      });
      if (
        !mounted.current ||
        request !== menuRevision.current ||
        latest.current.disabled ||
        historyAtRequest !== history.signal.value ||
        latestActionsKey.current !== actionsKey
      ) {
        return;
      }
      const action = actions[result.tapIndex];
      if (!action) {
        return;
      }
      if (action.name === "signature-undo") {
        history.undo();
        publish();
      } else if (action.name === "signature-redo") {
        history.redo();
        publish();
      } else if (action.name === "signature-clear") {
        clear();
      } else if (action.name === "signature-alternative") {
        latest.current.onRequestAlternative?.();
      } else {
        latest.current.onAccessibilityAction?.({
          nativeEvent: { actionName: action.name },
        });
      }
    } catch {
      return false;
    }
  };
  const slots = signatureVariants({ disabled, size });
  return {
    accessibilityHint,
    accessibilityLabel,
    adjust,
    announcement,
    canvas,
    canvasId,
    className,
    disabled,
    drawing,
    end,
    exportId,
    fallbackPath,
    finish,
    guideClassName,
    guideline,
    guidelineLabel,
    height,
    ink,
    layout,
    lineWidth,
    move,
    onRequestAlternative,
    padClassName,
    placeholder,
    placeholderClassName,
    props,
    slots,
    snapshot,
    start,
    width,
  };
};
