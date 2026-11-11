import { ScrollView, View } from "@tarojs/components";
import { getCurrentInstance } from "@tarojs/taro";
import { BottomSheet } from "panelui-taro/bottom-sheet";
import { Button } from "panelui-taro/button";
import { ChevronDownIcon, RotateCcwIcon } from "panelui-taro/icons";
import { Text } from "panelui-taro/primitives/text";
import { PanelUIProvider } from "panelui-taro/provider";
import { useState, type ReactNode } from "react";

import { useNativeTheme } from "@/services/native-theme";
import type { ComponentEntry } from "@/types";

import { DocsShell } from "../DocsShell";

const FullBleedPreview = ({
  entry,
  children,
}: {
  entry: ComponentEntry;
  children: ReactNode;
}) => {
  useNativeTheme(`${entry.name} · PanelUI`);
  return (
    <PanelUIProvider className="h-screen">
      <View className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {children}
      </View>
    </PanelUIProvider>
  );
};

export const ComponentPage = ({ entry }: { entry: ComponentEntry }) => {
  const [selected, setSelected] = useState(() => {
    const demoId = getCurrentInstance().router?.params.demo;
    return demoId === undefined
      ? 0
      : Math.max(
          0,
          entry.demos.findIndex((demo) => demo.id === demoId)
        );
  });
  const [fullBleed, setFullBleed] = useState(false);
  const [run, setRun] = useState(0);
  const [variantsOpen, setVariantsOpen] = useState(false);
  const demo = entry.demos[selected] ?? entry.demos[0];
  const Demo = demo.render;
  if (demo.fullBleed && fullBleed) {
    return (
      <FullBleedPreview entry={entry}>
        <Demo key={`${selected}-${run}`} />
        <Button
          size="sm"
          variant="secondary"
          className="absolute top-2 right-3 z-10"
          onPress={() => setFullBleed(false)}
        >
          Back to examples
        </Button>
      </FullBleedPreview>
    );
  }
  return (
    <DocsShell section="components" slug={entry.slug}>
      <View className="docs-heading">
        <Text size="sm" muted className="block">
          {entry.summary}
        </Text>
      </View>
      <View className="docs-preview-toolbar">
        <Button
          size="sm"
          variant="secondary"
          className="docs-variant-trigger"
          accessibilityLabel="Choose variant"
          onPress={() => setVariantsOpen(true)}
        >
          <Text size="sm">{demo.label}</Text>
          <Text size="xs" muted>
            {selected + 1}/{entry.demos.length}
          </Text>
          <ChevronDownIcon size={16} />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          accessibilityLabel="Restart preview"
          onPress={() => setRun((value) => value + 1)}
        >
          <RotateCcwIcon size={18} />
        </Button>
      </View>
      <BottomSheet open={variantsOpen} onOpenChange={setVariantsOpen}>
        <BottomSheet.Content size="half">
          <BottomSheet.Header title={`${entry.name} variants`} />
          <BottomSheet.Body>
            <View className="docs-directory-list">
              {entry.demos.map((item, index) => (
                <Button
                  accessibilityLabel={`${entry.name} ${item.label} variant`}
                  key={item.id ?? item.label}
                  variant="ghost"
                  className={
                    index === selected
                      ? "docs-nav-item docs-nav-item-active"
                      : "docs-nav-item"
                  }
                  onPress={() => {
                    setSelected(index);
                    setRun(0);
                    setVariantsOpen(false);
                  }}
                >
                  {item.label}
                  {index === selected ? " ✓" : ""}
                </Button>
              ))}
            </View>
          </BottomSheet.Body>
        </BottomSheet.Content>
      </BottomSheet>
      {demo.fullBleed ? (
        <Button
          size="sm"
          variant="secondary"
          onPress={() => setFullBleed(true)}
        >
          Open full-screen preview
        </Button>
      ) : null}
      {demo.fullPage ? (
        <View
          key={`${selected}-${run}`}
          className="docs-preview docs-preview-full"
        >
          <Demo />
        </View>
      ) : (
        <ScrollView
          key={`${selected}-${run}`}
          scrollY
          className="docs-preview-scroll"
        >
          <View className="docs-preview docs-preview-inline">
            <Demo />
          </View>
        </ScrollView>
      )}
      {demo.description ? (
        <Text size="xs" muted className="docs-demo-description">
          {demo.description}
        </Text>
      ) : null}
    </DocsShell>
  );
};
