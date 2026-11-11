import { Alert } from "panelui-taro/alert";
import { Button } from "panelui-taro/button";
import {
  AppleIcon,
  ChevronRightIcon,
  FacebookIcon,
  GoogleIcon,
  SearchIcon,
} from "panelui-taro/icons";
import { Text } from "panelui-taro/primitives/text";
import { Separator } from "panelui-taro/separator";
import { useState, type ReactNode } from "react";

import { demoAction } from "../runtime/demo-action";
import { View } from "../runtime/native";
import { hasNativeUI } from "../runtime/native";
import { useCSSVariable } from "../runtime/theme";
import { ComponentEntry } from "../types";
function NativeDemo({ children }: { children: ReactNode }) {
  return (
    <View className="w-full gap-5">
      <Alert variant={hasNativeUI() ? "info" : "warning"}>
        <Alert.Content>
          <Alert.Title>
            {hasNativeUI()
              ? "Rendering the platform control"
              : "@expo/ui not available"}
          </Alert.Title>
          <Alert.Description>
            {hasNativeUI()
              ? "Theme tokens do not apply here — the platform draws this."
              : "The `native` prop is a no-op, so the styled component renders instead."}
          </Alert.Description>
        </Alert.Content>
      </Alert>

      <Separator />
      <View className="w-full gap-4">{children}</View>
    </View>
  );
}
function GlassButtonDemo() {
  return (
    <NativeDemo>
      <View className="w-full gap-2">
        <Text size="sm" muted>
          Glass — needs iOS 26
        </Text>
        <View className="w-full flex-row items-center gap-3">
          <Button native glass onPress={demoAction("Prominent")}>
            Prominent
          </Button>
          <Button native glass variant="ghost" onPress={demoAction("Plain")}>
            Plain
          </Button>
          <Button
            native
            glass
            size="icon"
            variant="ghost"
            onPress={demoAction("Button selected")}
          >
            <SearchIcon size={18} />
          </Button>
        </View>
      </View>

      <View className="w-full gap-2">
        <Text size="sm" muted>
          The same buttons without it
        </Text>
        <View className="w-full flex-row items-center gap-3">
          <Button native onPress={demoAction("Prominent")}>
            Prominent
          </Button>
          <Button native variant="ghost" onPress={demoAction("Plain")}>
            Plain
          </Button>
          <Button
            native
            size="icon"
            variant="ghost"
            onPress={demoAction("Button selected")}
          >
            <SearchIcon size={18} />
          </Button>
        </View>
      </View>
    </NativeDemo>
  );
}
function LoadingButtonDemo() {
  const [saving, setSaving] = useState(false);
  return (
    <Button
      fullWidth
      loading={saving}
      onPress={() => {
        setSaving(true);
        setTimeout(() => setSaving(false), 1800);
      }}
    >
      {saving ? "Saving…" : "Save changes"}
    </Button>
  );
}
function SpinnerColorButtonDemo() {
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const token = useCSSVariable("--color-info");
  const info = typeof token === "string" ? token : undefined;
  return (
    <View className="w-full gap-2">
      <Button
        fullWidth
        variant="outline"
        loading={uploading}
        spinnerProps={{ color: info }}
        onPress={() => {
          setUploading(true);
          setTimeout(() => setUploading(false), 1800);
        }}
      >
        {uploading ? "Uploading…" : "Upload photo"}
      </Button>
      <Button
        fullWidth
        variant="secondary"
        loading={syncing}
        spinnerProps={{ className: "border-success/24 border-t-success" }}
        onPress={() => {
          setSyncing(true);
          setTimeout(() => setSyncing(false), 1800);
        }}
      >
        {syncing ? "Syncing…" : "Sync now"}
      </Button>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "button",
  name: "Button",
  summary: "Pressable action with variants and loading",
  demos: [
    {
      label: "Variants",
      render: () => (
        <View className="w-full gap-2">
          <Button fullWidth onPress={demoAction("Primary")}>
            Primary
          </Button>
          <Button
            fullWidth
            variant="secondary"
            onPress={demoAction("Secondary")}
          >
            Secondary
          </Button>
          <Button fullWidth variant="outline" onPress={demoAction("Outline")}>
            Outline
          </Button>
          <Button fullWidth variant="ghost" onPress={demoAction("Ghost")}>
            Ghost
          </Button>
          <Button
            fullWidth
            variant="destructive"
            onPress={demoAction("Delete")}
          >
            Delete
          </Button>
        </View>
      ),
    },
    {
      label: "Sizes",
      render: () => (
        <View className="items-center gap-3">
          <Button
            size="xs"
            variant="outline"
            onPress={demoAction("Extra small")}
          >
            Extra small
          </Button>
          <Button size="sm" variant="outline" onPress={demoAction("Small")}>
            Small
          </Button>
          <Button onPress={demoAction("Medium")}>Medium</Button>
          <Button size="lg" onPress={demoAction("Large")}>
            Large
          </Button>
          <Button size="xl" onPress={demoAction("Extra large")}>
            Extra large
          </Button>
          <Button disabled>Disabled</Button>
        </View>
      ),
    },
    { label: "Loading", render: () => <LoadingButtonDemo /> },
    { label: "Spinner colour", render: () => <SpinnerColorButtonDemo /> },
    {
      label: "Social login",
      render: () => (
        <View className="w-full gap-3">
          <Button
            variant="social"
            fullWidth
            startContent={<GoogleIcon size={18} />}
            onPress={demoAction("Continue with Google")}
          >
            Continue with Google
          </Button>
          <Button
            variant="social"
            fullWidth
            startContent={<FacebookIcon size={18} />}
            onPress={demoAction("Continue with Facebook")}
          >
            Continue with Facebook
          </Button>
          <Button
            variant="social"
            fullWidth
            startContent={<AppleIcon size={18} />}
            onPress={demoAction("Continue with Apple")}
          >
            Continue with Apple
          </Button>
        </View>
      ),
    },
    {
      label: "With icons",
      render: () => (
        <View className="w-full gap-2">
          <Button
            fullWidth
            startContent={<SearchIcon size={16} />}
            onPress={demoAction("Search")}
          >
            Search
          </Button>
          <Button
            fullWidth
            variant="outline"
            endContent={<ChevronRightIcon size={16} />}
            onPress={demoAction("Continue")}
          >
            Continue
          </Button>
          <Button
            size="icon"
            variant="outline"
            onPress={demoAction("Button selected")}
          >
            <SearchIcon size={18} />
          </Button>
        </View>
      ),
    },
    {
      label: "Native",
      render: () => (
        <NativeDemo>
          <Button native onPress={demoAction("Filled")}>
            Filled
          </Button>
          <Button native variant="outline" onPress={demoAction("Outlined")}>
            Outlined
          </Button>

          <View className="w-full flex-row items-center gap-3">
            <Button native variant="ghost" onPress={demoAction("Text")}>
              Text
            </Button>
            <Button native size="sm" onPress={demoAction("Small")}>
              Small
            </Button>
          </View>
        </NativeDemo>
      ),
    },
    {
      label: "Liquid Glass",
      render: () => <GlassButtonDemo />,
    },
  ],
};
