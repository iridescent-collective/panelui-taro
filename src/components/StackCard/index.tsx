import { View } from "@tarojs/components";
import { Children, forwardRef, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { useWindowMetrics } from "../../hooks/use-window-metrics";
import { cn } from "../../lib/utils";
import { StackCardContext } from "./context";
import {
  StackCardAction,
  StackCardActions,
  StackCardCard,
  StackCardEmpty,
  StackCardStamp,
} from "./parts";
import { StackCardSlot } from "./slot";
import type { StackCardHandle, StackCardProps } from "./types";
import { useStackAccessibilityMenu } from "./use-accessibility-menu";
import { useStackModel } from "./use-model";
import { useStackPan } from "./use-pan";

export { useStackCard } from "./context";
export type {
  StackCardProps,
  StackCardHandle,
  StackCardDirection,
  StackCardLayout,
  StackCardCardProps,
  StackCardStampProps,
  StackCardStampColor,
  StackCardEmptyProps,
  StackCardActionsProps,
  StackCardActionProps,
} from "./types";
const splitStack = (children: ReactNode) => {
  const cards: ReactElement[] = [];
  const stamps: ReactElement[] = [];
  const below: ReactNode[] = [];
  let empty: ReactNode = null;
  for (const child of Children.toArray(children)) {
    if (!isValidElement(child)) {
      continue;
    }
    if (child.type === StackCardCard) {
      cards.push(child);
    } else if (child.type === StackCardStamp) {
      stamps.push(child);
    } else if (child.type === StackCardEmpty) {
      empty = child;
    } else {
      below.push(child);
    }
  }
  return { below, cards, empty, stamps };
};
const StackCardRoot = forwardRef<StackCardHandle, StackCardProps>(
  (props, ref) => {
    const {
      children,
      layout = "stack",
      depth = 2,
      className,
      pileClassName,
      index: _index,
      defaultIndex: _defaultIndex,
      onIndexChange: _onIndexChange,
      onSwipe: _onSwipe,
      onEmpty: _onEmpty,
      directions: _directions,
      threshold: _threshold,
      disabled: _disabled,
      haptics: _haptics,
      directionLabels: _directionLabels,
      ...viewProps
    } = props;
    const { cards, stamps, below, empty } = splitStack(children);
    const measured = useElementLayout(true, cards.length, undefined, false);
    const { scale } = useWindowMetrics();
    const model = useStackModel(
      props,
      cards.length,
      measured.layout?.width ?? 0,
      measured.layout?.height ?? 0,
      ref
    );
    const { index, disabled } = model.context;
    const pan = useStackPan(
      model,
      scale,
      measured.layout?.top ?? 0,
      !disabled && index < cards.length && model.allowed.length > 0
    );
    const accessibilityMenu = useStackAccessibilityMenu(
      index,
      !disabled && index < cards.length,
      model.allowed,
      props.directionLabels,
      model.launch
    );
    const first = Math.max(0, index - 1);
    const last = Math.min(cards.length - 1, index + depth + 1);
    return (
      <StackCardContext.Provider value={model.context}>
        <View {...viewProps} className={cn("flex w-full flex-col", className)}>
          <View
            id={measured.id}
            className={cn("relative w-full flex-1", pileClassName)}
            catchMove={
              !disabled && index < cards.length && model.allowed.length > 0
            }
            onLongPress={() => {
              void accessibilityMenu();
            }}
            onTouchStart={pan.onTouchStart}
            onTouchMove={pan.onTouchMove}
            onTouchEnd={pan.onTouchEnd}
            onTouchCancel={pan.onTouchCancel}
          >
            {index >= cards.length ? empty : null}
            {cards.map((card, cardIndex) =>
              cardIndex >= first && cardIndex <= last ? (
                <StackCardSlot
                  key={card.key ?? cardIndex}
                  cardIndex={cardIndex}
                  depth={depth}
                  layout={layout}
                >
                  {card}
                  {cardIndex === index ? stamps : null}
                </StackCardSlot>
              ) : null
            )}
          </View>
          {below}
        </View>
      </StackCardContext.Provider>
    );
  }
);
StackCardRoot.displayName = "StackCard";
export const StackCard = Object.assign(StackCardRoot, {
  Action: StackCardAction,
  Actions: StackCardActions,
  Card: StackCardCard,
  Empty: StackCardEmpty,
  Stamp: StackCardStamp,
});
