// @vitest-environment happy-dom

import type * as TaroComponents from "@tarojs/components";
import { act, render } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { expect, it, vi } from "vitest";

import { Avatar } from "../src/components/Avatar";
import { ImageGeneration } from "../src/components/ImageGeneration";
import { LiveLineChart } from "../src/components/LiveLineChart";
import { PageHeader } from "../src/components/PageHeader";
import { Post } from "../src/components/Post";
import { PanelUIProvider } from "../src/components/Provider";
import { QRCode } from "../src/components/QRCode";
import { Signature } from "../src/components/Signature";
import { Sketch } from "../src/components/Sketch";
import { ChartAccessibilityData } from "../src/primitives/chart-accessibility";

const native = vi.hoisted(() => ({
  images: [] as { role: unknown; nativeRole: unknown }[],
}));
vi.mock("@tarojs/components", async (original) => {
  const actual = await original<typeof TaroComponents>();
  const { createElement } = await import("react");
  const capture = (props: object) => {
    const nativeRole = Reflect.get(props, "aria-role");
    if (nativeRole === "img" || nativeRole === "image") {
      native.images.push({ nativeRole, role: Reflect.get(props, "role") });
    }
  };
  return {
    ...actual,
    Image: (props: ComponentProps<typeof actual.Image>) => {
      capture(props);
      return createElement(actual.Image, props);
    },
    View: (props: ComponentProps<typeof actual.View>) => {
      capture(props);
      return createElement(actual.View, props);
    },
  };
});

const cases: { name: string; element: ReactNode; role?: string }[] = [
  { element: <Avatar fallback="AB" />, name: "Avatar standalone", role: "img" },
  {
    element: (
      <Avatar fallback="AB">
        <Avatar.Badge>Badge</Avatar.Badge>
      </Avatar>
    ),
    name: "Avatar with children",
    role: "img",
  },
  {
    element: (
      <ChartAccessibilityData
        chart="Example"
        data={[10]}
        valueOf={(value) => [["Value", value]]}
      />
    ),
    name: "ChartAccessibilityData summary",
    role: "img",
  },
  { element: <Signature />, name: "Signature pad", role: "img" },
  { element: <Sketch />, name: "Sketch canvas" },
  {
    element: <ImageGeneration status="complete" />,
    name: "ImageGeneration frame",
    role: "img",
  },
  {
    element: <LiveLineChart data={[{ time: 1000, value: 1 }]} paused />,
    name: "LiveLineChart summary",
    role: "img",
  },
  {
    element: (
      <Post>
        <Post.Media source={{ uri: "/test-image.png" }} alt="Post picture" />
      </Post>
    ),
    name: "Post.Media picture",
  },
  {
    element: (
      <QRCode value="https://example.com">
        <QRCode.Canvas />
      </QRCode>
    ),
    name: "QRCode.Canvas",
    role: "img",
  },
  {
    element: (
      <PageHeader>
        <PageHeader.Cover
          source={{ uri: "/test-image.png" }}
          alt="Cover picture"
        />
      </PageHeader>
    ),
    name: "PageHeader.Cover picture",
  },
];

it.each(cases)(
  "uses native image semantics without changing $name HTML role",
  async ({ element, role }) => {
    native.images = [];
    render(<PanelUIProvider reducedMotion>{element}</PanelUIProvider>);
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(native.images.length).toBeGreaterThan(0);
    for (const image of native.images) {
      expect(image).toEqual({ nativeRole: "image", role });
    }
  }
);

it("keeps unlabelled Post and PageHeader pictures decorative", () => {
  native.images = [];
  render(
    <PanelUIProvider reducedMotion>
      <Post>
        <Post.Media source={{ uri: "/test-image.png" }} />
      </Post>
      <PageHeader>
        <PageHeader.Cover source={{ uri: "/test-image.png" }} />
      </PageHeader>
    </PanelUIProvider>
  );
  expect(native.images).toEqual([]);
});
