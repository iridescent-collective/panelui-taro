export type RatingSize = "sm" | "md" | "lg";
export type RatingColor =
  | "warning"
  | "primary"
  | "success"
  | "destructive"
  | "info"
  | "foreground";
export interface RatingProps {
  id?: string;
  className?: string;
  value?: number;
  defaultValue?: number;
  max?: number;
  precision?: number;
  onValueChange?: (value: number) => void;
  onValueCommit?: (value: number) => void;
  readOnly?: boolean;
  disabled?: boolean;
  allowClear?: boolean;
  color?: RatingColor;
  size?: RatingSize;
  label?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  haptics?: boolean;
  headerClassName?: string;
  rowClassName?: string;
}
