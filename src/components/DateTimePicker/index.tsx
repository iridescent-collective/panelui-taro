import { View } from "@tarojs/components";
import { isValidElement } from "react";

import { CalendarIcon } from "../../icons";
import { cn } from "../../lib/utils";
import { Button } from "../Button";
import { Dialog } from "../Dialog";
import type { DialogActionTarget } from "../Dialog/types";
import { Popover } from "../Popover";
import { Text } from "../primitives/Text";
import { PANEL_WIDTH } from "./constants";
import { DateTimePanel } from "./panel";
import type { DateTimePickerProps } from "./types";
import { useDateTimePicker } from "./use-model";

export type { DateTimePickerProps, DateTimePickerPresentation } from "./types";
const DateTimePickerRoot = (props: DateTimePickerProps) => {
  const {
    presentation = "popover",
    placeholder = "Pick a date and time",
    doneLabel = "Done",
    className,
    children,
  } = props;
  const model = useDateTimePicker(props);
  const panel = <DateTimePanel source={props} model={model} />;
  if (presentation === "inline") {
    return panel;
  }
  const trigger = isValidElement<DialogActionTarget>(children) ? (
    children
  ) : (
    <Button
      variant="outline"
      disabled={model.disabled}
      className={cn("justify-start gap-[16px]", className)}
    >
      <CalendarIcon size={16} />
      <Text
        className={
          model.label ? undefined : "text-[color:var(--panel-muted-foreground)]"
        }
      >
        {children ?? model.label ?? placeholder}
      </Text>
    </Button>
  );
  if (presentation === "dialog") {
    return (
      <Dialog open={model.open} onOpenChange={model.setOpen}>
        <Dialog.Trigger>{trigger}</Dialog.Trigger>
        <Dialog.Content blur className="items-center gap-0 p-[32px]">
          {panel}
          <Dialog.Close>
            <Button className="mt-[24px] w-full">{doneLabel}</Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog>
    );
  }
  const sheet = presentation === "bottom-sheet";
  return (
    <Popover
      open={model.open}
      onOpenChange={model.setOpen}
      presentation={sheet ? "bottom-sheet" : "popover"}
    >
      <Popover.Trigger>{trigger}</Popover.Trigger>
      <Popover.Content width={sheet ? "full" : "content-fit"}>
        <View
          className={cn(
            "flex flex-col",
            sheet ? "w-full pb-[16px]" : "p-[24px]"
          )}
        >
          {panel}
          <Popover.Close>
            <Button
              className="mt-[24px] w-full self-center"
              style={sheet ? undefined : { maxWidth: `${PANEL_WIDTH * 2}rpx` }}
            >
              {doneLabel}
            </Button>
          </Popover.Close>
        </View>
      </Popover.Content>
    </Popover>
  );
};
DateTimePickerRoot.displayName = "DateTimePicker";
export const DateTimePicker = Object.assign(DateTimePickerRoot, {
  Trigger: Popover.Trigger,
});
