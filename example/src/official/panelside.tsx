import {
  PanelsideActionsBlock,
  PanelsideAssistantBlock,
  PanelsideChatBlock,
  PanelsideCurveBlock,
  PanelsideDockedBlock,
  PanelsideNativeBlock,
  PanelsideNavigateBlock,
  PanelsideOverlayBlock,
} from "../extras/panelside-blocks";
import { ComponentEntry } from "../types";

export const entry: ComponentEntry = {
  slug: "panelside",
  name: "Panelside",
  summary: "Navigation panel that pushes and curves the app screen",
  demos: [
    {
      label: "Assistant",
      id: "assistant",
      fullPage: true,
      fullBleed: true,
      description:
        "Swipe from the left edge — the screen slides, shrinks and rounds.",
      render: () => <PanelsideAssistantBlock />,
    },
    {
      label: "Open a conversation",
      id: "navigate",
      fullPage: true,
      fullBleed: true,
      description:
        "Press a chat and the screen becomes it, with the panel closing itself.",
      render: () => <PanelsideNavigateBlock />,
    },
    {
      label: "Row actions",
      id: "actions",
      fullPage: true,
      fullBleed: true,
      description:
        "Every conversation carries a “…”: rename it, star it, share it or delete it without leaving the panel.",
      render: () => <PanelsideActionsBlock />,
    },
    {
      label: "Overlay",
      id: "overlay",
      fullPage: true,
      fullBleed: true,
      description:
        "The same panel sliding over a screen that stays where it is.",
      render: () => <PanelsideOverlayBlock />,
    },
    {
      label: "Docked",
      id: "docked",
      fullPage: true,
      fullBleed: true,
      description:
        "Past a width you pick, the panel is a column and the trigger goes.",
      render: () => <PanelsideDockedBlock />,
    },
    {
      label: "Deeper curve",
      id: "curve",
      fullPage: true,
      fullBleed: true,
      description:
        "Scale, radius and dim turned well up — the three numbers are yours.",
      render: () => <PanelsideCurveBlock />,
    },
    {
      label: "Full chat",
      id: "chat",
      fullPage: true,
      fullBleed: true,
      description:
        "A streaming transcript underneath, anchored and scrolling on its own.",
      render: () => <PanelsideChatBlock />,
    },
    {
      label: "Native chat",
      id: "native",
      fullPage: true,
      fullBleed: true,
      description:
        "Platform picker, sheet and buttons inside the panel — needs @expo/ui.",
      render: () => <PanelsideNativeBlock />,
    },
  ],
};
