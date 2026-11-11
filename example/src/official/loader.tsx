import { Button } from "panelui-taro/button";
import { Card } from "panelui-taro/card";
import { Chip } from "panelui-taro/chip";
import { Loader, type LoaderVariant } from "panelui-taro/loader";
import { Text } from "panelui-taro/primitives/text";
import { useEffect, useState } from "react";

import { ScrollView, View } from "../runtime/native";
import { ComponentEntry } from "../types";
const LOADER_VARIANTS: {
  variant: LoaderVariant;
  label: string;
}[] = [
  { variant: "pulse-dots", label: "Pulse dots" },
  { variant: "bounce-dots", label: "Bounce dots" },
  { variant: "pulsating-dots", label: "Pulsating dots" },
  { variant: "liquid-dots", label: "Liquid dots" },
  { variant: "bar-cascade", label: "Bar cascade" },
  { variant: "bouncing-bars", label: "Bouncing bars" },
  { variant: "symmetric-wave", label: "Symmetric wave" },
  { variant: "morph-ring", label: "Morph ring" },
  { variant: "wave-physics", label: "Wave physics" },
];
function LoaderGalleryVersion() {
  return (
    <ScrollView contentContainerClassName="gap-3 p-4 pb-10">
      <View className="gap-1">
        <Text size="lg" weight="semibold">
          Nine loaders
        </Text>
        <Text size="sm" muted>
          Same props, same colour, same tempo — the variant is the only thing
          that changes.
        </Text>
      </View>

      {LOADER_VARIANTS.map(({ variant, label }) => (
        <Card key={variant}>
          <Card.Content className="flex-row items-center gap-4 py-5">
            <View className="w-32 items-center">
              <Loader variant={variant} />
            </View>
            <Text size="sm" muted className="flex-1">
              {label}
            </Text>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}
function LoaderScreenVersion() {
  const [variant, setVariant] = useState<LoaderVariant>("wave-physics");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setLoading(false), 2600);
    return () => clearTimeout(timer);
  }, [loading]);
  return (
    <View className="flex-1">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 p-4"
      >
        {LOADER_VARIANTS.map(({ variant: value, label }) => (
          <Chip
            key={value}
            selected={value === variant}
            onPress={() => {
              setVariant(value);
              setLoading(true);
            }}
          >
            {label}
          </Chip>
        ))}
      </ScrollView>

      <View className="flex-1 items-center justify-center gap-6 p-6">
        {loading ? (
          <>
            <Loader variant={variant} size="lg" label="Loading your reports" />
            <Text size="sm" muted className="text-center">
              Fetching reports…
            </Text>
          </>
        ) : (
          <>
            <Text size="lg" weight="semibold">
              12 reports
            </Text>
            <Text size="sm" muted className="text-center">
              Pick another loader above to run it again.
            </Text>
            <Button variant="outline" onPress={() => setLoading(true)}>
              Reload
            </Button>
          </>
        )}
      </View>
    </View>
  );
}
function LoaderInlineVersion() {
  const [busy, setBusy] = useState<string | null>(null);
  const run = (id: string) => {
    setBusy(id);
    setTimeout(() => setBusy(null), 2200);
  };
  return (
    <ScrollView contentContainerClassName="gap-4 p-4 pb-10">
      <View className="gap-1">
        <Text size="lg" weight="semibold">
          In place
        </Text>
        <Text size="sm" muted>
          With no colour of its own a loader draws in the foreground of the
          surface it is on, so it stays readable inside a filled button.
        </Text>
      </View>

      <Button onPress={() => run("primary")} disabled={busy === "primary"}>
        {busy === "primary" ? (
          <Loader variant="pulse-dots" size="sm" />
        ) : (
          "Save changes"
        )}
      </Button>

      <Button
        variant="outline"
        onPress={() => run("outline")}
        disabled={busy === "outline"}
      >
        {busy === "outline" ? (
          <Loader variant="bounce-dots" size="sm" />
        ) : (
          "Sync library"
        )}
      </Button>

      <Card>
        <Card.Header>
          <Card.Title>Coloured by token</Card.Title>
          <Card.Description>
            `color` takes a token name, so the loader follows the theme.
          </Card.Description>
        </Card.Header>
        <Card.Content className="flex-row items-center justify-around py-6">
          <Loader variant="bar-cascade" color="--color-info" />
          <Loader variant="symmetric-wave" color="--color-success" />
          <Loader variant="bouncing-bars" color="--color-destructive" />
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Sizes</Card.Title>
        </Card.Header>
        <Card.Content className="flex-row items-center justify-around py-6">
          <Loader variant="pulsating-dots" size="sm" />
          <Loader variant="pulsating-dots" size="md" />
          <Loader variant="pulsating-dots" size="lg" />
        </Card.Content>
      </Card>
    </ScrollView>
  );
}
export const entry: ComponentEntry = {
  slug: "loader",
  name: "Loader",
  summary: "Nine loading animations behind one variant prop",
  demos: [
    {
      label: "The nine",
      id: "gallery",
      fullPage: true,
      description: "All of them side by side, which is the only way to choose.",
      render: () => <LoaderGalleryVersion />,
    },
    {
      label: "Waiting for a screen",
      id: "screen",
      fullPage: true,
      description: "Standing in for content that has not arrived yet.",
      render: () => <LoaderScreenVersion />,
    },
    {
      label: "In place",
      id: "inline",
      fullPage: true,
      description:
        "Inside buttons and cards, taking its colour from the surface.",
      render: () => <LoaderInlineVersion />,
    },
    {
      label: "Pulse dots",
      render: () => <Loader />,
    },
    {
      label: "Wave physics",
      render: () => <Loader variant="wave-physics" />,
    },
    {
      label: "Liquid dots",
      render: () => <Loader variant="liquid-dots" />,
    },
    {
      label: "Morph ring",
      render: () => <Loader variant="morph-ring" />,
    },
  ],
};
