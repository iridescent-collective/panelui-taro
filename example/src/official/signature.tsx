import { Alert } from "panelui-taro/alert";
import { Badge } from "panelui-taro/badge";
import { Button } from "panelui-taro/button";
import { Frame } from "panelui-taro/frame";
import { PackageIcon, PencilIcon, XIcon } from "panelui-taro/icons";
import { Text } from "panelui-taro/primitives/text";
import {
  Signature,
  type SignatureHandle,
} from "panelui-taro/signature";
import {
  ToggleButton,
  ToggleButtonGroup,
} from "panelui-taro/toggle-button";
import { useEffect, useRef, useState } from "react";

import Animated, {
  FadeInDown,
  FadeOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  ZoomIn,
} from "../runtime/motion";
import { Pressable, ScrollView, View } from "../runtime/native";
import { Portal, Scrim } from "../runtime/overlays";
import { ComponentEntry } from "../types";
function SignatureDemo({ guideline = false }: { guideline?: boolean }) {
  const pad = useRef<SignatureHandle>(null);
  const [count, setCount] = useState(0);
  return (
    <View className="w-full gap-3">
      <Signature
        ref={pad}
        guideline={guideline}
        guidelineLabel={guideline ? "Sign above the line" : undefined}
        onChange={setCount}
      />
      <Signature.Toolbar>
        <View className="flex-row gap-2">
          <Signature.Undo
            disabled={count === 0}
            onPress={() => pad.current?.undo()}
          />
          <Signature.Clear
            disabled={count === 0}
            onPress={() => pad.current?.clear()}
          />
        </View>
        <Text size="xs" muted>
          {count === 0 ? "Nothing signed yet" : `${count} strokes`}
        </Text>
      </Signature.Toolbar>
    </View>
  );
}
const SIGNING_LIFT = 28;
function SignatureSheetVersion() {
  const [open, setOpen] = useState(false);
  const [signed, setSigned] = useState(false);
  return (
    <View className="flex-1 items-center justify-center gap-4 px-6">
      {signed ? (
        <Alert variant="success" className="w-full">
          <Alert.Indicator />
          <Text size="sm">Signed. The agreement is on its way.</Text>
        </Alert>
      ) : (
        <Text size="sm" muted className="text-center">
          A signature is asked for over the thing being signed, so the pad comes
          up over the screen rather than taking you to another one.
        </Text>
      )}
      <Button onPress={() => setOpen(true)}>
        {signed ? "Sign again" : "Sign the agreement"}
      </Button>

      {open ? (
        <Portal>
          <SigningFrame
            onClose={() => setOpen(false)}
            onFinish={() => {
              setSigned(true);
              setOpen(false);
            }}
          />
        </Portal>
      ) : null}
    </View>
  );
}
function SigningFrame({
  guideline = false,
  onClose,
  onFinish,
}: {
  guideline?: boolean;
  onClose: () => void;
  onFinish: (pad: SignatureHandle | null) => void;
}) {
  const pad = useRef<SignatureHandle>(null);
  const [count, setCount] = useState(0);
  const lift = useSharedValue(0);
  useEffect(() => {
    lift.value = withSpring(count > 0 ? -SIGNING_LIFT : 0, {
      damping: 22,
      stiffness: 240,
      mass: 0.8,
    });
  }, [count, lift]);
  const rise = useAnimatedStyle(() => ({
    transform: [{ translateY: lift.value }],
  }));
  return (
    <View className="absolute inset-0 items-center justify-center px-6">
      <Scrim blur />
      <Pressable
        accessibilityLabel="Close"
        className="absolute inset-0"
        onPress={onClose}
      />

      <Animated.View
        entering={ZoomIn.springify().damping(18).stiffness(250).mass(0.6)}
        className="w-full"
      >
        <Animated.View style={rise}>
          <Frame className="rounded-[28px] border-2 border-dashed">
            <Frame.Header>
              <Signature.Clear
                accessibilityLabel="Start over"
                className="bg-transparent"
                disabled={count === 0}
                onPress={() => pad.current?.clear()}
              />

              <Frame.Title
                weight="semibold"
                className="text-foreground flex-1 text-center"
              >
                Sign
              </Frame.Title>
              <SigningCloseButton onPress={onClose} />
            </Frame.Header>

            <Frame.Panel className="rounded-b-[26px]">
              <Signature
                ref={pad}
                size="lg"
                guideline={guideline}
                onChange={setCount}
                className="bg-background rounded-none border-0"
              />
            </Frame.Panel>
          </Frame>
        </Animated.View>
      </Animated.View>

      {count > 0 ? (
        <Animated.View
          entering={FadeInDown.springify().damping(18).stiffness(220).mass(0.6)}
          exiting={FadeOutDown.duration(150)}
          className="absolute inset-x-6 bottom-16 items-center"
        >
          <Button
            size="lg"
            startContent={<PencilIcon size={18} />}
            className="rounded-full px-8"
            onPress={() => onFinish(pad.current)}
          >
            Finish Signature
          </Button>
        </Animated.View>
      ) : null}
    </View>
  );
}
function SigningCloseButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Close"
      hitSlop={8}
      onPress={onPress}
      className="bg-muted h-9 w-9 items-center justify-center rounded-full active:opacity-70"
    >
      <XIcon size={16} />
    </Pressable>
  );
}
function SignatureDocumentVersion() {
  const [open, setOpen] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  return (
    <View className="flex-1">
      <ScrollView contentContainerClassName="gap-4 px-5 pb-10 pt-2">
        <Text size="lg" weight="semibold">
          Services agreement
        </Text>
        {Array.from({ length: 6 }, (_, index) => (
          <Text key={index} size="sm" muted>
            {index + 1}. This clause exists so the agreement is long enough to
            scroll, which is the point of signing at the bottom of one rather
            than on a screen of its own.
          </Text>
        ))}

        <Frame className="mt-2">
          <Frame.Header>
            <Frame.Title>Signature</Frame.Title>
            <Frame.Action>{signature ? "Signed" : "Required"}</Frame.Action>
          </Frame.Header>
          <Frame.Panel>
            <Frame.Row onPress={() => setOpen(true)} chevron>
              <Frame.Media>
                <PencilIcon size={18} />
              </Frame.Media>
              <Frame.Content>
                <Frame.Title>
                  {signature ? "Signed by Khalid Abdi" : "Tap to sign"}
                </Frame.Title>
                <Frame.Description>
                  {signature
                    ? "Captured as an SVG, stored with the agreement."
                    : "Your signature is captured as vector paths, not a photo."}
                </Frame.Description>
              </Frame.Content>
            </Frame.Row>
          </Frame.Panel>
        </Frame>

        {signature ? (
          <Text size="xs" muted numberOfLines={3}>
            {signature.slice(0, 180)}…
          </Text>
        ) : null}
      </ScrollView>

      {open ? (
        <Portal>
          <SigningFrame
            guideline
            onClose={() => setOpen(false)}
            onFinish={(signed) => {
              setSignature(signed?.toSVG() ?? null);
              setOpen(false);
            }}
          />
        </Portal>
      ) : null}
    </View>
  );
}
function SignatureExportVersion() {
  const pad = useRef<SignatureHandle>(null);
  const [count, setCount] = useState(0);
  const [format, setFormat] = useState("svg");
  const [result, setResult] = useState<string | null>(null);
  return (
    <View className="flex-1 gap-4 px-5 pt-2">
      <Signature ref={pad} size="lg" guideline onChange={setCount} />

      <ToggleButtonGroup
        selectionMode="single"
        value={[format]}
        onValueChange={(next) => setFormat(next[0] ?? "svg")}
      >
        <ToggleButton id="svg">SVG</ToggleButton>
        <ToggleButton id="png">PNG</ToggleButton>
      </ToggleButtonGroup>

      <View className="flex-row gap-2">
        <Button
          variant="outline"
          className="flex-1"
          disabled={count === 0}
          onPress={() => pad.current?.clear()}
        >
          Clear
        </Button>
        <Button
          className="flex-1"
          disabled={count === 0}
          onPress={async () => {
            try {
              const file = await pad.current?.save({
                filename: "agreement",
                format: format as "svg" | "png",
              });
              setResult(
                file ? `${file.uri} (${file.width}×${file.height})` : null
              );
            } catch (error) {
              setResult(error instanceof Error ? error.message : String(error));
            }
          }}
        >
          Save
        </Button>
      </View>

      {result ? (
        <Text size="xs" muted>
          {result}
        </Text>
      ) : (
        <Text size="xs" muted>
          Saving writes to the app&apos;s document directory. PNG needs the
          optional raster package; SVG needs nothing.
        </Text>
      )}
    </View>
  );
}
function SignatureFullScreenVersion() {
  const pad = useRef<SignatureHandle>(null);
  const [count, setCount] = useState(0);
  return (
    <View className="flex-1">
      <Signature
        ref={pad}
        size="full"
        guideline
        guidelineLabel="Khalid Abdi"
        onChange={setCount}
        placeholder={
          <Text size="sm" muted>
            Turn the device sideways and sign across the screen
          </Text>
        }
      />
      <View className="border-border flex-row items-center justify-between gap-2 border-t px-5 py-4">
        <Signature.Clear
          disabled={count === 0}
          onPress={() => pad.current?.clear()}
        />
        <Button disabled={count === 0} className="flex-1">
          Accept and continue
        </Button>
      </View>
    </View>
  );
}
function SignatureDeliveryVersion() {
  const pad = useRef<SignatureHandle>(null);
  const [count, setCount] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  return (
    <ScrollView contentContainerClassName="gap-4 px-5 pb-10 pt-2">
      <Frame>
        <Frame.Header>
          <Frame.Title>Delivery 4821</Frame.Title>
          <Frame.Action>
            <Badge variant="secondary">2 parcels</Badge>
          </Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <Frame.Row>
            <Frame.Media>
              <PackageIcon size={18} />
            </Frame.Media>
            <Frame.Content>
              <Frame.Title>Khalid Abdi</Frame.Title>
              <Frame.Description>
                14 Cadogan Street · Handed to the recipient
              </Frame.Description>
            </Frame.Content>
          </Frame.Row>
          <Frame.Row>
            <Frame.Content>
              <Frame.Title>Received at</Frame.Title>
            </Frame.Content>
            <Frame.Actions>
              <Text size="sm" muted>
                14:32
              </Text>
            </Frame.Actions>
          </Frame.Row>
        </Frame.Panel>
      </Frame>

      <Text size="sm" muted>
        Recipient signature
      </Text>
      <Signature ref={pad} guideline onChange={setCount} />

      <View className="flex-row gap-2">
        <Signature.Clear
          disabled={count === 0}
          onPress={() => pad.current?.clear()}
        />
        <Button
          className="flex-1"
          disabled={count === 0 || confirmed}
          onPress={() => setConfirmed(true)}
        >
          {confirmed ? "Confirmed" : "Confirm delivery"}
        </Button>
      </View>

      {confirmed ? (
        <Alert variant="success">
          <Alert.Indicator />
          <Text size="sm">Delivery confirmed and the signature attached.</Text>
        </Alert>
      ) : null}
    </ScrollView>
  );
}
export const entry: ComponentEntry = {
  slug: "signature",
  name: "Signature",
  summary: "Sign with a finger, and get the result back out",
  demos: [
    { label: "Default", render: () => <SignatureDemo /> },
    { label: "With a baseline", render: () => <SignatureDemo guideline /> },
    {
      label: "Sizes",
      render: () => (
        <View className="w-full gap-4">
          <Signature size="sm" placeholder={null} />
          <Signature size="md" placeholder={null} />
        </View>
      ),
    },
    {
      label: "Signing frame",
      id: "sheet",
      fullPage: true,
      description:
        "A framed pad over a frosted screen. Draw a stroke and the frame lifts as the confirm button arrives beneath it.",
      render: () => <SignatureSheetVersion />,
    },
    {
      label: "Signing a document",
      id: "document",
      fullPage: true,
      description:
        "An agreement you scroll, with the captured signature landing back in the document.",
      render: () => <SignatureDocumentVersion />,
    },
    {
      label: "Saving to a file",
      id: "export",
      fullPage: true,
      description:
        "save() writes SVG or PNG and hands back where it went. The optional packages report themselves by name.",
      render: () => <SignatureExportVersion />,
    },
    {
      label: "Full screen",
      id: "full-screen",
      fullPage: true,
      description:
        "The whole screen is the pad, for a form that signs and nothing else.",
      render: () => <SignatureFullScreenVersion />,
    },
    {
      label: "Proof of delivery",
      id: "delivery",
      fullPage: true,
      description:
        "Recipient, timestamp and signature on one screen, the way a courier app asks.",
      render: () => <SignatureDeliveryVersion />,
    },
  ],
};
