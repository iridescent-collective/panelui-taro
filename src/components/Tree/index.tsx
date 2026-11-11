import { TreeGroup } from "./group";
import { TreeIndicator } from "./indicator";
import { TreeItem } from "./item";
import { TreeIcon, TreeLabel, TreeActions } from "./parts";
import { TreeRoot } from "./root";
import { TreeTrigger } from "./trigger";

export type {
  TreeProps,
  TreeItemProps,
  TreeTriggerProps,
  TreeIndicatorProps,
  TreeIconProps,
  TreeActionsProps,
  TreeGroupProps,
  TreeSize,
  TreeSelectionMode,
} from "./types";
export const Tree = Object.assign(TreeRoot, {
  Actions: TreeActions,
  Group: TreeGroup,
  Icon: TreeIcon,
  Indicator: TreeIndicator,
  Item: TreeItem,
  Label: TreeLabel,
  Trigger: TreeTrigger,
});
