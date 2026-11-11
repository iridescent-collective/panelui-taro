import { PanelsidePanel, PanelsideScene } from "./layers";
import { PanelsidePages, PanelsidePage, PanelsideTrigger } from "./pages";
import {
  PanelsideGroup,
  PanelsideGroupLabel,
  PanelsideCta,
  PanelsideSearchTrigger,
} from "./parts";
import { PanelsideRoot } from "./root";
import {
  PanelsideItem,
  PanelsideItemIcon,
  PanelsideItemLabel,
  PanelsideItemBadge,
  PanelsideAction,
  PanelsideItemActions,
} from "./rows";
import {
  PanelsideHeader,
  PanelsideSearch,
  PanelsideContent,
  PanelsideFooter,
} from "./surfaces";

export { usePanelside } from "./context";
export type {
  PanelsideMode,
  PanelsideSwipeFrom,
  PanelsideItemSize,
  PanelsideCtaSize,
  PanelsideSurface,
  PanelsideControlVariant,
  UsePanelsideResult,
  PanelsideProps,
  PanelsidePanelProps,
  PanelsideHeaderProps,
  PanelsideSearchProps,
  PanelsideContentProps,
  PanelsideGroupProps,
  PanelsideGroupLabelProps,
  PanelsideItemProps,
  PanelsideItemIconProps,
  PanelsideItemLabelProps,
  PanelsideItemBadgeProps,
  PanelsideActionProps,
  PanelsideItemActionsProps,
  PanelsideFooterProps,
  PanelsideCtaProps,
  PanelsideSceneProps,
  PanelsidePagesProps,
  PanelsidePageProps,
  PanelsideTriggerProps,
  PanelsideSearchTriggerProps,
} from "./types";
export const Panelside = Object.assign(PanelsideRoot, {
  Action: PanelsideAction,
  Content: PanelsideContent,
  Cta: PanelsideCta,
  Footer: PanelsideFooter,
  Group: PanelsideGroup,
  GroupLabel: PanelsideGroupLabel,
  Header: PanelsideHeader,
  Item: PanelsideItem,
  ItemActions: PanelsideItemActions,
  ItemBadge: PanelsideItemBadge,
  ItemIcon: PanelsideItemIcon,
  ItemLabel: PanelsideItemLabel,
  Page: PanelsidePage,
  Pages: PanelsidePages,
  Panel: PanelsidePanel,
  Scene: PanelsideScene,
  Search: PanelsideSearch,
  SearchTrigger: PanelsideSearchTrigger,
  Trigger: PanelsideTrigger,
});
