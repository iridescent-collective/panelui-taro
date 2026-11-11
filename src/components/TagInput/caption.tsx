import { Text } from "../primitives/Text";
import type { TagInputProps } from "./types";
import { tagInputVariants } from "./variants";

export const TagCaption = ({
  props,
  count,
  overflowing,
}: {
  props: TagInputProps;
  count: number;
  overflowing: boolean;
}) => {
  const slots = tagInputVariants({
    disabled: !!props.disabled,
    size: props.size,
    variant: props.variant,
  });
  const message = props.errorMessage || props.description;
  const className = props.errorMessage ? slots.error() : slots.description();
  return (
    <>
      {message ? <Text className={className}>{message}</Text> : null}
      {props.showCount && props.max !== undefined ? (
        <Text
          className={slots.count({
            className: overflowing
              ? "text-[var(--panel-destructive)]"
              : undefined,
          })}
        >{`${count} / ${props.max}`}</Text>
      ) : null}
    </>
  );
};
