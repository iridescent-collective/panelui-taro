import { isValidElement } from "react";

import { ClockIcon } from "../../icons";
import { cn } from "../../lib/utils";
import { Button } from "../Button";
import { Dialog } from "../Dialog";
import type { DialogActionTarget } from "../Dialog/types";
import { Popover } from "../Popover";
import { Text } from "../primitives/Text";
import { Panel } from "./panel";
import type { TimePickerProps } from "./types";
import { useTimePicker } from "./use-model";

export type {
  HourCycle,
  TimeValue,
  TimePickerLayout,
  TimePickerPresentation,
  TimePickerReadout,
  TimePickerProps,
} from "./types";
const TimePickerRoot = (props: TimePickerProps) => {
  const {
    presentation = "popover",
    placeholder = "Choose a time",
    className,
    children,
  } = props;
  const { face, label, open, setOpen, layout, disabled } = useTimePicker(props);
  if (presentation === "inline") {
    return <Panel layout={layout} className={className} {...face} />;
  }
  const trigger = isValidElement<DialogActionTarget>(children) ? (
    children
  ) : (
    <Button
      variant="outline"
      disabled={disabled}
      className={cn("justify-start gap-[16px]", className)}
    >
      <ClockIcon size={16} />
      <Text
        className={
          label ? undefined : "text-[color:var(--panel-muted-foreground)]"
        }
      >
        {children ?? label ?? placeholder}
      </Text>
    </Button>
  );
  if (presentation === "dialog") {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Trigger>{trigger}</Dialog.Trigger>
        <Dialog.Content blur className="items-center gap-0 p-[32px]">
          <Panel
            layout={layout}
            {...face}
            footer={
              <Dialog.Close>
                <Button className="mt-[8px] w-full">Done</Button>
              </Dialog.Close>
            }
          />
        </Dialog.Content>
      </Dialog>
    );
  }
  const sheet = presentation === "bottom-sheet";
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      presentation={sheet ? "bottom-sheet" : "popover"}
    >
      <Popover.Trigger>{trigger}</Popover.Trigger>
      <Popover.Content width={sheet ? "full" : "content-fit"}>
        <Panel
          layout={layout}
          fullWidth={sheet}
          className={
            sheet
              ? "w-full gap-[32px] px-[8px] pb-[16px]"
              : "self-center p-[24px]"
          }
          footer={
            sheet ? (
              <Popover.Close>
                <Button className="mt-[16px] w-full">Done</Button>
              </Popover.Close>
            ) : null
          }
          {...face}
        />
      </Popover.Content>
    </Popover>
  );
};
TimePickerRoot.displayName = "TimePicker";
export const TimePicker = Object.assign(TimePickerRoot, {
  Trigger: Popover.Trigger,
});
