import { Image, View } from "@tarojs/components";
import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useState,
} from "react";
import type { ComponentRef, ReactElement, ReactNode } from "react";

import { useDirection } from "../../hooks/use-direction";
import { cn } from "../../lib/utils";
import type { VariantProps } from "../../vendor/tailwind-variants/lite";
import { Text, textChildren } from "../primitives/Text";
import { avatarGroupCount, avatarGroupOverlap } from "./avatar-group";
import type { AvatarSizeName } from "./avatar-group";
import { avatarSourceIdentity } from "./avatar-source";
import { avatarImageUri } from "./image-source";
import type {
  AvatarImageSource as ImageSourcePropType,
  AvatarImageProps as ImageProps,
  AvatarViewProps as ViewProps,
} from "./types";
import { avatarVariants } from "./variants";

export interface AvatarProps
  extends ViewProps, VariantProps<typeof avatarVariants> {
  className?: string;

  source?: ImageSourcePropType;

  fallback?: string;
  fallbackContent?: ReactNode;
  showFallbackWhileLoading?: boolean;
  imageProps?: Omit<ImageProps, "source">;
}

const AvatarRoot = forwardRef<ComponentRef<typeof View>, AvatarProps>(
  (
    {
      className,
      size,
      source,
      fallback,
      fallbackContent,
      showFallbackWhileLoading,
      imageProps,
      children,
      ...props
    },
    ref
  ) => {
    const [failedSource, setFailedSource] = useState<string>();
    const [loadedSource, setLoadedSource] = useState<string>();
    const { root, image, fallback: fallbackSlot } = avatarVariants({ size });
    const sourceIdentity = avatarSourceIdentity(source);
    const showImage = !!source && failedSource !== sourceIdentity;

    const fallbackFace = fallbackContent ?? (
      <Text className={fallbackSlot()}>{fallback ?? "?"}</Text>
    );
    const waiting =
      !!showFallbackWhileLoading && loadedSource !== sourceIdentity;
    const face = showImage ? (
      <>
        <Image
          mode="aspectFill"
          {...imageProps}
          className={cn(
            imageProps?.className ?? image(),
            waiting && "absolute h-0 w-0 opacity-0"
          )}
          src={avatarImageUri(source, size ?? "md")}
          onLoad={(event) => {
            setLoadedSource(sourceIdentity);
            imageProps?.onLoad?.(event);
          }}
          onError={(event) => {
            setFailedSource(sourceIdentity);
            imageProps?.onError?.(event);
          }}
        />
        {waiting ? fallbackFace : null}
      </>
    ) : (
      fallbackFace
    );

    if (!children) {
      return (
        <View
          ref={ref}
          role="img"
          aria-role="image"
          className={root({ className: `relative flex ${className ?? ""}` })}
          {...props}
        >
          {face}
        </View>
      );
    }

    return (
      <View
        ref={ref}
        className={cn("relative self-start", className)}
        {...props}
      >
        <View
          role="img"
          aria-role="image"
          className={root({ className: "relative flex" })}
        >
          {face}
        </View>
        {textChildren(children)}
      </View>
    );
  }
);
AvatarRoot.displayName = "Avatar";

export interface AvatarBadgeProps extends ViewProps {
  className?: string;
  children?: ReactNode;
}

const AvatarBadge = forwardRef<ComponentRef<typeof View>, AvatarBadgeProps>(
  ({ className, children, ...props }, ref) => (
    <View
      ref={ref}
      className={cn(
        "absolute -end-[8px] -top-[8px] rounded-full border-[4px] border-solid border-[var(--panel-background)]",
        className
      )}
      {...props}
    >
      {textChildren(children)}
    </View>
  )
);
AvatarBadge.displayName = "Avatar.Badge";

export interface AvatarGroupProps extends ViewProps {
  className?: string;

  size?: AvatarSizeName;

  max?: number;

  total?: number;

  overlap?: number;
}

const AvatarGroup = forwardRef<ComponentRef<typeof View>, AvatarGroupProps>(
  (
    { className, size = "md", max, total, overlap, children, ...props },
    ref
  ) => {
    const faces = Children.toArray(children).filter(
      (child): child is ReactElement<AvatarProps> =>
        isValidElement<AvatarProps>(child)
    );
    const { visible, overflow } = avatarGroupCount(faces.length, max, total);
    const slide = avatarGroupOverlap(size, overlap);
    const direction = useDirection();

    const stack: { key: string; node: ReactNode }[] = [];

    for (let index = 0; index < visible; index += 1) {
      const face = faces[index];
      if (!face) {
        continue;
      }
      stack.push({
        key: String(face.key ?? index),
        node: cloneElement(face, {
          className: cn(
            "border-[4px] border-solid border-[var(--panel-background)]",
            face.props.className
          ),
          size: face.props.size ?? size,
        }),
      });
    }

    if (overflow > 0) {
      stack.push({
        key: "overflow",
        node: (
          <AvatarRoot
            size={size}
            fallback={`+${overflow}`}
            aria-label={`${overflow} more`}
            className="border-[4px] border-solid border-[var(--panel-background)]"
          />
        ),
      });
    }

    return (
      <View
        ref={ref}
        className={cn("flex flex-row self-start", className)}
        {...props}
        role="list"
        aria-role="list"
      >
        {stack.map((entry, index) => (
          <View
            key={entry.key}
            role="listitem"
            aria-role="listitem"
            style={{
              zIndex: stack.length - index,
              [direction === "rtl" ? "marginRight" : "marginLeft"]:
                index === 0 ? 0 : `${-slide * 2}rpx`,
            }}
          >
            {entry.node}
          </View>
        ))}
      </View>
    );
  }
);
AvatarGroup.displayName = "Avatar.Group";

export const Avatar = Object.assign(AvatarRoot, {
  Badge: AvatarBadge,
  Group: AvatarGroup,
});

export {
  AVATAR_GROUP_OVERLAP_RATIO,
  AVATAR_SIZE_POINTS,
  avatarGroupCount,
  avatarGroupOverlap,
  type AvatarGroupCount,
  type AvatarSizeName,
} from "./avatar-group";
