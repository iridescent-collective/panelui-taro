import { View } from "@tarojs/components";
import { forwardRef, Children } from "react";
import type { ComponentRef, ComponentProps } from "react";

import { cn } from "../../lib/utils";
import { Text, textChildren } from "../primitives/Text";
import type { TextProps } from "../primitives/Text";
import { TEXT_WEIGHT } from "../primitives/Text/constants";
import {
  HEADING_LEVEL,
  TYPOGRAPHY_ALIGN,
  TYPOGRAPHY_TRANSFORM,
  TYPOGRAPHY_TYPE,
} from "./constants";

export type TypographyType = keyof typeof TYPOGRAPHY_TYPE;
export type TypographyWeight = keyof typeof TEXT_WEIGHT;
export type TypographyListItemProps = TypographyParagraphProps;

export interface TypographyProps extends Omit<TextProps, "size"> {
  type?: keyof typeof TYPOGRAPHY_TYPE;
  align?: keyof typeof TYPOGRAPHY_ALIGN;
  transform?: keyof typeof TYPOGRAPHY_TRANSFORM;
  underline?: boolean;
  italic?: boolean;
  strike?: boolean;
}
export interface TypographyHeadingProps extends Omit<TypographyProps, "type"> {
  type?: keyof typeof HEADING_LEVEL;
}
export interface TypographyParagraphProps extends Omit<
  TypographyProps,
  "type"
> {
  type?: "body" | "body-sm" | "body-xs" | "lead" | "large" | "small";
}
export interface TypographyCodeProps extends Omit<TypographyProps, "type"> {
  containerClassName?: string;
}
export type TypographyBlockquoteProps = TypographyCodeProps;
export interface TypographyListProps extends ComponentProps<typeof View> {
  ordered?: boolean;
}

const TypographyRoot = forwardRef<ComponentRef<typeof Text>, TypographyProps>(
  (
    {
      type = "body",
      align,
      transform,
      weight,
      muted,
      underline,
      italic,
      strike,
      className,
      ...props
    }: TypographyProps,
    ref
  ) => (
    <Text
      ref={ref}
      {...props}
      className={cn(
        TYPOGRAPHY_TYPE[type],
        weight && TEXT_WEIGHT[weight],
        align && TYPOGRAPHY_ALIGN[align],
        transform && TYPOGRAPHY_TRANSFORM[transform],
        muted && "text-[color:var(--panel-muted-foreground)]",
        underline && "underline",
        italic && "italic",
        strike && "line-through",
        className
      )}
    />
  )
);
const TypographyHeading = forwardRef<
  ComponentRef<typeof Text>,
  TypographyHeadingProps
>(({ type = "h2", ...props }: TypographyHeadingProps, ref) => (
  <TypographyRoot
    ref={ref}
    type={type}
    role="heading"
    aria-role="heading"
    aria-level={HEADING_LEVEL[type]}
    {...props}
  />
));
const TypographyParagraph = forwardRef<
  ComponentRef<typeof Text>,
  TypographyParagraphProps
>((props: TypographyParagraphProps, ref) => (
  <TypographyRoot ref={ref} {...props} />
));
const TypographyCode = forwardRef<
  ComponentRef<typeof View>,
  TypographyCodeProps
>(({ containerClassName, ...props }: TypographyCodeProps, ref) => (
  <View
    ref={ref}
    className={cn(
      "self-start rounded-[var(--panel-radius-md)] bg-[var(--panel-muted)] px-[12px] py-[8px]",
      containerClassName
    )}
  >
    <TypographyRoot {...props} type="code" />
  </View>
));
const TypographyBlockquote = forwardRef<
  ComponentRef<typeof View>,
  TypographyBlockquoteProps
>(
  (
    { containerClassName, italic = true, ...props }: TypographyBlockquoteProps,
    ref
  ) => (
    <View
      ref={ref}
      className={cn(
        "border-s-[4px] border-solid border-[var(--panel-border)] ps-[32px]",
        containerClassName
      )}
    >
      <TypographyRoot {...props} type="blockquote" italic={italic} />
    </View>
  )
);
const TypographyList = forwardRef<
  ComponentRef<typeof View>,
  TypographyListProps
>(
  (
    { ordered = false, children, className, ...props }: TypographyListProps,
    ref
  ) => (
    <View
      ref={ref}
      {...props}
      role="list"
      aria-role="list"
      className={cn("flex flex-col gap-[16px]", className)}
    >
      {Children.map(children, (child, index) => (
        <View
          role="listitem"
          aria-role="listitem"
          className="flex w-full flex-row gap-[16px]"
        >
          {ordered ? (
            <Text muted>{index + 1}.</Text>
          ) : (
            <View
              aria-hidden
              className="mt-[20px] h-[12px] w-[12px] shrink-0 rounded-full bg-[var(--panel-muted-foreground)]"
            />
          )}
          <View className="flex-1">{textChildren(child)}</View>
        </View>
      ))}
    </View>
  )
);

export const Typography = Object.assign(TypographyRoot, {
  Blockquote: TypographyBlockquote,
  Code: TypographyCode,
  Heading: TypographyHeading,
  List: TypographyList,
  ListItem: TypographyParagraph,
  Paragraph: TypographyParagraph,
});
