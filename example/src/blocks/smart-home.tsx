import BlindsIcon from "@hugeicons/core-free-icons/BlindsIcon";
import BulbIcon from "@hugeicons/core-free-icons/BulbIcon";
import Coffee02Icon from "@hugeicons/core-free-icons/Coffee02Icon";
import Desk01Icon from "@hugeicons/core-free-icons/Desk01Icon";
import DishWasherIcon from "@hugeicons/core-free-icons/DishWasherIcon";
import DropletIcon from "@hugeicons/core-free-icons/DropletIcon";
import Fan01Icon from "@hugeicons/core-free-icons/Fan01Icon";
import FireIcon from "@hugeicons/core-free-icons/FireIcon";
import LockGlyph from "@hugeicons/core-free-icons/LockIcon";
import Moon02Icon from "@hugeicons/core-free-icons/Moon02Icon";
import PowerIcon from "@hugeicons/core-free-icons/PowerIcon";
import SnowIcon from "@hugeicons/core-free-icons/SnowIcon";
import Speaker01Icon from "@hugeicons/core-free-icons/Speaker01Icon";
import Sun03Icon from "@hugeicons/core-free-icons/Sun03Icon";
import SunCloud01Icon from "@hugeicons/core-free-icons/SunCloud01Icon";
import ThermometerIcon from "@hugeicons/core-free-icons/ThermometerIcon";
import Tv01Icon from "@hugeicons/core-free-icons/Tv01Icon";
import {
  BarChart,
  type BarChartDatum,
} from "panelui-taro/bar-chart";
import { Button } from "panelui-taro/button";
import { Frame } from "panelui-taro/frame";
import {
  ChevronLeftIcon,
  MinusIcon,
  PlusIcon,
  useIconColor,
} from "panelui-taro/icons";
import { Pressable as AnimatedPressable } from "../runtime/native";
import { Text } from "panelui-taro/primitives/text";
import { Tabs } from "panelui-taro/tabs";
import { TextAnimation } from "panelui-taro/text-animation";
import {
  ToggleButton,
  ToggleButtonGroup,
} from "panelui-taro/toggle-button";
import { clsx as cn } from "clsx";
import { memo, useState } from "react";

import { HugeiconsIcon, type IconSvgElement } from "../runtime/icons";
import { ScrollView, View } from "../runtime/native";
import { useSafeAreaInsets } from "../runtime/native";
import { useCSSVariable } from "../runtime/theme";
type DeviceKind = "light" | "blinds" | "media" | "appliance";
type Mode = "heat" | "cool" | "auto" | "off";
type Scene = "morning" | "away" | "movie" | "night";
interface Device {
  id: string;
  name: string;
  kind: DeviceKind;
  icon: IconSvgElement;
  on: boolean;
}
interface Room {
  id: string;
  name: string;
  current: number;
  target: number;
  mode: Mode;
  devices: Device[];
}
const ROOMS: Room[] = [
  {
    id: "living",
    name: "Living room",
    current: 20.4,
    target: 21.5,
    mode: "heat",
    devices: [
      {
        id: "ceiling",
        name: "Ceiling light",
        kind: "light",
        icon: BulbIcon,
        on: true,
      },
      {
        id: "lamp",
        name: "Floor lamp",
        kind: "light",
        icon: BulbIcon,
        on: false,
      },
      {
        id: "tv",
        name: "Television",
        kind: "media",
        icon: Tv01Icon,
        on: false,
      },
      {
        id: "speaker",
        name: "Speaker",
        kind: "media",
        icon: Speaker01Icon,
        on: true,
      },
      {
        id: "blinds",
        name: "Blinds",
        kind: "blinds",
        icon: BlindsIcon,
        on: true,
      },
      {
        id: "fan",
        name: "Ceiling fan",
        kind: "appliance",
        icon: Fan01Icon,
        on: false,
      },
    ],
  },
  {
    id: "kitchen",
    name: "Kitchen",
    current: 21.8,
    target: 21,
    mode: "auto",
    devices: [
      {
        id: "pendants",
        name: "Pendants",
        kind: "light",
        icon: BulbIcon,
        on: true,
      },
      {
        id: "cabinet",
        name: "Under-cabinet",
        kind: "light",
        icon: BulbIcon,
        on: false,
      },
      {
        id: "coffee",
        name: "Coffee machine",
        kind: "appliance",
        icon: Coffee02Icon,
        on: false,
      },
      {
        id: "dishwasher",
        name: "Dishwasher",
        kind: "appliance",
        icon: DishWasherIcon,
        on: true,
      },
    ],
  },
  {
    id: "bedroom",
    name: "Bedroom",
    current: 19.1,
    target: 18.5,
    mode: "cool",
    devices: [
      {
        id: "bedside",
        name: "Bedside lamp",
        kind: "light",
        icon: BulbIcon,
        on: false,
      },
      {
        id: "blinds",
        name: "Blinds",
        kind: "blinds",
        icon: BlindsIcon,
        on: false,
      },
      {
        id: "humidifier",
        name: "Humidifier",
        kind: "appliance",
        icon: DropletIcon,
        on: true,
      },
      { id: "fan", name: "Fan", kind: "appliance", icon: Fan01Icon, on: false },
    ],
  },
  {
    id: "office",
    name: "Office",
    current: 20.9,
    target: 21,
    mode: "off",
    devices: [
      {
        id: "desk",
        name: "Desk lamp",
        kind: "light",
        icon: Desk01Icon,
        on: true,
      },
      {
        id: "strip",
        name: "Light strip",
        kind: "light",
        icon: BulbIcon,
        on: true,
      },
      {
        id: "heater",
        name: "Heater",
        kind: "appliance",
        icon: FireIcon,
        on: false,
      },
      {
        id: "speaker",
        name: "Speaker",
        kind: "media",
        icon: Speaker01Icon,
        on: false,
      },
    ],
  },
];
const OUTSIDE = { temperature: 14, summary: "Light cloud" };
const MIN_TEMPERATURE = 10;
const MAX_TEMPERATURE = 30;
const MODES: {
  id: Mode;
  label: string;
  icon: IconSvgElement;
  surface: string;
}[] = [
  { id: "heat", label: "Heat", icon: FireIcon, surface: "bg-warning-subtle" },
  { id: "cool", label: "Cool", icon: SnowIcon, surface: "bg-info-subtle" },
  {
    id: "auto",
    label: "Auto",
    icon: ThermometerIcon,
    surface: "bg-success-subtle",
  },
  { id: "off", label: "Off", icon: PowerIcon, surface: "bg-muted" },
];
const MODE_TOKEN: Record<Mode, string> = {
  heat: "--color-warning",
  cool: "--color-info",
  auto: "--color-success",
  off: "--color-muted-foreground",
};
const SCENES: {
  id: Scene;
  label: string;
  icon: IconSvgElement;
  sets: Partial<Record<DeviceKind, boolean>>;
}[] = [
  {
    id: "morning",
    label: "Morning",
    icon: Sun03Icon,
    sets: { light: true, blinds: true },
  },
  {
    id: "away",
    label: "Away",
    icon: LockGlyph,
    sets: { light: false, media: false, appliance: false },
  },
  {
    id: "movie",
    label: "Movie",
    icon: Tv01Icon,
    sets: { light: false, blinds: false, media: true },
  },
  {
    id: "night",
    label: "Night",
    icon: Moon02Icon,
    sets: { light: false, blinds: false, media: false },
  },
];
function clockHour(hour: number) {
  return `${String(hour).padStart(2, "0")}:00`;
}
const ENERGY = [
  0.3, 0.2, 0.2, 0.2, 0.3, 0.6, 0.9, 1.1, 0.7, 0.5, 0.4, 0.5, 0.6, 0.4, 0.4,
  0.5, 0.7, 0.9,
].map((kwh, hour) => ({
  hour: clockHour(hour),
  until: clockHour(hour + 1),
  kwh,
}));
const ENERGY_TODAY = ENERGY.reduce((sum, row) => sum + row.kwh, 0);
const ENERGY_TREND = -12.4;
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
function stateOf(device: Device) {
  if (device.kind === "blinds") return device.on ? "Open" : "Closed";
  if (device.kind === "media") return device.on ? "Playing" : "Off";
  return device.on ? "On" : "Off";
}
function Climate({
  room,
  onChange,
}: {
  room: Room;
  onChange: (patch: Partial<Room>) => void;
}) {
  const mode = MODES.find((item) => item.id === room.mode)!;
  const tint = useToken(MODE_TOKEN[room.mode], "#f59e0b");
  const off = room.mode === "off";
  const tooCold = room.current < room.target - 0.2;
  const tooWarm = room.current > room.target + 0.2;
  const status = off
    ? "Off"
    : tooCold && room.mode !== "cool"
      ? "Heating"
      : tooWarm && room.mode !== "heat"
        ? "Cooling"
        : "Holding";
  const nextMode = MODES[(MODES.indexOf(mode) + 1) % MODES.length]!;
  const nudge = (by: number) =>
    onChange({
      target: Math.min(
        MAX_TEMPERATURE,
        Math.max(MIN_TEMPERATURE, room.target + by)
      ),
    });
  return (
    <View className="border-border bg-card flex-row flex-wrap items-center justify-end gap-3 rounded-3xl border p-3 pl-4">
      <View className="min-w-36 flex-1 flex-row items-center gap-3">
        <AnimatedPressable
          onPress={() => onChange({ mode: nextMode.id })}
          accessibilityRole="button"
          accessibilityLabel={`Mode: ${mode.label}`}
          accessibilityHint={`Changes the mode to ${nextMode.label}`}
          className={cn(
            "h-11 w-11 items-center justify-center rounded-full",
            mode.surface
          )}
        >
          <Glyph icon={mode.icon} size={20} color={tint} />
        </AnimatedPressable>

        <View
          className="flex-1"
          accessible
          accessibilityLabel={`Climate. ${status}, currently ${room.current.toFixed(1)} degrees`}
        >
          <Text weight="semibold" numberOfLines={1}>
            Climate
          </Text>
          <Text size="sm" muted className="tabular-nums" numberOfLines={1}>
            {status} · {room.current.toFixed(1)}°
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-full"
          accessibilityLabel="Lower the target by half a degree"
          disabled={off || room.target <= MIN_TEMPERATURE}
          onPress={() => nudge(-0.5)}
        >
          <MinusIcon size={14} />
        </Button>
        <View
          accessible
          accessibilityLabel={`Target ${room.target.toFixed(1)} degrees`}
          className={cn("flex-row items-start", off && "opacity-40")}
        >
          <TextAnimation.Sliding
            value={room.target}
            decimals={1}
            textClassName="text-2xl font-bold"
          />
          <Text weight="bold" className="text-lg">
            °
          </Text>
        </View>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-full"
          accessibilityLabel="Raise the target by half a degree"
          disabled={off || room.target >= MAX_TEMPERATURE}
          onPress={() => nudge(0.5)}
        >
          <PlusIcon size={14} />
        </Button>
      </View>
    </View>
  );
}
function DeviceTile({
  device,
  onToggle,
}: {
  device: Device;
  onToggle: (on: boolean) => void;
}) {
  const primary = useToken("--color-primary", "#262626");
  const muted = useToken("--color-muted-foreground", "#737373");
  return (
    <AnimatedPressable
      onPress={() => onToggle(!device.on)}
      accessibilityRole="switch"
      accessibilityLabel={device.name}
      accessibilityState={{ checked: device.on }}
      aria-valuetext={stateOf(device)}
      className={cn(
        "flex-1 gap-5 rounded-3xl border p-4",
        device.on ? "border-primary bg-primary" : "border-border bg-card"
      )}
    >
      <View
        className={cn(
          "h-11 w-11 items-center justify-center rounded-full",
          device.on ? "bg-primary-foreground" : "bg-muted"
        )}
      >
        <Glyph
          icon={device.icon}
          size={20}
          color={device.on ? primary : muted}
        />
      </View>
      <View>
        <Text
          weight="semibold"
          numberOfLines={1}
          className={cn(device.on && "text-primary-foreground")}
        >
          {device.name}
        </Text>
        <Text
          size="sm"
          muted={!device.on}
          className={cn(device.on && "text-primary-foreground opacity-70")}
        >
          {stateOf(device)}
        </Text>
      </View>
    </AnimatedPressable>
  );
}
const EnergyFrame = memo(function EnergyFrame() {
  const [hour, setHour] = useState<BarChartDatum | null>(null);
  return (
    <Frame className="w-full">
      <Frame.Header>
        <Frame.Title>Energy today</Frame.Title>
        <Frame.Action>Whole house</Frame.Action>
      </Frame.Header>
      <Frame.Panel>
        <BarChart
          data={ENERGY}
          xDataKey="hour"
          aspectRatio={2}
          onActiveIndexChange={(_index, datum) => setHour(datum)}
        >
          <BarChart.Header
            className="px-4 pt-3.5"
            value={`${(hour ? Number(hour.kwh) : ENERGY_TODAY).toFixed(1)} kWh`}
            caption={
              hour
                ? `${hour.hour}–${hour.until}`
                : `${ENERGY_TREND}% on the same hours yesterday`
            }
          />
          <BarChart.Grid />
          <BarChart.Bar dataKey="kwh" />

          <BarChart.XAxis
            ticks={4}
            format={(datum) => String(datum.hour).slice(0, 2)}
          />
          <BarChart.Tooltip />
        </BarChart>
      </Frame.Panel>
    </Frame>
  );
});
export interface SmartHomeBlockProps {
  onBack?: () => void;
  className?: string;
}
export function SmartHomeBlock({ onBack, className }: SmartHomeBlockProps) {
  const insets = useSafeAreaInsets();
  const sky = useToken("--color-foreground", "#262626");
  const [rooms, setRooms] = useState(ROOMS);
  const [roomId, setRoomId] = useState(ROOMS[0]!.id);
  const [scenes, setScenes] = useState<Record<string, Scene | undefined>>({});
  const room = rooms.find((item) => item.id === roomId) ?? rooms[0]!;
  const scene = scenes[room.id];
  const onCount = rooms.reduce(
    (sum, item) => sum + item.devices.filter((device) => device.on).length,
    0
  );
  const patchRoom = (patch: Partial<Room>) =>
    setRooms((current) =>
      current.map((item) =>
        item.id === room.id ? { ...item, ...patch } : item
      )
    );
  const setDevice = (id: string, on: boolean) => {
    patchRoom({
      devices: room.devices.map((device) =>
        device.id === id ? { ...device, on } : device
      ),
    });
    setScenes((current) => ({ ...current, [room.id]: undefined }));
  };
  const applyScene = (id: Scene | undefined) => {
    setScenes((current) => ({ ...current, [room.id]: id }));
    if (!id) return;
    const { sets } = SCENES.find((item) => item.id === id)!;
    patchRoom({
      devices: room.devices.map((device) =>
        sets[device.kind] === undefined
          ? device
          : { ...device, on: sets[device.kind]! }
      ),
    });
  };
  const rows: Device[][] = [];
  for (let index = 0; index < room.devices.length; index += 2)
    rows.push(room.devices.slice(index, index + 2));
  return (
    <View className={cn("bg-background flex-1", className)}>
      <View style={{ paddingTop: insets.top + 8 }} className="px-5 pb-3">
        <View className="w-full max-w-xl flex-row items-center gap-3 self-center">
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
            <Text size="lg" weight="semibold">
              Home
            </Text>
            <Text size="sm" muted>
              {rooms.length} rooms · {onCount} devices on
            </Text>
          </View>
          <View
            accessible
            accessibilityLabel={`${OUTSIDE.temperature} degrees outside, ${OUTSIDE.summary.toLowerCase()}`}
            className="bg-muted flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
          >
            <Glyph icon={SunCloud01Icon} size={16} color={sky} />
            <Text size="sm" weight="semibold" className="tabular-nums">
              {OUTSIDE.temperature}°
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        contentContainerClassName="px-5 pt-2"
      >
        <View className="w-full max-w-xl gap-6 self-center">
          <Tabs
            variant="pill"
            defaultValue={ROOMS[0]!.id}
            value={room.id}
            onValueChange={setRoomId}
          >
            <Tabs.List scrollable>
              {rooms.map((item) => (
                <Tabs.Trigger key={item.id} value={item.id}>
                  {item.name}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs>

          <Climate room={room} onChange={patchRoom} />

          <View className="gap-3">
            <Text size="sm" weight="semibold" muted>
              Scenes
            </Text>

            <ToggleButtonGroup
              selectionMode="single"
              value={scene ? [scene] : []}
              onValueChange={(value) =>
                applyScene(value[0] as Scene | undefined)
              }
              className="w-full flex-wrap gap-2"
            >
              {SCENES.map((item) => (
                <ToggleButton
                  key={item.id}
                  id={item.id}
                  className="h-auto min-h-12 grow basis-[46%] justify-start gap-2.5 rounded-2xl px-4 py-3"
                >
                  <Glyph icon={item.icon} size={18} />
                  <ToggleButton.Label>{item.label}</ToggleButton.Label>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </View>

          <View className="gap-3">
            <Text size="sm" weight="semibold" muted>
              Devices
            </Text>
            {rows.map((row) => (
              <View
                key={row.map((device) => device.id).join()}
                className="flex-row gap-3"
              >
                {row.map((device) => (
                  <DeviceTile
                    key={device.id}
                    device={device}
                    onToggle={(on) => setDevice(device.id, on)}
                  />
                ))}
                {row.length === 1 ? <View className="flex-1" /> : null}
              </View>
            ))}
          </View>

          <EnergyFrame />
        </View>
      </ScrollView>
    </View>
  );
}
