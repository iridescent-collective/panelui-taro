import {
  AlertTriangleIcon,
  CheckCircleIcon,
  CircleIcon,
  InfoIcon,
  XIcon,
} from "../../icons";
import type { ThemeToken } from "../../theme/types";
import type { AnimatedBadgeSize, AnimatedBadgeStatus } from "./types";

export const ROLL_OUT = 180;
export const ROLL_IN = { damping: 18, mass: 0.85, stiffness: 210 };
export const LAYOUT_SPRING = { damping: 22, mass: 1, stiffness: 100 };
export const ICON_SIZE: Record<AnimatedBadgeSize, number> = { md: 14, sm: 12 };
export const STATUS_ICON: Record<AnimatedBadgeStatus, typeof InfoIcon> = {
  danger: XIcon,
  info: InfoIcon,
  loading: CircleIcon,
  neutral: CircleIcon,
  success: CheckCircleIcon,
  warning: AlertTriangleIcon,
};
export const STATUS_COLOR: Record<AnimatedBadgeStatus, ThemeToken> = {
  danger: "destructive-foreground",
  info: "info-foreground",
  loading: "info-foreground",
  neutral: "muted-foreground",
  success: "success-foreground",
  warning: "warning-foreground",
};
export const isStatus = (value: unknown): value is AnimatedBadgeStatus =>
  typeof value === "string" &&
  Object.getOwnPropertyDescriptor(STATUS_ICON, value) !== undefined;
