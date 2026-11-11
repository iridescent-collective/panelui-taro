import { MessageScrollerButton } from "./button";
import { MessageScrollerContent } from "./content";
import { MessageScrollerItem } from "./item";
import { MessageScrollerList } from "./list";
import { MessageScrollerRoot } from "./root";
import { MessageScrollerViewport } from "./viewport";

export { useMessageScroller, useMessageScrollerVisibility } from "./context";
export type {
  MessageScrollerProps,
  MessageScrollerPosition,
  MessageScrollerViewportProps,
  MessageScrollerListProps,
  MessageScrollerListItem,
  MessageScrollerContentProps,
  MessageScrollerItemProps,
  MessageScrollerButtonProps,
} from "./types";
export const MessageScroller = Object.assign(MessageScrollerRoot, {
  Button: MessageScrollerButton,
  Content: MessageScrollerContent,
  Item: MessageScrollerItem,
  List: MessageScrollerList,
  Viewport: MessageScrollerViewport,
});
