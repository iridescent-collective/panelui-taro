import { ScrollView, View } from "@tarojs/components";
import { useMemo } from "react";

import { cn } from "../../lib/utils";
import { getRegisteredThemeTokens } from "../../theme/registry";
import type { ThemeToken } from "../../theme/types";
import { useTheme } from "../../theme/use-theme";
import { Text, textChildren } from "../primitives/Text";
import { CodeBlockContext } from "./context";
import { highlight } from "./highlight";
import type { Token, TokenKind } from "./highlight";
import {
  CodeBlockHeader,
  CodeBlockFilename,
  CodeBlockLanguage,
  CodeBlockActions,
  CodeBlockCopyButton,
} from "./parts";
import type { CodeBlockProps } from "./types";
import { codeBlockVariants } from "./variants";

export type {
  CodeBlockProps,
  CodeBlockHeaderProps,
  CodeBlockFilenameProps,
  CodeBlockLanguageProps,
  CodeBlockActionsProps,
  CodeBlockCopyButtonProps,
} from "./types";
export { resolveLanguage } from "./highlight";
export type { CodeLanguage, Token, TokenKind } from "./highlight";
const TOKEN_COLORS: Record<TokenKind, ThemeToken> = {
  comment: "code-comment",
  deleted: "code-deleted",
  function: "code-function",
  inserted: "code-inserted",
  keyword: "code-keyword",
  number: "code-number",
  plain: "foreground",
  property: "code-property",
  punctuation: "code-punctuation",
  string: "code-string",
};
const CodeLine = ({
  tokens,
  className,
}: {
  tokens: Token[];
  className: string;
}) => {
  const { theme } = useTheme();
  return (
    <Text className={cn("whitespace-pre", className)}>
      {tokens.length === 0 ? " " : null}
      {tokens.map((token, index) => (
        <Text
          key={`token-${index}`}
          className={className}
          style={{
            color: getRegisteredThemeTokens(theme)[TOKEN_COLORS[token.kind]],
            whiteSpace: "pre",
          }}
        >
          {token.text}
        </Text>
      ))}
    </Text>
  );
};
const CodeBlockRoot = ({
  className,
  code,
  language,
  showLineNumbers = false,
  children,
  ...props
}: CodeBlockProps) => {
  const slots = codeBlockVariants();
  const lines = useMemo(() => highlight(code, language), [code, language]);
  const context = useMemo(() => ({ code }), [code]);
  const gutterWidth = String(lines.length).length;
  return (
    <CodeBlockContext.Provider value={context}>
      <View
        {...props}
        className={cn("flex flex-col", slots.root({ className }))}
      >
        {textChildren(children)}
        <ScrollView scrollX enhanced bounces={false} showScrollbar={false}>
          <View
            className={slots.body({ className: "inline-block min-w-full" })}
          >
            {lines.map((tokens, index) => (
              <View key={`line-${index}`} className={slots.line()}>
                {showLineNumbers ? (
                  <Text
                    className={slots.gutter()}
                    style={{
                      flexShrink: 0,
                      width: `${(16 + gutterWidth * 7) * 2}rpx`,
                    }}
                  >
                    {index + 1}
                  </Text>
                ) : null}
                <CodeLine tokens={tokens} className={slots.code()} />
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </CodeBlockContext.Provider>
  );
};
export const CodeBlock = Object.assign(CodeBlockRoot, {
  Actions: CodeBlockActions,
  CopyButton: CodeBlockCopyButton,
  Filename: CodeBlockFilename,
  Header: CodeBlockHeader,
  Language: CodeBlockLanguage,
});
