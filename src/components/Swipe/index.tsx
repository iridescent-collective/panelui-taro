import { SwipeAction, SwipeStart, SwipeEnd } from "./action";
import { SwipeGroup } from "./group";
import { SwipeRoot } from "./root";

export { useSwipeGroup } from "./context";
export type {
  SwipeOpenSide,
  SwipeHandle,
  SwipeGroupProps,
  SwipeActionColor,
  SwipeActionProps,
  SwipePanelProps,
  SwipeProps,
} from "./types";
export const Swipe = Object.assign(SwipeRoot, {
  Action: SwipeAction,
  End: SwipeEnd,
  Group: SwipeGroup,
  Start: SwipeStart,
});
