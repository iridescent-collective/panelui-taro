import { View } from "@tarojs/components";
import { forwardRef, isValidElement } from "react";
import type { ComponentRef, ReactNode } from "react";

import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { Popover } from "../Popover";
import { Text } from "../primitives/Text";
import {
  CANVAS_SIZE,
  holeBounds,
  LOGO_FRACTION,
  PLATE,
  QUIET_ZONE,
} from "./constants";
import { QRCodeContext, useQRCode } from "./context";
import type {
  QRCodeActionProps,
  QRCodeCaptionProps,
  QRCodeContentProps,
  QRCodeDescriptionProps,
  QRCodeFrameProps,
  QRCodeHeaderProps,
  QRCodeLogoProps,
  QRCodePanelProps,
  QRCodeTitleProps,
  QRCodeTriggerProps,
  QRCodeValueProps,
} from "./types";

export const QRCodeFrame = forwardRef<
  ComponentRef<typeof View>,
  QRCodeFrameProps
>(({ className, children, ...props }, ref) => {
  const { slots } = useQRCode("QRCode.Frame");
  return (
    <View {...props} ref={ref} className={slots.frame({ className })}>
      {children}
    </View>
  );
});
export const QRCodeHeader = forwardRef<
  ComponentRef<typeof View>,
  QRCodeHeaderProps
>(({ className, children, ...props }, ref) => {
  const { slots } = useQRCode("QRCode.Header");
  return (
    <View
      {...props}
      ref={ref}
      className={cn("flex", slots.header({ className }))}
    >
      {children}
    </View>
  );
});
export const QRCodePanel = forwardRef<
  ComponentRef<typeof View>,
  QRCodePanelProps
>(({ className, children, ...props }, ref) => {
  const { slots } = useQRCode("QRCode.Panel");
  return (
    <View
      {...props}
      ref={ref}
      className={cn("flex flex-col", slots.panel({ className }))}
    >
      {children}
    </View>
  );
});
export const QRCodeTitle = ({ className, children }: QRCodeTitleProps) => {
  useQRCode("QRCode.Title");
  return (
    <Text
      size="sm"
      muted
      numberOfLines={1}
      className={cn("min-w-0 shrink", className)}
    >
      {children}
    </Text>
  );
};
export const QRCodeAction = forwardRef<
  ComponentRef<typeof View>,
  QRCodeActionProps
>(({ className, children, ...props }, ref) => {
  useQRCode("QRCode.Action");
  return (
    <View
      {...props}
      ref={ref}
      className={cn(
        "flex shrink-0 flex-row items-center gap-[16px]",
        className
      )}
    >
      {typeof children === "string" ? (
        <Text size="sm" muted>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
});
export const QRCodeDescription = ({
  className,
  children,
}: QRCodeDescriptionProps) => {
  useQRCode("QRCode.Description");
  return (
    <Text size="sm" muted className={cn("text-center", className)}>
      {children}
    </Text>
  );
};
export const QRCodeCaption = ({ className, children }: QRCodeCaptionProps) => {
  const { slots } = useQRCode("QRCode.Caption");
  return <Text className={slots.caption({ className })}>{children}</Text>;
};
export const QRCodeValue = ({ className, full }: QRCodeValueProps) => {
  const { slots, value } = useQRCode("QRCode.Value");
  return (
    <Text
      className={slots.value({ className })}
      numberOfLines={full ? undefined : 1}
      selectable
    >
      {value}
    </Text>
  );
};
export const QRCodeLogo = forwardRef<
  ComponentRef<typeof View>,
  QRCodeLogoProps
>(({ className, children, style, ...props }, ref) => {
  const { size, matrix } = useQRCode("QRCode.Logo");
  if (!matrix) {
    return null;
  }
  const { from, to } = holeBounds(matrix.size, LOGO_FRACTION);
  const box =
    ((to - from) / (matrix.size + QUIET_ZONE * 2)) * CANVAS_SIZE[size];
  return (
    <View
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <View
        {...props}
        ref={ref}
        className={cn(
          "flex items-center justify-center overflow-hidden rounded-md",
          className
        )}
        style={mergeStyle(
          {
            backgroundColor: PLATE,
            height: `${box * 2}rpx`,
            width: `${box * 2}rpx`,
          },
          style
        )}
      >
        {children}
      </View>
    </View>
  );
});
export const hasLogo = (children: ReactNode): boolean => {
  if (Array.isArray(children)) {
    return children.some(hasLogo);
  }
  if (!isValidElement<{ children?: ReactNode }>(children)) {
    return false;
  }
  return children.type === QRCodeLogo || hasLogo(children.props.children);
};
export const QRCodeTrigger = ({ children }: QRCodeTriggerProps) => {
  useQRCode("QRCode.Trigger");
  return <Popover.Trigger>{children}</Popover.Trigger>;
};
export const QRCodeContent = ({
  className,
  width = "content-fit",
  children,
  ...props
}: QRCodeContentProps) => {
  const context = useQRCode("QRCode.Content");
  return (
    <Popover.Content
      {...props}
      width={width}
      className={cn("flex flex-col items-center gap-[24px]", className)}
    >
      <QRCodeContext.Provider value={context}>
        {children}
      </QRCodeContext.Provider>
    </Popover.Content>
  );
};
