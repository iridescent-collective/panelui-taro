import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

export type TourShape = "rect" | "circle";
export type TourPlacement = "top" | "bottom" | "auto";
export interface TourLabels {
  next?: string;
  back?: string;
  done?: string;
  skip?: string;
  close?: string;
}
export interface TourProps {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  step?: number;
  defaultStep?: number;
  onStepChange?: (step: number) => void;
  onFinish?: () => void;
  onSkip?: () => void;
  padding?: number;
  radius?: number;
  shape?: TourShape;
  placement?: TourPlacement;
  dismissible?: boolean;
  showProgress?: boolean;
  showSkip?: boolean;
  interactive?: boolean;
  overlayColor?: string;
  labels?: TourLabels;
  cardClassName?: string;
}
export interface TourStepProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  order: number;
  title?: string;
  description?: string;
  shape?: TourShape;
  padding?: number;
  radius?: number;
  placement?: TourPlacement;
  children?: ReactNode;
}
export interface TourRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface TourStepEntry {
  order: number;
  title?: string;
  description?: string;
  shape?: TourShape;
  padding?: number;
  radius?: number;
  placement?: TourPlacement;
  measure: (done: (rect: TourRect | null) => void) => void;
}
export interface TourOverlayProps {
  active: TourStepEntry | undefined;
  index: number;
  total: number;
  isFirst: boolean;
  isLast: boolean;
  padding: number;
  radius: number;
  shape: TourShape;
  placement: TourPlacement;
  dismissible: boolean;
  showProgress: boolean;
  showSkip: boolean;
  interactive: boolean;
  overlayColor: string;
  words: Required<TourLabels>;
  cardClassName?: string;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}
