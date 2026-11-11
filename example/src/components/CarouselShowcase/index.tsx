import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Carousel } from "panelui-taro/carousel";
import type {
  CarouselHandle,
  CarouselVariant,
} from "panelui-taro/carousel";
import { Typography } from "panelui-taro/typography";
import { useRef, useState } from "react";

const VARIANTS: CarouselVariant[] = [
  "default",
  "interactive",
  "coverflow",
  "stack",
];
const SLIDES = ["Reading", "Voice messages", "Location"];
export const CarouselShowcase = () => {
  const [variant, setVariant] = useState<CarouselVariant>("default");
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(3);
  const [loop, setLoop] = useState(false);
  const [vertical, setVertical] = useState(false);
  const ref = useRef<CarouselHandle>(null);
  const stacked = variant === "coverflow" || variant === "stack";
  let itemClassName: string | undefined;
  if (stacked) {
    itemClassName = "h-[300px] w-[480px]";
  } else if (variant === "interactive") {
    itemClassName = "h-[300px]";
  }
  return (
    <View className="flex flex-col gap-[32px]">
      <Typography id="panel-carousel-result">
        {JSON.stringify({ count, index, loop, variant, vertical })}
      </Typography>
      <Carousel
        ref={ref}
        id="panel-carousel-root"
        variant={variant}
        itemSize={stacked ? 240 : 220}
        orientation={vertical ? "vertical" : "horizontal"}
        loop={loop}
        onIndexChange={setIndex}
        className="flex flex-col gap-[24px]"
      >
        <Carousel.Content className="h-[400px]">
          {SLIDES.slice(0, count).map((label) => (
            <Carousel.Item key={label} className={itemClassName}>
              <View className="flex h-full w-full flex-col items-center justify-center gap-[24px] rounded-[32px] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-background)]">
                <Typography weight="semibold">{label}</Typography>
                <Carousel.Caption>{label} card</Carousel.Caption>
              </View>
            </Carousel.Item>
          ))}
        </Carousel.Content>
        <Carousel.Controls />
      </Carousel>
      <Button
        id="panel-carousel-next"
        variant="outline"
        onPress={() => ref.current?.next()}
      >
        Next using ref
      </Button>
      <Button
        id="panel-carousel-layout"
        variant="outline"
        onPress={() =>
          setVariant(
            VARIANTS[(VARIANTS.indexOf(variant) + 1) % VARIANTS.length]
          )
        }
      >
        Layout: {variant}
      </Button>
      <Button
        id="panel-carousel-count"
        variant="outline"
        onPress={() => setCount((value) => (value === 0 ? 3 : value - 1))}
      >
        Slides: {count}
      </Button>
      <Button
        id="panel-carousel-loop"
        variant="outline"
        onPress={() => setLoop((value) => !value)}
      >
        {loop ? "Disable loop" : "Enable loop"}
      </Button>
      <Button
        id="panel-carousel-axis"
        variant="outline"
        onPress={() => setVertical((value) => !value)}
      >
        {vertical ? "Horizontal axis" : "Vertical axis"}
      </Button>
    </View>
  );
};
