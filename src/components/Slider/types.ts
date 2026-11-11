export type SliderColor =
  | "primary"
  | "success"
  | "warning"
  | "destructive"
  | "info";
export type SliderSize = "sm" | "md" | "lg";
export interface SliderProps {
  className?: string;
  thumbSize?: number;
  thumbPlacement?: "inside" | "centered";
  value?: number;
  defaultValue?: number;
  range?: [number, number];
  defaultRange?: [number, number];
  min?: number;
  max?: number;
  step?: number;
  minStepsBetweenThumbs?: number;
  onValueChange?: (value: number) => void;
  onValueCommit?: (value: number) => void;
  onRangeChange?: (range: [number, number]) => void;
  onRangeCommit?: (range: [number, number]) => void;
  disabled?: boolean;
  native?: boolean;
  label?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  haptics?: boolean;
  color?: SliderColor;
  size?: SliderSize;
  headerClassName?: string;
  trackClassName?: string;
  fillClassName?: string;
  thumbClassName?: string;
  knobClassName?: string;
}
export type SliderThumb = "low" | "high";
