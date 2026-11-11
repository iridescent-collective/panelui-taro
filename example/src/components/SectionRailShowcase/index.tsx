import { ScrollView, View } from "@tarojs/components";
import { getWindowInfo } from "@tarojs/taro";
import { Button } from "panelui-taro/button";
import { SectionRail } from "panelui-taro/section-rail";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

import { useSectionNavigation } from "../../hooks/use-section-navigation";

const SECTIONS = [
  { id: "intro", label: "Introduction", level: 0 },
  { id: "setup", label: "Setup and configuration", level: 1 },
  { id: "finish", label: "Finish and next steps", level: 0 },
];
export const SectionRailShowcase = () => {
  const [value, setValue] = useState("intro");
  const navigate = useSectionNavigation(
    "panel-sectionrail-scroll",
    SECTIONS,
    160
  );
  const [left, setLeft] = useState(false);
  const [bottom, setBottom] = useState(false);
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Heading type="h3">SectionRail · 浮动目录</Typography.Heading>
      <View className="flex flex-row gap-[16px]">
        <Button variant="outline" onPress={() => setLeft(!left)}>
          {left ? "靠右" : "靠左"}
        </Button>
        <Button variant="outline" onPress={() => setBottom(!bottom)}>
          {bottom ? "垂直居中" : "底部对齐"}
        </Button>
      </View>
      <View className="relative h-[520px] overflow-hidden rounded-xl border-[2px] border-solid border-[var(--panel-border)]">
        <ScrollView
          id="panel-sectionrail-scroll"
          enhanced
          scrollY
          className="h-full"
          onScroll={(event) => {
            const scale = getWindowInfo().windowWidth / 375;
            const index = Math.min(
              SECTIONS.length - 1,
              Math.floor((event.detail.scrollTop / scale + 130) / 160)
            );
            const active = SECTIONS[index];
            if (active) {
              setValue(active.id);
            }
          }}
        >
          {SECTIONS.map((section) => (
            <View
              id={`panel-section-${section.id}`}
              key={section.id}
              className="flex h-[320px] flex-col justify-center gap-[24px] bg-[var(--panel-background)] p-[32px]"
            >
              <Typography.Heading type="h4">{section.label}</Typography.Heading>
              <Typography>{section.id}</Typography>
            </View>
          ))}
        </ScrollView>
        <SectionRail
          value={value}
          onValueChange={(next) => {
            setValue(next);
            navigate(next);
          }}
          placement={left ? "left" : "right"}
          align={bottom ? "bottom" : "center"}
        >
          <SectionRail.Trigger className="panel-sectionrail-trigger">
            {SECTIONS.map((section) => (
              <SectionRail.Bar
                key={section.id}
                value={section.id}
                level={section.level}
              />
            ))}
          </SectionRail.Trigger>
          <SectionRail.Content>
            {SECTIONS.map((section) => (
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
      <Typography id="panel-sectionrail-value">{`当前：${value}`}</Typography>
    </View>
  );
};
