import { cn } from "../../lib/utils";
import { Popover } from "../Popover";
import { ColorPickerContext, useColorPicker } from "./context";
import type { ColorPickerContentProps, ColorPickerTriggerProps } from "./types";

export const ColorPickerTrigger = ({ children }: ColorPickerTriggerProps) => {
  useColorPicker();
  return <Popover.Trigger>{children}</Popover.Trigger>;
};
export const ColorPickerContent = ({
  className,
  width = "trigger",
  minWidth = 268,
  children,
  ...props
}: ColorPickerContentProps) => {
  const context = useColorPicker();
  return (
    <Popover.Content
      width={width}
      minWidth={minWidth}
      className={cn("flex flex-col gap-[24px]", className)}
      {...props}
    >
      <ColorPickerContext.Provider value={context}>
        {children}
      </ColorPickerContext.Provider>
    </Popover.Content>
  );
};
