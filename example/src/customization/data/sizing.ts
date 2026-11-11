export const CONTROL_SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
export const NATIVE_SIZE_SCALES = [
  { name: "Button", unit: "min height", values: [28, 36, 44, 48, 56] },
  { name: "Toggle button", unit: "height", values: [28, 36, 44, 48, 56] },
  { name: "Input", unit: "height", values: [32, 40, 48, 56, 64] },
  { name: "Textarea", unit: "type size", values: [13, 14, 16, 16, 18] },
  { name: "Select", unit: "type size", values: [13, 14, 16, 18, 18] },
  { name: "Chip", unit: "height", values: [20, 24, 28, 36, 44] },
  { name: "Badge", unit: "type size", values: [10, 11, 12, 14, 16] },
  { name: "Checkbox", unit: "box", values: [14, 16, 20, 24, 28] },
  { name: "Radio group", unit: "disc", values: [14, 16, 20, 24, 28] },
  { name: "Switch", unit: "track height", values: [20, 24, 28, 32, 36] },
  { name: "Tabs", unit: "type size", values: [12, 13, 14, 16, 18] },
] as const;
