import { Image, View } from "@tarojs/components";
import { createContext, forwardRef, useContext, useMemo } from "react";
import type { ComponentRef, ReactNode } from "react";

import { BadgeCheckIcon } from "../../icons";
import { selectionTick } from "../../lib/haptics";
import { cn } from "../../lib/utils";
import {
  AnimatedPressable,
  AnimatedPressable as Pressable,
} from "../../primitives/animated-pressable";
import { Avatar } from "../Avatar";
import { Text, textChildren } from "../primitives/Text";
import { usePostPop, usePostToken } from "./motion";
import { PostCount, VoteArrow } from "./motion-parts";
import { imageUri } from "./source";
import type {
  PostVariant,
  PostProps,
  PostHeaderProps,
  PostAuthorProps,
  PostActionProps,
  PostCommunityProps,
  PostTitleProps,
  PostBodyProps,
  PostMediaProps,
  PostFooterProps,
  PostStatProps,
  PostVotesProps,
} from "./types";
import { isType, initials, tokenize, statTone, SCRIM_COLOURS } from "./utils";
import { postVariants } from "./variants";

export const PostContext = createContext<{
  variant: PostVariant;
  size: "default" | "sm";
}>({
  size: "default",
  variant: "feed",
});
const usePost = () => useContext(PostContext);
export const PostRoot = forwardRef<ComponentRef<typeof View>, PostProps>(
  (
    {
      className,
      variant = "feed",
      size = "default",
      onPress,
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    const { root } = postVariants({ size, variant });
    const context = useMemo(() => ({ size, variant }), [variant, size]);
    const body = (
      <PostContext.Provider value={context}>{children}</PostContext.Provider>
    );
    if (!onPress && !onClick) {
      return (
        <View ref={ref} {...props} className={root({ className })}>
          {body}
        </View>
      );
    }
    return (
      <AnimatedPressable
        ref={ref}
        {...props}
        accessibilityRole="link"
        onClick={onClick ?? onPress}
        className={root({ className })}
      >
        {body}
      </AnimatedPressable>
    );
  }
);
PostRoot.displayName = "Post";
export const PostAction = forwardRef<
  ComponentRef<typeof View>,
  PostActionProps
>(({ className, children, ...props }, ref) => {
  const { variant, size } = usePost();
  const { action } = postVariants({ size, variant });
  return (
    <View ref={ref} className={action({ className })} {...props}>
      {children}
    </View>
  );
});
PostAction.displayName = "Post.Action";
export const PostHeader = forwardRef<
  ComponentRef<typeof View>,
  PostHeaderProps
>(({ className, children, ...props }, ref) => {
  const { variant, size } = usePost();
  const { header } = postVariants({ size, variant });
  const content: ReactNode[] = [];
  const actions: ReactNode[] = [];
  for (const child of Array.isArray(children) ? children : [children]) {
    if (isType(child, PostAction)) {
      actions.push(child);
    } else {
      content.push(child);
    }
  }
  return (
    <View ref={ref} className={header({ className })} {...props}>
      {content}
      {actions}
    </View>
  );
});
PostHeader.displayName = "Post.Header";
export const PostAuthor = forwardRef<
  ComponentRef<typeof View>,
  PostAuthorProps
>(
  (
    {
      className,
      name,
      handle,
      avatar,
      fallback,
      verified,
      timestamp,
      children,
      ...props
    },
    ref
  ) => {
    const { variant, size } = usePost();
    const {
      author,
      authorLine,
      name: nameSlot,
      handle: handleSlot,
      meta,
    } = postVariants({
      size,
      variant,
    });
    const verifiedColor = usePostToken("--color-primary");
    const onVerified = usePostToken("--color-primary-foreground");
    const inline = variant === "compact";
    const overlaid = variant === "media";
    return (
      <View
        ref={ref}
        className="flex min-w-0 flex-1 flex-row items-start gap-[20px]"
        {...props}
      >
        <Avatar
          size={variant === "compact" ? "sm" : "md"}
          source={avatar}
          fallback={fallback ?? initials(name)}
          className={overlaid ? "border-white/30" : undefined}
        />
        <View className={author({ className })}>
          <View className={authorLine({ className: "h-[48px]" })}>
            <Text
              numberOfLines={1}
              className={nameSlot({
                className: cn("shrink", overlaid && "text-white"),
              })}
            >
              {name}
            </Text>
            {verified ? (
              <BadgeCheckIcon
                size={15}
                color={
                  typeof verifiedColor === "string" ? verifiedColor : "#2563eb"
                }
                checkColor={
                  typeof onVerified === "string" ? onVerified : "#ffffff"
                }
              />
            ) : null}
            {inline && handle ? (
              <Text
                size="sm"
                numberOfLines={1}
                className={handleSlot({ className: "shrink" })}
              >
                {handle}
              </Text>
            ) : null}
            {inline && timestamp !== undefined ? (
              <>
                <Text
                  size="sm"
                  numberOfLines={1}
                  className={handleSlot({ className: "shrink-0" })}
                >
                  ·
                </Text>
                {textChildren(timestamp, (text) => (
                  <Text
                    size="sm"
                    numberOfLines={1}
                    className={handleSlot({ className: "shrink-0" })}
                  >
                    {text}
                  </Text>
                ))}
              </>
            ) : null}
          </View>

          {!inline && (handle || timestamp !== undefined) ? (
            <Text
              numberOfLines={1}
              className={meta({
                className: overlaid ? "text-white/80" : undefined,
              })}
            >
              {[handle, typeof timestamp === "string" ? timestamp : undefined]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          ) : null}
          {!inline && timestamp !== undefined && typeof timestamp !== "string"
            ? timestamp
            : null}
          {children}
        </View>
      </View>
    );
  }
);
PostAuthor.displayName = "Post.Author";

export const PostCommunity = forwardRef<
  ComponentRef<typeof View>,
  PostCommunityProps
>(({ className, name, avatar, meta, children, ...props }, ref) => {
  const { variant, size } = usePost();
  const { community, communityName, communityMeta } = postVariants({
    size,
    variant,
  });
  return (
    <View ref={ref} className={community({ className })} {...props}>
      <Avatar
        size="sm"
        source={avatar}
        fallback={name
          .replace(/^[^a-z0-9]*/iu, "")
          .slice(0, 1)
          .toUpperCase()}
        className="h-[48px] w-[48px]"
      />
      <Text
        numberOfLines={1}
        className={communityName({ className: "shrink" })}
      >
        {name}
      </Text>
      {meta === undefined ? null : (
        <>
          <Text className={communityMeta()}>·</Text>
          {textChildren(meta, (text) => (
            <Text className={communityMeta()}>{text}</Text>
          ))}
        </>
      )}
      {children}
    </View>
  );
});
PostCommunity.displayName = "Post.Community";
export const PostTitle = forwardRef<ComponentRef<typeof View>, PostTitleProps>(
  ({ className, children, ...props }, ref) => {
    const { variant, size } = usePost();
    const { title } = postVariants({ size, variant });
    return (
      <View
        ref={ref}
        className={cn("flex flex-col px-[32px] pb-[16px]", className)}
        {...props}
      >
        {textChildren(children, (text) => (
          <Text className={title()}>{text}</Text>
        ))}
      </View>
    );
  }
);
PostTitle.displayName = "Post.Title";
export const PostBody = forwardRef<ComponentRef<typeof View>, PostBodyProps>(
  (
    {
      className,
      numberOfLines,
      onTagPress,
      onMentionPress,
      children,
      ...props
    },
    ref
  ) => {
    const { variant, size } = usePost();
    const { body } = postVariants({ size, variant });
    if (typeof children !== "string") {
      return (
        <View ref={ref} className={cn(body(), className)} {...props}>
          {children}
        </View>
      );
    }
    return (
      <View ref={ref} className={cn(body({ className }))} {...props}>
        <Text
          numberOfLines={numberOfLines}
          className={body({ className: "p-0" })}
        >
          {tokenize(children).map((token, index) =>
            token.kind === "text" ? (
              token.value
            ) : (
              <Text
                key={index}
                className="text-[color:var(--panel-primary)]"
                onPress={
                  token.kind === "tag"
                    ? onTagPress &&
                      ((event) => {
                        event.stopPropagation();
                        onTagPress(token.value.slice(1));
                      })
                    : onMentionPress &&
                      ((event) => {
                        event.stopPropagation();
                        onMentionPress(token.value.slice(1));
                      })
                }
              >
                {token.value}
              </Text>
            )
          )}
        </Text>
      </View>
    );
  }
);
PostBody.displayName = "Post.Body";
export const PostMedia = forwardRef<ComponentRef<typeof View>, PostMediaProps>(
  (
    {
      className,
      source,
      aspectRatio = 16 / 10,
      scrim,
      overlay,
      alt,
      onPress,
      children,
      ...props
    },
    ref
  ) => {
    const { variant, size } = usePost();
    const { media } = postVariants({ size, variant });
    const shade = scrim ?? (variant === "media" ? "top" : "none");
    const picture = (
      <>
        <Image
          src={imageUri(source)}
          mode="aspectFill"
          aria-hidden={!alt}
          aria-label={alt}
          aria-role={alt ? "image" : undefined}
          className="h-full w-full"
        />
        {shade === "top" || shade === "both" ? (
          <View
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[224px]"
            style={{
              background: `linear-gradient(to bottom, ${SCRIM_COLOURS.join(",")})`,
            }}
          />
        ) : null}
        {shade === "bottom" || shade === "both" ? (
          <View
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[256px]"
            style={{
              background: `linear-gradient(to top, ${SCRIM_COLOURS.join(",")})`,
            }}
          />
        ) : null}
        {overlay ? <View className="absolute inset-0">{overlay}</View> : null}
        {children}
      </>
    );
    if (!onPress) {
      return (
        <View
          ref={ref}
          {...props}
          className={media({ className })}
          style={{ aspectRatio }}
        >
          {picture}
        </View>
      );
    }
    return (
      <Pressable
        pressScale={1}
        pressOpacity={1}
        ref={ref}
        {...props}
        accessibilityRole="button"
        aria-label={alt}
        onClick={(event) => {
          event.stopPropagation();
          onPress?.(event);
        }}
        className={media({ className })}
        style={{ aspectRatio }}
      >
        {picture}
      </Pressable>
    );
  }
);
PostMedia.displayName = "Post.Media";
export const PostFooter = forwardRef<
  ComponentRef<typeof View>,
  PostFooterProps
>(({ className, children, ...props }, ref) => {
  const { variant, size } = usePost();
  const { footer } = postVariants({ size, variant });
  return (
    <View ref={ref} className={footer({ className })} {...props}>
      {children}
    </View>
  );
});
PostFooter.displayName = "Post.Footer";
export const PostStat = forwardRef<ComponentRef<typeof View>, PostStatProps>(
  (
    {
      className,
      icon: Icon,
      value,
      active = false,
      tone = "default",
      align = "start",
      onPress,
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    const { variant, size } = usePost();
    const { stat, statLabel } = postVariants({ size, variant });
    const litColor = usePostToken(statTone[tone]);
    const restColor = usePostToken("--color-muted-foreground");

    const pop = usePostPop(active, 90, 1, active ? 1.25 : 0.85, 1);
    const iconStyle = { transform: `scale(${pop})` };
    const colour = active ? litColor : restColor;
    const inner = (
      <>
        {Icon ? (
          <View style={iconStyle}>
            <Icon
              size={variant === "compact" ? 15 : 17}
              color={colour}
              filled={active}
            />
          </View>
        ) : null}
        {value === undefined ? null : (
          <PostCount
            value={value}
            className={statLabel({ className: active ? "" : undefined })}
            color={active ? colour : undefined}
          />
        )}
        {children}
      </>
    );
    const classes = stat({
      className: cn(align === "end" && "ms-auto", className),
    });
    if (!onPress && !onClick) {
      return (
        <View ref={ref} {...props} className={classes}>
          {inner}
        </View>
      );
    }
    return (
      <Pressable
        pressScale={1}
        pressOpacity={1}
        ref={ref}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        hitSlop={10}
        onClick={(event) => {
          event.stopPropagation();
          void selectionTick();
          (onClick ?? onPress)?.(event);
        }}
        className={classes}
        {...props}
      >
        {inner}
      </Pressable>
    );
  }
);
PostStat.displayName = "Post.Stat";
export const PostVotes = forwardRef<ComponentRef<typeof View>, PostVotesProps>(
  (
    {
      className,
      score,
      vote = null,
      onVote,
      orientation = "horizontal",
      disabled = false,
      ...props
    },
    ref
  ) => {
    const { variant, size } = usePost();
    const { votes, voteButton, voteScore } = postVariants({ size, variant });
    const upColor = usePostToken("--color-success");
    const downColor = usePostToken("--color-destructive");
    const restColor = usePostToken("--color-muted-foreground");
    const up = typeof upColor === "string" ? upColor : "#16a34a";
    const down = typeof downColor === "string" ? downColor : "#dc2626";
    const rest = typeof restColor === "string" ? restColor : "#737373";
    const cast = (next: "up" | "down") => {
      selectionTick();
      onVote?.(vote === next ? null : next);
    };
    let scoreColour: string | undefined;
    if (vote === "up") {
      scoreColour = up;
    } else if (vote === "down") {
      scoreColour = down;
    }
    return (
      <View
        ref={ref}
        role="group"
        aria-role="group"
        aria-label="Score"
        aria-valuetext={String(score)}
        className={votes({
          className: cn(
            orientation === "vertical" && "flex flex-col gap-0",
            vote === "up" && "bg-[var(--panel-success-opacity-12)]",
            vote === "down" && "bg-[var(--panel-destructive-opacity-12)]",
            className
          ),
        })}
        {...props}
      >
        <VoteArrow
          direction="up"
          active={vote === "up"}
          color={vote === "up" ? up : rest}
          disabled={disabled}
          className={voteButton()}
          onPress={() => cast("up")}
        />
        <PostCount
          value={score}
          className={voteScore({ className: "min-w-[48px] text-center" })}
          color={scoreColour}
        />
        <VoteArrow
          direction="down"
          active={vote === "down"}
          color={vote === "down" ? down : rest}
          disabled={disabled}
          className={voteButton()}
          onPress={() => cast("down")}
        />
      </View>
    );
  }
);
PostVotes.displayName = "Post.Votes";
