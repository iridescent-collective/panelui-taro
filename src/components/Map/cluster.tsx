import { View } from "@tarojs/components";
import { useMemo, useState } from "react";

import { AnimatedPressable } from "../../primitives/animated-pressable";
import { useThemeToken } from "../../theme/use-theme";
import { Text } from "../primitives/Text";
import { useMap } from "./context";
import { geoJSONGeometry } from "./geojson";
import { withAlpha } from "./heatmap";
import { useAccessibleMapFeatures } from "./layers";
import { asMapLayer } from "./map-children";
import { projectMapCoordinates } from "./projection";
import type { LngLat, MapClusterProps, PixelPoint } from "./types";
import { useMapData } from "./use-data";
import { useMapProjectionJob } from "./use-projection-job";

export interface ClusterPoint {
  point: PixelPoint;
  feature: unknown;
  coordinate?: LngLat;
}
export interface ClusterGroup {
  point: PixelPoint;
  features: unknown[];
  coordinate?: LngLat;
}
export const clusterMapPoints = (
  points: ClusterPoint[],
  radius: number,
  enabled: boolean
): ClusterGroup[] => {
  const groups: ClusterGroup[] = [];
  for (const value of points) {
    let found: ClusterGroup | undefined;
    if (enabled) {
      found = groups.find(
        (group) =>
          Math.hypot(
            group.point[0] - value.point[0],
            group.point[1] - value.point[1]
          ) <= radius
      );
    }
    if (found) {
      const count = found.features.length;
      found.point = [
        (found.point[0] * count + value.point[0]) / (count + 1),
        (found.point[1] * count + value.point[1]) / (count + 1),
      ];
      if (found.coordinate && value.coordinate) {
        found.coordinate = [
          (found.coordinate[0] * count + value.coordinate[0]) / (count + 1),
          (found.coordinate[1] * count + value.coordinate[1]) / (count + 1),
        ];
      }
      found.features.push(value.feature);
    } else {
      groups.push({
        coordinate: value.coordinate,
        features: [value.feature],
        point: [...value.point],
      });
    }
  }
  return groups;
};
export const clusterRadius = (count: number) =>
  count < 25 ? 16 : Math.min(28, count < 100 ? 22 : 28);
export const MapCluster = asMapLayer(
  ({
    data,
    color,
    textColor,
    radius = 50,
    maxZoom = 14,
    onPress,
    accessibility,
    id = "cluster",
  }: MapClusterProps) => {
    const loaded = useMapData(data);
    const ctx = useMap();
    const primary = useThemeToken("primary");
    const foreground = useThemeToken("primary-foreground");
    const [groups, setGroups] = useState<ClusterGroup[]>([]);
    useAccessibleMapFeatures(id, loaded, accessibility, onPress);
    const identity = useMemo(
      () => ({ loaded, maxZoom, project: ctx.project, radius }),
      [loaded, ctx.project, radius, maxZoom]
    );
    useMapProjectionJob<typeof identity, ClusterPoint[]>({
      enabled: ctx.ready,
      fail: (error) =>
        ctx.issue({
          capability: "cluster",
          message:
            error instanceof Error
              ? error.message
              : "Cluster projection failed",
        }),
      identity,
      receive: (points) =>
        setGroups(clusterMapPoints(points, radius, ctx.state.zoom <= maxZoom)),
      revision: ctx.revision,
      work: async (isCurrent) => {
        const features = geoJSONGeometry(loaded).filter(
          (value) => value.type === "point"
        );
        const coordinates = features.map((value) => value.coordinates[0][0]);
        const pixels = await projectMapCoordinates(
          coordinates,
          ctx.project,
          isCurrent
        );
        return features.map((value, index) => ({
          coordinate: coordinates[index],
          feature: value.feature,
          point: pixels[index],
        }));
      },
    });
    return (
      <>
        {groups.map((group, index) => {
          const count = group.features.length;
          const bubble = count > 1;
          const size = bubble ? clusterRadius(count) : 6;
          return (
            <View
              key={`${id}-${index}`}
              className="absolute flex items-center justify-center rounded-full border-[4px]"
              style={{
                backgroundColor: color ?? primary,
                borderColor: withAlpha(
                  textColor ?? foreground,
                  bubble ? 0.25 : 0.4
                ),
                boxSizing: "content-box",
                height: `${size * 4}rpx`,
                left: `${group.point[0] * 2}rpx`,
                pointerEvents: "auto",
                top: `${group.point[1] * 2}rpx`,
                transform: "translate(-50%, -50%)",
                width: `${size * 4}rpx`,
              }}
            >
              <AnimatedPressable
                accessibilityRole={onPress ? "button" : undefined}
                accessibilityLabel={bubble ? `${count} points` : "Map point"}
                onPress={
                  onPress
                    ? () =>
                        onPress(
                          bubble
                            ? {
                                features: group.features,
                                geometry: {
                                  coordinates: group.coordinate,
                                  type: "Point",
                                },
                                properties: {
                                  cluster: true,
                                  cluster_id: index,
                                  point_count: count,
                                  point_count_abbreviated:
                                    count > 999
                                      ? `${Math.round(count / 100) / 10}k`
                                      : count,
                                },
                                type: "Feature",
                              }
                            : group.features[0]
                        )
                    : undefined
                }
                className="flex h-full w-full items-center justify-center"
              >
                {bubble ? (
                  <Text size="xs" style={{ color: textColor ?? foreground }}>
                    {count > 999 ? `${Math.round(count / 100) / 10}k` : count}
                  </Text>
                ) : null}
              </AnimatedPressable>
            </View>
          );
        })}
      </>
    );
  }
);
MapCluster.displayName = "Map.Cluster";
