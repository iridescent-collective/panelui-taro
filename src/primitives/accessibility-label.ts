export interface AccessibilityLabelProps {
  accessibilityLabel?: string;
  "aria-label"?: string;
  ariaLabel?: string;
}

export const resolveAccessibilityLabel = (props: AccessibilityLabelProps) =>
  props.accessibilityLabel ?? props["aria-label"] ?? props.ariaLabel;
