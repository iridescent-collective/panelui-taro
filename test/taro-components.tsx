import {
  createElement,
  forwardRef,
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
} from "react";
import type { ButtonHTMLAttributes, ComponentType, ReactNode } from "react";
import { createPortal } from "react-dom";

type AnyProps = Record<string, unknown>;
export const TARO_TEST_EVENTS = {
  cameraInit: "taro:camerainit",
  afterLeave: "taro:afterleave",
  beforeLeave: "taro:beforeleave",
  chooseAvatar: "taro:chooseavatar",
  confirm: "taro:confirm",
  dragEnd: "taro:dragend",
  getPhoneNumber: "taro:getphonenumber",
  keyboardHeightChange: "taro:keyboardheightchange",
  lineChange: "taro:linechange",
  longPress: "taro:longpress",
  pickerChange: "taro:pickerchange",
  regionChange: "taro:regionchange",
  scroll: "taro:scroll",
  scrollEnd: "taro:scrollend",
  selectionChange: "taro:selectionchange",
} as const;
const PROP_BY_TEST_EVENT: Record<string, string> = {
  [TARO_TEST_EVENTS.cameraInit]: "onInitDone",
  [TARO_TEST_EVENTS.afterLeave]: "onAfterLeave",
  [TARO_TEST_EVENTS.beforeLeave]: "onBeforeLeave",
  [TARO_TEST_EVENTS.chooseAvatar]: "onChooseAvatar",
  [TARO_TEST_EVENTS.confirm]: "onConfirm",
  [TARO_TEST_EVENTS.getPhoneNumber]: "onGetPhoneNumber",
  [TARO_TEST_EVENTS.longPress]: "onLongPress",
  [TARO_TEST_EVENTS.lineChange]: "onLineChange",
  [TARO_TEST_EVENTS.keyboardHeightChange]: "onKeyboardHeightChange",
  [TARO_TEST_EVENTS.pickerChange]: "onChange",
  [TARO_TEST_EVENTS.regionChange]: "onRegionChange",
  [TARO_TEST_EVENTS.scroll]: "onScroll",
  [TARO_TEST_EVENTS.scrollEnd]: "onScrollEnd",
  [TARO_TEST_EVENTS.selectionChange]: "onSelectionChange",
  [TARO_TEST_EVENTS.dragEnd]: "onDragEnd",
};
const latestHandlers = new WeakMap<
  Element,
  Record<string, (event: unknown) => unknown>
>();
export const dispatchTaroInput = (
  element: Element,
  detail: { cursor: number; value: string }
) => latestHandlers.get(element)?.onInput?.({ detail });
const RAW_DETAIL_TEST_EVENTS: ReadonlySet<string> = new Set([
  TARO_TEST_EVENTS.longPress,
]);
export const dispatchTaroEvent = (
  el: Element,
  type: string,
  detail?: unknown
): void => {
  const prop = PROP_BY_TEST_EVENT[type];
  if (!prop) {
    return;
  }
  const event = RAW_DETAIL_TEST_EVENTS.has(type) ? detail : { detail };
  latestHandlers.get(el)?.[prop]?.(event);
};
const useBridge = (props: AnyProps, outerRef: unknown) => {
  const elRef = useRef<Element | null>(null);
  const next: Record<string, (event: unknown) => unknown> = {};
  for (const prop of [...Object.values(PROP_BY_TEST_EVENT), "onInput"]) {
    const fn = props[prop];
    if (typeof fn === "function") {
      next[prop] = fn as (event: unknown) => unknown;
    }
  }
  if (elRef.current) {
    latestHandlers.set(elRef.current, next);
  }
  return (el: Element | null) => {
    elRef.current = el;
    if (el) {
      latestHandlers.set(el, next);
    }
    if (typeof outerRef === "function") {
      outerRef(el);
    } else if (outerRef && typeof outerRef === "object") {
      (outerRef as { current: unknown }).current = el;
    }
  };
};
const omitBridgeProps = (props: AnyProps): AnyProps =>
  Object.fromEntries(
    Object.entries(props).filter(
      ([key]) =>
        key !== "aria-role" && !Object.values(PROP_BY_TEST_EVENT).includes(key)
    )
  );
const domStyle = (style: unknown) => {
  if (typeof style !== "string") {
    return style;
  }
  const parsed = document.createElement("div").style;
  parsed.cssText = style;
  return Object.fromEntries(
    Array.from({ length: parsed.length }, (_, index) => parsed.item(index)).map(
      (name) => {
        const key = name.startsWith("--")
          ? name
          : name.replaceAll(/-[a-z]/gu, (match) =>
              match.slice(1).toUpperCase()
            );
        return [key, parsed.getPropertyValue(name)];
      }
    )
  );
};
const stub = (tag: string) =>
  forwardRef<unknown, AnyProps>((props, ref) => {
    const bridgeRef = useBridge(props, ref);
    return createElement(tag, {
      ...omitBridgeProps(props),
      catchMove: undefined,
      "data-taro-catch-move":
        props.catchMove === undefined ? undefined : String(props.catchMove),
      "data-taro-scroll-x":
        props.scrollX === undefined ? undefined : String(props.scrollX),
      "data-taro-style": JSON.stringify(props.style),
      "data-weapp-role": props["aria-role"],
      ref: bridgeRef,
      style: domStyle(props.style),
    });
  });

export const Camera = stub("section");
export const Canvas = stub("canvas");
export const View = stub("div");
export const CustomWrapper = stub("div");
export const Text = stub("span");
export const ScrollView = stub("div");
export const Map = stub("div");
export const Slider = stub("div");
export const CoverView = stub("div");
export const CoverImage = stub("img");
export const Picker = stub("div");
export const PickerView = stub("div");
export const PickerViewColumn = stub("div");

export interface TaroButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  hoverClass?: string;
  onGetPhoneNumber?: (event: unknown) => void;
  openType?: string;
}
export type ButtonProps = TaroButtonProps;
export const TaroButton = forwardRef<HTMLButtonElement, TaroButtonProps>(
  (props, ref) => {
    const bridgeRef = useBridge({ ...props }, ref);
    return createElement("button", {
      ...omitBridgeProps({ ...props }),
      ref: bridgeRef,
    });
  }
);
export const Button = TaroButton;

export const TaroInput = forwardRef<HTMLInputElement, AnyProps>(
  (props, ref) => {
    const bridgeRef = useBridge(props, ref);
    const {
      onInput,
      maxlength,
      password,
      type,
      focus: _focus,
      cursor: _cursor,
      placeholderClass: _placeholderClass,
      confirmType: _confirmType,
      onConfirm: _onConfirm,
      ...rest
    } = props as AnyProps & {
      onInput?: (e: { detail: { cursor?: number; value: string } }) => unknown;
      onConfirm?: () => void;
    };
    return createElement("input", {
      ...rest,
      "data-taro-focus": String(props.focus),
      "data-taro-style": JSON.stringify(props.style),
      "data-weapp-role": props["aria-role"],
      maxLength: maxlength as number | undefined,
      onInput: onInput
        ? (e: { target?: { value?: string } }) =>
            (() => {
              const replacement = onInput({
                detail: { value: String(e.target?.value ?? "") },
              });
              if (typeof replacement === "string" && e.target) {
                e.target.value = replacement;
              }
            })()
        : undefined,
      ref: bridgeRef,
      type: password ? "password" : ((type as string) ?? "text"),
    });
  }
);
export const Input = TaroInput;
export interface TextareaMockHandle {
  setAttribute: (name: string, value: string) => void;
}
export const TaroTextarea = forwardRef<TextareaMockHandle, AnyProps>(
  (props, ref) => {
    const bridgeRef = useBridge(props, null);
    const { onInput, value, ...rest } = props as AnyProps & {
      value?: string;
      onInput?: (e: { detail: { cursor?: number; value: string } }) => unknown;
    };
    const [nativeValue, setNativeValue] = useState(value ?? "");
    useEffect(() => setNativeValue(value ?? ""), [value]);
    useImperativeHandle(
      ref,
      () => ({
        setAttribute: (name, next) => {
          if (name === "value") {
            setNativeValue(next);
          }
        },
      }),
      []
    );
    return createElement("textarea", {
      ...omitBridgeProps(rest),
      "data-taro-style": JSON.stringify(props.style),
      "data-weapp-role": props["aria-role"],
      onInput: onInput
        ? (event: { target?: { selectionStart?: number; value?: string } }) => {
            const raw = String(event.target?.value ?? "");
            const limit =
              typeof props.maxlength === "number" ? props.maxlength : 140;
            const next = limit < 0 ? raw : raw.slice(0, limit);
            setNativeValue(next);
            onInput({
              detail: { cursor: event.target?.selectionStart, value: next },
            });
          }
        : undefined,
      ref: bridgeRef,
      value: nativeValue,
    });
  }
);
export const Textarea = TaroTextarea;

export const Image = forwardRef<HTMLImageElement, AnyProps & { src?: string }>(
  (props, ref) => {
    const { onLoad, ...rest } = props as AnyProps & {
      onLoad?: (e: { detail: { height: number; width: number } }) => void;
    };
    return createElement("img", {
      ...rest,
      "data-taro-style": JSON.stringify(props.style),
      "data-weapp-role": props["aria-role"],
      onLoad: onLoad
        ? (e: { target?: { height?: number; width?: number } }) =>
            onLoad({
              detail: {
                height: Number(e.target?.height ?? 0),
                width: Number(e.target?.width ?? 0),
              },
            })
        : undefined,
      ref,
    });
  }
);

export interface TaroTouch {
  clientY: number;
  identifier: number;
  pageX?: number;
  pageY?: number;
}
export interface ITouchEvent {
  changedTouches?: TaroTouch[];
  touches: TaroTouch[];
}

export interface MapPropsMarkerCallout {
  anchorX: number;
  anchorY: number;
  [key: string]: unknown;
}
export interface MapPropsMarker {
  anchor?: { x: number; y: number };
  callout?: MapPropsMarkerCallout;
  height?: number;
  iconPath?: string;
  id: number | string;
  latitude: number;
  longitude: number;
  width?: number;
  [key: string]: unknown;
}
export interface MapPropsPolyline {
  arrowLine?: boolean;
  color?: string;
  points: { latitude: number; longitude: number }[];
  width?: number;
  [key: string]: unknown;
}
export interface MapPropsCircle {
  color?: string;
  fillColor?: string;
  latitude: number;
  longitude: number;
  radius: number;
  strokeWidth?: number;
  [key: string]: unknown;
}
export interface MapProps {
  circle: MapPropsCircle;
  latitude?: number;
  longitude?: number;
  marker: MapPropsMarker;
  polyline: MapPropsPolyline;
  scale?: number;
  [key: string]: unknown;
}

export const TaroComponents: Record<string, ComponentType<AnyProps>> = {};

export const Switch = forwardRef<HTMLInputElement, AnyProps>((props, ref) => {
  const { checked, disabled, onChange, ...rest } = props;
  const [nativeChecked, setNativeChecked] = useState(Boolean(checked));
  useEffect(() => setNativeChecked(Boolean(checked)), [checked]);
  return createElement("input", {
    ...rest,
    checked: nativeChecked,
    disabled,
    onChange:
      typeof onChange === "function"
        ? (event: { target: { checked: boolean } }) =>
            (() => {
              setNativeChecked(event.target.checked);
              onChange({ detail: { value: event.target.checked } });
            })()
        : undefined,
    ref,
    role: "switch",
    type: "checkbox",
  });
});

export const RootPortal = ({ children }: { children?: ReactNode }) =>
  children ? createPortal(children, document.body) : null;

export const PageContainer = stub("section");
