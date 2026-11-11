// @vitest-environment happy-dom
import crypto from "node:crypto";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Button } from "../src/components/Button";
import { PanelUIProvider } from "../src/components/Provider";
import { QRCode } from "../src/components/QRCode";
import { holeBounds, levelFor } from "../src/components/QRCode/constants";
import { qrPaths } from "../src/components/QRCode/geometry";
import { encodeQr } from "../src/components/QRCode/qr-encode";
import type { ErrorCorrectionLevel } from "../src/components/QRCode/qr-encode";
import {
  eyeBallPath,
  eyeFramePath,
  modulePath,
} from "../src/components/QRCode/qr-shapes";
import { qrImageSource } from "../src/components/QRCode/svg-source";
import fixtures from "./fixtures/qr-source-matrices.json";
import { readTaroStyle } from "./taro-style";

it("encoder matches the pinned upstream matrices across levels, versions, UTF8 and empty data", () => {
  for (const sample of fixtures) {
    const matrix = encodeQr(sample.value, {
      errorCorrection: sample.errorCorrection as ErrorCorrectionLevel,
      version: sample.version ?? undefined,
    });
    const digest = crypto
      .createHash("sha256")
      .update(
        matrix.modules
          .map((row) => row.map((value) => (value ? "1" : "0")).join(""))
          .join("\n")
      )
      .digest("hex");
    expect(matrix.size).toBe(sample.size);
    expect(digest).toBe(sample.sha256);
  }
  expect(encodeQr("test", { version: 40 }).size).toBe(177);
  expect(() => encodeQr("test", { version: 0 })).toThrow();
  expect(() => encodeQr("x".repeat(100), { version: 1 })).toThrow();
});
it("draws three independent paths, a painted quiet zone, and safely escapes custom ink", () => {
  const matrix = encodeQr("PanelUI");
  const paths = qrPaths(matrix, 0, "square", "square", "square");
  const svg = decodeURIComponent(
    qrImageSource(
      matrix.size,
      paths,
      "#fff",
      'red"/><script>bad</script>',
      "#222",
      "#333"
    ).split(",")[1]
  );
  expect(svg).toContain(`viewBox="0 0 ${matrix.size + 8} ${matrix.size + 8}"`);
  expect(svg.match(/<path /gu)).toHaveLength(3);
  expect(svg).toContain('fill-rule="evenodd"');
  expect(svg).toContain("&quot;/&gt;&lt;script&gt;");
  expect(svg).not.toContain("<script>");
  for (const shape of [
    "square",
    "rounded",
    "dot",
    "classy",
    "diamond",
  ] as const) {
    expect(modulePath(shape, matrix.modules, 0, 0, matrix.size, 4)).not.toBe(
      ""
    );
  }
  for (const shape of [
    "square",
    "rounded",
    "circle",
    "leaf",
    "shield",
  ] as const) {
    expect(eyeFramePath(shape, 0, 0, 4, "tl")).not.toBe("");
  }
  for (const shape of [
    "square",
    "rounded",
    "dot",
    "diamond",
    "leaf",
  ] as const) {
    expect(eyeBallPath(shape, 0, 0, 4)).not.toBe("");
  }
});
it("logo raises weak correction and removes exactly the shared module hole", () => {
  expect(levelFor("L", 0)).toBe("L");
  expect(levelFor("L", 0.25)).toBe("M");
  expect(levelFor("H", 0.25)).toBe("H");
  const matrix = encodeQr("test", { errorCorrection: "Q" });
  const paths = qrPaths(matrix, 0.25, "square", "square", "square");
  const { from, to } = holeBounds(matrix.size, 0.25);
  for (let y = from; y < to; y += 1) {
    for (let x = from; x < to; x += 1) {
      expect(paths.body).not.toContain(`M${x + 4} ${y + 4}h1`);
    }
  }
  const tree = render(
    <PanelUIProvider>
      <QRCode value="test" errorCorrection="L">
        <QRCode.Panel>
          <QRCode.Canvas />
          <QRCode.Logo data-testid="logo">P</QRCode.Logo>
        </QRCode.Panel>
      </QRCode>
    </PanelUIProvider>
  );
  const source = tree.container.querySelector("img")?.getAttribute("src");
  expect(source).toBe(
    qrImageSource(
      matrix.size,
      paths,
      "#ffffff",
      "#111111",
      "#111111",
      "#111111"
    )
  );
  expect(readTaroStyle(screen.getByTestId("logo"))).toContain(
    `"width":"${((to - from) / (matrix.size + 8)) * 360}rpx"`
  );
});
it("invalid values reserve their size and recover without taking down the containing screen", () => {
  const tree = render(
    <PanelUIProvider>
      <QRCode value={"x".repeat(100)} version={1} size="sm">
        <QRCode.Canvas />
        <QRCode.Caption>Scan</QRCode.Caption>
      </QRCode>
    </PanelUIProvider>
  );
  expect(
    readTaroStyle(
      screen.getByRole("img", { name: "QR code could not be generated" })
    )
  ).toContain('"width":"256rpx"');
  expect(tree.container.querySelector("img")).toBeNull();
  tree.rerender(
    <PanelUIProvider>
      <QRCode value="test">
        <QRCode.Canvas pixelSize={200} />
        <QRCode.Value full />
      </QRCode>
    </PanelUIProvider>
  );
  expect(
    readTaroStyle(screen.getByRole("img", { name: "QR code for test" }))
  ).toContain('"height":"400rpx"');
  expect(tree.container.querySelector("img")).toBeTruthy();
  expect(screen.getByText("test").getAttribute("selectable")).not.toBe("false");
});
it("all shell parts preserve source layout and text slots", () => {
  render(
    <PanelUIProvider>
      <QRCode value="test">
        <QRCode.Frame data-testid="frame">
          <QRCode.Header>
            <QRCode.Title>Invite</QRCode.Title>
            <QRCode.Action>Expires tomorrow</QRCode.Action>
          </QRCode.Header>
          <QRCode.Panel>
            <QRCode.Canvas />
            <QRCode.Description>Scan to join</QRCode.Description>
          </QRCode.Panel>
        </QRCode.Frame>
        <QRCode.Caption>Family</QRCode.Caption>
        <QRCode.Value />
      </QRCode>
    </PanelUIProvider>
  );
  expect(screen.getByTestId("frame").className).toContain("panel-surface");
  expect(screen.getByText("Invite").className).toContain("min-w-0");
  expect(screen.getByText("Expires tomorrow").className).toContain(
    "panel-muted-foreground"
  );
  expect(screen.getByText("Scan to join").className).toContain("text-center");
  expect(screen.getByText("Family").className).toContain("text-[28px]");
});
it("controlled sheet content receives the QR context through the portal", async () => {
  const onOpenChange = vi.fn();
  const tree = render(
    <PanelUIProvider>
      <QRCode
        value="test"
        presentation="bottom-sheet"
        open={false}
        onOpenChange={onOpenChange}
      >
        <QRCode.Trigger>
          <Button>Show code</Button>
        </QRCode.Trigger>
        <QRCode.Content>
          <QRCode.Canvas />
          <QRCode.Value />
        </QRCode.Content>
      </QRCode>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Show code" }));
  await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(true));
  expect(screen.queryByRole("img")).toBeNull();
  tree.rerender(
    <PanelUIProvider>
      <QRCode
        value="test"
        presentation="bottom-sheet"
        open
        onOpenChange={onOpenChange}
      >
        <QRCode.Trigger>
          <Button>Show code</Button>
        </QRCode.Trigger>
        <QRCode.Content>
          <QRCode.Canvas />
          <QRCode.Value />
        </QRCode.Content>
      </QRCode>
    </PanelUIProvider>
  );
  expect(screen.getByRole("img", { name: "QR code for test" })).toBeTruthy();
  expect(screen.getByText("test")).toBeTruthy();
});
it("logo correction accounts for rounding the cleared hole to whole modules", () => {
  const matrix = encodeQr("https://panelui.dev", { errorCorrection: "Q" });
  const paths = qrPaths(matrix, 0.25, "rounded", "rounded", "rounded");
  const tree = render(
    <PanelUIProvider>
      <QRCode value="https://panelui.dev" errorCorrection="L">
        <QRCode.Panel>
          <QRCode.Canvas
            moduleShape="rounded"
            eyeFrameShape="rounded"
            eyeBallShape="rounded"
          />
          <QRCode.Logo>P</QRCode.Logo>
        </QRCode.Panel>
      </QRCode>
    </PanelUIProvider>
  );
  expect(tree.container.querySelector("img")?.getAttribute("src")).toBe(
    qrImageSource(
      matrix.size,
      paths,
      "#ffffff",
      "#111111",
      "#111111",
      "#111111"
    )
  );
});
