import { Card } from "panelui-taro/card";
import { Skeleton } from "panelui-taro/skeleton";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";

export const entry: ComponentEntry = {
  slug: "skeleton",
  name: "Skeleton",
  summary: "Shimmer placeholder for loading content",
  demos: [
    {
      label: "List row",
      render: () => (
        <View className="w-full gap-4">
          <View className="flex-row items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <View className="flex-1 gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </View>
          </View>
          <Skeleton className="h-32 w-full rounded-xl" />
        </View>
      ),
    },
    {
      label: "Card placeholder",
      render: () => (
        <Card className="w-full">
          <Card.Content className="gap-3 p-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </Card.Content>
        </Card>
      ),
    },
  ],
};
