import { View } from "@tarojs/components";
import { Accordion } from "panelui-taro/accordion";
import { Switch } from "panelui-taro/switch";
import { Textarea } from "panelui-taro/textarea";
import { ThemeSelector } from "panelui-taro/theme-selector";
import { useState } from "react";

import { FAQ } from "../../constant";
import { Section } from "../Section";
import { Text } from "../Text";

export const SettingsScreen = () => {
  const [notifications, setNotifications] = useState(true);
  const [note, setNote] = useState("");
  return (
    <View className="flex flex-col gap-[36px]">
      <Section title="Maya Lindqvist" caption="Personal workspace">
        <Text className="text-[48px] font-semibold">
          A calmer kind of everyday.
        </Text>
        <Text muted size="sm">
          Home, money, movement and your next departure. All in one place.
        </Text>
      </Section>
      <Section title="Appearance">
        <ThemeSelector label="Choose your theme" variant="card" size="sm" />
      </Section>
      <Section title="Preferences">
        <Text>Demo notifications</Text>
        <Switch
          label="Demo notifications"
          value={notifications}
          onValueChange={setNotifications}
        />
        <Text muted size="xs">
          Demo preference · No system permission is requested.
        </Text>
      </Section>
      <Section title="Help & details">
        <Accordion variant="ghost">
          {FAQ.map((item) => (
            <Accordion.Item key={item.id} value={item.id}>
              <Accordion.Trigger>
                <Accordion.Title>{item.title}</Accordion.Title>
                <Accordion.Indicator />
              </Accordion.Trigger>
              <Accordion.Content>
                <Text size="sm" muted>
                  {item.body}
                </Text>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion>
      </Section>
      <Accordion variant="surface" keepMounted>
        <Accordion.Item value="note">
          <Accordion.Trigger>
            <Accordion.Title>A note for your next adventure</Accordion.Title>
            <Accordion.Indicator />
          </Accordion.Trigger>
          <Accordion.Content>
            <Textarea
              value={note}
              onChangeText={setNote}
              placeholder="Somewhere you would love to go…"
            />
            <Text size="xs" muted>
              Your draft stays here when you collapse this section.
            </Text>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
      <Text size="xs" muted className="text-center">
        Design reference: panelui.dev · Local interactive sample
      </Text>
    </View>
  );
};
