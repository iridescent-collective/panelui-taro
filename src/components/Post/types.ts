import type { View } from "@tarojs/components";
import type { ComponentProps, ComponentType, ReactNode } from "react";

import type { IconProps } from "../../icons";
import type { AnimatedPressableProps as PostPressableProps } from "../../primitives/animated-pressable";
import type { AvatarImageSource } from "../Avatar/types";

export type PostViewProps = ComponentProps<typeof View>;

export type PostVariant = "feed" | "vote" | "compact" | "media";
export interface PostProps extends Omit<PostViewProps, "children"> {
  className?: string;
  variant?: PostVariant;
  size?: "default" | "sm";
  onPress?: PostPressableProps["onPress"];
  children?: ReactNode;
}
export interface PostHeaderProps extends PostViewProps {
  className?: string;
  children?: ReactNode;
}
export interface PostAuthorProps extends Omit<PostViewProps, "children"> {
  className?: string;
  name: string;
  handle?: string;
  avatar?: AvatarImageSource;
  fallback?: string;
  verified?: boolean;
  timestamp?: ReactNode;
  children?: ReactNode;
}
export interface PostActionProps extends PostViewProps {
  className?: string;
  children?: ReactNode;
}
export interface PostCommunityProps extends Omit<PostViewProps, "children"> {
  className?: string;
  name: string;
  avatar?: AvatarImageSource;
  meta?: ReactNode;
  children?: ReactNode;
}
export interface PostTitleProps extends PostViewProps {
  className?: string;
  children?: ReactNode;
}
export interface PostBodyProps extends Omit<PostViewProps, "children"> {
  className?: string;
  numberOfLines?: number;
  onTagPress?: (tag: string) => void;
  onMentionPress?: (handle: string) => void;
  children?: ReactNode;
}
export interface PostMediaProps extends Omit<PostViewProps, "children"> {
  className?: string;
  source: AvatarImageSource;
  aspectRatio?: number;
  scrim?: "none" | "top" | "bottom" | "both";
  overlay?: ReactNode;
  alt?: string;
  onPress?: PostPressableProps["onPress"];
  children?: ReactNode;
}
export interface PostFooterProps extends PostViewProps {
  className?: string;
  children?: ReactNode;
}
export interface PostStatProps extends Omit<
  PostPressableProps,
  "children" | "style"
> {
  className?: string;
  icon?: ComponentType<
    IconProps & {
      filled?: boolean;
    }
  >;
  value?: ReactNode;
  active?: boolean;
  tone?: "default" | "like" | "save" | "repost";
  align?: "start" | "end";
  children?: ReactNode;
}
export type PostVote = "up" | "down" | null;
export interface PostVotesProps extends Omit<PostViewProps, "children"> {
  className?: string;
  score: number | string;
  vote?: PostVote;
  onVote?: (vote: PostVote) => void;
  orientation?: "horizontal" | "vertical";
  disabled?: boolean;
}
