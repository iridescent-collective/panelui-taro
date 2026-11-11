import { ScrollView, View } from "@tarojs/components";
import { getWindowInfo } from "@tarojs/taro";
import { createObservableValue } from "panelui-taro/primitives/observable-value";
import { SectionProgress } from "panelui-taro/section-progress";
import { Typography } from "panelui-taro/typography";
import { useMemo, useState } from "react";

import { useSectionNavigation } from "../../hooks/use-section-navigation";

const SECTIONS = [
  { color: "foreground", id: "intro", label: "Introduction" },
  { color: "primary", id: "setup", label: "Setup" },
  { color: "success", id: "finish", label: "Finish" },
] as const;
export const SectionProgressShowcase = () => {
  const [value, setValue] = useState("intro");
  const navigate = useSectionNavigation(
    "panel-sectionprogress-scroll",
    SECTIONS,
    300
  );
  const scroll = useMemo(
    () => ({
      content: createObservableValue(900),
      offset: createObservableValue(0),
      viewport: createObservableValue(300),
    }),
    []
  );
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Heading type="h3">
        SectionProgress · 阅读位置
      </Typography.Heading>
      <View className="relative h-[600px] overflow-hidden rounded-xl border-[2px] border-solid border-[var(--panel-border)]">
        <ScrollView
          id="panel-sectionprogress-scroll"
          enhanced
          scrollY
          className="h-full"
          onScroll={(event) => {
            const offset =
              (event.detail.scrollTop * 375) / getWindowInfo().windowWidth;
            scroll.offset.value = offset;
            scroll.content.value =
              (event.detail.scrollHeight * 375) / getWindowInfo().windowWidth;
            setValue(
              SECTIONS[Math.min(2, Math.floor((offset + 150) / 300))]?.id ??
                "intro"
            );
          }}
        >
          {SECTIONS.map((section) => (
            <View
              id={`panel-reading-${section.id}`}
              key={section.id}
              className="flex h-[600px] items-center justify-center bg-[var(--panel-background)]"
            >
              <Typography.Heading type="h4">{section.label}</Typography.Heading>
            </View>
          ))}
        </ScrollView>
        <SectionProgress
          scroll={scroll}
          value={value}
          revealAt={0}
          onValueChange={(next) => {
            setValue(next);
            navigate(next);
          }}
        >
          {SECTIONS.map((section) => (
            <SectionProgress.Item
              key={section.id}
              value={section.id}
              color={section.color}
            >
              {section.label}
            </SectionProgress.Item>
          ))}
        </SectionProgress>
      </View>
      <Typography id="panel-sectionprogress-value">{`当前：${value}`}</Typography>
    </View>
  );
};
