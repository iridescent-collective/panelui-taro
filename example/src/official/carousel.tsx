import { Button } from "panelui-taro/button";
import { Card } from "panelui-taro/card";
import { Carousel } from "panelui-taro/carousel";
import { BookmarkIcon } from "panelui-taro/icons";
import { Item } from "panelui-taro/item";
import { Text } from "panelui-taro/primitives/text";
import { Separator } from "panelui-taro/separator";

import { demoAction } from "../runtime/demo-action";
import { Image, View } from "../runtime/native";
import { ComponentEntry } from "../types";
const SCENES = [
  { title: "Desert dunes", uri: "photo-1509316785289-025f5b846b35" },
  { title: "Northern lights", uri: "photo-1483347756197-71ef80e95f73" },
  { title: "Still harbour", uri: "photo-1502082553048-f009c37129b9" },
  { title: "Canyon road", uri: "photo-1469854523086-cc02fe5d8800" },
  { title: "Alpine lake", uri: "photo-1454391304352-2bf4678b1a7a" },
  { title: "City at dusk", uri: "photo-1493246507139-91e8fad9978e" },
].map((scene) => ({
  ...scene,
  uri: `https://images.unsplash.com/${scene.uri}?auto=format&fit=crop&w=600&q=70`,
}));
function CarouselTrackDemo() {
  return (
    <View className="w-full gap-4">
      <Carousel loop>
        <Carousel.Content className="h-56">
          {SCENES.map((scene) => (
            <Carousel.Item key={scene.title} className="px-2">
              <View className="h-full w-full overflow-hidden rounded-2xl">
                <Image source={{ uri: scene.uri }} className="h-full w-full" />
              </View>
            </Carousel.Item>
          ))}
        </Carousel.Content>
        <Carousel.Controls className="mt-4" />
      </Carousel>
    </View>
  );
}
function CarouselInteractiveDemo() {
  return (
    <View className="w-full gap-4">
      <Carousel variant="interactive" itemSize={160} defaultIndex={2}>
        <Carousel.Content className="h-56">
          {SCENES.map((scene) => (
            <Carousel.Item key={scene.title} className="items-center gap-2">
              <Carousel.Caption>{scene.title}</Carousel.Caption>
              <Image
                source={{ uri: scene.uri }}
                className="h-28 w-28 rounded-xl"
              />
            </Carousel.Item>
          ))}
        </Carousel.Content>
        <Carousel.Controls className="mt-2" />
      </Carousel>
    </View>
  );
}
function CarouselBareDemo() {
  return (
    <View className="w-full gap-4">
      <Carousel variant="interactive" itemSize={160} defaultIndex={2}>
        <Carousel.Content className="h-56">
          {SCENES.map((scene) => (
            <Carousel.Item key={scene.title} className="items-center gap-2">
              <Carousel.Caption>{scene.title}</Carousel.Caption>
              <Image
                source={{ uri: scene.uri }}
                className="h-28 w-28 rounded-xl"
              />
            </Carousel.Item>
          ))}
        </Carousel.Content>
      </Carousel>
      <Text size="sm" muted className="text-center">
        Drag it. There is nothing else to press.
      </Text>
    </View>
  );
}
function CarouselCoverflowDemo() {
  return (
    <View className="w-full gap-4">
      <Carousel variant="coverflow" itemSize={150} defaultIndex={2}>
        <Carousel.Content className="h-48">
          {SCENES.map((scene) => (
            <Carousel.Item key={scene.title}>
              <Image
                source={{ uri: scene.uri }}
                className="h-32 w-24 rounded-xl"
              />
            </Carousel.Item>
          ))}
        </Carousel.Content>
        <Carousel.Controls className="mt-4" />
      </Carousel>
    </View>
  );
}
const ROLES = [
  {
    title: "Prompt Engineer",
    rate: "$120/hr",
    company: "Northwind",
    field: "AI Research",
  },
  {
    title: "Design Engineer",
    rate: "$95/hr",
    company: "Beacon",
    field: "Product",
  },
  {
    title: "Systems Architect",
    rate: "$140/hr",
    company: "Halcyon",
    field: "Infrastructure",
  },
  {
    title: "Motion Designer",
    rate: "$88/hr",
    company: "Fieldnote",
    field: "Brand",
  },
];
function CarouselStackDemo() {
  return (
    <View className="w-full items-center gap-6">
      <Carousel variant="stack" itemSize={260}>
        <Carousel.Content className="h-72">
          {ROLES.map((role) => (
            <Carousel.Item key={role.title}>
              <Card className="w-64 gap-0 overflow-hidden">
                <Card.Content className="gap-6 pt-4 pb-4">
                  <View className="flex-row items-start justify-between">
                    <Text size="sm" muted>
                      {role.rate}
                    </Text>
                    <BookmarkIcon size={16} />
                  </View>

                  <View className="flex-row items-end justify-between gap-3">
                    <Text size="2xl" weight="bold" className="flex-1">
                      {role.title}
                    </Text>

                    <Carousel.Dots orientation="vertical" className="pb-1" />
                  </View>
                </Card.Content>

                <Separator />

                <Card.Content className="flex-row items-center justify-between gap-3 py-3">
                  <View className="flex-1">
                    <Text size="sm" weight="semibold" numberOfLines={1}>
                      {role.company}
                    </Text>
                    <Text size="xs" muted numberOfLines={1}>
                      {role.field}
                    </Text>
                  </View>
                  <Button
                    size="sm"
                    className="rounded-full"
                    onPress={demoAction("View")}
                  >
                    View
                  </Button>
                </Card.Content>
              </Card>
            </Carousel.Item>
          ))}
        </Carousel.Content>
      </Carousel>

      <Text size="sm" muted className="text-center">
        Drag the top card away to deal the next one.
      </Text>
    </View>
  );
}
function CarouselAutoplayDemo() {
  return (
    <View className="w-full gap-4">
      <Carousel loop autoplay autoplayInterval={2200}>
        <Carousel.Content className="h-40">
          {SCENES.map((scene) => (
            <Carousel.Item key={scene.title} className="px-2">
              <View className="h-full w-full overflow-hidden rounded-2xl">
                <Image source={{ uri: scene.uri }} className="h-full w-full" />
              </View>
            </Carousel.Item>
          ))}
        </Carousel.Content>
        <Carousel.Dots className="mt-4 self-center" />
      </Carousel>
      <Text size="sm" muted className="text-center">
        It stops for good once you take hold of it, rather than starting again a
        moment later.
      </Text>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "carousel",
  name: "Carousel",
  summary: "A run of slides, one at a time, dragged with a finger",
  demos: [
    { label: "A track", render: () => <CarouselTrackDemo /> },
    { label: "Interactive", render: () => <CarouselInteractiveDemo /> },
    { label: "Interactive, bare", render: () => <CarouselBareDemo /> },
    { label: "Coverflow", render: () => <CarouselCoverflowDemo /> },
    { label: "A deck of cards", render: () => <CarouselStackDemo /> },
    { label: "Autoplay, looping", render: () => <CarouselAutoplayDemo /> },
  ],
};
