import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Map } from "panelui-taro/map";
import type { MapHandle, ViewState } from "panelui-taro/map";
import { Typography } from "panelui-taro/typography";
import { useRef, useState } from "react";

import { MAP_AREA, MAP_CENTER, MAP_POINTS, MAP_ROUTE } from "./constants";

export const MapShowcase = () => {
  const ref = useRef<MapHandle>(null);
  const [mode, setMode] = useState("geometry");
  const [event, setEvent] = useState("Waiting for native map");
  const [viewState, setViewState] = useState<ViewState | null>(null);
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Paragraph>
        Map · WeChat native map with WGS84 adapter
      </Typography.Paragraph>
      <View className="h-[900px] overflow-hidden rounded-[32px]">
        <Map
          ref={ref}
          center={MAP_CENTER}
          zoom={13}
          bounds={[121.443, 31.211, 121.503, 31.252]}
          onReady={() => setEvent("Map ready")}
          onViewStateChange={setViewState}
          onPress={(coordinate) =>
            setEvent(coordinate.map((value) => value.toFixed(5)).join(", "))
          }
        >
          {mode === "geometry" ? (
            <>
              <Map.GeoJSON
                data={MAP_AREA}
                fillOpacity={0.12}
                onPress={() => setEvent("Area selected")}
                accessibility={() => ({ label: "Shanghai study area" })}
              />
              <Map.Route coordinates={MAP_ROUTE} />
              <Map.Arc
                from={MAP_ROUTE[0] ?? MAP_CENTER}
                to={MAP_ROUTE.at(-1) ?? MAP_CENTER}
                curvature={0.3}
              />
            </>
          ) : null}
          {mode === "cluster" ? (
            <Map.Cluster
              data={MAP_POINTS}
              onPress={() => setEvent("Point cluster selected")}
              accessibility={(_, index) => ({
                label: `Map point ${index + 1}`,
              })}
            />
          ) : null}
          {mode === "heatmap" ? (
            <Map.Heatmap data={MAP_POINTS} weight="weight" points />
          ) : null}
          {mode === "geometry" ? (
            <Map.Marker
              lngLat={MAP_ROUTE[0] ?? MAP_CENTER}
              accessibilityLabel="Shanghai marker"
            >
              <Map.Label>Shanghai</Map.Label>
              <Map.Popup title="Shanghai">Source marker popup</Map.Popup>
            </Map.Marker>
          ) : null}
          <Map.Controls compass recenter />
          <Map.Overlay position="bottom">
            <View className="rounded-[24px] border border-[var(--panel-border)] bg-[var(--panel-card)] px-[24px] py-[16px]">
              <Typography.Paragraph>{event}</Typography.Paragraph>
            </View>
          </Map.Overlay>
        </Map>
      </View>
      <Typography
        id="panel-map-view-state"
        type="body-xs"
        className="block w-full max-w-full min-w-0 break-all whitespace-normal"
      >
        {JSON.stringify(viewState)}
      </Typography>
      <View className="flex flex-row gap-[16px]">
        {["geometry", "cluster", "heatmap"].map((value) => (
          <Button
            key={value}
            variant={mode === value ? "primary" : "outline"}
            onPress={() => setMode(value)}
          >
            {value}
          </Button>
        ))}
      </View>
      <Button
        variant="outline"
        onPress={() =>
          ref.current?.fitBounds([121.45, 31.21, 121.5, 31.25], {
            duration: 0,
            padding: 36,
          })
        }
      >
        Fit demo bounds
      </Button>
    </View>
  );
};
