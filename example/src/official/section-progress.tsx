import { ChevronLeftIcon } from "panelui-taro/icons";
import { Item } from "panelui-taro/item";
import { Text } from "panelui-taro/primitives/text";
import {
  SectionProgress,
  type SectionProgressColor,
  type SectionProgressPlacement,
} from "panelui-taro/section-progress";
import { Skeleton } from "panelui-taro/skeleton";

import { CircleButton } from "../extras/screen-header";
import { useSafeAreaInsets } from "../runtime/native";
import { ScrollView, View } from "../runtime/native";
import { useRouter } from "../runtime/router";
import { useScrollSections } from "../runtime/sections";
import { useCSSVariable } from "../runtime/theme";
import { ComponentEntry } from "../types";
const PROGRESS_SECTIONS: {
  id: string;
  label: string;
  color?: SectionProgressColor;
  body: string;
}[] = [
  {
    id: "intro",
    label: "Introduction",
    color: "primary",
    body: "Scroll on, and the pill appears at the bottom of the screen carrying two readings: how far down the page you are, and which part of it you are reading.",
  },
  {
    id: "install",
    label: "Installation",
    color: "info",
    body: "The ring is filled from the scroll position and the label is the section you are in. Press the pill to open the list and jump anywhere in it.",
  },
  {
    id: "theming",
    label: "Theming",
    color: "success",
    body: "Each section here declares a colour, so the ring, the label and the wash across the pill change as you cross into it.",
  },
  {
    id: "motion",
    label: "Motion",
    color: "warning",
    body: "The ring eases towards each new position rather than snapping to it, so a scroll reads as a glide instead of a series of steps.",
  },
  {
    id: "native",
    label: "Native controls",
    color: "danger",
    body: "The label changes when a heading passes a reading line a little way down the screen, so the section you have just scrolled past still counts as the one you are in.",
  },
  {
    id: "faq",
    label: "Frequently asked",
    body: "The last section is a special case: its top may never reach the reading line because the page runs out first, so reaching the bottom counts as being in it.",
  },
];
function SectionProgressVersion({
  placement,
  tinted,
  haptics,
}: {
  placement?: SectionProgressPlacement;
  tinted?: boolean;
  haptics?: boolean;
}) {
  const sections = useScrollSections({
    ids: PROGRESS_SECTIONS.map((section) => section.id),
  });
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <View className="flex-1">
      <ScrollView
        ref={sections.ref}
        {...sections.scrollProps}
        contentContainerStyle={{
          paddingTop: insets.top + 44,
          paddingBottom: 140,
        }}
      >
        {PROGRESS_SECTIONS.map((section) => (
          <View
            key={section.id}
            onLayout={sections.measure(section.id)}
            className="gap-3 px-6 py-10"
          >
            <Text size="2xl" weight="semibold">
              {section.label}
            </Text>
            <Text size="sm" muted>
              {section.body}
            </Text>
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </View>
        ))}
      </ScrollView>

      <SectionProgress
        placement={placement}
        haptics={haptics}
        scroll={sections.scroll}
        value={sections.active}
        onValueChange={sections.scrollTo}
      >
        {PROGRESS_SECTIONS.map((section) => (
          <SectionProgress.Item
            key={section.id}
            value={section.id}
            color={tinted ? section.color : undefined}
          >
            {section.label}
          </SectionProgress.Item>
        ))}
      </SectionProgress>

      <VersionBack />
    </View>
  );
}
function VersionBack() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const foreground = useCSSVariable("--color-foreground");
  return (
    <View className="absolute start-4 z-10" style={{ top: insets.top + 4 }}>
      <CircleButton onPress={() => router.back()} label="Go back">
        <ChevronLeftIcon
          size={20}
          color={typeof foreground === "string" ? foreground : undefined}
        />
      </CircleButton>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "section-progress",
  name: "SectionProgress",
  summary: "Floating pill with a scroll ring and the section being read",
  demos: [
    {
      label: "Bottom centre",
      id: "bottom-center",
      fullPage: true,
      fullBleed: true,
      description:
        "The default. Nothing on the first screen; scroll and it arrives, then stays. Press it for the list.",
      render: () => <SectionProgressVersion />,
    },
    {
      label: "A colour per section",
      id: "tinted",
      fullPage: true,
      fullBleed: true,
      description:
        "Each section brings its own colour to the ring, the label and the wash across the pill. Haptics on.",
      render: () => <SectionProgressVersion tinted haptics />,
    },
    {
      label: "Anchored to the top",
      id: "top-center",
      fullPage: true,
      fullBleed: true,
      description:
        "The same pill centred on the top edge, where it reads as a header rather than as something over the end of the page. The list opens downward out of it.",
      render: () => <SectionProgressVersion placement="top-center" />,
    },
  ],
};
