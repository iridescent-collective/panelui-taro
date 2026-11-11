import { ScrollView, View } from "@tarojs/components";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode, ComponentProps, ComponentRef } from "react";

import { ChevronLeftIcon, ChevronRightIcon, EllipsisIcon } from "../../icons";
import { selectionTick } from "../../lib/haptics";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import type { AnimatedPressableProps } from "../../primitives/animated-pressable";
import { useThemeToken } from "../../theme/use-theme";
import type { VariantProps } from "../../vendor/tailwind-variants/lite";
import { Text, textChildren } from "../primitives/Text";
import type { TextProps } from "../primitives/Text";
import { paginationVariants } from "./variants";

type ViewProps = ComponentProps<typeof View>;
export type PaginationVariant = "numbers" | "compact" | "simple";
export type PaginationSize = "sm" | "default";
const SMALL_HIT_SLOP = { bottom: 6, left: 6, right: 6, top: 6 } as const;

const iconSize: Record<PaginationSize, number> = { default: 20, sm: 16 };
interface PaginationContextValue {
  page: number;
  count: number;
  size: PaginationSize;
  disabled: boolean;
  goTo: (page: number) => void;
}
const PaginationContext = createContext<PaginationContextValue | null>(null);
const usePagination = (part: string): PaginationContextValue => {
  const context = useContext(PaginationContext);
  if (!context) {
    throw new Error(`${part} must be used inside <Pagination>.`);
  }
  return context;
};
const range = (start: number, end: number): number[] =>
  end < start
    ? []
    : Array.from({ length: end - start + 1 }, (_, i) => start + i);
export type PaginationItemValue = number | "start-ellipsis" | "end-ellipsis";
export const paginationRange = ({
  count,
  page,
  siblings = 1,
  boundaries = 1,
}: {
  count: number;
  page: number;
  siblings?: number;
  boundaries?: number;
}): PaginationItemValue[] => {
  const startPages = range(1, Math.min(boundaries, count));
  const endPages = range(
    Math.max(count - boundaries + 1, boundaries + 1),
    count
  );
  const siblingsStart = Math.max(
    Math.min(page - siblings, count - boundaries - siblings * 2 - 1),
    boundaries + 2
  );
  const siblingsEnd = Math.min(
    Math.max(page + siblings, boundaries + siblings * 2 + 2),
    endPages.length > 0 ? (endPages[0] as number) - 2 : count - 1
  );
  const leading: PaginationItemValue[] = [];
  if (siblingsStart > boundaries + 2) {
    leading.push("start-ellipsis");
  } else if (boundaries + 1 < count - boundaries) {
    leading.push(boundaries + 1);
  }
  const trailing: PaginationItemValue[] = [];
  if (siblingsEnd < count - boundaries - 1) {
    trailing.push("end-ellipsis");
  } else if (count - boundaries > boundaries) {
    trailing.push(count - boundaries);
  }
  return [
    ...startPages,
    ...leading,
    ...range(siblingsStart, siblingsEnd),
    ...trailing,
    ...endPages,
  ];
};
export interface PaginationProps
  extends Omit<ViewProps, "children">, VariantProps<typeof paginationVariants> {
  className?: string;
  count: number;
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  variant?: PaginationVariant;
  size?: PaginationSize;
  siblings?: number;
  boundaries?: number;
  controls?: boolean;
  pageJump?: number;
  disabled?: boolean;
  accessibilityLabel?: string;
  children?: ReactNode;
}
export interface PaginationItemProps extends Omit<
  AnimatedPressableProps,
  "children" | "disabled"
> {
  className?: string;
  page: number;
  labelClassName?: string;
  children?: ReactNode;
}
const PaginationItem = forwardRef<
  ComponentRef<typeof View>,
  PaginationItemProps
>(({ className, labelClassName, page, children, onPress, ...props }, ref) => {
  const {
    page: current,
    size,
    disabled,
    goTo,
  } = usePagination("Pagination.Item");
  const isCurrent = page === current;
  const { item, itemLabel } = paginationVariants({
    current: isCurrent,
    disabled,
    size,
  });
  return (
    <AnimatedPressable
      ref={ref}
      {...props}
      accessibilityRole="button"
      accessibilityLabel={`Page ${page}`}
      accessibilityState={{ disabled, selected: isCurrent }}
      disabled={disabled}
      hitSlop={size === "sm" ? SMALL_HIT_SLOP : undefined}
      onPress={(event) => {
        onPress?.(event);
        goTo(page);
      }}
      className={item({ className: `flex ${className ?? ""}` })}
    >
      {textChildren(children ?? String(page), (text) => (
        <Text className={itemLabel({ className: labelClassName })}>{text}</Text>
      ))}
    </AnimatedPressable>
  );
});
PaginationItem.displayName = "Pagination.Item";
export interface PaginationPreviousProps extends Omit<
  AnimatedPressableProps,
  "children"
> {
  className?: string;
  label?: boolean;
}
export interface PaginationNextProps extends Omit<
  AnimatedPressableProps,
  "children"
> {
  className?: string;
  label?: boolean;
}
type PaginationArrowProps = PaginationPreviousProps;
const useArrow = (step: -1 | 1, part: string) => {
  const { page, count, size, disabled, goTo } = usePagination(part);
  const color = useThemeToken("foreground");
  const target = page + step;
  const spent = disabled || target < 1 || target > count;
  const Glyph = step === -1 ? ChevronLeftIcon : ChevronRightIcon;
  return {
    Glyph,
    color: typeof color === "string" ? color : "#0a0a0a",
    press: () => goTo(target),
    size,
    spent,
  };
};
const PaginationArrow = ({
  step,
  part,
  word,
  className,
  label,
  disabled,
  onPress,
  ...props
}: PaginationArrowProps & {
  step: -1 | 1;
  part: string;
  word: string;
}) => {
  const { Glyph, size, spent, color, press } = useArrow(step, part);
  const isDisabled = Boolean(spent || disabled);
  const { item, itemLabel } = paginationVariants({
    disabled: isDisabled,
    size,
  });
  return (
    <AnimatedPressable
      {...props}
      accessibilityRole="button"
      accessibilityLabel={word}
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      hitSlop={size === "sm" ? SMALL_HIT_SLOP : undefined}
      onPress={(event) => {
        onPress?.(event);
        press();
      }}
      className={item({
        className: cn(
          "flex flex-row gap-[8px]",
          label && (size === "sm" ? "px-[16px]" : "px-[24px]"),
          className
        ),
      })}
    >
      {step === -1 ? <Glyph size={iconSize[size]} color={color} /> : null}
      {label ? <Text className={itemLabel()}>{word}</Text> : null}
      {step === 1 ? <Glyph size={iconSize[size]} color={color} /> : null}
    </AnimatedPressable>
  );
};
const PaginationPrevious = ({ ...props }: PaginationPreviousProps) => (
  <PaginationArrow
    step={-1}
    part="Pagination.Previous"
    word="Previous"
    {...props}
  />
);
PaginationPrevious.displayName = "Pagination.Previous";
const PaginationNext = ({ ...props }: PaginationNextProps) => (
  <PaginationArrow step={1} part="Pagination.Next" word="Next" {...props} />
);
PaginationNext.displayName = "Pagination.Next";
export interface PaginationEllipsisProps extends Omit<
  AnimatedPressableProps,
  "children"
> {
  className?: string;
  direction?: -1 | 1;
  jump?: number;
}
const PaginationEllipsis = forwardRef<
  ComponentRef<typeof View>,
  PaginationEllipsisProps
>(
  (
    {
      className,
      direction = 1,
      jump = 5,
      disabled: disabledProp,
      onPress,
      ...props
    },
    ref
  ) => {
    const { page, size, disabled, goTo } = usePagination("Pagination.Ellipsis");
    const color = useThemeToken("muted-foreground");
    const { ellipsis } = paginationVariants({ size });
    const isDisabled = Boolean(disabled || disabledProp);
    return (
      <AnimatedPressable
        ref={ref}
        {...props}
        accessibilityRole="button"
        accessibilityLabel={
          direction === -1 ? `Back ${jump} pages` : `Forward ${jump} pages`
        }
        accessibilityState={{ disabled: isDisabled }}
        disabled={isDisabled}
        hitSlop={size === "sm" ? SMALL_HIT_SLOP : undefined}
        onPress={(event) => {
          onPress?.(event);
          goTo(page + direction * jump);
        }}
        className={ellipsis({ className: `flex ${className ?? ""}` })}
      >
        <EllipsisIcon
          size={iconSize[size]}
          color={typeof color === "string" ? color : "#737373"}
        />
      </AnimatedPressable>
    );
  }
);
PaginationEllipsis.displayName = "Pagination.Ellipsis";
export interface PaginationSummaryProps extends TextProps {
  className?: string;
}
const PaginationSummary = forwardRef<
  ComponentRef<typeof Text>,
  PaginationSummaryProps
>(({ className, ...props }, ref) => {
  const { page, count, size } = usePagination("Pagination.Summary");
  const { summary } = paginationVariants({ size });
  return (
    <Text
      ref={ref}
      aria-label={`Page ${page} of ${count}`}
      className={summary({ className: cn("px-2", className) })}
      {...props}
    >
      {page} / {count}
    </Text>
  );
});
PaginationSummary.displayName = "Pagination.Summary";
export interface PaginationStatusProps extends TextProps {
  className?: string;
  page?: number;
  pageSize?: number;
  total?: number;
  children?: ReactNode;
}
const PaginationStatus = forwardRef<
  ComponentRef<typeof Text>,
  PaginationStatusProps
>(({ className, page: ownPage, pageSize, total, children, ...props }, ref) => {
  const context = useContext(PaginationContext);
  const size = context?.size ?? "default";
  const page = ownPage ?? context?.page ?? 1;
  const { status } = paginationVariants({ size });
  const span = useMemo(() => {
    if (children !== undefined) {
      return null;
    }
    if (pageSize === undefined || total === undefined) {
      return null;
    }
    if (total <= 0) {
      return "None";
    }
    const from = (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, total);
    return `${from}–${to} of ${total}`;
  }, [children, page, pageSize, total]);
  return (
    <Text ref={ref} className={status({ className })} {...props}>
      {span ?? textChildren(children)}
    </Text>
  );
});
PaginationStatus.displayName = "Pagination.Status";
const PaginationRoot = forwardRef<ComponentRef<typeof View>, PaginationProps>(
  (
    {
      className,
      count,
      page: controlledPage,
      defaultPage = 1,
      onPageChange,
      variant = "numbers",
      size = "default",
      siblings = 1,
      boundaries = 1,
      controls = true,
      pageJump = 5,
      disabled = false,
      accessibilityLabel = "Pagination",
      children,
      ...props
    },
    ref
  ) => {
    const [internalPage, setInternalPage] = useState(defaultPage);
    const isControlled = controlledPage !== undefined;
    const page = Math.min(
      Math.max(isControlled ? controlledPage : internalPage, 1),
      count
    );
    const goTo = useCallback(
      async (next: number) => {
        const clamped = Math.min(Math.max(next, 1), count);
        if (clamped === page || disabled) {
          return;
        }
        const tick = selectionTick();
        if (!isControlled) {
          setInternalPage(clamped);
        }
        onPageChange?.(clamped);
        await tick;
      },
      [count, page, disabled, isControlled, onPageChange]
    );
    const context = useMemo<PaginationContextValue>(
      () => ({ count, disabled, goTo, page, size }),
      [page, count, size, disabled, goTo]
    );
    const items = useMemo(
      () =>
        variant === "numbers"
          ? paginationRange({ boundaries, count, page, siblings })
          : [],
      [variant, count, page, siblings, boundaries]
    );
    const { root, list } = paginationVariants({ size });
    return (
      <PaginationContext.Provider value={context}>
        <View
          ref={ref}
          role="navigation"
          aria-role="navigation"
          aria-label={accessibilityLabel}
          className={root({
            className: cn(
              "w-full min-w-0 overflow-hidden",
              children ? "justify-between gap-[24px]" : "justify-center",
              className
            ),
          })}
          {...props}
        >
          {textChildren(children, (text) => (
            <PaginationStatus>{text}</PaginationStatus>
          ))}

          <ScrollView
            scrollX
            enhanced
            showScrollbar={false}
            className="w-full min-w-0 flex-1"
          >
            <View
              className={list({
                className: cn(
                  "w-max min-w-full",
                  children ? "justify-end" : "justify-center"
                ),
              })}
            >
              {controls ? (
                <PaginationPrevious label={variant === "simple"} />
              ) : null}

              {variant === "numbers"
                ? items.map((item, index) =>
                    typeof item === "number" ? (
                      <PaginationItem key={item} page={item} />
                    ) : (
                      <PaginationEllipsis
                        key={`${item}-${index}`}
                        direction={item === "start-ellipsis" ? -1 : 1}
                        jump={pageJump}
                      />
                    )
                  )
                : null}

              {variant === "compact" ? <PaginationSummary /> : null}

              {controls ? (
                <PaginationNext label={variant === "simple"} />
              ) : null}
            </View>
          </ScrollView>
        </View>
      </PaginationContext.Provider>
    );
  }
);
PaginationRoot.displayName = "Pagination";
export const Pagination = Object.assign(PaginationRoot, {
  Ellipsis: PaginationEllipsis,
  Item: PaginationItem,
  Next: PaginationNext,
  Previous: PaginationPrevious,
  Status: PaginationStatus,
  Summary: PaginationSummary,
});
