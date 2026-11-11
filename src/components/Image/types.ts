import type { Image } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

export interface ImageProps extends Omit<
  ComponentProps<typeof Image>,
  "src" | "children" | "placeholder"
> {
  source: string;
  containerClassName?: string;
  placeholder?: ReactNode;
  errorLabel?: string;
  retryLabel?: string;
  renderFallback?: (retry: () => void) => ReactNode;
  onRetry?: () => void;
}
