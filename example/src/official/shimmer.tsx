import { Shimmer } from "panelui-taro/shimmer";
import { Skeleton } from "panelui-taro/skeleton";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";

export const entry: ComponentEntry = {
  slug: "shimmer",
  name: "Shimmer",
  summary: "Animated highlight sweeping across content",
  demos: [
    {
      label: "Thinking text",
      render: () => (
        <View className="w-full gap-4">
          <Shimmer>Generating response…</Shimmer>
          <Shimmer duration={1400} textClassName="text-lg font-medium">
            Thinking…
          </Shimmer>
          <Shimmer duration={2400} textClassName="text-2xl font-semibold">
            Searching the web
          </Shimmer>
        </View>
      ),
    },
    {
      label: "Modes",
      render: () => (
        <View className="w-full gap-4">
          <Shimmer mode="ping-pong" duration={1600}>
            Ping-pong sweep
          </Shimmer>
          <Shimmer reverse>Right to left</Shimmer>
          <Shimmer spread={4} duration={2600}>
            A wider, slower band
          </Shimmer>
          <Shimmer enabled={false}>Disabled — renders statically</Shimmer>
        </View>
      ),
    },
    {
      label: "Custom colours",
      render: () => (
        <View className="w-full gap-4">
          <Shimmer baseColor="#3f3f46" shimmerColor="#fafafa">
            Neutral on dark
          </Shimmer>
          <Shimmer
            baseColor="#1e3a8a"
            shimmerColor="#93c5fd"
            textClassName="text-lg font-semibold"
          >
            Tinted blue
          </Shimmer>
        </View>
      ),
    },
    {
      label: "Masking a subtree",
      render: () => (
        <Shimmer as="view" className="w-full rounded-xl">
          <View className="gap-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </View>
        </Shimmer>
      ),
    },
  ],
};
