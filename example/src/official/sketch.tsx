import { Button } from "panelui-taro/button";
import { Text } from "panelui-taro/primitives/text";
import { Sketch, type SketchResult } from "panelui-taro/sketch";
import { useState } from "react";

import { useSafeAreaInsets } from "../runtime/native";
import { View } from "../runtime/native";
import { Portal } from "../runtime/overlays";
import { router } from "../runtime/router";
import { SvgXml } from "../runtime/svg";
import { ComponentEntry } from "../types";
function SketchSheetDemo({ native = true }: { native?: boolean }) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<SketchResult | null>(null);
  return (
    <View className="w-full items-center gap-4">
      {result ? (
        <View className="border-border bg-popover w-full items-center overflow-hidden rounded-2xl border">
          <SvgXml
            xml={result.svg}
            width="100%"
            height={180}
            viewBox={`0 0 ${result.width} ${result.height}`}
          />
        </View>
      ) : (
        <Text size="sm" muted className="text-center">
          Draw something, then press the check to bring it back here.
        </Text>
      )}
      <Button variant="outline" onPress={() => setOpen(true)}>
        {result ? "Draw again" : "Open sketch"}
      </Button>
      <Sketch.Sheet
        native={native}
        open={open}
        onOpenChange={setOpen}
        onDone={setResult}
      />
    </View>
  );
}
function SketchFullPageVersion() {
  const insets = useSafeAreaInsets();
  return (
    <Portal>
      <View className="absolute inset-0">
        <Sketch
          style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
          onClose={() => router.back()}
          onDone={() => router.back()}
        />
      </View>
    </Portal>
  );
}
export const entry: ComponentEntry = {
  slug: "sketch",
  name: "Sketch",
  summary:
    "Draw with a pen, shapes and an eraser, in a sheet or a whole screen",
  demos: [
    { label: "Native sheet", render: () => <SketchSheetDemo /> },
    { label: "Styled sheet", render: () => <SketchSheetDemo native={false} /> },
    {
      label: "Full page",
      id: "full-page",
      fullPage: true,
      description:
        "The whole screen is the canvas, with close and confirm at the ends.",
      render: () => <SketchFullPageVersion />,
    },
  ],
};
