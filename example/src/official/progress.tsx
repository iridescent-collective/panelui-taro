import { Progress } from "panelui-taro/progress";
import { useEffect, useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
function ProgressDemo() {
  const [uploaded, setUploaded] = useState(20);
  useEffect(() => {
    const id = setInterval(() => {
      setUploaded((current) => (current >= 100 ? 0 : current + 20));
    }, 1200);
    return () => clearInterval(id);
  }, []);
  return (
    <View className="w-full gap-4">
      <Progress value={uploaded} label="Uploading" showValueLabel />
      <Progress value={uploaded} color="success" size="sm" />
      <Progress value={70} color="warning" size="lg" />
      <Progress indeterminate color="info" />
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "progress",
  name: "Progress",
  summary: "Determinate and indeterminate progress bar",
  demos: [
    { label: "Animated", render: () => <ProgressDemo /> },
    {
      label: "Labelled",
      render: () => (
        <View className="w-full gap-4">
          <Progress value={64} label="Downloading" showValueLabel />
          <Progress
            value={40}
            color="success"
            label="Storage"
            showValueLabel
            formatOptions={{ style: "currency", currency: "USD" }}
            valueLabel="8.2 GB of 20 GB"
          />
          <Progress value={90} color="warning" showValueLabel />
        </View>
      ),
    },
    {
      label: "A range of its own",
      render: () => (
        <View className="w-full gap-4">
          <Progress
            value={1250}
            maxValue={2000}
            label="Budget"
            formatOptions={{ style: "currency", currency: "USD" }}
            showValueLabel
          />
          <Progress
            value={18}
            maxValue={24}
            color="info"
            label="Seats"
            valueLabel="18 of 24"
            showValueLabel
          />
          <Progress
            value={72}
            minValue={40}
            maxValue={80}
            color="success"
            showValueLabel
          />
        </View>
      ),
    },
    {
      label: "Colors",
      render: () => (
        <View className="w-full gap-4">
          <Progress value={35} />
          <Progress value={55} color="success" />
          <Progress value={75} color="warning" />
          <Progress value={90} color="destructive" />
        </View>
      ),
    },
    {
      label: "Sizes",
      render: () => (
        <View className="w-full gap-4">
          <Progress value={60} size="sm" />
          <Progress value={60} />
          <Progress value={60} size="lg" />
        </View>
      ),
    },
  ],
};
