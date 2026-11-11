import { View } from "@tarojs/components";
import { BarChart } from "panelui-taro/bar-chart";
import { Button } from "panelui-taro/button";
import { AnimatedPressable } from "panelui-taro/primitives/animated-pressable";
import { Tabs } from "panelui-taro/tabs";
import {
  Lightbulb,
  Power,
  Sun,
  Moon,
  Tv,
  Lock,
  Minus,
  Plus,
  Thermometer,
} from "lucide-react-taro";
import { useState } from "react";

import { ROOMS, SCENES } from "../../constant";
import { Glyph } from "../Glyph";
import { Section } from "../Section";
import { Text } from "../Text";

const SCENE_ICONS = [Sun, Lock, Tv, Moon];
export const HomeScreen = () => {
  const [roomId, setRoomId] = useState(ROOMS[0].id);
  const [targets, setTargets] = useState<Record<string, number>>({});
  const [devices, setDevices] = useState<Record<string, boolean>>({});
  const [scenes, setScenes] = useState<Record<string, string>>({});
  const room = ROOMS.find((entry) => entry.id === roomId) ?? ROOMS[0];
  const target = targets[roomId] ?? room.target;
  const isOn = (name: string, index: number) =>
    devices[`${roomId}:${name}`] ?? (index === 0 || index === 3);
  const applyScene = (scene: string) => {
    setScenes((current) => ({ ...current, [roomId]: scene }));
    setDevices((current) => {
      const next = { ...current };
      for (const name of room.devices) {
        next[`${roomId}:${name}`] =
          scene === "Morning" ||
          (scene === "Movie" && (name === "Television" || name === "Speaker"));
      }
      return next;
    });
  };
  return (
    <View className="flex flex-col gap-[36px]">
      <Tabs
        defaultValue={ROOMS[0].id}
        value={roomId}
        onValueChange={setRoomId}
        variant="pill"
        size="sm"
      >
        <Tabs.List>
          {ROOMS.map((entry) => (
            <Tabs.Trigger key={entry.id} value={entry.id}>
              {entry.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs>
      <Section title="Climate" caption={`Heating · ${room.current}°`}>
        <View className="flex flex-row items-center justify-between gap-[20px]">
          <Glyph icon={Thermometer} size={30} />
          <Button
            size="icon"
            variant="outline"
            accessibilityLabel="Lower temperature"
            disabled={target <= 10}
            onPress={() =>
              setTargets((current) => ({
                ...current,
                [roomId]: Math.max(10, target - 0.5),
              }))
            }
          >
            <Glyph icon={Minus} size={18} />
          </Button>
          <Text className="text-[48px] font-semibold tabular-nums">
            {target.toFixed(1)}°
          </Text>
          <Button
            size="icon"
            variant="outline"
            accessibilityLabel="Raise temperature"
            disabled={target >= 30}
            onPress={() =>
              setTargets((current) => ({
                ...current,
                [roomId]: Math.min(30, target + 0.5),
              }))
            }
          >
            <Glyph icon={Plus} size={18} />
          </Button>
        </View>
      </Section>
      <Text size="sm" muted>
        Scenes
      </Text>
      <View className="grid grid-cols-2 gap-[16px]">
        {SCENES.map((scene, index) => {
          const Icon = SCENE_ICONS[index];
          return (
            <Button
              key={scene}
              variant={scenes[roomId] === scene ? "primary" : "secondary"}
              onPress={() => applyScene(scene)}
            >
              <Glyph icon={Icon} size={18} />
              {scene}
            </Button>
          );
        })}
      </View>
      <Text size="sm" muted>
        Devices · {room.devices.filter(isOn).length} on
      </Text>
      <View className="grid grid-cols-2 gap-[20px]">
        {room.devices.map((name, index) => {
          const on = isOn(name, index);
          return (
            <AnimatedPressable
              key={`${roomId}:${name}`}
              accessibilityRole="switch"
              accessibilityLabel={name}
              accessibilityState={{ checked: on }}
              onPress={() => {
                setDevices((current) => ({
                  ...current,
                  [`${roomId}:${name}`]: !on,
                }));
                setScenes((current) => ({ ...current, [roomId]: "" }));
              }}
              className={`flex min-h-[232px] flex-col justify-between rounded-[var(--panel-radius-3xl)] border-[2px] border-solid border-[var(--panel-border)] p-[28px] ${on ? "bg-[var(--panel-primary)]" : "bg-[var(--panel-card)]"}`}
            >
              <View className="flex size-[64px] items-center justify-center rounded-full bg-[var(--panel-card)]">
                {index < 2 ? (
                  <Glyph icon={Lightbulb} size={22} />
                ) : (
                  <Glyph icon={Power} size={22} />
                )}
              </View>
              <View>
                <Text
                  weight="semibold"
                  className={on ? "text-[var(--panel-primary-foreground)]" : ""}
                >
                  {name}
                </Text>
                <Text
                  size="sm"
                  className={
                    on
                      ? "text-[var(--panel-primary-foreground)]"
                      : "text-[var(--panel-muted-foreground)]"
                  }
                >
                  {on ? "On" : "Off"}
                </Text>
              </View>
            </AnimatedPressable>
          );
        })}
      </View>
      <Section title="Energy" caption="Today · −12.4%">
        <BarChart
          data={[0.3, 0.2, 0.6, 1.1, 0.7, 0.4, 0.9].map((value, index) => ({
            hour: `${index * 3}:00`,
            value,
          }))}
          xDataKey="hour"
        >
          <BarChart.Header
            value="4.2 kWh"
            caption="A little less than yesterday"
          />
          <BarChart.Grid />
          <BarChart.Bar dataKey="value" />
          <BarChart.XAxis />
        </BarChart>
      </Section>
    </View>
  );
};
