import {
  FrameHeader,
  FrameTitle,
  FrameAction,
  FrameDescription,
  FrameMedia,
  FrameContent,
  FrameActions,
} from "./content";
import { FrameRow, FrameSection } from "./rows";
import { FrameRoot, FramePanel, FrameFooter } from "./shell";

export type {
  FrameVariant,
  FrameProps,
  FrameRootProps,
  FrameHeaderProps,
  FrameActionProps,
  FrameMediaProps,
  FrameContentProps,
  FrameActionsProps,
  FramePanelProps,
  FrameRowProps,
  FrameSectionProps,
  FrameFooterProps,
} from "./types";
export const Frame = Object.assign(FrameRoot, {
  Action: FrameAction,
  Actions: FrameActions,
  Content: FrameContent,
  Description: FrameDescription,
  Footer: FrameFooter,
  Header: FrameHeader,
  Media: FrameMedia,
  Panel: FramePanel,
  Row: FrameRow,
  Section: FrameSection,
  Title: FrameTitle,
});
