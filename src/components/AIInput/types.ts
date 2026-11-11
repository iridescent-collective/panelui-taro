import type { View, Textarea } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { ObservableNumber } from "../../primitives/observable-number";
import type { AIInputSize } from "./growth";

export type AIInputViewProps = ComponentProps<typeof View> & {
  accessibilityHint?: string;
};
export type AIInputNativeFieldProps = ComponentProps<typeof Textarea> & {
  keyboardType?: string;
  maxLength?: number;
  autoFocus?: boolean;
  editable?: boolean;
  onChangeText?: (value: string) => void;
};
export type AIInputStatus = "ready" | "recording" | "submitted" | "streaming";
export interface AIInputProps extends Omit<AIInputViewProps, "children"> {
  children?: ReactNode;
  className?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  status?: AIInputStatus;
  onSubmit?: (value: string) => void;
  onStop?: () => void;
  onVoice?: () => void;
  onRecordCancel?: () => void;
  onRecordConfirm?: () => void;
  level?: number | ObservableNumber;
  size?: AIInputSize;
  disabled?: boolean;
  native?: boolean;
  minRows?: number;
  maxRows?: number;
  avoidKeyboard?: boolean;
  keyboardBottomInset?: number;
  keyboardGap?: number;
}
export interface AIInputFieldProps extends Omit<
  AIInputNativeFieldProps,
  "value"
> {
  className?: string;
}
export interface AIInputRowProps extends AIInputViewProps {
  className?: string;
}
export interface AIInputToolbarProps extends AIInputViewProps {
  className?: string;
}
export interface AIInputActionProps extends Omit<AIInputViewProps, "children"> {
  className?: string;
  label: string;
  icon: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  size?: AIInputSize;
  native?: boolean;
}
export interface AIInputPillProps extends Omit<AIInputViewProps, "children"> {
  className?: string;
  label: ReactNode;
  detail?: ReactNode;
  indicator?: ReactNode;
  indicatorSymbol?: string;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  size?: AIInputSize;
  native?: boolean;
}
export interface AIInputSubmitProps extends Omit<AIInputViewProps, "children"> {
  className?: string;
  sendLabel?: string;
  voiceLabel?: string;
  stopLabel?: string;
  native?: boolean;
}
export interface AIInputRecordingProps extends Omit<
  AIInputViewProps,
  "children"
> {
  className?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  native?: boolean;
}
export interface AIInputSheetScreenProps extends AIInputViewProps {
  className?: string;
  id: string;
  title?: ReactNode;
  trailing?: ReactNode;
}
export interface AIInputSheetProps {
  children?: ReactNode;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  initialScreen?: string;
  onScreenChange?: (id: string) => void;
  blur?: boolean;
  size?: "auto" | "half" | "full";
  detached?: boolean;
}
export interface AIInputSheetGroupProps extends AIInputViewProps {
  className?: string;
  footnote?: ReactNode;
}
export interface AIInputSheetRowProps extends Omit<
  AIInputViewProps,
  "children"
> {
  className?: string;
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  value?: ReactNode;
  to?: string;
  onPress?: () => void;
  disabled?: boolean;
}
export interface AIInputSheetToggleProps extends Omit<
  AIInputViewProps,
  "children"
> {
  className?: string;
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  value: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
}
export interface AIInputSheetChoiceProps extends Omit<
  AIInputViewProps,
  "children"
> {
  className?: string;
  label: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}
export interface AIInputVoiceModeProps extends Omit<
  AIInputViewProps,
  "children"
> {
  className?: string;
  children?: ReactNode;
  state?: "idle" | "listening" | "thinking" | "speaking";
  level?: number | ObservableNumber;
  title?: ReactNode;
  onMicPress?: () => void;
  micLabel?: string;
  onClose?: () => void;
  closeLabel?: string;
  size?: AIInputSize;
  native?: boolean;
}
