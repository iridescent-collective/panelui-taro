import { View } from "@tarojs/components";
import { memo, useMemo } from "react";
import type { ComponentType, ReactNode, ComponentProps } from "react";

import { cn } from "../../lib/utils";
import { CodeBlock } from "../CodeBlock";
import { Text } from "../primitives/Text";
import { Table } from "../Table";
import { Typography } from "../Typography";
import { parseMarkdown } from "./markdown";
import type { Align, Block, InlineToken } from "./markdown";

export type {
  Block as ResponseBlock,
  InlineToken as ResponseInline,
} from "./markdown";
const HEADING_TYPE = ["h2", "h3", "h4", "h4", "h4", "h4"] as const;
const DEFAULT_LINK_PREFIXES = ["https://", "http://", "mailto:", "tel:"];
type ViewProps = ComponentProps<typeof View>;
export interface ResponseComponents {
  code?: ComponentType<{
    code: string;
    language?: string;
    streaming: boolean;
  }>;
  image?: ComponentType<{
    src: string;
    alt: string;
  }>;
}
export interface ResponseProps extends Omit<ViewProps, "children"> {
  className?: string;
  children?: string;
  isStreaming?: boolean;
  parseIncompleteMarkdown?: boolean;
  onLinkPress?: (href: string) => void;
  allowedLinkPrefixes?: string[];
  components?: ResponseComponents;
  showLineNumbers?: boolean;
}
interface RenderContext {
  streaming: boolean;
  onLinkPress?: (href: string) => void;
  allowedLinkPrefixes: string[];
  components?: ResponseComponents;
  showLineNumbers: boolean;
}
const ALIGNMENT: Record<Align, "start" | "center" | "end"> = {
  center: "center",
  left: "start",
  right: "end",
};
const marks = (token: InlineToken): string =>
  cn(
    token.bold && "font-semibold",
    token.italic && "italic",
    token.strike && "line-through"
  );
const spans = (tokens: InlineToken[], context: RenderContext): ReactNode =>
  tokens.map((token, index) => {
    if (token.kind === "image") {
      const Custom = context.components?.image;
      return Custom ? (
        <Custom key={index} src={token.href ?? ""} alt={token.value} />
      ) : null;
    }
    if (token.kind === "code") {
      return (
        <Text
          key={index}
          className={cn("bg-[var(--panel-muted)] font-mono", marks(token))}
        >
          {token.value}
        </Text>
      );
    }
    if (token.kind === "link") {
      const href = token.href ?? "";
      const openable = context.allowedLinkPrefixes.some((prefix) =>
        href.startsWith(prefix)
      );
      return (
        <Text
          key={index}
          className={cn(
            "text-[color:var(--panel-primary)] underline",
            marks(token)
          )}
          onPress={
            openable && context.onLinkPress
              ? () => context.onLinkPress?.(href)
              : undefined
          }
        >
          {token.value}
        </Text>
      );
    }
    if (!token.bold && !token.italic && !token.strike) {
      return token.value;
    }
    return (
      <Text key={index} className={marks(token)}>
        {token.value}
      </Text>
    );
  });
const InlineRun = ({
  tokens,
  context,
  className,
}: {
  tokens: InlineToken[];
  context: RenderContext;
  className?: string;
}) => <Text className={className}>{spans(tokens, context)}</Text>;
const TableBlock = ({
  block,
  context,
}: {
  block: Extract<
    Block,
    {
      type: "table";
    }
  >;
  context: RenderContext;
}) => {
  const align = (index: number) => ALIGNMENT[block.align[index] ?? "left"];
  return (
    <Table variant="outline" size="sm">
      <Table.Header>
        <Table.Row>
          {block.head.map((cell, index) => (
            <Table.Head key={index} align={align(index)}>
              <InlineRun
                tokens={cell}
                context={context}
                className="text-[22px] font-medium text-[color:var(--panel-muted-foreground)]"
              />
            </Table.Head>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {block.rows.map((row, rowIndex) => (
          <Table.Row key={rowIndex}>
            {block.head.map((_unused, index) => (
              <Table.Cell key={index} align={align(index)}>
                <InlineRun
                  tokens={row[index] ?? []}
                  context={context}
                  className="text-[24px] leading-[1.333333] text-[color:var(--panel-foreground)]"
                />
              </Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};
const BlockView = ({
  block,
  context,
}: {
  block: Block;
  context: RenderContext;
}) => {
  switch (block.type) {
    case "heading": {
      return (
        <Typography.Heading type={HEADING_TYPE[block.level - 1]}>
          {spans(block.inline, context)}
        </Typography.Heading>
      );
    }
    case "paragraph": {
      return (
        <Typography.Paragraph>
          {spans(block.inline, context)}
        </Typography.Paragraph>
      );
    }
    case "code": {
      const Custom = context.components?.code;
      if (Custom) {
        return (
          <Custom
            code={block.code}
            language={block.language}
            streaming={block.open && context.streaming}
          />
        );
      }
      return (
        <CodeBlock
          code={block.code}
          language={block.language}
          showLineNumbers={context.showLineNumbers}
        >
          {block.language ? (
            <CodeBlock.Header>
              <CodeBlock.Language>{block.language}</CodeBlock.Language>
              <CodeBlock.Actions>
                {block.open && context.streaming ? null : (
                  <CodeBlock.CopyButton />
                )}
              </CodeBlock.Actions>
            </CodeBlock.Header>
          ) : null}
        </CodeBlock>
      );
    }
    case "quote": {
      return (
        <View className="flex w-full flex-col gap-[16px] border-s-[4px] border-solid border-[var(--panel-border)] ps-[32px]">
          {block.blocks.map((child, index) => (
            <BlockView key={index} block={child} context={context} />
          ))}
        </View>
      );
    }
    case "list": {
      return (
        <Typography.List ordered={block.ordered}>
          {block.items.map((item, index) => (
            <View key={index} className="flex flex-col gap-[16px]">
              {item.map((child, position) => (
                <BlockView key={position} block={child} context={context} />
              ))}
            </View>
          ))}
        </Typography.List>
      );
    }
    case "table": {
      return <TableBlock block={block} context={context} />;
    }
    case "rule": {
      return <View className="h-[2px] w-full bg-[var(--panel-border)]" />;
    }
    default: {
      return null;
    }
  }
};
const ResponseRoot = ({
  className,
  children = "",
  isStreaming = false,
  parseIncompleteMarkdown = true,
  onLinkPress,
  allowedLinkPrefixes = DEFAULT_LINK_PREFIXES,
  components,
  showLineNumbers = false,
  ...props
}: ResponseProps) => {
  const speculate = isStreaming && parseIncompleteMarkdown;
  const blocks = useMemo(
    () => parseMarkdown(children, speculate),
    [children, speculate]
  );
  const context: RenderContext = {
    allowedLinkPrefixes,
    components,
    onLinkPress,
    showLineNumbers,
    streaming: isStreaming,
  };
  return (
    <View
      className={cn("flex w-full flex-col gap-[24px]", className)}
      {...props}
    >
      {blocks.map((block, index) => (
        <BlockView key={index} block={block} context={context} />
      ))}
    </View>
  );
};
export const Response = memo(ResponseRoot);
Response.displayName = "Response";
