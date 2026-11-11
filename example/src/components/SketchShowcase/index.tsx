import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Sketch } from "panelui-taro/sketch";
import type { SketchHandle } from "panelui-taro/sketch";
import { Typography } from "panelui-taro/typography";
import { useRef, useState } from "react";

export const SketchShowcase = () => {
  const drawing = useRef<SketchHandle>(null);
  const [count, setCount] = useState(0);
  const [result, setResult] = useState("");
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Paragraph>
        Sketch · pen, eight shapes and transparent eraser
      </Typography.Paragraph>
      <View className="flex h-[1120px] flex-col overflow-hidden rounded-[32px] border border-[var(--panel-border)]">
        <Sketch
          ref={drawing}
          onChange={setCount}
          onDone={(value) =>
            setResult(
              `${value.items.length} marks · ${value.width} × ${value.height}`
            )
          }
        />
      </View>
      <Typography.Paragraph>
        {count} marks · {result}
      </Typography.Paragraph>
      <View className="flex flex-row gap-[16px]">
        <Button variant="outline" onPress={() => drawing.current?.clear()}>
          Clear
        </Button>
        <Button
          variant="outline"
          onPress={() =>
            setResult(
              drawing.current?.toSVG().includes("<mask")
                ? "SVG with transparent eraser mask"
                : "SVG without eraser masks"
            )
          }
        >
          Inspect SVG
        </Button>
        <Button
          onPress={() => {
            const exportPNG = async () => {
              try {
                const path = await drawing.current?.toPNG();
                if (path) {
                  setResult(path);
                }
              } catch (error) {
                setResult(
                  error instanceof Error ? error.message : "PNG unavailable"
                );
              }
            };
            void exportPNG();
          }}
        >
          Export PNG
        </Button>
      </View>
    </View>
  );
};
