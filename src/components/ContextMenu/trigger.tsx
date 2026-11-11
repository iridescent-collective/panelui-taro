import { View } from "@tarojs/components";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { selectionTick } from "../../lib/haptics";
import { resolvePressableAccessibility } from "../../primitives/pressable-accessibility";
import { usePopoverAnchor } from "../Popover";
import {
  CONTEXT_MENU_DELAY,
  CONTEXT_MENU_SLOP,
  CONTEXT_PREVIEW_SCALE,
} from "./constants";
import { useContextMenu } from "./context";
import {
  contextMenuAccessibilityInvocation,
  contextMenuKeyInvocation,
} from "./invocation";
import type { ContextMenuInvocation } from "./invocation";
import type {
  ContextMenuTriggerHandle,
  ContextMenuTriggerProps,
} from "./types";
import { useContextHold } from "./use-hold";

export const ContextMenuTrigger = forwardRef<
  ContextMenuTriggerHandle,
  ContextMenuTriggerProps
>(
  (
    {
      children,
      anchor = "point",
      delay = CONTEXT_MENU_DELAY,
      slop = CONTEXT_MENU_SLOP,
      onPress,
      haptics = false,
      disabled = false,
      accessible,
      accessibilityActions,
      onAccessibilityAction,
      accessibilityRole,
      accessibilityLabel,
      accessibilityHint,
      accessibilityState,
      focusable,
      tabIndex,
      onKeyDown,
      onClick,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onTouchCancel,
      id,
      ...props
    },
    ref
  ) => {
    const controls = usePopoverAnchor("ContextMenu.Trigger");
    const context = useContextMenu("ContextMenu.Trigger");
    const measured = useElementLayout(false, children, id);
    const settings = useRef({
      anchor,
      children,
      context,
      controls,
      disabled,
      haptics,
    });
    settings.current = {
      anchor,
      children,
      context,
      controls,
      disabled,
      haptics,
    };
    const request = useRef(0);
    const mounted = useRef(false);
    useEffect(() => {
      mounted.current = true;
      return () => {
        mounted.current = false;
        request.current += 1;
      };
    }, []);
    useEffect(() => {
      request.current += 1;
    }, [disabled, children, anchor, context.hasPreview]);
    const open = useCallback(
      (point?: { x: number; y: number }) => {
        if (settings.current.disabled || !mounted.current) {
          return;
        }
        request.current += 1;
        const owner = request.current;
        if (settings.current.haptics) {
          void selectionTick();
        }
        measured.refresh(
          () =>
            mounted.current &&
            request.current === owner &&
            !settings.current.disabled,
          (rect) => {
            if (!rect) {
              return;
            }
            const { current } = settings;
            current.context.setTarget({
              height: rect.height,
              width: rect.width,
              x: rect.left,
              y: rect.top,
            });
            current.context.setContent(current.children);
            const grown = current.context.hasPreview
              ? (CONTEXT_PREVIEW_SCALE - 1) / 2
              : 0;
            const against = current.context.hasPreview
              ? "target"
              : current.anchor;
            current.controls.anchorTo(
              against === "point" && point
                ? { ...point, height: 0, width: 0 }
                : {
                    height: rect.height * (1 + grown * 2),
                    width: rect.width * (1 + grown * 2),
                    x: rect.left - rect.width * grown,
                    y: rect.top - rect.height * grown,
                  }
            );
            current.controls.setOpen(true);
          }
        );
      },
      [measured.refresh]
    );
    const invoke = (invocation: ContextMenuInvocation) => {
      if (disabled) {
        return;
      }
      if (invocation === "menu") {
        open();
      } else {
        onPress?.();
      }
    };
    useImperativeHandle(ref, () => ({
      activate: () => invoke(onPress ? "press" : "menu"),
      getAccessibilityActions: () =>
        disabled
          ? undefined
          : [
              { name: "activate" },
              { label: "Show menu", name: "showMenu" },
              ...(accessibilityActions ?? []).filter(
                ({ name }) => name !== "activate" && name !== "showMenu"
              ),
            ],
      getFocusOptions: () => ({
        accessible: accessible ?? true,
        focusable: focusable ?? !disabled,
        tabIndex: tabIndex ?? (disabled ? -1 : 0),
      }),
      handleAccessibilityAction: (event) => {
        const name = event.nativeEvent.actionName;
        const invocation = contextMenuAccessibilityInvocation(
          name,
          Boolean(onPress),
          disabled
        );
        if (invocation) {
          invoke(invocation);
          return;
        }
        if (name !== "activate" && name !== "showMenu") {
          onAccessibilityAction?.(event);
        }
      },
      handleKeyDown: (event) => {
        onKeyDown?.(event);
        if (event.isDefaultPrevented()) {
          return;
        }
        const invocation = contextMenuKeyInvocation(
          event.nativeEvent,
          Boolean(onPress),
          disabled
        );
        if (!invocation) {
          return;
        }
        event.preventDefault();
        invoke(invocation);
      },
      showMenu: () => invoke("menu"),
    }));
    const hold = useContextHold({
      delay,
      disabled,
      openAt: open,
      press: () => onPress?.(),
      slop,
    });
    return (
      <View
        {...props}
        id={measured.id}
        {...resolvePressableAccessibility(props, {
          disabled: disabled || accessibilityState?.disabled,
          hint: accessibilityHint,
          label: accessibilityLabel,
          role:
            accessible === false ? undefined : (accessibilityRole ?? "button"),
          state: {
            ...accessibilityState,
            disabled: disabled || accessibilityState?.disabled,
            expanded: controls.open,
          },
        })}
        onClick={(event) => {
          if (hold.onClick()) {
            onClick?.(event);
          }
        }}
        onTouchStart={(event) => {
          onTouchStart?.(event);
          hold.onTouchStart(event);
        }}
        onTouchMove={(event) => {
          onTouchMove?.(event);
          hold.onTouchMove(event);
        }}
        onTouchEnd={(event) => {
          onTouchEnd?.(event);
          hold.onTouchEnd();
        }}
        onTouchCancel={(event) => {
          onTouchCancel?.(event);
          hold.onTouchCancel();
        }}
      >
        <View style={{ display: "contents", pointerEvents: "none" }}>
          {children}
        </View>
      </View>
    );
  }
);
ContextMenuTrigger.displayName = "ContextMenu.Trigger";
