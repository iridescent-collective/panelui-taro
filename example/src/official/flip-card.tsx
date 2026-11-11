import BedDoubleIcon from "@hugeicons/core-free-icons/BedDoubleIcon";
import Call02Icon from "@hugeicons/core-free-icons/Call02Icon";
import Coffee01Icon from "@hugeicons/core-free-icons/Coffee01Icon";
import Location01Icon from "@hugeicons/core-free-icons/Location01Icon";
import Mail01Icon from "@hugeicons/core-free-icons/Mail01Icon";
import RefreshIcon from "@hugeicons/core-free-icons/RefreshIcon";
import Ticket01Icon from "@hugeicons/core-free-icons/Ticket01Icon";
import Wifi01Icon from "@hugeicons/core-free-icons/Wifi01Icon";
import { clsx as cn } from "clsx";
import { Avatar } from "panelui-taro/avatar";
import { Badge } from "panelui-taro/badge";
import { Button } from "panelui-taro/button";
import { Card } from "panelui-taro/card";
import { Chip } from "panelui-taro/chip";
import { FlipCard } from "panelui-taro/flip-card";
import { CheckIcon } from "panelui-taro/icons";
import { Text } from "panelui-taro/primitives/text";
import { QRCode } from "panelui-taro/qr-code";
import { Rating } from "panelui-taro/rating";
import { useState } from "react";

import logoDark from "../assets/logo-dark.png";
import { demoAction } from "../runtime/demo-action";
import { HugeiconsIcon } from "../runtime/icons";
import { Image, View } from "../runtime/native";
import { useCSSVariable } from "../runtime/theme";
import { ComponentEntry } from "../types";
const price = (value: number) => `$${value.toFixed(2)}`;
function FlipCardBankDemo() {
  const tint = useCSSVariable("--color-primary-foreground");
  return (
    <FlipCard className="w-full" style={{ height: "400rpx" }}>
      <FlipCard.Front className="bg-primary h-full justify-between rounded-2xl p-5">
        <View className="flex-row items-center justify-between">
          <Text size="sm" weight="medium" className="text-primary-foreground">
            PanelUI Bank
          </Text>
          <Image
            source={logoDark}
            style={{
              width: 26,
              height: 26,
              tintColor: typeof tint === "string" ? tint : undefined,
            }}
            resizeMode="contain"
            accessibilityLabel="PanelUI"
          />
        </View>
        <Text size="xl" className="text-primary-foreground tracking-[3px]">
          4242 4242 4242 4242
        </Text>
        <View className="flex-row justify-between">
          <Text size="sm" className="text-primary-foreground/80">
            K. ABDI
          </Text>
          <Text size="sm" className="text-primary-foreground/80">
            09/29
          </Text>
        </View>
      </FlipCard.Front>
      <FlipCard.Back className="bg-surface-secondary h-full justify-start rounded-2xl py-5">
        <View className="bg-foreground/80 h-10 w-full" />
        <View className="mt-5 flex-row items-center justify-end gap-3 px-5">
          <Text size="sm" muted>
            CVC
          </Text>
          <View className="bg-background rounded-md px-3 py-1">
            <Text className="font-mono">829</Text>
          </View>
        </View>
      </FlipCard.Back>
    </FlipCard>
  );
}
function FlipCardVerticalDemo() {
  return (
    <FlipCard
      direction="vertical"
      className="w-full"
      style={{ height: "280rpx" }}
    >
      <FlipCard.Front className="border-border bg-card h-full items-center justify-center gap-0.5 rounded-2xl border">
        <Text size="3xl" weight="bold">
          37°
        </Text>
        <Text size="sm" muted>
          Celsius
        </Text>
      </FlipCard.Front>
      <FlipCard.Back className="bg-primary h-full items-center justify-center gap-0.5 rounded-2xl">
        <Text size="3xl" weight="bold" className="text-primary-foreground">
          99°
        </Text>
        <Text size="sm" className="text-primary-foreground/70">
          Fahrenheit
        </Text>
      </FlipCard.Back>
    </FlipCard>
  );
}
function FlipCardControlledDemo() {
  const [flipped, setFlipped] = useState(false);
  return (
    <View className="w-full gap-3">
      <FlipCard
        flipped={flipped}
        trigger="none"
        className="w-full"
        style={{ height: "280rpx" }}
      >
        <FlipCard.Front className="border-border bg-card h-full items-center justify-center gap-1.5 rounded-2xl border px-6">
          <Text size="xs" weight="medium" muted>
            QUESTION
          </Text>
          <Text size="lg" weight="medium">
            Which ocean is the deepest?
          </Text>
        </FlipCard.Front>
        <FlipCard.Back className="bg-primary h-full items-center justify-center gap-1.5 rounded-2xl px-6">
          <Text
            size="xs"
            weight="medium"
            className="text-primary-foreground/60"
          >
            ANSWER
          </Text>
          <Text size="lg" weight="medium" className="text-primary-foreground">
            The Pacific
          </Text>
        </FlipCard.Back>
      </FlipCard>
      <Button variant="outline" onPress={() => setFlipped((on) => !on)}>
        {flipped ? "Back to the question" : "Show the answer"}
      </Button>
    </View>
  );
}
function FlipCardDragDemo() {
  const muted = useTint("--color-muted-foreground");
  const onPrimary = useTint("--color-primary-foreground");
  return (
    <FlipCard trigger="drag" className="w-full" style={{ height: "280rpx" }}>
      <FlipCard.Front className="border-border bg-card h-full items-center justify-center gap-2 rounded-2xl border">
        <HugeiconsIcon icon={RefreshIcon} size={20} color={muted} />
        <Text size="sm" muted>
          Drag across it
        </Text>
      </FlipCard.Front>
      <FlipCard.Back className="bg-primary h-full items-center justify-center gap-2 rounded-2xl">
        <CheckIcon size={20} color={onPrimary} />
        <Text size="sm" className="text-primary-foreground/80">
          Let go and it settles
        </Text>
      </FlipCard.Back>
    </FlipCard>
  );
}
function useTint(name: string): string | undefined {
  const value = useCSSVariable(name);
  return typeof value === "string" ? value : undefined;
}
const HOTEL_ROOMS = [
  { name: "Harbour double", sleeps: "Sleeps 2 · sea view", price: "$180" },
  { name: "Courtyard twin", sleeps: "Sleeps 2 · quiet side", price: "$165" },
  { name: "Loft suite", sleeps: "Sleeps 4 · terrace", price: "$260" },
];
const HOTEL_AMENITIES = [
  { label: "Wi-Fi", icon: Wifi01Icon },
  { label: "Breakfast", icon: Coffee01Icon },
  { label: "Late check-out", icon: BedDoubleIcon },
];
const PRODUCT_SIZES = [
  { label: "S", soldOut: false },
  { label: "M", soldOut: false },
  { label: "L", soldOut: true },
  { label: "XL", soldOut: false },
];
const PRODUCT_COLOURS = [
  { name: "Bone", swatch: "#E7E1D5" },
  { name: "Slate", swatch: "#5A6470" },
  { name: "Moss", swatch: "#6B7355" },
];
const TICKET_FIELDS = [
  { label: "GATE", value: "C" },
  { label: "ROW", value: "14" },
  { label: "SEAT", value: "22" },
];
const PROFILE_STATS = [
  { value: "12 yrs", label: "Experience" },
  { value: "Lisbon", label: "UTC+1" },
  { value: "4", label: "Reports" },
];
const PROFILE_SKILLS = ["Build systems", "Gradle", "Xcode", "CI", "Release"];
const PROFILE_CONTACTS = [
  { icon: Mail01Icon, value: "rosa@example.com" },
  { icon: Call02Icon, value: "+351 21 555 0134" },
];
function TurnHint({
  label = "Tap to turn",
  onPrimary = false,
}: {
  label?: string;
  onPrimary?: boolean;
}) {
  const mutedTint = useTint("--color-muted-foreground");
  const primaryTint = useTint("--color-primary-foreground");
  return (
    <View className="flex-row items-center gap-1.5">
      <HugeiconsIcon
        icon={RefreshIcon}
        size={13}
        color={onPrimary ? primaryTint : mutedTint}
      />
      <Text
        size="xs"
        muted={!onPrimary}
        className={cn(onPrimary && "text-primary-foreground/70")}
      >
        {label}
      </Text>
    </View>
  );
}
function FlipCardHotelVersion() {
  const muted = useTint("--color-muted-foreground");
  const onPrimary = useTint("--color-primary-foreground");
  return (
    <View className="flex-1 justify-center px-5">
      <FlipCard className="w-full" style={{ height: "680rpx" }}>
        <FlipCard.Front className="h-full">
          <Card className="bg-primary h-full justify-between overflow-hidden p-5">
            <View className="gap-4">
              <View className="flex-row items-start justify-between">
                <Badge
                  variant="success"
                  className="bg-success"
                  labelClassName="text-success-solid-foreground"
                >
                  9.1 · Excellent
                </Badge>
              </View>
              <View className="gap-1">
                <Text
                  size="2xl"
                  weight="semibold"
                  className="text-primary-foreground"
                >
                  The Wharf House
                </Text>
                <View className="flex-row items-center gap-1.5">
                  <HugeiconsIcon
                    icon={Location01Icon}
                    size={13}
                    color={onPrimary}
                  />
                  <Text size="sm" className="text-primary-foreground/80">
                    Old Town · 400m from the harbour
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center gap-2">
                <Rating value={4.5} readOnly size="sm" />
                <Text size="xs" className="text-primary-foreground/60">
                  128 reviews
                </Text>
              </View>
            </View>

            <View className="gap-3">
              <View className="border-primary-foreground/15 border-t" />
              <Text size="sm" className="text-primary-foreground/70">
                Free cancellation until 24 hours before
              </Text>
              <View className="flex-row items-end justify-between">
                <View className="flex-row items-baseline gap-1.5">
                  <Text
                    size="2xl"
                    weight="semibold"
                    className="text-primary-foreground"
                  >
                    $180
                  </Text>
                  <Text size="sm" className="text-primary-foreground/60">
                    a night
                  </Text>
                </View>
                <TurnHint label="Rooms" onPrimary />
              </View>
            </View>
          </Card>
        </FlipCard.Front>

        <FlipCard.Back className="h-full">
          <Card className="h-full justify-between p-5">
            <Text size="lg" weight="semibold">
              Rooms
            </Text>

            <View>
              {HOTEL_ROOMS.map((room, index) => (
                <View
                  key={room.name}
                  className={cn(
                    "flex-row items-center justify-between gap-3 py-3",
                    index > 0 && "border-border border-t"
                  )}
                >
                  <View className="shrink gap-0.5">
                    <Text size="sm" weight="medium">
                      {room.name}
                    </Text>
                    <Text size="xs" muted>
                      {room.sleeps}
                    </Text>
                  </View>
                  <Text size="sm" weight="semibold">
                    {room.price}
                  </Text>
                </View>
              ))}
            </View>

            <View className="gap-3">
              <View className="flex-row flex-wrap gap-2">
                {HOTEL_AMENITIES.map((amenity) => (
                  <Chip
                    key={amenity.label}
                    size="sm"
                    start={
                      <HugeiconsIcon
                        icon={amenity.icon}
                        size={13}
                        color={muted}
                      />
                    }
                  >
                    {amenity.label}
                  </Chip>
                ))}
              </View>
              <Button fullWidth onPress={demoAction("Book from $180")}>
                Book from $180
              </Button>
            </View>
          </Card>
        </FlipCard.Back>
      </FlipCard>
    </View>
  );
}
function FlipCardProductVersion() {
  return (
    <View className="flex-1 justify-center px-5">
      <FlipCard
        direction="vertical"
        className="w-full"
        style={{ height: "680rpx" }}
      >
        <FlipCard.Front className="h-full">
          <Card className="bg-primary h-full justify-between overflow-hidden p-5">
            <View className="flex-row items-start justify-between gap-3">
              <View className="shrink gap-1">
                <Text
                  size="xs"
                  weight="medium"
                  className="text-primary-foreground/60"
                >
                  {PRODUCT_COLOURS.map((colour) => colour.name).join(" · ")}
                </Text>
                <Text
                  size="2xl"
                  weight="semibold"
                  className="text-primary-foreground"
                >
                  Heavyweight Tee
                </Text>
                <Text size="sm" className="text-primary-foreground/70">
                  Organic cotton, boxy fit
                </Text>
              </View>
              <Badge
                variant="warning"
                className="bg-warning"
                labelClassName="text-warning-solid-foreground"
              >
                3 left
              </Badge>
            </View>

            <View className="gap-3">
              <View className="border-primary-foreground/15 border-t" />
              <Text size="sm" className="text-primary-foreground/70">
                Ships in two days
              </Text>
              <View className="flex-row items-end justify-between">
                <Text
                  size="2xl"
                  weight="semibold"
                  className="text-primary-foreground"
                >
                  $48
                </Text>
                <TurnHint label="Sizes" onPrimary />
              </View>
            </View>
          </Card>
        </FlipCard.Front>

        <FlipCard.Back className="h-full">
          <Card className="h-full justify-between p-5">
            <View className="gap-1">
              <Text size="lg" weight="semibold">
                Heavyweight Tee
              </Text>
              <Text size="sm" muted>
                280gsm combed cotton, pre-shrunk, with a ribbed collar that
                keeps its shape.
              </Text>
            </View>

            <View className="gap-2">
              <Text size="xs" weight="medium" muted>
                SIZE
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {PRODUCT_SIZES.map((size) => (
                  <Chip key={size.label} size="sm" disabled={size.soldOut}>
                    {size.soldOut ? `${size.label} — sold out` : size.label}
                  </Chip>
                ))}
              </View>
            </View>

            <View className="gap-3">
              <View className="border-border flex-row items-center justify-between border-t pt-3">
                <Text size="sm" muted>
                  Delivery
                </Text>
                <Text size="sm" weight="medium">
                  Two days, free
                </Text>
              </View>
              <Button fullWidth onPress={demoAction("Add to bag · $48")}>
                Add to bag · $48
              </Button>
            </View>
          </Card>
        </FlipCard.Back>
      </FlipCard>
    </View>
  );
}
function FlipCardTicketVersion() {
  const onPrimary = useTint("--color-primary-foreground");
  return (
    <View className="flex-1 justify-center px-5">
      <FlipCard className="w-full" style={{ height: "640rpx" }}>
        <FlipCard.Front className="bg-primary h-full justify-between rounded-2xl p-6">
          <View className="flex-row items-start justify-between gap-3">
            <View className="shrink gap-1">
              <Text
                size="xs"
                weight="medium"
                className="text-primary-foreground/70"
              >
                SAT 14 SEPTEMBER · 20:00
              </Text>
              <Text
                size="2xl"
                weight="semibold"
                className="text-primary-foreground"
              >
                Night Signal
              </Text>
              <Text size="sm" className="text-primary-foreground/80">
                The Foundry, Manchester
              </Text>
            </View>
            <HugeiconsIcon icon={Ticket01Icon} size={24} color={onPrimary} />
          </View>

          <View className="gap-5">
            <View className="border-primary-foreground/30 border-t border-dashed" />
            <View className="flex-row justify-between">
              {TICKET_FIELDS.map((field) => (
                <View key={field.label} className="gap-1">
                  <Text size="xs" className="text-primary-foreground/60">
                    {field.label}
                  </Text>
                  <Text
                    size="xl"
                    weight="semibold"
                    className="text-primary-foreground"
                  >
                    {field.value}
                  </Text>
                </View>
              ))}
            </View>
            <View className="flex-row items-center gap-1.5">
              <HugeiconsIcon icon={RefreshIcon} size={13} color={onPrimary} />
              <Text size="xs" className="text-primary-foreground/70">
                Tap for the code
              </Text>
            </View>
          </View>
        </FlipCard.Front>

        <FlipCard.Back className="border-border bg-card h-full items-center justify-between rounded-2xl border p-6">
          <Text size="xs" weight="medium" muted>
            NIGHT SIGNAL · GATE C
          </Text>

          <QRCode value="https://panelui.dev/t/NS-8842-14C" size="md">
            <QRCode.Canvas />
          </QRCode>
          <View className="items-center gap-1">
            <Text size="sm" weight="medium" className="font-mono">
              NS-8842-14C
            </Text>
            <Text size="xs" muted>
              Show this at the door
            </Text>
          </View>
        </FlipCard.Back>
      </FlipCard>
    </View>
  );
}
function FlipCardProfileVersion() {
  const muted = useTint("--color-muted-foreground");
  return (
    <View className="flex-1 justify-center px-5">
      <FlipCard className="w-full" style={{ height: "640rpx" }}>
        <FlipCard.Front className="h-full">
          <Card className="bg-primary h-full justify-between p-6">
            <View className="gap-4">
              <Avatar
                size="lg"
                fallback="RM"
                className="border-primary-foreground/20"
              />
              <View className="gap-2">
                <View className="gap-1">
                  <Text
                    size="2xl"
                    weight="semibold"
                    className="text-primary-foreground"
                  >
                    Rosa Marín
                  </Text>
                  <Text size="sm" className="text-primary-foreground/70">
                    Staff Engineer · Platform
                  </Text>
                </View>
                <Badge
                  variant="success"
                  className="bg-success"
                  labelClassName="text-success-solid-foreground"
                >
                  Available
                </Badge>
              </View>
            </View>

            <View className="gap-4">
              <View className="flex-row">
                {PROFILE_STATS.map((stat, index) => (
                  <View
                    key={stat.label}
                    className={cn(
                      "flex-1 gap-0.5",
                      index > 0 && "border-primary-foreground/20 border-l pl-4"
                    )}
                  >
                    <Text
                      size="lg"
                      weight="semibold"
                      className="text-primary-foreground"
                    >
                      {stat.value}
                    </Text>
                    <Text size="xs" className="text-primary-foreground/60">
                      {stat.label}
                    </Text>
                  </View>
                ))}
              </View>
              <TurnHint onPrimary />
            </View>
          </Card>
        </FlipCard.Front>

        <FlipCard.Back className="h-full">
          <Card className="h-full justify-between p-6">
            <View className="gap-2">
              <Text size="lg" weight="semibold">
                Rosa Marín
              </Text>
              <Text size="sm" muted>
                Twelve years on build tooling. Currently pulling the mobile
                release pipeline apart so it can be put back together in under
                ten minutes.
              </Text>
            </View>

            <View className="flex-row flex-wrap gap-2">
              {PROFILE_SKILLS.map((skill) => (
                <Chip key={skill} size="sm">
                  {skill}
                </Chip>
              ))}
            </View>

            <View className="gap-3">
              {PROFILE_CONTACTS.map((contact) => (
                <View
                  key={contact.value}
                  className="flex-row items-center gap-2.5"
                >
                  <HugeiconsIcon icon={contact.icon} size={15} color={muted} />
                  <Text size="sm">{contact.value}</Text>
                </View>
              ))}
            </View>
          </Card>
        </FlipCard.Back>
      </FlipCard>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "flip-card",
  name: "FlipCard",
  summary: "Two faces of one card, and a turn between them",
  demos: [
    {
      label: "A hotel room",
      id: "hotel",
      fullPage: true,
      description:
        "The listing on the front, the rooms and their prices on the back.",
      render: () => <FlipCardHotelVersion />,
    },
    {
      label: "A product",
      id: "product",
      fullPage: true,
      description: "What a shop grid has room for, and what it does not.",
      render: () => <FlipCardProductVersion />,
    },
    {
      label: "An event ticket",
      id: "ticket",
      fullPage: true,
      description:
        "Read by a person on the front and by a scanner on the back.",
      render: () => <FlipCardTicketVersion />,
    },
    {
      label: "A profile",
      id: "profile",
      fullPage: true,
      description: "A face in a directory, and the person behind it.",
      render: () => <FlipCardProfileVersion />,
    },
    { label: "A bank card", render: () => <FlipCardBankDemo /> },
    {
      label: "Turning it the other way",
      render: () => <FlipCardVerticalDemo />,
    },
    {
      label: "Flipped from somewhere else",
      render: () => <FlipCardControlledDemo />,
    },
    { label: "Turning it with a finger", render: () => <FlipCardDragDemo /> },
  ],
};
