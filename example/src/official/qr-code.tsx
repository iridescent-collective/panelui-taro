import { Avatar } from "panelui-taro/avatar";
import { Button } from "panelui-taro/button";
import { Card } from "panelui-taro/card";
import { Frame } from "panelui-taro/frame";
import {
  QRCode,
  type QRCodeEyeBallShape,
  type QRCodeEyeFrameShape,
  type QRCodeModuleShape,
} from "panelui-taro/qr-code";

import { ScrollView, View } from "../runtime/native";
import { ComponentEntry } from "../types";
function QRCodeFramedVersion() {
  return (
    <View className="flex-1 items-center justify-center gap-4 p-4">
      <QRCode value="https://panelui.dev" size="lg">
        <QRCode.Frame>
          <QRCode.Header>
            <QRCode.Title>Documentation</QRCode.Title>
            <QRCode.Action>panelui.dev</QRCode.Action>
          </QRCode.Header>
          <QRCode.Panel>
            <QRCode.Canvas />
          </QRCode.Panel>
        </QRCode.Frame>
        <QRCode.Caption>Scan to open the documentation</QRCode.Caption>
      </QRCode>
    </View>
  );
}
function QRCodeHeaderVersion() {
  return (
    <View className="flex-1 items-center justify-center gap-4 p-4">
      <QRCode value="https://panelui.dev/pair/8f2a41" size="lg">
        <QRCode.Frame>
          <QRCode.Header>
            <QRCode.Title>Pair a device</QRCode.Title>
            <QRCode.Action>Expires in 5m</QRCode.Action>
          </QRCode.Header>
          <QRCode.Panel>
            <QRCode.Canvas />

            <QRCode.Logo>
              <Avatar fallback="P" size="sm" />
            </QRCode.Logo>
          </QRCode.Panel>
        </QRCode.Frame>

        <QRCode.Value />
      </QRCode>
    </View>
  );
}
const QR_STYLES: {
  label: string;
  module: QRCodeModuleShape;
  frame: QRCodeEyeFrameShape;
  ball: QRCodeEyeBallShape;
}[] = [
  { label: "Square", module: "square", frame: "square", ball: "square" },
  { label: "Rounded", module: "rounded", frame: "rounded", ball: "rounded" },
  { label: "Dots", module: "dot", frame: "circle", ball: "dot" },
  { label: "Classy", module: "classy", frame: "leaf", ball: "leaf" },
  { label: "Diamond", module: "diamond", frame: "shield", ball: "diamond" },
];
function QRCodeStylesVersion() {
  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="flex-row flex-wrap justify-center gap-x-8 gap-y-10 p-6"
      showsVerticalScrollIndicator={false}
    >
      {QR_STYLES.map((style) => (
        <QRCode
          key={style.label}
          value="https://panelui.dev"
          size="sm"
          errorCorrection="H"
        >
          <QRCode.Canvas
            moduleShape={style.module}
            eyeFrameShape={style.frame}
            eyeBallShape={style.ball}
          />
          <QRCode.Caption>{style.label}</QRCode.Caption>
        </QRCode>
      ))}
    </ScrollView>
  );
}
const QR_PALETTES: {
  label: string;
  color: string;
  eyeFrameColor: string;
  eyeBallColor: string;
}[] = [
  {
    label: "Indigo",
    color: "#1f2937",
    eyeFrameColor: "#4338ca",
    eyeBallColor: "#f97316",
  },
  {
    label: "Forest",
    color: "#14532d",
    eyeFrameColor: "#166534",
    eyeBallColor: "#65a30d",
  },
  {
    label: "Plum",
    color: "#3b0764",
    eyeFrameColor: "#7e22ce",
    eyeBallColor: "#db2777",
  },
  {
    label: "Ink",
    color: "#111827",
    eyeFrameColor: "#111827",
    eyeBallColor: "#dc2626",
  },
  {
    label: "Ocean",
    color: "#0c4a6e",
    eyeFrameColor: "#0369a1",
    eyeBallColor: "#0891b2",
  },
  {
    label: "Ember",
    color: "#431407",
    eyeFrameColor: "#c2410c",
    eyeBallColor: "#f59e0b",
  },
];
function QRCodeBrandVersion() {
  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="flex-row flex-wrap justify-center gap-x-8 gap-y-10 p-6"
      showsVerticalScrollIndicator={false}
    >
      {QR_PALETTES.map((palette) => (
        <QRCode
          key={palette.label}
          value="https://panelui.dev"
          size="sm"
          errorCorrection="H"
        >
          <QRCode.Canvas
            moduleShape="rounded"
            eyeFrameShape="rounded"
            eyeBallShape="rounded"
            color={palette.color}
            eyeFrameColor={palette.eyeFrameColor}
            eyeBallColor={palette.eyeBallColor}
          />
          <QRCode.Caption>{palette.label}</QRCode.Caption>
        </QRCode>
      ))}
    </ScrollView>
  );
}
function QRCodePopoverVersion() {
  return (
    <View className="flex-1 justify-center gap-4 p-4">
      <Card>
        <Card.Header>
          <Card.Title>Share this page</Card.Title>
          <Card.Description>Anyone with the code can open it.</Card.Description>
        </Card.Header>
        <Card.Footer>
          <QRCode value="https://panelui.dev" presentation="popover">
            <QRCode.Trigger>
              <Button variant="outline">Show QR code</Button>
            </QRCode.Trigger>
            <QRCode.Content>
              <QRCode.Canvas />
              <QRCode.Caption>Scan to open the docs</QRCode.Caption>
            </QRCode.Content>
          </QRCode>
        </Card.Footer>
      </Card>

      <QRCode
        value="WIFI:T:WPA;S:PanelUI Guest;P:hunter2;;"
        presentation="bottom-sheet"
        size="lg"
      >
        <QRCode.Trigger>
          <Button>Join the network</Button>
        </QRCode.Trigger>
        <QRCode.Content>
          <QRCode.Canvas />
          <QRCode.Caption>Scan to join PanelUI Guest</QRCode.Caption>
        </QRCode.Content>
      </QRCode>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "qr-code",
  name: "QRCode",
  summary: "A string a camera can read",
  demos: [
    {
      label: "Framed",
      id: "framed",
      fullPage: true,
      description:
        "The code in a bordered panel, with a line under it saying what it does.",
      render: () => <QRCodeFramedVersion />,
    },
    {
      label: "With a header",
      id: "header",
      fullPage: true,
      description:
        "A title strip with a trailing slot, a mark in the middle, and the string underneath.",
      render: () => <QRCodeHeaderVersion />,
    },
    {
      label: "Folded away",
      id: "popover",
      fullPage: true,
      description:
        "Behind a button, brought up in a popover or a sheet when it is wanted.",
      render: () => <QRCodePopoverVersion />,
    },
    {
      label: "Sizes",
      render: () => (
        <View className="w-full items-center gap-6">
          <QRCode value="https://panelui.dev" size="sm">
            <QRCode.Canvas />
          </QRCode>
          <QRCode value="https://panelui.dev" size="md">
            <QRCode.Canvas />
          </QRCode>
        </View>
      ),
    },
    {
      label: "Error correction",
      render: () => (
        <View className="w-full flex-row items-center justify-around">
          <QRCode value="https://panelui.dev" size="sm" errorCorrection="L">
            <QRCode.Canvas />
            <QRCode.Caption>L</QRCode.Caption>
          </QRCode>
          <QRCode value="https://panelui.dev" size="sm" errorCorrection="H">
            <QRCode.Canvas />
            <QRCode.Caption>H</QRCode.Caption>
          </QRCode>
        </View>
      ),
    },
    {
      label: "With a mark",
      render: () => (
        <QRCode value="https://panelui.dev" size="lg">
          <QRCode.Frame>
            <QRCode.Header>
              <QRCode.Title>PanelUI</QRCode.Title>
            </QRCode.Header>
            <QRCode.Panel>
              <QRCode.Canvas />
              <QRCode.Logo>
                <Avatar fallback="P" size="sm" />
              </QRCode.Logo>
            </QRCode.Panel>
          </QRCode.Frame>
        </QRCode>
      ),
    },
    {
      label: "Module shapes",
      render: () => (
        <View className="w-full flex-row items-center justify-around">
          {(["square", "rounded", "dot"] as const).map((shape) => (
            <QRCode
              key={shape}
              value="https://panelui.dev"
              size="sm"
              errorCorrection="H"
            >
              <QRCode.Canvas moduleShape={shape} />
              <QRCode.Caption>{shape}</QRCode.Caption>
            </QRCode>
          ))}
        </View>
      ),
    },
    {
      label: "Eye shapes",
      render: () => (
        <View className="w-full flex-row items-center justify-around">
          {(["rounded", "circle", "shield"] as const).map((shape) => (
            <QRCode
              key={shape}
              value="https://panelui.dev"
              size="sm"
              errorCorrection="H"
            >
              <QRCode.Canvas eyeFrameShape={shape} eyeBallShape="rounded" />
              <QRCode.Caption>{shape}</QRCode.Caption>
            </QRCode>
          ))}
        </View>
      ),
    },
    {
      label: "Every style",
      id: "styles",
      fullPage: true,
      description:
        "Each module and eye shape in turn, so what each one costs in ink is visible.",
      render: () => <QRCodeStylesVersion />,
    },
    {
      label: "Branded",
      id: "branded",
      fullPage: true,
      description:
        "The same code in six palettes — body, rings and centres coloured separately.",
      render: () => <QRCodeBrandVersion />,
    },
  ],
};
