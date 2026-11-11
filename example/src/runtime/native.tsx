import {
  View as TaroView,
  ScrollView as TaroScrollView,
  Image as TaroImage,
} from "@tarojs/components";
import {
  getWindowInfo,
  createSelectorQuery,
  onWindowResize,
  offWindowResize,
} from "@tarojs/taro";
import { AnimatedPressable } from "panelui-taro/primitives/animated-pressable";
import { KeyboardAvoider as PanelKeyboardAvoider } from "panelui-taro/primitives/keyboard-avoider";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useId,
  useState,
  useRef,
} from "react";
import type { CSSProperties, ReactNode } from "react";

import { useWindowMetrics } from "../../../src/hooks/use-window-metrics";

export { Text } from "panelui-taro/primitives/text";
export type ViewStyle = CSSProperties;
export type StyleProp<T> = T | false | null | undefined | StyleProp<T>[];
export type LayoutChangeEvent = {
  nativeEvent: {
    layout: { x: number; y: number; width: number; height: number };
  };
};
export type NativeScrollEvent = {
  contentOffset: { x: number; y: number };
  contentSize: { width: number; height: number };
  layoutMeasurement: { width: number; height: number };
};
export type NativeSyntheticEvent<T> = { nativeEvent: T };
type NativeProps = {
  children?: ReactNode;
  className?: string;
  pointerEvents?: "auto" | "none" | "box-none" | "box-only";
  style?: unknown;
  [key: string]: unknown;
};
const unitless = new Set([
  "opacity",
  "zIndex",
  "flex",
  "flexGrow",
  "flexShrink",
  "order",
  "aspectRatio",
  "fontWeight",
  "elevation",
]);
export const nativeStyle = (style: unknown): CSSProperties => {
  if (Array.isArray(style)) {
    return Object.assign({}, ...style.map(nativeStyle));
  }
  if (!style || typeof style !== "object") {
    return {};
  }
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(style)) {
    if (key === "transform" && Array.isArray(value)) {
      next.transform = value
        .flatMap((item) =>
          Object.entries(item).map(
            ([name, amount]) =>
              `${name}(${typeof amount === "number" && name.startsWith("translate") ? `${amount * 2}rpx` : amount})`
          )
        )
        .join(" ");
    } else {
      next[key] =
        typeof value === "number" && !unitless.has(key)
          ? `${value * 2}rpx`
          : value;
    }
  }
  return next as CSSProperties;
};
const flexClass = (className = "") =>
  `${/\b(?:absolute|fixed|sticky)\b/u.test(className) ? "" : "relative"} flex ${className.includes("flex-row") ? "" : "flex-col"} ${className}`;
const isPointerEvents = (
  value: unknown
): value is NonNullable<NativeProps["pointerEvents"]> =>
  value === "auto" ||
  value === "none" ||
  value === "box-none" ||
  value === "box-only";
const pointerClass = (value: unknown) =>
  isPointerEvents(value) ? `official-pointer-${value}` : "";
const pointerStyle = (value: unknown): CSSProperties =>
  isPointerEvents(value)
    ? {
        pointerEvents:
          value === "box-none" ? "none" : value === "box-only" ? "auto" : value,
      }
    : {};
const useNativeLayout = (id: string, onLayout: unknown) => {
  const measured = useRef("");
  useEffect(() => {
    if (typeof onLayout !== "function") {
      return;
    }
    const measure = () => {
      createSelectorQuery()
        .select(`#${id}`)
        .boundingClientRect((box) => {
          const rect = Array.isArray(box) ? box[0] : box;
          if (!rect) {
            return;
          }
          const scale = 375 / getWindowInfo().windowWidth;
          const snapshot = `${rect.left},${rect.top},${rect.width},${rect.height},${scale}`;
          if (measured.current === snapshot) {
            return;
          }
          measured.current = snapshot;
          onLayout({
            nativeEvent: {
              layout: {
                height: rect.height * scale,
                width: rect.width * scale,
                x: rect.left * scale,
                y: rect.top * scale,
              },
            },
          });
        })
        .exec();
    };
    measure();
    onWindowResize(measure);
    return () => offWindowResize(measure);
  }, [id, onLayout]);
};
export const View = forwardRef<unknown, NativeProps>(
  (
    {
      children,
      className,
      style,
      pointerEvents,
      onLayout,
      entering,
      layout,
      ...props
    },
    ref
  ) => {
    const generatedId = `official-${useId().replaceAll(":", "")}`;
    const id = typeof props.id === "string" ? props.id : generatedId;
    useNativeLayout(id, onLayout);
    return (
      <TaroView
        {...props}
        ref={ref}
        id={typeof props.id === "string" ? props.id : id}
        className={`${flexClass(typeof className === "string" ? className : "")} ${pointerClass(pointerEvents)}`}
        style={{
          minWidth:
            typeof className === "string" && /(?:^|\s)min-w-/u.test(className)
              ? undefined
              : 0,
          ...nativeStyle(style),
          ...pointerStyle(pointerEvents),
          ...(entering &&
          typeof entering === "object" &&
          "name" in entering &&
          "milliseconds" in entering
            ? {
                animation: `${entering.name} ${entering.milliseconds}ms ease both`,
              }
            : {}),
          ...(layout
            ? {
                transition:
                  "height 240ms ease, width 240ms ease, transform 240ms ease",
              }
            : {}),
        }}
      >
        {children as ReactNode}
      </TaroView>
    );
  }
);
export const Pressable = ({
  children,
  className,
  style,
  pointerEvents,
  ...props
}: NativeProps) => (
  <AnimatedPressable
    {...props}
    className={`${flexClass(typeof className === "string" ? className : "")} ${pointerClass(pointerEvents)}`}
    style={{
      minWidth:
        typeof className === "string" && /(?:^|\s)min-w-/u.test(className)
          ? undefined
          : 0,
      ...nativeStyle(
        typeof style === "function" ? style({ pressed: false }) : style
      ),
      ...pointerStyle(pointerEvents),
    }}
  >
    {children as ReactNode}
  </AnimatedPressable>
);
export interface NativeScrollHandle {
  readNativeMetrics: () => {
    offset: number;
    pageY: number;
    height: number;
  } | null;
  scrollToNative: (offset: number) => void;
  scrollTo: (options: { y?: number; x?: number; animated?: boolean }) => void;
  scrollToEnd: (options?: { animated?: boolean }) => void;
}
export const ScrollView = forwardRef<NativeScrollHandle, NativeProps>(
  (
    {
      children,
      className,
      style,
      contentContainerStyle,
      contentContainerClassName,
      horizontal,
      onScroll,
      onMomentumScrollEnd,
      onLayout,
      ...props
    },
    ref
  ) => {
    const [position, setPosition] = useState({ end: "", left: 0, top: 0 });
    const generatedId = `scroll-${useId().replaceAll(":", "")}`;
    const id = typeof props.id === "string" ? props.id : generatedId;
    const end = `${id}-end`;
    useNativeLayout(id, onLayout);
    const metrics = useRef({
      height: getWindowInfo().windowHeight,
      offset: 0,
      pageY: 0,
      width: getWindowInfo().windowWidth,
    });
    const momentum = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
      createSelectorQuery()
        .select(`#${id}`)
        .boundingClientRect((box) => {
          const rect = Array.isArray(box) ? box[0] : box;
          if (rect) {
            metrics.current = {
              ...metrics.current,
              height: rect.height,
              pageY: rect.top,
              width: rect.width,
            };
          }
        })
        .exec();
      return () => {
        if (momentum.current) {
          clearTimeout(momentum.current);
        }
      };
    }, [id]);
    useImperativeHandle(
      ref,
      () => ({
        readNativeMetrics: () => metrics.current,
        scrollTo: ({ y = 0, x = 0 }) =>
          setPosition({
            end: "",
            left: x / (375 / getWindowInfo().windowWidth),
            top: y / (375 / getWindowInfo().windowWidth),
          }),
        scrollToEnd: () => setPosition((value) => ({ ...value, end })),
        scrollToNative: (top) => setPosition({ end: "", left: 0, top }),
      }),
      [end]
    );
    return (
      <TaroScrollView
        {...props}
        id={id}
        scrollY={!horizontal}
        scrollX={Boolean(horizontal)}
        scrollTop={position.top}
        scrollLeft={position.left}
        scrollIntoView={position.end}
        className={typeof className === "string" ? className : undefined}
        style={{
          flexGrow: 1,
          flexShrink: 1,
          minHeight: 0,
          minWidth: 0,
          ...nativeStyle(style),
        }}
        onScroll={(event) => {
          metrics.current.offset = event.detail.scrollTop;
          const scale = 375 / getWindowInfo().windowWidth;
          const normalized = {
            ...event,
            nativeEvent: {
              contentOffset: {
                x: event.detail.scrollLeft * scale,
                y: event.detail.scrollTop * scale,
              },
              contentSize: {
                height: event.detail.scrollHeight * scale,
                width: event.detail.scrollWidth * scale,
              },
              layoutMeasurement: {
                height: metrics.current.height * scale,
                width: metrics.current.width * scale,
              },
            },
          };
          if (typeof onScroll === "function") {
            onScroll(normalized);
          }
          if (typeof onMomentumScrollEnd === "function") {
            if (momentum.current) {
              clearTimeout(momentum.current);
            }
            momentum.current = setTimeout(
              () => onMomentumScrollEnd(normalized),
              100
            );
          }
        }}
      >
        <View
          className={`${horizontal ? "flex-row " : ""}${typeof contentContainerClassName === "string" ? contentContainerClassName : ""}`}
          style={contentContainerStyle}
        >
          {children}
          <TaroView id={end} />
        </View>
      </TaroScrollView>
    );
  }
);
export const Image = ({
  source,
  className,
  style,
  resizeMode,
  ...props
}: NativeProps) => (
  <TaroImage
    {...props}
    src={
      typeof source === "object" && source && "uri" in source
        ? String(source.uri)
        : String(source ?? "")
    }
    className={typeof className === "string" ? className : undefined}
    style={nativeStyle(style)}
    mode={resizeMode === "contain" ? "aspectFit" : "aspectFill"}
  />
);
export const Platform = {
  OS: "weapp",
  select: <T,>(values: { default?: T; ios?: T; android?: T }) =>
    values.default ?? values.android,
};
export const hasNativeUI = () => false;
export const useSafeAreaInsets = () => useWindowMetrics().insets;
export const KeyboardAvoider = ({
  children,
  className,
  style,
  pointerEvents,
  ...props
}: NativeProps) => (
  <PanelKeyboardAvoider
    {...props}
    className={`${flexClass(className)} ${pointerClass(pointerEvents)}`}
    style={{
      minWidth: 0,
      ...nativeStyle(style),
      ...pointerStyle(pointerEvents),
    }}
  >
    {children as ReactNode}
  </PanelKeyboardAvoider>
);

export { ScrollProgress } from "panelui-taro/primitives/scroll-progress";
export { Linking } from "./links";
export const FlatList = <T,>({
  data,
  renderItem,
  keyExtractor,
  ListHeaderComponent,
  ListFooterComponent,
  ...props
}: NativeProps & {
  data: readonly T[];
  renderItem: (info: { item: T; index: number }) => ReactNode;
  keyExtractor?: (item: T, index: number) => string;
  ListHeaderComponent?: ReactNode;
  ListFooterComponent?: ReactNode;
}) => (
  <ScrollView {...props}>
    {ListHeaderComponent}
    {data.map((item, index) => (
      <View key={keyExtractor?.(item, index) ?? index}>
        {renderItem({ index, item })}
      </View>
    ))}
    {ListFooterComponent}
  </ScrollView>
);
export const SectionList = <S extends { data: readonly unknown[] }>({
  sections,
  renderItem,
  renderSectionHeader,
  keyExtractor,
  ...props
}: NativeProps & {
  sections: readonly S[];
  renderItem: (info: {
    item: S["data"][number];
    index: number;
    section: S;
  }) => ReactNode;
  renderSectionHeader?: (info: { section: S }) => ReactNode;
  keyExtractor?: (item: S["data"][number], index: number) => string;
}) => (
  <ScrollView {...props}>
    {sections.map((section, i) => (
      <View key={i}>
        {renderSectionHeader?.({ section })}
        {section.data.map((item, index) => (
          <View key={keyExtractor?.(item, index) ?? index}>
            {renderItem({ index, item, section })}
          </View>
        ))}
      </View>
    ))}
  </ScrollView>
);
