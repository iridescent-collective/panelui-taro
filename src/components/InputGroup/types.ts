import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { InputProps } from "../Input/types";
import type { InputGroupMeasurements } from "./measurements";

export interface InputGroupProps extends ComponentProps<typeof View> {
  isDisabled?: boolean;
  children?: ReactNode;
}
export interface InputGroupDecoratorProps extends ComponentProps<typeof View> {
  isDecorative?: boolean;
  children?: ReactNode;
}
export type InputGroupInputProps = InputProps;
export interface InputGroupState extends InputGroupMeasurements {
  isDisabled: boolean;
}
