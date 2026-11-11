import { ScrollView, View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { ScrollHeader } from "panelui-taro/scroll-header";
import type { ScrollHeaderSurface } from "panelui-taro/scroll-header";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

const ROWS = Array.from({ length: 18 }, (_, index) => index + 1);
const SURFACES: ScrollHeaderSurface[] = ["plain", "muted", "none", "blur"];
export const ScrollHeaderShowcase = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [surfaceIndex, setSurfaceIndex] = useState(0);
  const [snap, setSnap] = useState(true);
  const [cover, setCover] = useState(false);
  const surface = SURFACES[surfaceIndex] ?? "plain";
  return (
    <View className="flex flex-col gap-[24px]">
      <View className="flex flex-row flex-wrap gap-[16px]">
        <Button
          variant="outline"
          onPress={() => setSurfaceIndex((surfaceIndex + 1) % SURFACES.length)}
        >
          {surface}
        </Button>
        <Button variant="outline" onPress={() => setSnap(!snap)}>
          {snap ? "吸附开启" : "吸附关闭"}
        </Button>
        <Button variant="outline" onPress={() => setCover(!cover)}>
          {cover ? "关闭封面" : "显示封面"}
        </Button>
      </View>
      <Typography id="panel-header-result">
        {collapsed ? "collapsed" : "expanded"}
      </Typography>
      <ScrollHeader
        id="panel-scroll-header"
        inset={false}
        snap={snap}
        onCollapsedChange={setCollapsed}
        className="h-[600px] flex-none rounded-[24px] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-background)]"
      >
        <ScrollHeader.Bar surface={surface} id="panel-header-bar">
          <ScrollHeader.Title>Library</ScrollHeader.Title>
          <ScrollHeader.Actions>
            <Button variant="ghost" size="sm">
              Search
            </Button>
          </ScrollHeader.Actions>
        </ScrollHeader.Bar>
        <ScrollHeader.Large id="panel-header-large">
          <ScrollHeader.Title>Library</ScrollHeader.Title>
          <ScrollHeader.Description>
            18 books · Scroll to collapse
          </ScrollHeader.Description>
        </ScrollHeader.Large>
        {cover ? <ScrollHeader.Cover /> : null}
        <ScrollView id="panel-header-scroll" scrollY className="h-full">
          {ROWS.map((row) => (
            <View
              key={row}
              className="border-b-[2px] border-solid border-[var(--panel-border)] px-[32px] py-[24px]"
            >
              <Typography>Book {row}</Typography>
            </View>
          ))}
        </ScrollView>
      </ScrollHeader>
    </View>
  );
};
