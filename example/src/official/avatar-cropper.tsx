import { Avatar } from "panelui-taro/avatar";
import {
  AvatarCropper,
  type AvatarCropperHandle,
  type AvatarCropperShape,
  type AvatarCropperSource,
  pickAvatarImage,
} from "panelui-taro/avatar-cropper";
import { Button } from "panelui-taro/button";
import { CameraIcon, ImageIcon } from "panelui-taro/icons";
import { Text } from "panelui-taro/primitives/text";
import { Tabs } from "panelui-taro/tabs";
import { useRef, useState } from "react";

import { useSafeAreaInsets } from "../runtime/native";
import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
const PORTRAIT: AvatarCropperSource = {
  uri: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1024&h=1024&q=80",
};
function CropperControls() {
  return (
    <View className="flex-row items-center justify-between px-3 py-2">
      <AvatarCropper.Reset />
      <AvatarCropper.Rotate />
    </View>
  );
}
function AvatarCropperBasicDemo() {
  return (
    <View className="border-border h-96 w-full overflow-hidden rounded-2xl border">
      <AvatarCropper source={PORTRAIT}>
        <AvatarCropper.Canvas />
        <CropperControls />
      </AvatarCropper>
    </View>
  );
}
function AvatarCropperShapesDemo() {
  const [shape, setShape] = useState<AvatarCropperShape>("squircle");
  return (
    <View className="w-full gap-3">
      <Tabs
        value={shape}
        defaultValue={shape}
        onValueChange={(value) => setShape(value as AvatarCropperShape)}
      >
        <Tabs.List>
          <Tabs.Trigger value="circle">Circle</Tabs.Trigger>
          <Tabs.Trigger value="squircle">Squircle</Tabs.Trigger>
          <Tabs.Trigger value="square">Square</Tabs.Trigger>
        </Tabs.List>
      </Tabs>
      <View className="border-border h-80 w-full overflow-hidden rounded-2xl border">
        <AvatarCropper source={PORTRAIT} shape={shape} />
      </View>
    </View>
  );
}
const FILLS = { theme: undefined, white: "#ffffff", black: "#000000" } as const;
function AvatarCropperZoomOutDemo() {
  const cropper = useRef<AvatarCropperHandle>(null);
  const [fill, setFill] = useState<keyof typeof FILLS>("theme");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const crop = async () => {
    setError(null);
    try {
      const written = await cropper.current?.crop({ size: 512 });
      if (written) setResult(written.uri);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  };
  return (
    <View className="w-full gap-3">
      <Tabs
        value={fill}
        defaultValue={fill}
        onValueChange={(value) => setFill(value as keyof typeof FILLS)}
      >
        <Tabs.List>
          <Tabs.Trigger value="theme">Theme</Tabs.Trigger>
          <Tabs.Trigger value="white">White</Tabs.Trigger>
          <Tabs.Trigger value="black">Black</Tabs.Trigger>
        </Tabs.List>
      </Tabs>
      <View className="border-border h-80 w-full overflow-hidden rounded-2xl border">
        <AvatarCropper
          ref={cropper}
          source={PORTRAIT}
          cover={false}
          background={FILLS[fill]}
        >
          <AvatarCropper.Canvas />
          <CropperControls />
        </AvatarCropper>
      </View>
      <View className="flex-row items-center gap-3">
        <Button variant="secondary" onPress={crop}>
          Crop
        </Button>
        <Avatar
          size="lg"
          source={result ? { uri: result } : undefined}
          fallback="KA"
        />
        {error ? (
          <Text size="sm" className="text-destructive flex-1">
            {error}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
function AvatarCropperProfileVersion() {
  const insets = useSafeAreaInsets();
  const cropper = useRef<AvatarCropperHandle>(null);
  const [photo, setPhoto] = useState<AvatarCropperSource | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pick = async (from: "library" | "camera") => {
    setError(null);
    try {
      const picked = await pickAvatarImage({ from });
      if (picked) setPhoto(picked);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  };
  const done = async () => {
    setSaving(true);
    try {
      const result = await cropper.current?.crop({ size: 512 });
      if (result) setAvatar(result.uri);
      setPhoto(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setSaving(false);
    }
  };
  if (photo) {
    return (
      <View className="bg-background flex-1">
        <View className="flex-row items-center justify-between px-2 pb-2">
          <Button variant="ghost" size="sm" onPress={() => setPhoto(null)}>
            Cancel
          </Button>
          <Text weight="semibold">Move and scale</Text>
          <Button size="sm" loading={saving} onPress={done}>
            Done
          </Button>
        </View>
        <AvatarCropper ref={cropper} source={photo}>
          <AvatarCropper.Canvas />
          <View
            className="flex-row items-center justify-between px-4 pt-2"
            style={{ paddingBottom: insets.bottom + 8 }}
          >
            <AvatarCropper.Reset />
            <AvatarCropper.Rotate />
          </View>
        </AvatarCropper>
      </View>
    );
  }
  return (
    <View
      className="bg-background flex-1 px-6"
      style={{ paddingBottom: insets.bottom + 8 }}
    >
      <View className="flex-1 items-center justify-center gap-6">
        <Avatar
          size="xl"
          source={avatar ? { uri: avatar } : undefined}
          fallback="KA"
        />
        <View className="items-center gap-1">
          <Text size="lg" weight="semibold">
            Khalid Abdi
          </Text>
          <Text size="sm" muted className="text-center">
            {avatar
              ? "Looking good."
              : "Add a photo so your team knows who you are."}
          </Text>
        </View>
        <View className="w-full gap-2">
          <Button variant="secondary" onPress={() => pick("library")}>
            <ImageIcon size={18} />
            Choose photo
          </Button>
          <Button variant="secondary" onPress={() => pick("camera")}>
            <CameraIcon size={18} />
            Take photo
          </Button>
          <Button variant="ghost" onPress={() => setPhoto(PORTRAIT)}>
            Try it with a sample photo
          </Button>
        </View>
        {error ? (
          <Text size="sm" className="text-destructive text-center">
            {error}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
const photo = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`;
export const entry: ComponentEntry = {
  slug: "avatar-cropper",
  name: "AvatarCropper",
  summary: "Frame a photo under a circle, and get that circle back as an image",
  demos: [
    {
      label: "Change photo",
      id: "profile",
      fullPage: true,
      description:
        "Choose a photo or take one, frame it, and see it land in the avatar. The sample photo works without a camera.",
      render: () => <AvatarCropperProfileVersion />,
    },
    { label: "Drag, pinch and turn", render: () => <AvatarCropperBasicDemo /> },
    { label: "Shapes", render: () => <AvatarCropperShapesDemo /> },
    {
      label: "Zooming out past the outline",
      render: () => <AvatarCropperZoomOutDemo />,
    },
  ],
};
