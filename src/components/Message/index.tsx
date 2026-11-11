import { View } from "@tarojs/components";
import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
} from "react";
import type { ReactNode, ComponentProps, ComponentRef } from "react";
import type { VariantProps } from "../../vendor/tailwind-variants/lite";

import { IconColorProvider } from "../../icons";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { useThemeToken } from "../../theme/use-theme";
import { Text, textChildren } from "../primitives/Text";
import type { TextProps } from "../primitives/Text";
import { messageVariants } from "./variants";

type ViewProps = ComponentProps<typeof View>;
type GestureResponderEvent = Parameters<
  NonNullable<ViewProps["onLongPress"]>
>[0];
type Align = "start" | "end";
interface MessageContextValue {
  align: Align;
  stacked: boolean;
}
const MessageContext = createContext<MessageContextValue>({
  align: "start",
  stacked: false,
});
const useMessageContext = () => useContext(MessageContext);
const GroupContext = createContext<{
  align: Align;
} | null>(null);
export interface MessageProps
  extends ViewProps, VariantProps<typeof messageVariants> {
  className?: string;
  align?: Align;
  stacked?: boolean;
  onLongPress?: (event: GestureResponderEvent) => void;
  children?: ReactNode;
}
const MessageRoot = forwardRef<ComponentRef<typeof View>, MessageProps>(
  (
    { className, align, stacked = false, onLongPress, children, ...props },
    ref
  ) => {
    const group = useContext(GroupContext);
    const resolvedAlign = align ?? group?.align ?? "start";
    const { root } = messageVariants({ align: resolvedAlign });
    const body = onLongPress ? (
      <AnimatedPressable
        ref={ref}
        onLongPress={onLongPress}
        className={root({ className })}
        {...props}
      >
        {textChildren(children)}
      </AnimatedPressable>
    ) : (
      <View ref={ref} className={root({ className })} {...props}>
        {textChildren(children)}
      </View>
    );
    return (
      <MessageContext.Provider value={{ align: resolvedAlign, stacked }}>
        {body}
      </MessageContext.Provider>
    );
  }
);
MessageRoot.displayName = "Message";
export interface MessageGroupProps extends ViewProps {
  className?: string;
  align?: Align;
  children?: ReactNode;
}
const MessageGroup = forwardRef<ComponentRef<typeof View>, MessageGroupProps>(
  ({ className, align = "start", children, ...props }, ref) => {
    const { group } = messageVariants({ align });
    const stackedChildren = Children.map(children, (child, index) =>
      isValidElement<MessageProps>(child) && child.props.stacked === undefined
        ? cloneElement(child, { stacked: index > 0 })
        : child
    );
    return (
      <GroupContext.Provider value={{ align }}>
        <View
          ref={ref}
          className={group({ className: cn("flex flex-col", className) })}
          {...props}
        >
          {stackedChildren}
        </View>
      </GroupContext.Provider>
    );
  }
);
MessageGroup.displayName = "Message.Group";
export interface MessageAvatarProps extends ViewProps {
  className?: string;
  children?: ReactNode;
}
const MessageAvatar = forwardRef<ComponentRef<typeof View>, MessageAvatarProps>(
  ({ className, children, ...props }, ref) => {
    const { stacked } = useMessageContext();
    const { avatar } = messageVariants();
    return (
      <View
        ref={ref}
        aria-hidden={stacked}
        className={avatar({ className })}
        {...props}
      >
        {stacked ? (
          <View className="opacity-0">{textChildren(children)}</View>
        ) : (
          children
        )}
      </View>
    );
  }
);
MessageAvatar.displayName = "Message.Avatar";
export interface MessageContentProps extends ViewProps {
  className?: string;
  children?: ReactNode;
}
const MessageContent = forwardRef<
  ComponentRef<typeof View>,
  MessageContentProps
>(({ className, children, ...props }, ref) => {
  const { align } = useMessageContext();
  const { content } = messageVariants({ align });
  return (
    <View
      ref={ref}
      className={content({ className: cn("flex min-w-0 flex-col", className) })}
      {...props}
    >
      {textChildren(children)}
    </View>
  );
});
MessageContent.displayName = "Message.Content";
export interface MessageHeaderProps extends TextProps {
  className?: string;
}
const MessageHeader = forwardRef<
  React.ElementRef<typeof Text>,
  MessageHeaderProps
>(({ className, ...props }, ref) => {
  const { align } = useMessageContext();
  const { header } = messageVariants({ align });
  return (
    <Text ref={ref} size="xs" className={header({ className })} {...props} />
  );
});
MessageHeader.displayName = "Message.Header";
export interface MessageBubbleProps extends ViewProps {
  className?: string;
  children?: ReactNode;
}
const MessageBubble = forwardRef<ComponentRef<typeof View>, MessageBubbleProps>(
  ({ className, children, ...props }, ref) => {
    const { align } = useMessageContext();
    const { bubble } = messageVariants({ align });
    const foreground = useThemeToken(
      align === "end" ? "primary-foreground" : "foreground"
    );
    return (
      <View ref={ref} className={bubble({ className })} {...props}>
        <IconColorProvider
          color={typeof foreground === "string" ? foreground : undefined}
        >
          {textChildren(children)}
        </IconColorProvider>
      </View>
    );
  }
);
MessageBubble.displayName = "Message.Bubble";
export interface MessageBubbleContentProps extends TextProps {
  className?: string;
}
const MessageBubbleContent = forwardRef<
  React.ElementRef<typeof Text>,
  MessageBubbleContentProps
>(({ className, ...props }, ref) => {
  const { align } = useMessageContext();
  const { bubbleContent } = messageVariants({ align });
  return <Text ref={ref} className={bubbleContent({ className })} {...props} />;
});
MessageBubbleContent.displayName = "Message.BubbleContent";
export interface MessageFooterProps extends TextProps {
  className?: string;
}
const MessageFooter = forwardRef<
  React.ElementRef<typeof Text>,
  MessageFooterProps
>(({ className, ...props }, ref) => {
  const { align } = useMessageContext();
  const { footer } = messageVariants({ align });
  return (
    <Text ref={ref} size="xs" className={footer({ className })} {...props} />
  );
});
MessageFooter.displayName = "Message.Footer";
export interface MessageActionsProps extends ViewProps {
  className?: string;
  children?: ReactNode;
}
const MessageActions = forwardRef<
  ComponentRef<typeof View>,
  MessageActionsProps
>(({ className, children, ...props }, ref) => {
  const { align } = useMessageContext();
  return (
    <View
      ref={ref}
      className={cn(
        "flex flex-row items-center gap-[8px]",
        align === "end" && "flex-row-reverse",
        className
      )}
      {...props}
    >
      {textChildren(children)}
    </View>
  );
});
MessageActions.displayName = "Message.Actions";
export const Message = Object.assign(MessageRoot, {
  Actions: MessageActions,
  Avatar: MessageAvatar,
  Bubble: MessageBubble,
  BubbleContent: MessageBubbleContent,
  Content: MessageContent,
  Footer: MessageFooter,
  Group: MessageGroup,
  Header: MessageHeader,
});
