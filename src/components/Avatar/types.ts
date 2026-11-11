import type { Image, View } from "@tarojs/components";
import type { ComponentProps } from "react";

export type AvatarImageSource =
  | string
  | { uri: string; width?: number; height?: number; scale?: number }
  | readonly { uri: string; width?: number; height?: number; scale?: number }[];
export type AvatarImageProps = Omit<ComponentProps<typeof Image>, "src">;
export type AvatarViewProps = ComponentProps<typeof View>;
