import { ColorPickerArea } from "./area";
import { ColorPickerContent, ColorPickerTrigger } from "./presentation";
import {
  ColorPickerChannelReadout,
  ColorPickerField,
  ColorPickerPreview,
} from "./readouts";
import { ColorPickerRoot } from "./root";
import { ColorPickerSwatches } from "./swatches";
import {
  ColorPickerAlpha,
  ColorPickerBrightness,
  ColorPickerHue,
} from "./tracks";
import { ColorPickerWheel } from "./wheel";

export type {
  ColorPickerProps,
  ColorPickerSize,
  ColorPickerPresentation,
  ColorPickerTriggerProps,
  ColorPickerContentProps,
  ColorPickerFieldProps,
  ColorPickerAreaProps,
  ColorPickerWheelProps,
  ColorPickerChannel,
  ColorPickerChannelProps,
  ColorPickerHueProps,
  ColorPickerBrightnessProps,
  ColorPickerAlphaProps,
  ColorPickerPreviewProps,
  ColorPickerSwatchesProps,
} from "./types";
export const ColorPicker = Object.assign(ColorPickerRoot, {
  Alpha: ColorPickerAlpha,
  Area: ColorPickerArea,
  Brightness: ColorPickerBrightness,
  Channel: ColorPickerChannelReadout,
  Content: ColorPickerContent,
  Field: ColorPickerField,
  Hue: ColorPickerHue,
  Preview: ColorPickerPreview,
  Swatches: ColorPickerSwatches,
  Trigger: ColorPickerTrigger,
  Wheel: ColorPickerWheel,
});
