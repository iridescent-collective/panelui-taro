import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef, ReactNode } from "react";

import { UploadIcon } from "../../icons";
import { mergeStyle } from "../../lib/styles";
import { tv } from "../../lib/variants";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { useThemeToken } from "../../theme/use-theme";
import { useFieldLabelledBy } from "../Field";
import { Text } from "../primitives/Text";
import { SourceChooser } from "./chooser";
import { useFileUpload } from "./context";
import { describeRules } from "./core";
import { mutedUploadFill } from "./presentation";
import type { FileUploadDropzoneProps, FileUploadRejection } from "./types";

const variants = tv({
  slots: {
    badge:
      "flex h-[96px] w-[96px] items-center justify-center rounded-full border border-[var(--panel-border)] bg-[var(--panel-background)]",
    body: "flex flex-col items-center gap-[24px]",
    error: "text-center text-[28px] text-[var(--panel-destructive)]",
    hint: "text-center text-[28px] text-[var(--panel-muted-foreground)]",
    root: "flex flex-col items-center justify-center rounded-[var(--panel-radius-2xl)] border-[4px] border-dashed border-[var(--panel-border)] px-[48px] py-[56px] active:bg-[var(--panel-muted)]",
    title:
      "text-center text-[32px] font-semibold text-[var(--panel-foreground)]",
  },
  variants: {
    disabled: { true: { body: "opacity-50" } },
    invalid: {
      true: {
        root: "border-[var(--panel-destructive)] bg-[var(--panel-destructive-subtle)]",
      },
    },
  },
});
const rejectionMessage = (rejections: FileUploadRejection[]) => {
  const [first] = rejections;
  if (!first) {
    return null;
  }
  if (rejections.length === 1) {
    return first.message;
  }
  return `${first.message} ${rejections.length - 1} more could not be added.`;
};
const DropzoneCopy = ({
  value,
  className,
}: {
  value: ReactNode;
  className: string;
}) => {
  if (!value) {
    return null;
  }
  return typeof value === "string" ? (
    <Text className={className}>{value}</Text>
  ) : (
    value
  );
};
export const FileUploadDropzone = forwardRef<
  ComponentRef<typeof View>,
  FileUploadDropzoneProps
>(({ className, title, description, icon, children, ...props }, ref) => {
  const {
    accept,
    maxSize,
    maxFiles,
    multiple,
    disabled,
    invalid,
    canAddMore,
    rejections,
    files,
  } = useFileUpload();
  const labelledBy = useFieldLabelledBy();
  const color = useThemeToken("foreground");
  const muted = useThemeToken("muted");
  const errorFill = useThemeToken("destructive-subtle");
  const full = multiple && maxFiles !== undefined && files.length >= maxFiles;
  const rejected = rejectionMessage(rejections);
  const slots = variants({
    disabled: disabled || full,
    invalid: invalid || rejected !== null,
  });
  const heading = title ?? (multiple ? "Choose files" : "Choose a file");
  const hint = full
    ? `${files.length} of ${maxFiles} added. Remove one to add another.`
    : (description ??
      describeRules({
        accept,
        maxFiles: multiple ? maxFiles : undefined,
        maxSize,
      }));
  return (
    <SourceChooser>
      <AnimatedPressable
        {...props}
        ref={ref}
        style={mergeStyle(
          {
            backgroundColor:
              invalid || rejected !== null ? errorFill : mutedUploadFill(muted),
          },
          props.style
        )}
        aria-labelledby={labelledBy?.join(" ")}
        accessibilityRole="button"
        accessibilityLabel={[
          typeof heading === "string" ? heading : null,
          typeof hint === "string" ? hint : null,
        ]
          .filter(Boolean)
          .join(". ")}
        accessibilityState={{ disabled: disabled || !canAddMore }}
        disabled={disabled || !canAddMore}
        className={slots.root({ className })}
      >
        <View className={slots.body()}>
          {children ?? (
            <>
              <View className={slots.badge()}>
                {icon ?? <UploadIcon size={22} color={color} />}
              </View>
              <View className="flex flex-col gap-[8px]">
                <DropzoneCopy value={heading} className={slots.title()} />
                <DropzoneCopy value={hint} className={slots.hint()} />
                {rejected ? (
                  <Text aria-live="polite" className={slots.error()}>
                    {rejected}
                  </Text>
                ) : null}
              </View>
            </>
          )}
        </View>
      </AnimatedPressable>
    </SourceChooser>
  );
});
