import type { Textarea, View } from "@tarojs/components";
import type {
  AriaAttributes,
  ComponentProps,
  ReactElement,
  ReactNode,
} from "react";

import type { DialogActionTarget } from "../Dialog/types";

export interface FeedbackProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}
export interface FeedbackTriggerProps {
  children: ReactElement<DialogActionTarget>;
}
export interface FeedbackContentProps extends ComponentProps<typeof View> {
  dismissible?: boolean;
  blur?: boolean;
}
export type FeedbackPanelProps = ComponentProps<typeof View>;
export interface FeedbackCloseProps extends ComponentProps<typeof View> {
  label?: string;
  onPress?: () => void;
}
export interface FeedbackFieldProps
  extends Omit<ComponentProps<typeof Textarea>, "value">, AriaAttributes {
  value?: string;
  onChangeText?: (value: string) => void;
  minHeight?: number;
  editable?: boolean;
  autoFocus?: boolean;
  maxLength?: number;
  accessibilityLabel?: string;
}
export type FeedbackFooterProps = ComponentProps<typeof View>;
export interface FeedbackActionProps extends ComponentProps<typeof View> {
  labelClassName?: string;
  disabled?: boolean;
  onPress?: () => void;
}
export interface FeedbackSubmitProps extends FeedbackActionProps {
  onSubmit?: (value: string) => void;
}
export interface FeedbackContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  value: string;
  setValue: (value: string) => void;
  fieldValue: string | undefined;
  setFieldValue: (value: string | undefined) => void;
}
