import { FabAction } from "./action";
import { FabGroup } from "./group";
import { FabRoot } from "./root";

export type {
  FabProps,
  FabPlacement,
  FabSize,
  FabVariant,
  FabGroupProps,
  FabGroupLayout,
  FabMenuAppearance,
  FabMenuIconPlacement,
  FabActionProps,
} from "./types";
export const Fab = Object.assign(FabRoot, {
  Action: FabAction,
  Group: FabGroup,
});
