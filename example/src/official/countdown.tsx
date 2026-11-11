import { Badge } from "panelui-taro/badge";
import { Button } from "panelui-taro/button";
import { Card } from "panelui-taro/card";
import { Countdown } from "panelui-taro/countdown";
import { OtpInput } from "panelui-taro/otp-input";
import { Text } from "panelui-taro/primitives/text";
import { useState } from "react";

import { ScrollView, View } from "../runtime/native";
import { ComponentEntry } from "../types";
function useTarget(seconds: number) {
  const [target, setTarget] = useState(() => Date.now() + seconds * 1000);
  return [target, () => setTarget(Date.now() + seconds * 1000)] as const;
}
function CountdownLaunchVersion() {
  const [target] = useTarget(2 * 86400 + 14 * 3600 + 3 * 60 + 41);
  const [notify, setNotify] = useState(false);
  return (
    <View className="bg-background flex-1 items-center justify-center gap-8 px-6">
      <View className="items-center gap-3">
        <Badge variant="outline" className="self-center">
          Launching Thursday
        </Badge>
        <Text size="3xl" weight="bold" className="text-center">
          Panel 2
        </Text>
        <Text muted className="text-center">
          A new editor, offline sync, and a public API.
        </Text>
      </View>
      <Countdown to={target} size="lg" />
      <Button
        variant={notify ? "outline" : "primary"}
        onPress={() => setNotify((on) => !on)}
      >
        {notify ? "We will email you" : "Notify me"}
      </Button>
    </View>
  );
}
function CountdownSaleVersion() {
  const [target, restart] = useTarget(5 * 60 + 8);
  const [over, setOver] = useState(false);
  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerStyle={{ padding: 16, gap: 16 }}
    >
      <Card>
        <Card.Header>
          <View className="flex-row items-center justify-between gap-3">
            <Badge>Flash sale</Badge>
            {over ? (
              <Text size="sm" weight="semibold" muted>
                Ended
              </Text>
            ) : (
              <View className="flex-row items-baseline gap-1.5">
                <Text size="sm" muted>
                  Ends in
                </Text>
                <Countdown
                  to={target}
                  variant="inline"
                  size="sm"
                  units={["minutes", "seconds"]}
                  urgentBelow={300}
                  onComplete={() => setOver(true)}
                />
              </View>
            )}
          </View>
          <Card.Title>40% off every annual plan</Card.Title>
          <Card.Description>
            The digits turn red in the last five minutes. It starts eight
            seconds above that line.
          </Card.Description>
        </Card.Header>
        <Card.Footer>
          <Button
            className="flex-1"
            onPress={() => {
              setOver(false);
              restart();
            }}
          >
            {over ? "Run it again" : "Upgrade for $86/yr"}
          </Button>
        </Card.Footer>
      </Card>
    </ScrollView>
  );
}
function CountdownResendVersion() {
  const [target, restart] = useTarget(30);
  const [ready, setReady] = useState(false);
  return (
    <View className="bg-background flex-1 gap-6 px-6 pt-10">
      <View className="gap-2">
        <Text size="2xl" weight="bold">
          Check your messages
        </Text>
        <Text muted>We sent a six-digit code to +44 7700 900 418.</Text>
      </View>
      <OtpInput length={6} groupEvery={3} />
      {ready ? (
        <Button
          variant="outline"
          onPress={() => {
            setReady(false);
            restart();
          }}
        >
          Resend code
        </Button>
      ) : (
        <View className="flex-row items-baseline justify-center gap-1.5">
          <Text size="sm" muted>
            Resend a code in
          </Text>
          <Countdown
            to={target}
            variant="inline"
            size="sm"
            units={["minutes", "seconds"]}
            onComplete={() => setReady(true)}
          />
        </View>
      )}
    </View>
  );
}
function CountdownSizesDemo() {
  const [target] = useTarget(3 * 3600 + 25 * 60 + 9);
  return (
    <View className="items-center gap-5">
      <Countdown to={target} size="sm" />
      <Countdown to={target} size="md" />
      <Countdown to={target} size="lg" units={["hours", "minutes"]} />
    </View>
  );
}
function CountdownLabelsDemo() {
  const [target] = useTarget(9 * 86400 + 6 * 3600 + 12 * 60);
  return (
    <Countdown
      to={target}
      labels={{
        days: "Jours",
        hours: "Heures",
        minutes: "Min",
        seconds: "Sec",
      }}
    />
  );
}
export const entry: ComponentEntry = {
  slug: "countdown",
  name: "Countdown",
  summary: "The time left until a moment, ticking down to it",
  demos: [
    {
      label: "Launch page",
      id: "launch",
      fullPage: true,
      description: "Large segments under a headline, two and a half days out.",
      render: () => <CountdownLaunchVersion />,
    },
    {
      label: "Flash sale",
      id: "sale",
      fullPage: true,
      description:
        'Inline in a card header. It turns red in the last five minutes and swaps to "Ended" when it reaches zero.',
      render: () => <CountdownSaleVersion />,
    },
    {
      label: "Resend a code",
      id: "resend",
      fullPage: true,
      description:
        "Thirty seconds, then the line becomes a button that starts it again.",
      render: () => <CountdownResendVersion />,
    },
    { label: "Sizes and units", render: () => <CountdownSizesDemo /> },
    { label: "Translated labels", render: () => <CountdownLabelsDemo /> },
  ],
};
