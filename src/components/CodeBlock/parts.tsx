import { View } from "@tarojs/components";

import { useCopyToClipboard } from "../../hooks/use-copy-to-clipboard";
import { CheckIcon, CopyIcon } from "../../icons";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { useThemeToken } from "../../theme/use-theme";
import { Text, textChildren } from "../primitives/Text";
import { useCodeBlock } from "./context";
import type {
  CodeBlockHeaderProps,
  CodeBlockFilenameProps,
  CodeBlockLanguageProps,
  CodeBlockActionsProps,
  CodeBlockCopyButtonProps,
} from "./types";
import { codeBlockVariants } from "./variants";

export const CodeBlockHeader = ({
  className,
  children,
  ...props
}: CodeBlockHeaderProps) => (
  <View {...props} className={codeBlockVariants().header({ className })}>
    {textChildren(children)}
  </View>
);
export const CodeBlockFilename = ({
  className,
  children,
  ...props
}: CodeBlockFilenameProps) => (
  <Text
    numberOfLines={1}
    className={codeBlockVariants().filename({ className })}
    {...props}
  >
    {children}
  </Text>
);
export const CodeBlockLanguage = ({
  className,
  children,
  ...props
}: CodeBlockLanguageProps) => (
  <Text className={codeBlockVariants().language({ className })} {...props}>
    {children}
  </Text>
);
export const CodeBlockActions = ({
  className,
  children,
  ...props
}: CodeBlockActionsProps) => (
  <View {...props} className={codeBlockVariants().actions({ className })}>
    {textChildren(children)}
  </View>
);
export const CodeBlockCopyButton = ({
  className,
  timeout = 2000,
  onCopy,
}: CodeBlockCopyButtonProps) => {
  const { code } = useCodeBlock("CodeBlock.CopyButton");
  const { copy, copied } = useCopyToClipboard({ onCopy, timeout });
  const tick = useThemeToken("success");
  const idle = useThemeToken("muted-foreground");
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={copied ? "Copied" : "Copy code"}
      accessibilityState={{ selected: copied }}
      hitSlop={6}
      className={cn("flex flex-col", codeBlockVariants().action({ className }))}
      onPress={async () => {
        try {
          await copy(code);
          return true;
        } catch {
          return false;
        }
      }}
    >
      {copied ? (
        <CheckIcon size={14} color={tick} />
      ) : (
        <CopyIcon size={14} color={idle} />
      )}
    </AnimatedPressable>
  );
};
