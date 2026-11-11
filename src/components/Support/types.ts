import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";
import type { VariantProps } from "../../vendor/tailwind-variants/lite";

import type { supportVariants } from "./variants";

type ViewProps = ComponentProps<typeof View>;
export type SupportAvailability = "online" | "away" | "offline";
export type SupportConversationStatus =
  | "open"
  | "pending"
  | "solved"
  | "closed";
export interface SupportContextValue {
  availability: SupportAvailability;
}
export interface TopicsContextValue {
  value: string | null;
  select: (value: string) => void;
}
export interface SupportProps extends ViewProps {
  className?: string;
  availability?: SupportAvailability;
  children?: ReactNode;
}
export interface SupportHeaderProps extends ViewProps {
  className?: string;
  title?: string;
  description?: string;
  children?: ReactNode;
}
export interface SupportStatusProps extends ViewProps {
  className?: string;
  availability?: SupportAvailability;
  replyTime?: string;
  children?: ReactNode;
}
export interface SupportGroupProps extends ViewProps {
  className?: string;
  title?: string;
  children?: ReactNode;
}
export interface SupportChannelProps extends Omit<ViewProps, "children"> {
  className?: string;
  icon?: ReactNode;
  label: string;
  description?: string;
  detail?: string;
  disabled?: boolean;
  onPress?: () => void;
}
export interface SupportTopicsProps extends ViewProps {
  className?: string;
  title?: string;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  children?: ReactNode;
}
export interface SupportTopicProps extends Omit<ViewProps, "children"> {
  className?: string;
  value: string;
  icon?: ReactNode;
  label: string;
  description?: string;
  disabled?: boolean;
  onPress?: () => void;
}
export interface SupportConversationProps extends Omit<ViewProps, "children"> {
  className?: string;
  title: string;
  preview?: string;
  status?: SupportConversationStatus;
  timestamp?: string;
  unread?: boolean;
  updated?: boolean;
  reference?: string;
  onPress?: () => void;
}
export interface SupportArticleProps extends Omit<ViewProps, "children"> {
  className?: string;
  icon?: ReactNode;
  title: string;
  collection?: string;
  onPress?: () => void;
}
export interface SupportAgentProps extends Omit<
  ViewProps,
  "children" | "role"
> {
  className?: string;
  avatar?: ReactNode;
  name: string;
  role?: string;
  availability?: SupportAvailability;
  typing?: boolean;
}
export interface SupportTicketProps extends Omit<ViewProps, "children"> {
  className?: string;
  reference?: string;
  subject?: string;
  status?: SupportConversationStatus;
}
export interface SupportHandoffProps extends ViewProps {
  className?: string;
  icon?: ReactNode;
  children?: ReactNode;
}
export interface SupportNoteProps extends ViewProps {
  className?: string;
  children?: ReactNode;
}
export interface SupportRepliesProps extends ViewProps {
  className?: string;
  children?: ReactNode;
}
export interface SupportReplyProps extends Omit<ViewProps, "children"> {
  className?: string;
  value?: string;
  label: string;
  disabled?: boolean;
  onPress?: (value: string) => void;
}
export interface SupportResolutionProps extends ViewProps {
  className?: string;
  title?: string;
  children?: ReactNode;
}
export type SupportVariants = VariantProps<typeof supportVariants>;
