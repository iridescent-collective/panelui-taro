import { View } from "@tarojs/components";
import { getWindowInfo, navigateTo, redirectTo } from "@tarojs/taro";
import { BottomSheet } from "panelui-taro/bottom-sheet";
import { Button } from "panelui-taro/button";
import { ChevronDownIcon } from "panelui-taro/icons";
import { Input } from "panelui-taro/input";
import { Text } from "panelui-taro/primitives/text";
import { PanelUIProvider } from "panelui-taro/provider";
import { useState } from "react";
import type { ReactNode } from "react";

import blocks from "@/data/blocks.json";
import components from "@/data/components.json";
import customization from "@/data/customization.json";
import { useNativeTheme } from "@/services/native-theme";

import { ThemeControl } from "../ThemeControl";

let lastComponent = "/pages/index/index";
let lastCustomization = "/customization/colors/index";
let lastBlock = "/blocks/smart-home/index";
export const DocsShell = ({
  children,
  section,
  slug,
}: {
  children: ReactNode;
  section: "components" | "blocks" | "customization";
  slug: string;
}) => {
  const window = getWindowInfo();
  const safeBottom = Math.max(
    0,
    window.screenHeight - (window.safeArea?.bottom ?? window.screenHeight)
  );
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const entries = { blocks, components, customization }[section];
  const sectionTitle = {
    blocks: "Blocks",
    components: "Components",
    customization: "Customization",
  }[section];
  const active = entries.find((item) => item.slug === slug) ?? entries[0];
  useNativeTheme(`${active.name} · PanelUI`);
  if (section === "components") {
    lastComponent = active.route;
  } else if (section === "blocks") {
    lastBlock = active.route;
  } else {
    lastCustomization = active.route;
  }
  const filtered = entries.filter((item) =>
    item.name.toLowerCase().includes(query.trim().toLowerCase())
  );
  const go = (url: string) => {
    setOpen(false);
    if (url !== active.route) {
      void redirectTo({ url });
    }
  };
  return (
    <PanelUIProvider className="h-screen">
      <View className="docs-shell" style={{ paddingBottom: `${safeBottom}px` }}>
        <View className="docs-topbar">
          <View className="docs-topnav">
            <Button
              size="sm"
              variant="ghost"
              className={
                section === "components"
                  ? "docs-tab docs-tab-active"
                  : "docs-tab"
              }
              onPress={() => go(lastComponent)}
            >
              Components
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={
                section === "blocks" ? "docs-tab docs-tab-active" : "docs-tab"
              }
              onPress={() => go(lastBlock)}
            >
              Blocks
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={
                section === "customization"
                  ? "docs-tab docs-tab-active"
                  : "docs-tab"
              }
              onPress={() => go(lastCustomization)}
            >
              Customization
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="docs-tab"
              accessibilityLabel="Open AI Assistant"
              onPress={() => { void navigateTo({ url: "/showcases/ai/index" }); }}
            >
              AI
            </Button>
          </View>
          <ThemeControl />
        </View>
        <View className="docs-directory-bar">
          <Button
            variant="ghost"
            className="docs-directory-trigger"
            accessibilityLabel={
              section === "components"
                ? "Browse components"
                : `Browse ${section}`
            }
            onPress={() => {
              setQuery("");
              setOpen(true);
            }}
          >
            <Text size="xl" weight="bold">
              {active.name}
            </Text>
            <ChevronDownIcon size={18} />
          </Button>
          <Text size="xs" muted>
            Directory
          </Text>
        </View>
        <View className="docs-page">{children}</View>
        <BottomSheet open={open} onOpenChange={setOpen}>
          <BottomSheet.Content size="full">
            <BottomSheet.Header title={sectionTitle} />
            <View className="docs-directory-search">
              <Input
                accessibilityLabel="Search directory"
                placeholder={`Search ${section}…`}
                value={query}
                onChangeText={setQuery}
                returnKeyType="search"
              />
              <Text size="xs" muted>
                {filtered.length} results
              </Text>
            </View>
            <BottomSheet.Body
              scrollIntoView={
                open && !query.trim()
                  ? `docs-nav-${section}-${active.slug}`
                  : ""
              }
              scrollTop={query.trim() ? 0 : undefined}
            >
              <View className="docs-directory-list">
                {filtered.map((item) => (
                  <Button
                    key={item.slug}
                    id={`docs-nav-${section}-${item.slug}`}
                    variant="ghost"
                    className={
                      item.slug === slug
                        ? "docs-nav-item docs-nav-item-active"
                        : "docs-nav-item"
                    }
                    accessibilityLabel={item.name}
                    onPress={() => go(item.route)}
                  >
                    {item.name}
                    {item.slug === slug ? " ✓" : ""}
                  </Button>
                ))}
                {filtered.length === 0 ? (
                  <Text muted className="docs-directory-empty">
                    No matching entries.
                  </Text>
                ) : null}
              </View>
            </BottomSheet.Body>
          </BottomSheet.Content>
        </BottomSheet>
      </View>
    </PanelUIProvider>
  );
};
