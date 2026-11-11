import { View } from "@tarojs/components";
import { Accordion } from "panelui-taro/accordion";
import { Countdown } from "panelui-taro/countdown";
import { QRCode } from "panelui-taro/qr-code";
import { SlideButton } from "panelui-taro/slide-button";
import { Plane, Lock } from "lucide-react-taro";
import { useState } from "react";

import { Glyph } from "../Glyph";
import { Section } from "../Section";
import { Text } from "../Text";

const clock = (time: number) =>
  new Date(time).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Lisbon",
  });

export const TravelScreen = () => {
  const [checkedIn, setCheckedIn] = useState(false);
  const [departure] = useState(() => Date.now() + 172 * 60_000);
  return (
    <View className="flex flex-col gap-[36px]">
      <Section title="Northwind Air" caption="Economy">
        <View className="flex flex-row items-center justify-between">
          <View>
            <Text className="text-[80px] font-semibold tracking-[-4px]">
              LIS
            </Text>
            <Text muted size="sm">
              Lisbon
            </Text>
            <Text weight="semibold">{clock(departure)}</Text>
          </View>
          <View className="flex flex-col items-center gap-[20px]">
            <Glyph icon={Plane} size={30} />
            <Text size="xs" muted>
              3h 35m · Direct
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-[80px] font-semibold tracking-[-4px]">
              CPH
            </Text>
            <Text muted size="sm">
              Copenhagen
            </Text>
            <Text weight="semibold">
              {new Date(departure + 215 * 60_000).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Europe/Copenhagen",
              })}
            </Text>
          </View>
        </View>
        <View className="flex flex-row justify-between">
          <View>
            <Text size="xs" muted>
              PASSENGER
            </Text>
            <Text weight="semibold">Maya Lindqvist</Text>
          </View>
          <View>
            <Text size="xs" muted>
              BOOKING
            </Text>
            <Text weight="semibold">K7QX2M</Text>
          </View>
        </View>
        <View className="flex flex-row justify-between">
          {[
            { label: "GATE", value: "B22" },
            { label: "SEAT", value: "14A" },
            { label: "GROUP", value: "2" },
            { label: "BOARDS", value: clock(departure - 35 * 60_000) },
          ].map((field) => (
            <View key={field.label}>
              <Text size="xs" muted>
                {field.label}
              </Text>
              <Text weight="semibold">{field.value}</Text>
            </View>
          ))}
        </View>
        <View className="flex flex-row items-center justify-between rounded-[24px] bg-[var(--panel-muted)] p-[24px]">
          <Text size="sm" muted>
            Boarding in
          </Text>
          <Countdown
            to={departure - 35 * 60_000}
            units={["hours", "minutes", "seconds"]}
            urgentBelow={600}
          />
        </View>
        <View className="items-center border-t-[2px] border-dashed border-[var(--panel-border)] pt-[40px]">
          {checkedIn ? (
            <QRCode value="PANELUI-DEMO-NOT-A-BOARDING-PASS-K7QX2M" size="md">
              <QRCode.Canvas />
              <QRCode.Caption>
                Demo boarding code · Not valid for travel
              </QRCode.Caption>
            </QRCode>
          ) : (
            <View className="flex min-h-[240px] items-center justify-center gap-[20px] rounded-[32px] bg-[var(--panel-muted)] p-[40px]">
              <Glyph icon={Lock} size={28} />
              <Text muted size="sm">
                Check in to get your code
              </Text>
            </View>
          )}
        </View>
      </Section>
      <SlideButton
        fullWidth
        completed={checkedIn}
        onCompletedChange={setCheckedIn}
        onComplete={() => setCheckedIn(true)}
        accessibilityActionLabel="Complete demo check-in"
      >
        <SlideButton.Label>
          {checkedIn ? "Checked in · Have a good flight" : "Slide to check in"}
        </SlideButton.Label>
      </SlideButton>
      <Section title="Your journey" caption="Terminal 1">
        {[
          {
            detail: checkedIn
              ? "Your demo boarding pass is ready"
              : "Slide above to unlock your boarding pass",
            time: "Now",
            title: "Check in",
          },
          {
            detail: "Allow 30 minutes · Terminal 1",
            time: clock(departure - 65 * 60_000),
            title: "Security & passport control",
          },
          {
            detail: "Group 2 · Seat 14A",
            time: clock(departure - 35 * 60_000),
            title: "Board at gate B22",
          },
          {
            detail: "Keep your boarding pass ready",
            time: clock(departure - 15 * 60_000),
            title: "Gate closes",
          },
        ].map((step) => (
          <View key={step.title} className="flex flex-row gap-[24px]">
            <Text muted size="xs" className="w-[100px] shrink-0">
              {step.time}
            </Text>
            <View>
              <Text weight="medium">{step.title}</Text>
              <Text muted size="xs">
                {step.detail}
              </Text>
            </View>
          </View>
        ))}
      </Section>
      <Accordion variant="surface">
        <Accordion.Item value="bags">
          <Accordion.Trigger>
            <Accordion.Title>Fare & baggage</Accordion.Title>
            <Accordion.Indicator />
          </Accordion.Trigger>
          <Accordion.Content>
            <Text size="sm" muted>
              Classic fare · 1 × 8 kg cabin bag · 1 × 23 kg checked bag · Window
              seat · Vegetarian meal
            </Text>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </View>
  );
};
