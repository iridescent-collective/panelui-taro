import { Avatar } from "panelui-taro/avatar";
import { Badge } from "panelui-taro/badge";
import { Button } from "panelui-taro/button";
import { Card } from "panelui-taro/card";
import { Chip } from "panelui-taro/chip";
import { Frame } from "panelui-taro/frame";
import {
  ChevronLeftIcon,
  CompassIcon,
  StarIcon,
  XIcon,
} from "panelui-taro/icons";
import { Input } from "panelui-taro/input";
import { Item } from "panelui-taro/item";
import { Map, type LngLat, type MapHandle } from "panelui-taro/map";
import { Text } from "panelui-taro/primitives/text";
import { Progress } from "panelui-taro/progress";
import { Separator } from "panelui-taro/separator";
import { useMemo, useRef, useState } from "react";

import { ScrollView, View } from "../runtime/native";
import { useSafeAreaInsets } from "../runtime/native";
import { router } from "../runtime/router";
import { useCSSVariable } from "../runtime/theme";
import { EUROPE_CODES, europeFeatures } from "./europe-outlines";
function useToken(name: string, fallback: string) {
  const value = useCSSVariable(name);
  return typeof value === "string" && value.length > 0 ? value : fallback;
}
function seeded(key: string, min: number, max: number) {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1)
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  const unit = Math.abs(Math.sin(hash)) % 1;
  return Math.round(min + unit * (max - min));
}
const EUROPE_BOUNDS: [number, number, number, number] = [-11, 35, 31, 63];
const PLACES = [
  {
    id: "nat",
    name: "Natural History Museum",
    category: "Museum",
    rating: 4.7,
    reviews: "92k",
    minutes: 14,
    open: "Closes 17:50",
    lngLat: [-0.1763, 51.4967] as LngLat,
  },
  {
    id: "vna",
    name: "V&A",
    category: "Museum",
    rating: 4.8,
    reviews: "61k",
    minutes: 12,
    open: "Closes 17:45",
    lngLat: [-0.1719, 51.4966] as LngLat,
  },
  {
    id: "hyde",
    name: "Hyde Park",
    category: "Park",
    rating: 4.7,
    reviews: "140k",
    minutes: 9,
    open: "Open until midnight",
    lngLat: [-0.1657, 51.5073] as LngLat,
  },
  {
    id: "harr",
    name: "Harrods",
    category: "Department store",
    rating: 4.4,
    reviews: "73k",
    minutes: 7,
    open: "Closes 21:00",
    lngLat: [-0.1633, 51.4994] as LngLat,
  },
];
const HERE: LngLat = [-0.1622, 51.4936];
export function PlacesBlock() {
  const [selected, setSelected] = useState<(typeof PLACES)[number] | null>(
    null
  );
  const [directions, setDirections] = useState(false);
  const [query, setQuery] = useState("");
  const insets = useSafeAreaInsets();
  const map = useRef<MapHandle>(null);
  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return PLACES.filter(
      (place) =>
        place.name.toLowerCase().includes(needle) ||
        place.category.toLowerCase().includes(needle)
    );
  }, [query]);
  const select = (place: (typeof PLACES)[number]) => {
    setSelected(place);
    setDirections(false);
    setQuery("");
    map.current?.flyTo({ center: place.lngLat, zoom: 15 });
  };
  return (
    <View className="flex-1">
      <Map ref={map} center={HERE} zoom={14}>
        {PLACES.map((place) => (
          <Map.Marker
            key={place.id}
            lngLat={place.lngLat}
            onPress={() => select(place)}
          >
            <View
              className={
                place.id === selected?.id
                  ? "border-background bg-primary h-6 w-6 rounded-full border-[3px] shadow-md"
                  : "border-background bg-muted-foreground h-4 w-4 rounded-full border-2"
              }
            />

            {place.id === selected?.id ? (
              <Map.Label side="top" size="sm" tone="primary">
                {place.name}
              </Map.Label>
            ) : null}
          </Map.Marker>
        ))}

        <Map.Marker lngLat={HERE}>
          <View className="border-background bg-info h-4 w-4 rounded-full border-2" />
        </Map.Marker>

        {directions && selected ? (
          <Map.Route coordinates={[HERE, selected.lngLat]} width={5} />
        ) : null}

        <Map.Controls locate position="top-right" className="mt-32" />
      </Map>

      <View className="absolute start-4 end-4" style={{ top: insets.top + 8 }}>
        <Card>
          <Card.Content className="flex-row items-center gap-2 p-2">
            <Button
              size="icon"
              variant="ghost"
              accessibilityLabel="Back"
              onPress={() => router.back()}
            >
              <ChevronLeftIcon size={18} />
            </Button>

            <Input
              value={query}
              onChangeText={setQuery}
              placeholder="Search here"
              containerClassName="flex-1"
              className="border-0 bg-transparent px-0"
              size="sm"
              returnKeyType="search"
              onConfirm={() => matches[0] && select(matches[0])}
            />
            {query.length > 0 ? (
              <Button
                size="icon"
                variant="ghost"
                accessibilityLabel="Clear search"
                onPress={() => setQuery("")}
              >
                <XIcon size={16} />
              </Button>
            ) : (
              <Avatar size="sm" fallback="K" />
            )}
          </Card.Content>
        </Card>

        {query.trim() ? (
          <Card className="mt-2">
            {matches.length === 0 ? (
              <Card.Content className="p-3">
                <Text size="sm" muted>
                  Nothing here matches “{query.trim()}”.
                </Text>
              </Card.Content>
            ) : (
              matches.map((place) => (
                <Item key={place.id} size="sm" onPress={() => select(place)}>
                  <Item.Media variant="icon">
                    <CompassIcon size={16} />
                  </Item.Media>
                  <Item.Content>
                    <Item.Title>{place.name}</Item.Title>
                    <Item.Description>
                      {place.category} · {place.minutes} min walk
                    </Item.Description>
                  </Item.Content>
                </Item>
              ))
            )}
          </Card>
        ) : (
          <View className="mt-2 flex-row gap-2">
            {["Restaurants", "Museums", "Parks"].map((label) => (
              <Chip
                key={label}
                size="sm"
                onPress={() => setQuery(label.slice(0, -1))}
              >
                {label}
              </Chip>
            ))}
          </View>
        )}
      </View>

      {selected ? (
        <View
          className="absolute start-4 end-4"
          style={{ bottom: insets.bottom + 16 }}
        >
          <Card>
            <Card.Content className="gap-3 p-4">
              <View className="flex-row items-start gap-3">
                <View className="min-w-0 flex-1 gap-0.5">
                  <Text weight="semibold" numberOfLines={1}>
                    {selected.name}
                  </Text>
                  <View className="flex-row items-center gap-1.5">
                    <Text size="sm" weight="medium">
                      {selected.rating}
                    </Text>
                    <StarIcon size={12} filled />
                    <Text size="sm" muted numberOfLines={1}>
                      ({selected.reviews}) · {selected.category}
                    </Text>
                  </View>
                  <Text size="sm" muted numberOfLines={1}>
                    {selected.open} · {selected.minutes} min walk
                  </Text>
                </View>
                <Button
                  size="icon"
                  variant="ghost"
                  accessibilityLabel="Close"
                  onPress={() => setSelected(null)}
                >
                  <XIcon size={16} />
                </Button>
              </View>

              <View className="flex-row gap-2">
                <Button
                  className="flex-1"
                  size="sm"
                  onPress={() => setDirections((current) => !current)}
                >
                  {directions ? "Hide route" : "Directions"}
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Save
                </Button>
              </View>
            </Card.Content>
          </Card>
        </View>
      ) : null}
    </View>
  );
}
const METRICS = [
  { id: "revenue", label: "Revenue", unit: "€", min: 40, max: 9800 },
  { id: "customers", label: "Customers", unit: "", min: 12, max: 4200 },
  { id: "churn", label: "Churn", unit: "%", min: 1, max: 14 },
] as const;
export function ChoroplethBlock() {
  const [metric, setMetric] = useState<(typeof METRICS)[number]>(METRICS[0]);
  const muted = useToken("--color-muted", "rgba(0,0,0,0.06)");
  const primary = useToken("--color-primary", "#262626");
  const { data, peak } = useMemo(() => {
    const values = Object.fromEntries(
      EUROPE_CODES.map((code) => [
        code,
        seeded(metric.id + code, metric.min, metric.max),
      ])
    );
    return {
      data: europeFeatures(values),
      peak: Math.max(...Object.values(values)),
    };
  }, [metric]);
  return (
    <View className="flex-1">
      <View className="gap-3 p-4">
        <View className="gap-1">
          <Text size="lg" weight="semibold">
            {metric.label} by country
          </Text>
          <Text size="sm" muted>
            One layer, shaded by a style expression — not one layer per bucket.
          </Text>
        </View>
        <View className="flex-row gap-2">
          {METRICS.map((option) => (
            <Chip
              key={option.id}
              selected={option.id === metric.id}
              onPress={() => setMetric(option)}
            >
              {option.label}
            </Chip>
          ))}
        </View>
      </View>

      <View className="flex-1">
        <Map blank bounds={EUROPE_BOUNDS}>
          <Map.GeoJSON
            data={data}
            fill={[
              "interpolate",
              ["linear"],
              ["get", "value"],
              0,
              muted,
              peak,
              primary,
            ]}
            fillOpacity={0.9}
            accessibility={(feature) => {
              const country = feature as (typeof data.features)[number];
              const suffix = metric.id === "churn" ? "%" : "";
              const value = `${metric.unit}${country.properties.value.toLocaleString()}${suffix}`;
              return {
                label: `${country.properties.name}: ${value}`,
              };
            }}
          />

          <Map.Controls recenter />
        </Map>
      </View>

      <View className="gap-2 p-4">
        <View className="h-2 flex-row overflow-hidden rounded-full">
          {Array.from({ length: 12 }, (_, i) => (
            <View
              key={i}
              className="flex-1"
              style={{
                backgroundColor: i === 0 ? muted : primary,
                opacity: 0.15 + (i / 11) * 0.85,
              }}
            />
          ))}
        </View>
        <View className="flex-row justify-between">
          <Text size="xs" muted>
            {metric.unit}0
          </Text>
          <Text size="xs" muted>
            {metric.unit}
            {peak.toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
}
const HOTSPOTS: LngLat[] = [
  [-0.128, 51.507],
  [2.352, 48.857],
  [13.405, 52.52],
  [4.895, 52.37],
  [12.496, 41.903],
  [-3.703, 40.417],
];
function scatter() {
  const points: {
    lngLat: LngLat;
    weight: number;
  }[] = [];
  HOTSPOTS.forEach(([lng, lat], city) => {
    const count = 40 + city * 8;
    for (let i = 0; i < count; i += 1) {
      const key = `${city}-${i}`;
      points.push({
        lngLat: [
          lng + (seeded(`x${key}`, -140, 140) / 100) * 0.9,
          lat + (seeded(`y${key}`, -140, 140) / 100) * 0.5,
        ],
        weight: seeded(`w${key}`, 10, 100) / 100,
      });
    }
  });
  return {
    type: "FeatureCollection" as const,
    features: points.map((p, i) => ({
      type: "Feature" as const,
      id: i,
      properties: { weight: p.weight },
      geometry: { type: "Point" as const, coordinates: p.lngLat },
    })),
  };
}
const HEAT_RAMP = ["#fff7bc", "#fee391", "#fec44f", "#fe9929", "#d7301f"];
function HeatLegend() {
  return (
    <Card>
      <Card.Content className="gap-2 p-3">
        <Text size="xs" weight="medium">
          Reports per square kilometre
        </Text>
        <View className="h-2 flex-row overflow-hidden rounded-full">
          {HEAT_RAMP.map((color) => (
            <View
              key={color}
              className="flex-1"
              style={{ backgroundColor: color }}
            />
          ))}
        </View>
        <View className="flex-row justify-between">
          <Text size="xs" muted>
            Low
          </Text>
          <Text size="xs" muted>
            High
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
}
export function HeatmapBlock() {
  const data = useMemo(scatter, []);
  return (
    <View className="flex-1">
      <View className="gap-1 p-4">
        <Text size="lg" weight="semibold">
          Reported outages
        </Text>
        <Text size="sm" muted>
          Where, rather than how many. Zoom in and the field hands over to the
          reports it was made of.
        </Text>
      </View>
      <View className="flex-1">
        <Map bounds={[-10, 38, 20, 56]}>
          <Map.Heatmap
            data={data}
            weight="weight"
            radius={28}
            colors={HEAT_RAMP}
            points
            maxZoom={9}
          />
          <Map.Controls position="top-right" />
        </Map>
        <View className="absolute start-4 end-4 bottom-4">
          <HeatLegend />
        </View>
      </View>
    </View>
  );
}
const LEG_DONE: LngLat[] = [
  [-0.128, 51.507],
  [-0.09, 51.52],
  [-0.02, 51.54],
  [0.09, 51.56],
];
const LEG_LEFT: LngLat[] = [
  [0.09, 51.56],
  [0.22, 51.575],
  [0.36, 51.585],
];
const STOPS: {
  id: string;
  name: string;
  time: string;
  done: boolean;
  lngLat: LngLat;
}[] = [
  {
    id: "1",
    name: "Depot — Southwark",
    time: "08:12",
    done: true,
    lngLat: [-0.128, 51.507],
  },
  {
    id: "2",
    name: "Shoreditch High St",
    time: "09:40",
    done: true,
    lngLat: [-0.02, 51.54],
  },
  {
    id: "3",
    name: "Hackney Wick",
    time: "10:25",
    done: true,
    lngLat: [0.09, 51.56],
  },
  {
    id: "4",
    name: "Stratford",
    time: "11:05",
    done: false,
    lngLat: [0.22, 51.575],
  },
  {
    id: "5",
    name: "Ilford",
    time: "11:50",
    done: false,
    lngLat: [0.36, 51.585],
  },
];
export function DeliveryTrackerBlock() {
  const done = STOPS.filter((s) => s.done).length;
  return (
    <View className="flex-1">
      <View className="flex-[3]">
        <Map center={[0.02, 51.545]} zoom={10.5}>
          <Map.Route id="done" coordinates={LEG_DONE} width={4} />
          <Map.Route
            id="left"
            coordinates={LEG_LEFT}
            width={4}
            dashed
            opacity={0.5}
          />
          {STOPS.map((stop) => (
            <Map.Marker key={stop.id} lngLat={stop.lngLat}>
              <View
                className={
                  stop.done
                    ? "border-background bg-primary h-3 w-3 rounded-full border-2"
                    : "border-background bg-muted-foreground h-3 w-3 rounded-full border-2"
                }
              />
            </Map.Marker>
          ))}
          <Map.Controls position="top-right" />
        </Map>
      </View>

      <Card className="max-h-[62%] rounded-b-none">
        <Card.Content className="gap-4 p-4">
          <View className="flex-row items-center gap-3">
            <Avatar size="sm" fallback="RA" />
            <View className="min-w-0 flex-1">
              <Text weight="medium" numberOfLines={1}>
                Rana A.
              </Text>
              <Text size="xs" muted numberOfLines={1}>
                Van 12 · LX21 KTF
              </Text>
            </View>
            <Badge>ETA 11:50</Badge>
          </View>

          <View className="gap-1.5">
            <View className="flex-row justify-between">
              <Text size="xs" muted>
                {done} of {STOPS.length} stops
              </Text>
              <Text size="xs" muted>
                {Math.round((done / STOPS.length) * 100)}%
              </Text>
            </View>
            <Progress value={(done / STOPS.length) * 100} />
          </View>

          <Separator />

          <ScrollView contentContainerClassName="gap-2">
            {STOPS.map((stop) => (
              <View key={stop.id} className="flex-row items-center gap-3">
                <View
                  className={
                    stop.done
                      ? "bg-primary h-2 w-2 rounded-full"
                      : "bg-border h-2 w-2 rounded-full"
                  }
                />
                <Text
                  size="sm"
                  className="min-w-0 flex-1"
                  muted={!stop.done}
                  numberOfLines={1}
                >
                  {stop.name}
                </Text>
                <Text size="xs" muted>
                  {stop.time}
                </Text>
              </View>
            ))}
          </ScrollView>
        </Card.Content>
      </Card>
    </View>
  );
}
const STORES = [
  {
    id: "sh",
    name: "Shoreditch",
    address: "14 Rivington St",
    lngLat: [-0.081, 51.526] as LngLat,
    open: true,
  },
  {
    id: "so",
    name: "Soho",
    address: "9 Berwick St",
    lngLat: [-0.135, 51.513] as LngLat,
    open: true,
  },
  {
    id: "kx",
    name: "King’s Cross",
    address: "Unit 3, Coal Drops",
    lngLat: [-0.126, 51.535] as LngLat,
    open: false,
  },
  {
    id: "br",
    name: "Brixton",
    address: "22 Atlantic Rd",
    lngLat: [-0.114, 51.463] as LngLat,
    open: true,
  },
];
export function StoreLocatorBlock() {
  const [selected, setSelected] = useState(STORES[0]);
  const map = useRef<MapHandle>(null);
  const select = (store: (typeof STORES)[number]) => {
    setSelected(store);
    map.current?.flyTo({ center: store.lngLat, zoom: 14 });
  };
  return (
    <View className="flex-1">
      <View className="flex-[3]">
        <Map ref={map} center={selected.lngLat} zoom={14}>
          {STORES.map((store) => (
            <Map.Marker
              key={store.id}
              lngLat={store.lngLat}
              onPress={() => select(store)}
            >
              <View
                className={
                  store.id === selected.id
                    ? "border-background bg-primary h-5 w-5 rounded-full border-2 shadow-md"
                    : "border-background bg-muted-foreground h-3.5 w-3.5 rounded-full border-2"
                }
              />
            </Map.Marker>
          ))}
          <Map.Controls locate position="top-right" />
        </Map>
      </View>

      <View className="flex-[2]">
        <ScrollView contentContainerClassName="gap-2 p-4">
          {STORES.map((store) => (
            <Item
              key={store.id}
              onPress={() => select(store)}
              className={
                store.id === selected.id ? "border-primary" : undefined
              }
            >
              <Item.Content>
                <Item.Title>{store.name}</Item.Title>
                <Item.Description>{store.address}</Item.Description>
              </Item.Content>
              <Item.Actions>
                <Chip size="sm" variant={store.open ? "success" : "outline"}>
                  {store.open ? "Open" : "Closed"}
                </Chip>
              </Item.Actions>
            </Item>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
const HUBS: {
  id: string;
  name: string;
  lngLat: LngLat;
  tier: "hub" | "spoke";
}[] = [
  { id: "ams", name: "Amsterdam", lngLat: [4.895, 52.37], tier: "hub" },
  { id: "lon", name: "London", lngLat: [-0.128, 51.507], tier: "hub" },
  { id: "ber", name: "Berlin", lngLat: [13.405, 52.52], tier: "spoke" },
  { id: "par", name: "Paris", lngLat: [2.352, 48.857], tier: "spoke" },
  { id: "mad", name: "Madrid", lngLat: [-3.703, 40.417], tier: "spoke" },
  { id: "mil", name: "Milan", lngLat: [9.19, 45.464], tier: "spoke" },
  { id: "cph", name: "Copenhagen", lngLat: [12.568, 55.676], tier: "spoke" },
];
const LANES = [
  { from: "ams", to: "ber" },
  { from: "ams", to: "cph" },
  { from: "ams", to: "mil" },
  { from: "lon", to: "par" },
  { from: "lon", to: "mad" },
  { from: "lon", to: "ams" },
];
export function LogisticsNetworkBlock() {
  const [origin, setOrigin] = useState<string | null>(null);
  const byId = useMemo(
    () => Object.fromEntries(HUBS.map((h) => [h.id, h])),
    []
  );
  const lanes = origin
    ? LANES.filter((l) => l.from === origin || l.to === origin)
    : LANES;
  return (
    <View className="flex-1">
      <View className="gap-3 p-4">
        <View className="gap-1">
          <Text size="lg" weight="semibold">
            Network
          </Text>
          <Text size="sm" muted>
            {lanes.length} lanes across {HUBS.length} sites.
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            <Chip selected={origin === null} onPress={() => setOrigin(null)}>
              All
            </Chip>
            {HUBS.filter((h) => h.tier === "hub").map((hub) => (
              <Chip
                key={hub.id}
                selected={origin === hub.id}
                onPress={() => setOrigin(hub.id)}
              >
                {hub.name}
              </Chip>
            ))}
          </View>
        </ScrollView>
      </View>

      <View className="flex-1">
        <Map bounds={[-12, 36, 26, 60]}>
          {lanes.map((lane) => (
            <Map.Arc
              key={`${lane.from}-${lane.to}`}
              id={`${lane.from}-${lane.to}`}
              from={byId[lane.from].lngLat}
              to={byId[lane.to].lngLat}
              curvature={0.18}
              opacity={0.8}
            />
          ))}
          {HUBS.map((site) => (
            <Map.Marker key={site.id} lngLat={site.lngLat}>
              <View
                className={
                  site.tier === "hub"
                    ? "border-background bg-primary h-3.5 w-3.5 rounded-full border-2"
                    : "border-background bg-muted-foreground h-2.5 w-2.5 rounded-full border-2"
                }
              />

              <Map.Label
                size="sm"
                tone={site.tier === "hub" ? "default" : "muted"}
              >
                {site.name}
              </Map.Label>
            </Map.Marker>
          ))}
        </Map>
      </View>
    </View>
  );
}
const NODES: {
  id: string;
  city: string;
  lngLat: LngLat;
  state: "up" | "slow" | "down";
  ms: number;
}[] = [
  { id: "lhr", city: "London", lngLat: [-0.128, 51.507], state: "up", ms: 24 },
  { id: "fra", city: "Frankfurt", lngLat: [8.682, 50.11], state: "up", ms: 31 },
  {
    id: "iad",
    city: "Ashburn",
    lngLat: [-77.487, 39.043],
    state: "slow",
    ms: 186,
  },
  {
    id: "sfo",
    city: "San Francisco",
    lngLat: [-122.419, 37.775],
    state: "up",
    ms: 42,
  },
  {
    id: "sin",
    city: "Singapore",
    lngLat: [103.82, 1.352],
    state: "down",
    ms: 0,
  },
  {
    id: "syd",
    city: "Sydney",
    lngLat: [151.209, -33.868],
    state: "up",
    ms: 88,
  },
];
const NODE_CHIP = {
  up: "success",
  slow: "warning",
  down: "destructive",
} as const;
export function UptimeMonitorBlock() {
  const down = NODES.filter((n) => n.state !== "up").length;
  return (
    <View className="flex-1">
      <View className="flex-1">
        <Map center={[0, 25]} zoom={1.1}>
          {NODES.map((node) => (
            <Map.Marker key={node.id} lngLat={node.lngLat}>
              <View
                className={
                  node.state === "up"
                    ? "border-background bg-success h-3 w-3 rounded-full border-2"
                    : node.state === "slow"
                      ? "border-background bg-warning h-3 w-3 rounded-full border-2"
                      : "border-background bg-destructive h-3 w-3 rounded-full border-2"
                }
              />

              <Map.Label size="sm" tone="muted">
                {node.id.toUpperCase()}
              </Map.Label>
            </Map.Marker>
          ))}
        </Map>
      </View>

      <Frame className="rounded-b-none">
        <Frame.Header>
          <Frame.Title>Edge nodes</Frame.Title>
          <Frame.Action>
            <Chip size="sm" variant={down ? "warning" : "success"}>
              {down ? `${down} degraded` : "All healthy"}
            </Chip>
          </Frame.Action>
        </Frame.Header>
        <Frame.Panel className="rounded-b-none">
          <ScrollView className="max-h-56">
            {NODES.map((node) => (
              <Frame.Row key={node.id}>
                <Frame.Content>
                  <Frame.Title>{node.city}</Frame.Title>
                  <Frame.Description>{node.id.toUpperCase()}</Frame.Description>
                </Frame.Content>
                <Frame.Actions>
                  <Text size="xs" muted>
                    {node.state === "down" ? "—" : `${node.ms}ms`}
                  </Text>
                  <Chip size="sm" variant={NODE_CHIP[node.state]}>
                    {node.state}
                  </Chip>
                </Frame.Actions>
              </Frame.Row>
            ))}
          </ScrollView>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
const RUN: LngLat[] = [
  [-0.1219, 51.5008],
  [-0.1196, 51.5033],
  [-0.1145, 51.5074],
  [-0.1085, 51.5083],
  [-0.1042, 51.5082],
  [-0.0994, 51.5081],
  [-0.0943, 51.5079],
  [-0.088, 51.5069],
  [-0.0813, 51.5066],
  [-0.0754, 51.5044],
];
const RUN_START = RUN[0]!;
const RUN_END = RUN[RUN.length - 1]!;
const RUN_FIGURES = [
  { label: "Distance", value: "3.6 km" },
  { label: "Time", value: "19:42" },
  { label: "Pace", value: "5:28 /km" },
];
const RUN_SPLITS = [
  { id: "1", stretch: "Kilometre 1", pace: "5:41", elapsed: "5:41" },
  { id: "2", stretch: "Kilometre 2", pace: "5:30", elapsed: "11:11" },
  { id: "3", stretch: "Kilometre 3", pace: "5:22", elapsed: "16:33" },
  { id: "4", stretch: "Last 600 m", pace: "5:15", elapsed: "19:42" },
];
export function RunSummaryBlock() {
  const [splits, setSplits] = useState(false);
  return (
    <Map center={[-0.0986, 51.5052]} zoom={13.3}>
      <Map.Route coordinates={RUN} width={5} />
      <Map.Marker lngLat={RUN_START}>
        <View className="border-background bg-muted-foreground h-4 w-4 rounded-full border-2" />
      </Map.Marker>
      <Map.Marker lngLat={RUN_END}>
        <View className="border-background bg-primary h-6 w-6 rounded-full border-[3px] shadow-md" />
        <Map.Label side="top" size="sm" tone="primary">
          Tower Bridge
        </Map.Label>
      </Map.Marker>

      <Map.Overlay position="top" safeArea>
        <Card>
          <Card.Content className="gap-3 p-3">
            <View className="flex-row items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                accessibilityLabel="Back"
                onPress={() => router.back()}
              >
                <ChevronLeftIcon size={18} />
              </Button>
              <View className="min-w-0 flex-1">
                <Text weight="semibold" numberOfLines={1}>
                  Thames Path
                </Text>
                <Text size="xs" muted numberOfLines={1}>
                  Tuesday 07:12 · Westminster to Tower Bridge
                </Text>
              </View>
            </View>
            <View className="flex-row px-2 pb-1">
              {RUN_FIGURES.map((figure) => (
                <View key={figure.label} className="flex-1 gap-0.5">
                  <Text size="xs" muted>
                    {figure.label}
                  </Text>
                  <Text weight="semibold">{figure.value}</Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>
      </Map.Overlay>

      <Map.Overlay position="bottom" safeArea>
        <Card>
          <Card.Content className="gap-3 p-4">
            <View className="flex-row items-center gap-3">
              <View className="min-w-0 flex-1 gap-0.5">
                <Text weight="medium">Splits</Text>
                <Text size="xs" muted numberOfLines={1}>
                  Fastest full kilometre 5:22
                </Text>
              </View>
              <Button
                size="sm"
                variant="outline"
                onPress={() => setSplits((current) => !current)}
              >
                {splits ? "Hide" : "Show"}
              </Button>
            </View>

            {splits ? (
              <View className="gap-2">
                <Separator />
                {RUN_SPLITS.map((split) => (
                  <View key={split.id} className="flex-row items-center gap-3">
                    <Text
                      size="sm"
                      className="min-w-0 flex-1"
                      numberOfLines={1}
                    >
                      {split.stretch}
                    </Text>
                    <Text size="sm" weight="medium">
                      {split.pace}
                    </Text>
                    <Text size="xs" muted className="w-12 text-right">
                      {split.elapsed}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </Card.Content>
        </Card>
      </Map.Overlay>

      <Map.Controls position="top-right" zoom={false} locate />
      <Map.Controls position="bottom-right" recenter />
    </Map>
  );
}
