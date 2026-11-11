import Airplane01Icon from "@hugeicons/core-free-icons/Airplane01Icon";
import Luggage01Icon from "@hugeicons/core-free-icons/Luggage01Icon";
import { AnimatedBadge } from "panelui-taro/animated-badge";
import { Button } from "panelui-taro/button";
import { Countdown } from "panelui-taro/countdown";
import { FlipCard } from "panelui-taro/flip-card";
import {
  ChevronLeftIcon,
  ClockIcon,
  LockIcon,
  useIconColor,
} from "panelui-taro/icons";
import { Text } from "panelui-taro/primitives/text";
import { QRCode } from "panelui-taro/qr-code";
import { SlideButton } from "panelui-taro/slide-button";
import { Timeline } from "panelui-taro/timeline";
import { clsx as cn } from "clsx";
import { useMemo, useState, type ReactNode } from "react";

import { HugeiconsIcon, type IconSvgElement } from "../runtime/icons";
import { ScrollView, View, type LayoutChangeEvent } from "../runtime/native";
import { useSafeAreaInsets } from "../runtime/native";
import Svg, { Circle, Path } from "../runtime/svg";
import { useCSSVariable } from "../runtime/theme";
const FLIGHT = {
  airline: "Northwind Air",
  number: "NW 1482",
  cabin: "Economy",
  from: { code: "LIS", city: "Lisbon" },
  to: { code: "CPH", city: "Copenhagen" },
  durationMinutes: 215,
  arrivalOffsetMinutes: 60,
  passenger: "Maya Lindqvist",
  booking: "K7QX2M",
  gate: "B22",
  seat: "14A",
  group: "2",
  terminal: "1",
};
const DEPARTS_IN_MINUTES = 172;
const BOARDING_LEAD_MINUTES = 35;
const GATE_CLOSES_LEAD_MINUTES = 15;
const URGENT_BELOW_SECONDS = 600;
const BOARDING_CODE =
  "M1LINDQVIST/MAYA     EK7QX2M LISCPHNW 1482 289Y014A0042 100";
const FARE = [
  { label: "Fare", value: "Classic" },
  { label: "Cabin bag", value: "1 × 8 kg" },
  { label: "Checked bag", value: "1 × 23 kg" },
  { label: "Seat", value: "14A · Window" },
  { label: "Meal", value: "Vegetarian, pre-ordered" },
];
const MINUTE = 60000;
function clock(ms: number) {
  const date = new Date(ms);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
function duration(minutes: number) {
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
}
function useToken(name: string, fallback: string) {
  const value = useCSSVariable(name);
  return typeof value === "string" && value.length > 0 ? value : fallback;
}
function Glyph({
  icon,
  size = 18,
  color,
}: {
  icon: IconSvgElement;
  size?: number;
  color?: string;
}) {
  const inherited = useIconColor();
  const fallback = useToken("--color-foreground", "#262626");
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      color={color ?? inherited ?? fallback}
      strokeWidth={1.75}
    />
  );
}
function Field({
  label,
  value,
  align = "start",
}: {
  label: string;
  value: string;
  align?: "start" | "end";
}) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}, ${value}`}
      className={cn("gap-0.5", align === "end" && "items-end")}
    >
      <Text
        size="xs"
        weight="medium"
        muted
        className="tracking-wider uppercase"
      >
        {label}
      </Text>
      <Text weight="semibold" className="tabular-nums">
        {value}
      </Text>
    </View>
  );
}
function FlightPath() {
  const [width, setWidth] = useState(0);
  const stroke = useToken("--color-muted-foreground", "#737373");
  const plane = useToken("--color-foreground", "#262626");
  const height = 44;
  const inset = 6;
  return (
    <View
      className="flex-1 items-center"
      onLayout={(event: LayoutChangeEvent) =>
        setWidth(event.nativeEvent.layout.width)
      }
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
    >
      <View style={{ height }} className="w-full">
        {width > 0 ? (
          <Svg width={width} height={height}>
            <Path
              d={`M ${inset} ${height - 6} Q ${width / 2} ${-height / 2} ${width - inset} ${height - 6}`}
              stroke={stroke}
              strokeOpacity={0.6}
              strokeWidth={1.5}
              strokeDasharray="3 5"
              strokeLinecap="round"
              fill="none"
            />
            <Circle cx={inset} cy={height - 6} r={3} fill={stroke} />
            <Circle cx={width - inset} cy={height - 6} r={3} fill={stroke} />
          </Svg>
        ) : null}
        <View className="absolute inset-x-0 top-0 items-center">
          <View className="bg-card rounded-full px-1.5">
            <View style={{ transform: [{ rotate: "45deg" }] }}>
              <Glyph icon={Airplane01Icon} size={20} color={plane} />
            </View>
          </View>
        </View>
      </View>
      <Text size="xs" muted className="tabular-nums">
        {duration(FLIGHT.durationMinutes)} · Direct
      </Text>
    </View>
  );
}
function Perforation() {
  return (
    <View
      className="h-7 justify-center"
      importantForAccessibility="no"
      accessibilityElementsHidden
    >
      <View className="border-border bg-background absolute -left-3.5 h-7 w-7 rounded-full border" />
      <View className="border-border bg-background absolute -right-3.5 h-7 w-7 rounded-full border" />
      <View className="mx-6 flex-row justify-between">
        {Array.from({ length: 22 }, (_, index) => (
          <View
            key={index}
            className="bg-muted-foreground h-0.5 w-1.5 rounded-full opacity-40"
          />
        ))}
      </View>
    </View>
  );
}
function BoardingCode({ checkedIn }: { checkedIn: boolean }) {
  if (!checkedIn) {
    return (
      <View
        accessible
        accessibilityLabel="Boarding code locked. Check in to get it."
        className="bg-muted h-36 w-36 items-center justify-center gap-2 rounded-2xl"
      >
        <LockIcon size={22} />
        <Text size="xs" muted className="text-center">
          Check in to{"\n"}get your code
        </Text>
      </View>
    );
  }
  return (
    <QRCode value={BOARDING_CODE} errorCorrection="Q">
      <QRCode.Canvas
        pixelSize={144}
        moduleShape="rounded"
        eyeFrameShape="rounded"
      />
    </QRCode>
  );
}
function Header({
  onBack,
  checkedIn,
}: {
  onBack?: () => void;
  checkedIn: boolean;
}) {
  return (
    <View className="flex-row items-center gap-3">
      {onBack ? (
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          accessibilityLabel="Back"
          onPress={onBack}
        >
          <ChevronLeftIcon size={18} />
        </Button>
      ) : null}
      <View className="flex-1">
        <Text size="lg" weight="semibold" numberOfLines={1}>
          Boarding pass
        </Text>
        <Text size="sm" muted>
          Today · {FLIGHT.number}
        </Text>
      </View>
      <AnimatedBadge status={checkedIn ? "success" : "info"}>
        {checkedIn ? "Checked in" : "Check-in open"}
      </AnimatedBadge>
    </View>
  );
}
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-3">
      <Text size="sm" weight="semibold" muted>
        {title}
      </Text>
      {children}
    </View>
  );
}
export interface BoardingPassBlockProps {
  onBack?: () => void;
  className?: string;
}
export function BoardingPassBlock({
  onBack,
  className,
}: BoardingPassBlockProps) {
  const insets = useSafeAreaInsets();
  const [checkedIn, setCheckedIn] = useState(false);
  const onPrimary = useToken("--color-primary-foreground", "#fafafa");
  const mutedForeground = useToken("--color-muted-foreground", "#737373");
  const times = useMemo(() => {
    const departs =
      Math.ceil((Date.now() + DEPARTS_IN_MINUTES * MINUTE) / (5 * MINUTE)) *
      5 *
      MINUTE;
    return {
      departs,
      arrives:
        departs +
        (FLIGHT.durationMinutes + FLIGHT.arrivalOffsetMinutes) * MINUTE,
      boards: departs - BOARDING_LEAD_MINUTES * MINUTE,
      gateCloses: departs - GATE_CLOSES_LEAD_MINUTES * MINUTE,
      bagDropCloses: departs - 60 * MINUTE,
    };
  }, []);
  const landsNextDay =
    new Date(times.arrives).getDate() !== new Date(times.departs).getDate();
  const journey = [
    {
      title: "Check in",
      detail: "Online, until an hour before departure",
      at: checkedIn ? "Done" : "Now",
    },
    {
      title: "Drop your bag",
      detail: `Desks 14–18, Terminal ${FLIGHT.terminal}`,
      at: `by ${clock(times.bagDropCloses)}`,
    },
    {
      title: "Security",
      detail: "Allow about 20 minutes at this time of day",
      at: "20 min",
    },
    {
      title: `Gate ${FLIGHT.gate}`,
      detail: `Group ${FLIGHT.group} is called second. The gate closes at ${clock(times.gateCloses)}.`,
      at: clock(times.boards),
    },
  ];
  return (
    <View className={cn("bg-background flex-1", className)}>
      <View style={{ paddingTop: insets.top + 8 }} className="px-5 pb-3">
        <View className="w-full max-w-xl self-center">
          <Header onBack={onBack} checkedIn={checkedIn} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        contentContainerClassName="px-5 pt-2"
      >
        <View className="w-full max-w-xl gap-6 self-center">
          <View className="border-border bg-card overflow-hidden rounded-3xl border">
            <View className="gap-6 p-5">
              <View className="flex-row items-center gap-2.5">
                <View className="bg-primary h-8 w-8 items-center justify-center rounded-full">
                  <Glyph icon={Airplane01Icon} size={16} color={onPrimary} />
                </View>
                <Text size="sm" weight="semibold" className="flex-1">
                  {FLIGHT.airline}
                </Text>
                <Text size="sm" muted>
                  {FLIGHT.cabin}
                </Text>
              </View>

              <View className="flex-row items-start gap-3">
                <View
                  accessible
                  accessibilityLabel={`From ${FLIGHT.from.city}, departs ${clock(times.departs)}`}
                >
                  <Text weight="bold" className="text-5xl tracking-tight">
                    {FLIGHT.from.code}
                  </Text>
                  <Text size="sm" muted>
                    {FLIGHT.from.city}
                  </Text>
                  <Text
                    size="lg"
                    weight="semibold"
                    className="mt-2 tabular-nums"
                  >
                    {clock(times.departs)}
                  </Text>
                </View>

                <View className="flex-1 pt-3">
                  <FlightPath />
                </View>

                <View
                  className="items-end"
                  accessible
                  accessibilityLabel={`To ${FLIGHT.to.city}, arrives ${clock(times.arrives)} local time${landsNextDay ? ", the next day" : ""}`}
                >
                  <Text weight="bold" className="text-5xl tracking-tight">
                    {FLIGHT.to.code}
                  </Text>
                  <Text size="sm" muted>
                    {FLIGHT.to.city}
                  </Text>
                  <View className="mt-2 flex-row items-start gap-0.5">
                    <Text size="lg" weight="semibold" className="tabular-nums">
                      {clock(times.arrives)}
                    </Text>
                    {landsNextDay ? (
                      <Text size="xs" weight="semibold" muted>
                        +1
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>

              <View className="gap-4">
                <View className="flex-row justify-between">
                  <Field label="Passenger" value={FLIGHT.passenger} />
                  <Field label="Booking" value={FLIGHT.booking} align="end" />
                </View>
                <View className="flex-row justify-between">
                  <Field label="Gate" value={FLIGHT.gate} />
                  <Field label="Seat" value={FLIGHT.seat} />
                  <Field label="Group" value={FLIGHT.group} />
                  <Field
                    label="Boards"
                    value={clock(times.boards)}
                    align="end"
                  />
                </View>
              </View>

              <View className="bg-muted flex-row items-center gap-2.5 rounded-2xl px-4 py-3">
                <ClockIcon size={16} color={mutedForeground} />
                <Text size="sm" muted className="flex-1">
                  Boarding in
                </Text>
                <Countdown
                  to={times.boards}
                  variant="inline"
                  size="sm"
                  units={["hours", "minutes", "seconds"]}
                  urgentBelow={URGENT_BELOW_SECONDS}
                />
              </View>
            </View>

            <Perforation />

            <FlipCard className="h-64">
              <FlipCard.Front className="flex-1 items-center justify-center gap-3 p-5">
                <BoardingCode checkedIn={checkedIn} />
                <Text size="xs" muted>
                  Tap for fare and bags
                </Text>
              </FlipCard.Front>
              <FlipCard.Back className="bg-card flex-1 gap-3 p-5">
                <View className="flex-row items-center gap-2">
                  <Glyph icon={Luggage01Icon} size={18} />
                  <Text weight="semibold" className="flex-1">
                    Fare and bags
                  </Text>
                  <Text size="xs" muted>
                    Tap to turn back
                  </Text>
                </View>
                {FARE.map((row) => (
                  <View
                    key={row.label}
                    className="flex-row items-center justify-between"
                  >
                    <Text size="sm" muted>
                      {row.label}
                    </Text>
                    <Text size="sm" weight="medium">
                      {row.value}
                    </Text>
                  </View>
                ))}
              </FlipCard.Back>
            </FlipCard>
          </View>

          <Section title="Your journey">
            <Timeline value={checkedIn ? 0 : -1}>
              {journey.map((step, index) => (
                <Timeline.Item
                  key={step.title}
                  step={index}
                  last={index === journey.length - 1}
                >
                  <Timeline.Indicator />
                  <Timeline.Content>
                    <Timeline.Header>
                      <Timeline.Heading>
                        <Timeline.Title>{step.title}</Timeline.Title>
                      </Timeline.Heading>
                      <Timeline.Trailing>{step.at}</Timeline.Trailing>
                    </Timeline.Header>
                    <Timeline.Description>{step.detail}</Timeline.Description>
                  </Timeline.Content>
                </Timeline.Item>
              ))}
            </Timeline>
          </Section>
        </View>
      </ScrollView>

      <View
        style={{ paddingBottom: insets.bottom + 12 }}
        className="border-border bg-background absolute inset-x-0 bottom-0 border-t px-5 pt-3"
      >
        <View className="w-full max-w-xl self-center">
          <SlideButton
            completed={checkedIn}
            onComplete={() => setCheckedIn(true)}
            accessibilityActionLabel="Check in"
          >
            <SlideButton.Label>
              {checkedIn
                ? `Checked in · Seat ${FLIGHT.seat}`
                : "Slide to check in"}
            </SlideButton.Label>
          </SlideButton>
        </View>
      </View>
    </View>
  );
}
