import { Item } from "panelui-taro/item";
import { Text } from "panelui-taro/primitives/text";
import { SectionRail } from "panelui-taro/section-rail";
import { Skeleton } from "panelui-taro/skeleton";
import { useRef, useState } from "react";

import { ScrollView, View } from "../runtime/native";
import { useScrollSections } from "../runtime/sections";
import { ComponentEntry } from "../types";
const RAIL_SECTIONS = [
  { id: "intro", label: "Introduction", level: 0 },
  { id: "install", label: "Installation", level: 0 },
  { id: "expo", label: "Expo", level: 1 },
  { id: "bare", label: "Bare React Native", level: 1 },
  { id: "theming", label: "Theming", level: 0 },
  { id: "tokens", label: "Design tokens", level: 1 },
  { id: "dark", label: "Dark mode", level: 1 },
  { id: "faq", label: "Frequently asked", level: 0 },
];
function SectionRailVersion({
  placement = "right",
  align = "center",
  haptics,
}: {
  placement?: "left" | "right";
  align?: "center" | "top" | "bottom";
  haptics?: boolean;
}) {
  const sections = useScrollSections({
    ids: RAIL_SECTIONS.map((section) => section.id),
  });
  return (
    <View className="flex-1">
      <ScrollView
        ref={sections.ref}
        {...sections.scrollProps}
        contentContainerStyle={{ paddingBottom: 160 }}
      >
        {RAIL_SECTIONS.map((section) => (
          <View
            key={section.id}
            onLayout={sections.measure(section.id)}
            className="gap-3 px-6 py-10"
          >
            <Text size={section.level ? "lg" : "2xl"} weight="semibold">
              {section.label}
            </Text>
            <Text size="sm" muted>
              Scroll and the bar for this section widens and brightens. Touch
              the rail to open the list and jump anywhere.
            </Text>
            <Skeleton className="h-24 w-full rounded-xl" />
          </View>
        ))}
      </ScrollView>

      <SectionRail
        placement={placement}
        align={align}
        haptics={haptics}
        value={sections.active}
        onValueChange={sections.scrollTo}
      >
        <SectionRail.Trigger>
          {RAIL_SECTIONS.map((section) => (
            <SectionRail.Bar
              key={section.id}
              value={section.id}
              level={section.level}
            />
          ))}
        </SectionRail.Trigger>
        <SectionRail.Content>
          {RAIL_SECTIONS.map((section) => (
            <SectionRail.Item
              key={section.id}
              value={section.id}
              level={section.level}
            >
              {section.label}
            </SectionRail.Item>
          ))}
        </SectionRail.Content>
      </SectionRail>
    </View>
  );
}
const PAGER_SECTIONS = [
  {
    id: "welcome",
    label: "Welcome",
    body: "Swipe up to move through the deck.",
  },
  {
    id: "tokens",
    label: "Tokens",
    body: "Every colour and radius comes from the theme.",
  },
  {
    id: "motion",
    label: "Motion",
    body: "Animations run on the UI thread, never on JS.",
  },
  {
    id: "native",
    label: "Native",
    body: "Some controls hand off to the platform entirely.",
  },
  {
    id: "ship",
    label: "Ship it",
    body: "No native modules, so it runs in Expo Go.",
  },
];
function SectionRailPagerVersion() {
  const [page, setPage] = useState(0);
  const scroller = useRef<import("../runtime/native").NativeScrollHandle>(null);
  const [pageHeight, setPageHeight] = useState(0);
  const jumping = useRef<number | null>(null);
  return (
    <View className="flex-1">
      <ScrollView
        ref={scroller}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onLayout={(event: import("../runtime/native").LayoutChangeEvent) =>
          setPageHeight(event.nativeEvent.layout.height)
        }
        onScroll={(
          event: import("../runtime/native").NativeSyntheticEvent<
            import("../runtime/native").NativeScrollEvent
          >
        ) => {
          if (jumping.current !== null) return;
          const { contentOffset, layoutMeasurement } = event.nativeEvent;
          if (!layoutMeasurement.height) return;
          const next = Math.round(contentOffset.y / layoutMeasurement.height);
          if (next !== page) setPage(next);
        }}
        onMomentumScrollEnd={() => {
          jumping.current = null;
        }}
      >
        {PAGER_SECTIONS.map((section, index) => (
          <View
            key={section.id}
            style={{ height: pageHeight || undefined }}
            className="justify-center gap-4 px-8"
          >
            <Text size="sm" muted>
              {index + 1} of {PAGER_SECTIONS.length}
            </Text>
            <Text size="3xl" weight="semibold">
              {section.label}
            </Text>
            <Text size="base" muted>
              {section.body}
            </Text>
          </View>
        ))}
      </ScrollView>

      <SectionRail
        placement="left"
        align="bottom"
        haptics
        value={PAGER_SECTIONS[page]?.id}
        onValueChange={(next) => {
          const index = PAGER_SECTIONS.findIndex(
            (section) => section.id === next
          );
          if (index < 0 || !pageHeight) return;
          jumping.current = index;
          setPage(index);
          scroller.current?.scrollTo({ y: index * pageHeight, animated: true });
        }}
      >
        <SectionRail.Trigger>
          {PAGER_SECTIONS.map((section) => (
            <SectionRail.Bar key={section.id} value={section.id} />
          ))}
        </SectionRail.Trigger>
        <SectionRail.Content>
          {PAGER_SECTIONS.map((section) => (
            <SectionRail.Item key={section.id} value={section.id}>
              {section.label}
            </SectionRail.Item>
          ))}
        </SectionRail.Content>
      </SectionRail>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "section-rail",
  name: "SectionRail",
  summary: "Floating section navigator for a long screen",
  demos: [
    {
      label: "Bottom right",
      id: "bottom-right",
      fullPage: true,
      description:
        "Out of the corner, clear of the text, with the panel opening upward. Haptics on.",
      render: () => <SectionRailVersion align="bottom" haptics />,
    },
    {
      label: "Bottom left",
      id: "bottom-left",
      fullPage: true,
      description: "The same corner treatment against the other edge.",
      render: () => (
        <SectionRailVersion placement="left" align="bottom" haptics />
      ),
    },
    {
      label: "Pager",
      id: "pager",
      fullPage: true,
      description:
        "One section per screen. Swipe up and the rail in the bottom-left tracks the page.",
      render: () => <SectionRailPagerVersion />,
    },
    {
      label: "Centred on the edge",
      id: "side",
      fullPage: true,
      description:
        "The original placement — halfway down the right edge, over the content it indexes.",
      render: () => <SectionRailVersion />,
    },
  ],
};
