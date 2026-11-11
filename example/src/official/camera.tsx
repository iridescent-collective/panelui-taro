import { Image, View } from "@tarojs/components";
import { navigateTo } from "@tarojs/taro";
import { Camera, useCamera } from "panelui-taro/camera";
import type { CameraCapture, CameraMode } from "panelui-taro/camera";
import { Text } from "panelui-taro/primitives/text";
import { useState } from "react";

import type { ComponentEntry } from "../types";
const State = () => {
  const camera = useCamera();
  return (
    <Text
      size="xs"
      className="text-white"
      aria-live="polite"
    >{`${camera.facing} · ${camera.mode} · flash ${camera.flash} · timer ${camera.timer}s · zoom ${camera.zoom.toFixed(2)} · ${camera.ready ? "Ready" : "Not ready"}`}</Text>
  );
};
const CameraDemo = ({
  profile = false,
  mode = "photo",
}: {
  profile?: boolean;
  mode?: CameraMode;
}) => {
  const [capture, setCapture] = useState<CameraCapture | null>(null);
  const [error, setError] = useState("");
  return (
    <View className="flex h-full min-h-[880px] w-full flex-col">
      <Camera
        defaultFacing={profile ? "front" : "back"}
        defaultMode={mode}
        maxDuration={mode === "video" ? 15 : undefined}
        onCapture={setCapture}
        onError={(e) => setError(e.message)}
        className="min-h-[880px]"
      >
        <Camera.Preview>
          {profile ? (
            <View className="absolute inset-[96px] rounded-full border-[4px] border-white/80" />
          ) : null}
        </Camera.Preview>
        <Camera.Header>
          <Camera.Flash />
          <Camera.Duration />
          <Camera.Timer />
        </Camera.Header>
        <Camera.Footer>
          {error ? (
            <Text className="text-white" size="xs">
              {error}
            </Text>
          ) : null}
          {capture ? (
            <Text
              className="text-white"
              size="xs"
            >{`Captured ${capture.type}: ${capture.uri}`}</Text>
          ) : null}
          <State />
          <Camera.Zoom
            stops={[
              { value: 0, label: "1×" },
              { value: 0.5, label: "Mid" },
              { value: 1, label: "Max" },
            ]}
          />
          {!profile ? <Camera.Modes /> : null}
          <Camera.Controls>
            <Camera.Library
              source={capture?.type === "photo" ? capture.uri : undefined}
              onPress={() => {
                if (capture) setError(`Last capture: ${capture.type}`);
              }}
            />
            <Camera.Shutter />
            <Camera.Flip />
          </Camera.Controls>
          <Camera.Button
            accessibilityLabel="Open platform hooks acceptance"
            onPress={() => {
              void navigateTo({ url: "/showcases/native-sync/index" });
            }}
          >
            <Text className="text-white" size="xs">
              Platform hooks acceptance
            </Text>
          </Camera.Button>
        </Camera.Footer>
      </Camera>
      {capture?.type === "photo" ? (
        <Image
          src={capture.uri}
          mode="aspectFit"
          className="h-[200px] w-full"
        />
      ) : null}
    </View>
  );
};
export const entry: ComponentEntry = {
  slug: "camera",
  name: "Camera",
  summary: "A full-screen camera you assemble from parts",
  demos: [
    {
      label: "Photo and video",
      id: "camera",
      fullPage: true,
      render: () => <CameraDemo />,
    },
    {
      label: "Profile photo",
      id: "profile-photo",
      fullPage: true,
      render: () => <CameraDemo profile />,
    },
    {
      label: "Short clip",
      id: "short-clip",
      fullPage: true,
      render: () => <CameraDemo mode="video" />,
    },
  ],
};
