// @vitest-environment happy-dom

import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { forwardRef } from "react";
import { expect, it, vi } from "vitest";

import { MapShowcase } from "../components/MapShowcase";

vi.mock("panelui-taro/map", async () => {
  const { createElement } = await import("react");
  const Layer = ({ children }: { children?: ReactNode }) =>
    createElement("div", null, children);
  const Root = forwardRef<
    HTMLDivElement,
    { children?: ReactNode; bounds?: number[] }
  >(({ children, bounds }, ref) => (
    <div
      ref={ref}
      data-testid="map-preview"
      data-bounds={JSON.stringify(bounds)}
    >
      {children}
    </div>
  ));
  return {
    Map: Object.assign(Root, {
      Arc: Layer,
      Cluster: Layer,
      Controls: Layer,
      GeoJSON: Layer,
      Heatmap: Layer,
      Label: Layer,
      Marker: ({ children }: { children?: ReactNode }) => (
        <div data-testid="map-marker">{children}</div>
      ),
      Overlay: Layer,
      Popup: Layer,
      Route: Layer,
    }),
  };
});
vi.mock("panelui-taro/button", () => ({
  Button: ({
    children,
    onPress,
  }: {
    children?: ReactNode;
    onPress?: () => void;
  }) => <button onClick={onPress}>{children}</button>,
}));
vi.mock("panelui-taro/typography", () => ({
  Typography: Object.assign(
    ({ children }: { children?: ReactNode }) => <p>{children}</p>,
    {
      Paragraph: ({ children }: { children?: ReactNode }) => <p>{children}</p>,
    }
  ),
}));

it("frames the demonstration data instead of squeezing it around the city center", () => {
  render(<MapShowcase />);
  expect(screen.getByTestId("map-preview").dataset.bounds).toBeDefined();
});
it.each(["cluster", "heatmap"])(
  "%s does not cover its data with an unrelated center marker and label",
  (mode) => {
    render(<MapShowcase />);
    fireEvent.click(screen.getByRole("button", { name: mode }));
    expect(screen.queryByTestId("map-marker")).toBeNull();
  }
);
