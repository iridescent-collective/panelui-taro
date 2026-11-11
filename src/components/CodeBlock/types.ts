import type { View } from "@tarojs/components";
import type { ComponentProps } from "react";

import type { TextProps } from "../primitives/Text";

export interface CodeBlockProps extends ComponentProps<typeof View> {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}
export type CodeBlockHeaderProps = ComponentProps<typeof View>;
export type CodeBlockFilenameProps = TextProps;
export type CodeBlockLanguageProps = TextProps;
export type CodeBlockActionsProps = ComponentProps<typeof View>;
export interface CodeBlockCopyButtonProps {
  className?: string;
  timeout?: number;
  onCopy?: () => void;
}
