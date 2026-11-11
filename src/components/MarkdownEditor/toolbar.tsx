import { ScrollView, View } from "@tarojs/components";
import { Fragment, forwardRef } from "react";
import type { ComponentRef } from "react";

import { EyeIcon, PencilIcon } from "../../icons";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Button } from "../Button";
import { ButtonGroup } from "../ButtonGroup";
import {
  ACTIONS,
  DEFAULT_ACTIONS,
  DEFAULT_PILL_ACTIONS,
  FAMILY,
} from "./actions";
import { useMarkdownEditor } from "./context";
import type { MarkdownEditorAction, MarkdownEditorToolbarProps } from "./types";
import { markdownEditorVariants } from "./variants";

export const MarkdownEditorToolbar = forwardRef<
  ComponentRef<typeof View>,
  MarkdownEditorToolbarProps
>(
  (
    {
      className,
      variant = "bar",
      actions,
      showModeSwitch = true,
      children,
      ...props
    },
    ref
  ) => {
    const { mode, setMode, run, active, disabled } = useMarkdownEditor();
    const slots = markdownEditorVariants({ variant });
    const pill = variant === "pill";
    const shown = actions ?? (pill ? DEFAULT_PILL_ACTIONS : DEFAULT_ACTIONS);
    const button = (action: MarkdownEditorAction, size: number) => (
      <Button
        key={action}
        accessibilityLabel={ACTIONS[action].label}
        accessibilityState={{ selected: active.has(action) }}
        variant={active.has(action) ? "secondary" : "ghost"}
        disabled={disabled}
        onPress={() => run(action)}
        className={
          pill ? "h-[72px] w-[72px] rounded-full px-[0px]" : "px-[16px]"
        }
      >
        {ACTIONS[action].icon(size)}
      </Button>
    );
    if (pill) {
      return (
        <View {...props} ref={ref} className={slots.toolbar({ className })}>
          {mode === "write" ? (
            <View className={slots.capsule()}>
              <ScrollView scrollX showScrollbar={false}>
                <View className="flex flex-row items-center">
                  {shown.map((action, index) => (
                    <Fragment key={action}>
                      {index > 0 &&
                      FAMILY[action] !== FAMILY[shown[index - 1]] ? (
                        <View className={slots.divider()} />
                      ) : null}
                      {button(action, 18)}
                    </Fragment>
                  ))}
                </View>
              </ScrollView>
            </View>
          ) : null}
          {showModeSwitch ? (
            <AnimatedPressable
              accessibilityRole="button"
              accessibilityLabel={mode === "write" ? "Preview" : "Write"}
              accessibilityState={{ selected: mode === "preview" }}
              pressScale={1}
              className={slots.escape({ className: "flex" })}
              onPress={() => setMode(mode === "write" ? "preview" : "write")}
            >
              {mode === "write" ? (
                <EyeIcon size={18} />
              ) : (
                <PencilIcon size={18} />
              )}
            </AnimatedPressable>
          ) : null}
        </View>
      );
    }
    return (
      <View {...props} ref={ref} className={slots.toolbar({ className })}>
        {mode === "write" ? (
          <ButtonGroup variant="ghost" size="sm" className="shrink">
            {shown.map((action) => button(action, 16))}
          </ButtonGroup>
        ) : (
          <View className="shrink" />
        )}
        <View className="flex flex-row items-center gap-[16px]">
          {children}
          {showModeSwitch ? (
            <ButtonGroup size="sm">
              <Button
                variant={mode === "write" ? "secondary" : "ghost"}
                startContent={<PencilIcon size={14} />}
                onPress={() => setMode("write")}
              >
                Write
              </Button>
              <Button
                variant={mode === "preview" ? "secondary" : "ghost"}
                startContent={<EyeIcon size={14} />}
                onPress={() => setMode("preview")}
              >
                Preview
              </Button>
            </ButtonGroup>
          ) : null}
        </View>
      </View>
    );
  }
);
MarkdownEditorToolbar.displayName = "MarkdownEditor.Toolbar";
