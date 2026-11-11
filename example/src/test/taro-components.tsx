import { createElement, forwardRef, useRef } from "react";
import type { ReactNode, ButtonHTMLAttributes, ComponentType } from "react";
import { createPortal } from "react-dom";

type AnyProps = Record<string, unknown>;
export const TARO_TEST_EVENTS = {
  chooseAvatar: "taro:chooseavatar",
  getPhoneNumber: "taro:getphonenumber",
  longPress: "taro:longpress",
  pickerChange: "taro:pickerchange",
  regionChange: "taro:regionchange",
  scroll: "taro:scroll",
  scrollEnd: "taro:scrollend",
} as const;
const PROP_BY_TEST_EVENT: Record<string, string> = {
  [TARO_TEST_EVENTS.scroll]: "onScroll",
  [TARO_TEST_EVENTS.scrollEnd]: "onScrollEnd",
  [TARO_TEST_EVENTS.chooseAvatar]: "onChooseAvatar",
  [TARO_TEST_EVENTS.getPhoneNumber]: "onGetPhoneNumber",
  [TARO_TEST_EVENTS.longPress]: "onLongPress",
  [TARO_TEST_EVENTS.pickerChange]: "onChange",
  [TARO_TEST_EVENTS.regionChange]: "onRegionChange",
};
const latestHandlers = new WeakMap<
  Element,
  Record<string, (event: unknown) => void>
>();
const RAW_DETAIL_TEST_EVENTS: ReadonlySet<string> = new Set([
  TARO_TEST_EVENTS.longPress,
]);
export const dispatchTaroEvent = (
  el: Element,
  type: string,
  detail: unknown
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
  const next: Record<string, (event: unknown) => void> = {};
  for (const [, prop] of Object.entries(PROP_BY_TEST_EVENT)) {
    const fn = props[prop];
    if (typeof fn === "function") {
      next[prop] = fn as (event: unknown) => void;
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
const omitBridgeProps = (props: AnyProps): AnyProps => {
  const bridgeProps = new Set(Object.values(PROP_BY_TEST_EVENT));
  return Object.fromEntries(
    Object.entries(props).filter(([key]) => !bridgeProps.has(key))
  );
};
const stub = (tag: string) =>
  forwardRef<unknown, AnyProps>((props, ref) => {
    const bridgeRef = useBridge(props, ref);
    return createElement(tag, {
      ...omitBridgeProps(props),
      ref: bridgeRef,
    });
  });

export const View = stub("div");
export const CustomWrapper = stub("div");
export const Text = stub("span");
export const ScrollView = stub("div");
export const Map = stub("div");
export const CoverView = stub("div");
export const CoverImage = stub("img");
export const Picker = stub("div");
export const Slider = stub("div");
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
      onInput?: (e: { detail: { cursor?: number; value: string } }) => void;
      onConfirm?: () => void;
    };
    return createElement("input", {
      ...rest,
      maxLength: maxlength as number | undefined,
      onInput: onInput
        ? (e: { target?: { value?: string } }) =>
            onInput({
              detail: { value: String(e.target?.value ?? "") },
            })
        : undefined,
      ref,
      type: password ? "password" : ((type as string) ?? "text"),
    });
  }
);
export const Input = TaroInput;
export const TaroTextarea = forwardRef<HTMLTextAreaElement, AnyProps>(
  (props, ref) => {
    const { onInput, ...rest } = props as AnyProps & {
      onInput?: (e: { detail: { value: string } }) => void;
    };
    return createElement("textarea", {
      ...rest,
      onInput: onInput
        ? (e: { target?: { value?: string } }) =>
            onInput({ detail: { value: String(e.target?.value ?? "") } })
        : undefined,
      ref,
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

export const RootPortal = ({ children }: { children?: ReactNode }) =>
  createPortal(children, document.body);
export const PageContainer = stub("div");

export { Canvas, Switch } from "../../../test/taro-components";

export const Camera = forwardRef<unknown, AnyProps>((props, ref) => createElement("section", { ...props, ref }));
