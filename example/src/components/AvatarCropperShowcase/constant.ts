import type { AvatarCropperSource } from "panelui-taro/avatar-cropper";

export const PORTRAIT: AvatarCropperSource = {
  uri: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1024&h=1024&q=80",
};
export const SHAPES = ["circle", "squircle", "square"] as const;
export const FILLS = {
  black: "#000000",
  theme: undefined,
  transparent: "transparent",
  white: "#ffffff",
} as const;
