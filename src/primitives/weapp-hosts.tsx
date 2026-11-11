import {
  Canvas as NativeCanvas,
  CoverImage as NativeCoverImage,
  CoverView as NativeCoverView,
  Image as NativeImage,
  Map as NativeMap,
  Picker as NativePicker,
  PickerView as NativePickerView,
  PickerViewColumn as NativePickerViewColumn,
  RootPortal as NativeRootPortal,
  ScrollView as NativeScrollView,
  Textarea as NativeTextarea,
} from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentProps, ComponentRef } from "react";

export const Map = forwardRef<
  ComponentRef<typeof NativeMap>,
  ComponentProps<typeof NativeMap>
>((props, ref) => <NativeMap {...props} ref={ref} />);
export const Picker = forwardRef<
  ComponentRef<typeof NativePicker>,
  ComponentProps<typeof NativePicker>
>((props, ref) => <NativePicker {...props} ref={ref} />);
export const PickerView = forwardRef<
  ComponentRef<typeof NativePickerView>,
  ComponentProps<typeof NativePickerView>
>((props, ref) => <NativePickerView {...props} ref={ref} />);
export const PickerViewColumn = forwardRef<
  ComponentRef<typeof NativePickerViewColumn>,
  ComponentProps<typeof NativePickerViewColumn>
>((props, ref) => <NativePickerViewColumn {...props} ref={ref} />);
export const CoverView = forwardRef<
  ComponentRef<typeof NativeCoverView>,
  ComponentProps<typeof NativeCoverView>
>((props, ref) => <NativeCoverView {...props} ref={ref} />);
export const CoverImage = forwardRef<
  ComponentRef<typeof NativeCoverImage>,
  ComponentProps<typeof NativeCoverImage>
>((props, ref) => <NativeCoverImage {...props} ref={ref} />);
export const ScrollView = forwardRef<
  ComponentRef<typeof NativeScrollView>,
  ComponentProps<typeof NativeScrollView>
>((props, ref) => <NativeScrollView {...props} ref={ref} />);
export const Image = forwardRef<
  ComponentRef<typeof NativeImage>,
  ComponentProps<typeof NativeImage>
>((props, ref) => <NativeImage {...props} ref={ref} />);
export const RootPortal = (props: ComponentProps<typeof NativeRootPortal>) => (
  <NativeRootPortal {...props} />
);

export const Textarea = forwardRef<
  ComponentRef<typeof NativeTextarea>,
  ComponentProps<typeof NativeTextarea>
>((props, ref) => <NativeTextarea {...props} ref={ref} />);

export const Canvas = forwardRef<ComponentRef<typeof NativeCanvas>, ComponentProps<typeof NativeCanvas>>((props, ref) => <NativeCanvas {...props} ref={ref} />);
