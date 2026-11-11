import { ScrollView, View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import {
  createBreakpoints,
  useBreakpoint,
} from "panelui-taro/hooks/use-breakpoint";
import { useScrollSections } from "panelui-taro/hooks/use-scroll-sections";
import { useSkeletonHandoff } from "panelui-taro/hooks/use-skeleton-handoff";
import {
  Glass,
  GlassContainer,
  hasGlass,
  useGlassMaterial,
} from "panelui-taro/primitives/glass";
import { Text } from "panelui-taro/primitives/text";
import { PanelUIProvider } from "panelui-taro/provider";
import { useState, useSyncExternalStore } from "react";
const Breakpoints = createBreakpoints({ compact: 0, wide: 600 });
const Sections = ["section-one", "section-two", "section-three"];
const Reader = () => {
  const bp = useBreakpoint();
  const custom = Breakpoints.useBreakpoint();
  const sections = useScrollSections({ ids: Sections, offset: 0 });
  const {
    onLayout: _layout,
    onContentSizeChange: _content,
    onMomentumScrollEnd: _momentum,
    scrollEventThrottle: _throttle,
    ...scrollProps
  } = sections.scrollProps;
  const [loading, setLoading] = useState(true);
  const skeleton = useSkeletonHandoff(loading);
  const opacity = useSyncExternalStore(
    skeleton.opacity.subscribe,
    skeleton.opacity.getSnapshot,
    skeleton.opacity.getSnapshot
  );
  const material = useGlassMaterial();
  return (
    <View className="flex flex-col gap-[20px] p-[32px]">
      <Text weight="bold">Native sync acceptance</Text>
      <Text>{`${Math.round(bp.width)} × ${Math.round(bp.height)} · ${bp.isLandscape ? "landscape" : "portrait"} · ${bp.current} · custom ${custom.current}`}</Text>
      <Text>{`Glass supported: ${hasGlass}; material: ${material}`}</Text>
      <GlassContainer>
        <Glass
          fallbackClassName="bg-[var(--panel-card)]"
          radius={16}
          className="p-[24px]"
        >
          <Text>Solid fallback with preserved radius and content</Text>
        </Glass>
      </GlassContainer>
      <Button onPress={() => setLoading((value) => !value)}>
        {loading ? "Load content" : "Show skeleton"}
      </Button>
      <Text>{`Skeleton mounted: ${skeleton.mounted}; opacity: ${opacity.toFixed(2)}`}</Text>
      {skeleton.mounted ? (
        <View
          style={{ opacity }}
          className="h-[32px] rounded-full bg-[var(--panel-muted)]"
        />
      ) : (
        <Text>Content ready</Text>
      )}
      <Text>{`Active section: ${sections.active}`}</Text>
      <View className="flex flex-row gap-[12px]">
        {Sections.map((id, index) => (
          <Button
            key={id}
            size="sm"
            onPress={() => sections.scrollTo(id)}
          >{`Jump ${index + 1}`}</Button>
        ))}
      </View>
      <ScrollView
        scrollY
        {...scrollProps}
        className="h-[400px] border-[2px] border-[var(--panel-border)]"
      >
        {Sections.map((id, index) => (
          <View key={id} id={id} className="h-[320px] p-[24px]">
            <Text>{`Section ${index + 1}`}</Text>
            <Text size="sm">Scroll tracking and jump settlement</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
export default function Page() {
  return (
    <PanelUIProvider className="min-h-screen bg-[var(--panel-background)]">
      <Breakpoints.Provider>
        <Reader />
      </Breakpoints.Provider>
    </PanelUIProvider>
  );
}
