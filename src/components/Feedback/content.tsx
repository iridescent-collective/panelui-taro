import { View } from "@tarojs/components";
import { nextTick } from "@tarojs/taro";
import { useEffect, useState } from "react";

import { useBackHandler } from "../../hooks/use-back-handler";
import { usePresence } from "../../hooks/use-presence";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { mergeStyle } from "../../lib/styles";
import { KeyboardAvoider } from "../../primitives/keyboard-avoider";
import { ModalPortal } from "../../primitives/portal";
import { Scrim } from "../../primitives/scrim";
import { textChildren } from "../primitives/Text";
import { FeedbackContext, useFeedback } from "./context";
import type { FeedbackContentProps } from "./types";
import { feedbackVariants } from "./variants";

const FeedbackLayer = ({
  className,
  dismissible = true,
  blur = false,
  children,
  style,
  ...props
}: FeedbackContentProps) => {
  const { open, setOpen } = useFeedback("Feedback.Content");
  const reduced = usePanelReducedMotion();
  const [shown, setShown] = useState(false);
  useEffect(() => {
    let current = true;
    nextTick(() => {
      if (current) {
        setShown(true);
      }
    });
    return () => {
      current = false;
    };
  }, []);
  useBackHandler(open && dismissible, () => setOpen(false));
  const slots = feedbackVariants();
  return (
    <View
      className="fixed inset-0 flex items-center justify-center p-[48px]"
      style={{
        opacity: Number(open && (shown || reduced)),
        transition: reduced ? "none" : "opacity 150ms ease",
      }}
    >
      <Scrim blur={blur} />
      <View
        className="absolute inset-0"
        aria-label="Close dialog"
        aria-disabled={!dismissible || !open}
        onClick={() => {
          if (dismissible && open) {
            setOpen(false);
          }
        }}
      />
      <KeyboardAvoider
        enabled={open}
        mode="lift"
        offset={16}
        className="flex w-full flex-col items-center"
      >
        <View
          {...props}
          role="dialog"
          aria-role="dialog"
          aria-modal
          aria-hidden={!open}
          className={slots.shell({ className })}
          style={mergeStyle(
            {
              borderRadius: "76rpx",
              padding: "16rpx",
              pointerEvents: open ? "auto" : "none",
              position: "relative",
              transform: shown || reduced ? "scale(1)" : "scale(0)",
              transition: reduced
                ? "none"
                : "transform 350ms cubic-bezier(0.22,1,0.36,1)",
            },
            style
          )}
        >
          <View
            aria-hidden
            className={slots.recess()}
            style={{ pointerEvents: "none" }}
          />
          {textChildren(children)}
        </View>
      </KeyboardAvoider>
    </View>
  );
};
export const FeedbackContent = (props: FeedbackContentProps) => {
  const context = useFeedback("Feedback.Content");
  const reduced = usePanelReducedMotion();
  const present = usePresence(context.open, reduced ? 0 : 150);
  return present ? (
    <ModalPortal>
      <FeedbackContext.Provider value={context}>
        <FeedbackLayer {...props} />
      </FeedbackContext.Provider>
    </ModalPortal>
  ) : null;
};
