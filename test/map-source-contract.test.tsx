// @vitest-environment happy-dom
import "./geometry-renderer";
import { document as taroDocument } from "@tarojs/runtime";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef, StrictMode } from "react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { Map } from "../src/components/Map";
import type { LngLat, MapHandle } from "../src/components/Map";
import { arcCoordinates } from "../src/components/Map/arc";
import { buildBasemapStyle } from "../src/components/Map/basemap";
import { clusterMapPoints, clusterRadius } from "../src/components/Map/cluster";
import { gcj02ToWgs84, wgs84ToGcj02 } from "../src/components/Map/coordinates";
import { evaluateMapExpression } from "../src/components/Map/expression";
import {
  heatmapPixels,
  heatmapSettings,
  withAlpha,
} from "../src/components/Map/heatmap";
import {
  controlsOffsets,
  overlayOffsets,
  overlayReservation,
  resolveMapInsets,
} from "../src/components/Map/map-insets";
import type {
  MapCorner,
  MapOverlayPosition,
} from "../src/components/Map/map-insets";
import { hitMapGeometry } from "../src/components/Map/surface";
import { PanelUIProvider } from "../src/components/Provider";
import FIXTURES from "./fixtures/map-source.json";
import { deferred } from "./helpers/deferred";
import type { createSelectorQuery as CreateSelectorQueryMock } from "./taro-api";
import {
  emitTestResize,
  setElementCanvasNode,
  setTestMeasurement,
} from "./taro-api";

const NATIVE = vi.hoisted(() => ({
  context: {
    getCenterLocation: vi.fn(),
    getRegion: vi.fn(),
    getRotate: vi.fn(),
    getScale: vi.fn(),
    getSkew: vi.fn(),
    includePoints: vi.fn(),
    toScreenLocation: vi.fn(),
  },
  create: vi.fn(),
  delay: false,
  fields: [] as (() => void)[],
  location: vi.fn(),
  platform: "ios",
  props: {} as Record<string, unknown>,
}));
vi.mock("@tarojs/taro", async () => {
  const actual = await vi.importActual<{
    createSelectorQuery: typeof CreateSelectorQueryMock;
  }>("@tarojs/taro");
  return {
    ...actual,
    createMapContext: NATIVE.create,
    createSelectorQuery: () => {
      const query = actual.createSelectorQuery();
      const { fields } = query;
      query.fields = (options, acceptNode) =>
        fields(options, (result) => {
          if (NATIVE.delay) {
            NATIVE.fields.push(() => acceptNode(result));
          } else {
            return acceptNode(result);
          }
        });
      return query;
    },
    getDeviceInfo: () => ({ platform: NATIVE.platform }),
    getLocation: NATIVE.location,
  };
});
vi.mock("@tarojs/components", async () => {
  const actual =
    await vi.importActual<Record<string, unknown>>("@tarojs/components");
  const { createElement } = await import("react");
  return {
    ...actual,
    Map: (props: Record<string, unknown>) => {
      NATIVE.props = props;
      return createElement("div", {
        "data-native-map": true,
        "data-native-scale": props.scale as number,
        id: props.id as string,
      });
    },
  };
});
beforeEach(() => {
  NATIVE.props = {};
  NATIVE.platform = "ios";
  NATIVE.fields = [];
  NATIVE.delay = false;
  NATIVE.create.mockReturnValue(NATIVE.context);
  NATIVE.context.getCenterLocation.mockImplementation(() =>
    Promise.resolve({
      latitude: Number(NATIVE.props.latitude),
      longitude: Number(NATIVE.props.longitude),
    })
  );
  NATIVE.context.getScale.mockImplementation(() =>
    Promise.resolve({
      scale: Number(NATIVE.props.scale),
    })
  );
  NATIVE.context.getRotate.mockImplementation(() =>
    Promise.resolve({
      rotate: Number(NATIVE.props.rotate),
    })
  );
  NATIVE.context.getSkew.mockImplementation(() =>
    Promise.resolve({
      skew: Number(NATIVE.props.skew),
    })
  );
  NATIVE.context.getRegion.mockResolvedValue({
    northeast: { latitude: 60, longitude: 100 },
    southwest: { latitude: 0, longitude: 0 },
  });
  NATIVE.context.includePoints.mockResolvedValue({});
  NATIVE.context.toScreenLocation.mockImplementation(
    ({ longitude, latitude }: { longitude: number; latitude: number }) =>
      Promise.resolve({ x: longitude + 150, y: 100 - latitude })
  );
  NATIVE.location.mockResolvedValue({ latitude: 31.2, longitude: 121.4 });
});
afterEach(() => vi.useRealTimers());
it.each(FIXTURES.offsets)("matches pinned overlay reservation %#", (frame) => {
  const insets = resolveMapInsets(frame.inset ?? undefined, 12, frame.safe);
  expect(insets).toEqual(frame.normalized);
  expect(overlayOffsets(frame.position as MapOverlayPosition, insets)).toEqual(
    frame.offsets
  );
  expect(
    overlayReservation(
      frame.position as MapOverlayPosition,
      insets,
      frame.height
    )
  ).toEqual(frame.reservation);
});
it.each(FIXTURES.controls)(
  "matches pinned control collision offsets %#",
  (frame) =>
    expect(
      controlsOffsets(frame.corner as MapCorner, {
        gap: 12,
        inset: frame.inset,
        reserved: frame.reserved,
      })
    ).toEqual(frame.output)
);
it.each(FIXTURES.colors)("matches pinned heatmap alpha ramp %#", (frame) =>
  expect(withAlpha(frame.color, frame.alpha)).toBe(frame.output)
);
it.each(FIXTURES.arcs)("matches pinned 64-segment arc %#", (frame) =>
  expect(
    arcCoordinates(frame.from as LngLat, frame.to as LngLat, frame.curvature)
  ).toEqual(frame.output)
);
it.each(FIXTURES.basemaps)("retains source basemap style builder %#", (frame) =>
  expect(buildBasemapStyle(frame.tokens, { blank: frame.blank })).toEqual(
    frame.output
  )
);
for (const frame of FIXTURES.heatmaps) {
  for (const zoom of [0, 4, 8, 12, 14, 15, 18, 20]) {
    it(`matches pinned heatmap expressions ${JSON.stringify(frame.props)} at zoom ${zoom}`, () => {
      const source = frame.layers[0].style;
      const props = frame.props as {
        radius?: number;
        intensity?: number;
        opacity?: number;
        maxZoom?: number;
      };
      const target = heatmapSettings(
        zoom,
        props.radius ?? 24,
        props.intensity ?? 1,
        props.opacity ?? 0.85,
        props.maxZoom ?? 15
      );
      const environment = {
        feature: { properties: { value: 0.5 }, type: "Feature" },
        zoom,
      };
      expect(target.radius).toBe(
        evaluateMapExpression(source.heatmapRadius, environment)
      );
      expect(target.intensity).toBe(
        evaluateMapExpression(source.heatmapIntensity, environment)
      );
      expect(target.opacity).toBe(
        evaluateMapExpression(source.heatmapOpacity, environment)
      );
    });
  }
}
it("keeps coordinate conversions opt-in and reversible at the native boundary", () => {
  for (const point of [
    [121.4737, 31.2304],
    [116.397, 39.908],
    [113.2644, 23.1291],
  ] as LngLat[]) {
    const native = wgs84ToGcj02(point);
    expect(native).not.toEqual(point);
    const restored = gcj02ToWgs84(native);
    expect(restored[0]).toBeCloseTo(point[0], 8);
    expect(restored[1]).toBeCloseTo(point[1], 8);
  }
  expect(wgs84ToGcj02([-73.9, 40.7])).toEqual([-73.9, 40.7]);
});
it("preserves polygon holes for rendering hit tests and handles source color expressions", () => {
  const outer: LngLat[] = [
    [0, 0],
    [100, 0],
    [100, 100],
    [0, 100],
    [0, 0],
  ];
  const hole: LngLat[] = [
    [20, 20],
    [80, 20],
    [80, 80],
    [20, 80],
    [20, 20],
  ];
  expect(
    hitMapGeometry([10, 10], { coordinates: [outer, hole], type: "polygon" }, 1)
  ).toBe(true);
  expect(
    hitMapGeometry([50, 50], { coordinates: [outer, hole], type: "polygon" }, 1)
  ).toBe(false);
  expect(
    evaluateMapExpression(
      ["match", ["get", "status"], "active", "#00ff00", "#ff0000"],
      { feature: { properties: { status: "active" } }, zoom: 10 }
    )
  ).toBe("#00ff00");
  expect(() =>
    evaluateMapExpression(["unsupported-op", 1], { feature: {}, zoom: 10 })
  ).toThrow("unsupported MapLibre expression");
});
it("clusters screen points with source bubble thresholds and computes bounded weighted density", () => {
  expect([1, 24, 25, 99, 100].map(clusterRadius)).toEqual([16, 16, 22, 22, 28]);
  const points = [
    { feature: 1, point: [0, 0] as LngLat },
    { feature: 2, point: [10, 0] as LngLat },
    { feature: 3, point: [100, 100] as LngLat },
  ];
  expect(
    clusterMapPoints(points, 50, true).map((group) => group.features.length)
  ).toEqual([2, 1]);
  expect(clusterMapPoints(points, 50, false)).toHaveLength(3);
  const pixel = heatmapPixels(
    20,
    20,
    [{ feature: { properties: { weight: 0 } }, point: [10, 10] }],
    { intensity: 1, opacity: 1, radius: 5, ramp: ["#ff0000"], weight: "weight" }
  );
  expect(pixel.every((value) => value === 0)).toBe(true);
  const dense = heatmapPixels(20, 20, [{ feature: {}, point: [10, 10] }], {
    intensity: 1,
    opacity: 0.5,
    radius: 5,
    ramp: ["#ff0000"],
  });
  expect(dense[(10 * 20 + 10) * 4 + 3]).toBe(128);
  expect(dense[3]).toBe(0);
});
const flushMicrotasks = async (count: number): Promise<void> => {
  if (count <= 0) {
    return;
  }
  await Promise.resolve();
  await flushMicrotasks(count - 1);
};
const settle = () =>
  act(async () => {
    await flushMicrotasks(12);
    if (vi.isFakeTimers()) await vi.advanceTimersByTimeAsync(24);
    else await new Promise((resolve) => setTimeout(resolve, 24));
    await flushMicrotasks(12);
  });
const nativeEvent = (key: string, detail: unknown = {}) => {
  const fn = NATIVE.props[key];
  if (typeof fn !== "function") {
    throw new TypeError(`Missing native handler ${key}`);
  }
  act(() => fn({ detail }));
};
const mount = async (
  children?: ReactNode,
  props: Record<string, unknown> = {}
) => {
  setTestMeasurement(320, 375);
  const ref = createRef<MapHandle>();
  const view = render(
    <PanelUIProvider>
      <Map ref={ref} {...props}>
        {children}
      </Map>
    </PanelUIProvider>
  );
  await settle();
  nativeEvent("onUpdated");
  await settle();
  return { ref, view };
};
it("adapts WGS84 markers, popup toggling, overlay reservations and explicit native camera handles", async () => {
  const onPress = vi.fn();
  const { ref } = await mount(
    <>
      <Map.Marker
        lngLat={[121.4737, 31.2304]}
        accessibilityLabel="Shanghai"
        onPress={onPress}
      >
        <Map.Label>Shanghai</Map.Label>
        <Map.Popup title="Shanghai details">Popup content</Map.Popup>
      </Map.Marker>
      <Map.Controls recenter />
      <Map.Overlay position="bottom">Map summary</Map.Overlay>
    </>,
    { center: [121.4737, 31.2304], zoom: 12 }
  );
  expect(NATIVE.props.longitude).toBeCloseTo(
    wgs84ToGcj02([121.4737, 31.2304])[0],
    8
  );
  expect(NATIVE.location).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Shanghai" }));
  expect(await screen.findByText("Shanghai details")).toBeTruthy();
  expect(onPress).toHaveBeenCalledOnce();
  const state = await ref.current?.getViewState();
  expect(state?.center[0]).toBeCloseTo(121.4737, 8);
  act(() =>
    ref.current?.fitBounds([121, 31, 122, 32], {
      padding: { left: 40, top: 20 },
    })
  );
  await settle();
  expect(NATIVE.context.includePoints).toHaveBeenCalledWith(
    expect.objectContaining({ padding: [20, 0, 0, 40] })
  );
});
it("adopts a native fit only when its region change has finished", async () => {
  vi.useFakeTimers();
  const { ref } = await mount(undefined, {
    center: [0, 20],
    coordinateSystem: "gcj02",
    zoom: 5,
  });
  act(() => ref.current?.fitBounds([25, 35, 35, 45], { duration: 0 }));
  await settle();
  NATIVE.context.getCenterLocation.mockResolvedValue({
    latitude: 40,
    longitude: 30,
  });
  NATIVE.context.getScale.mockResolvedValue({ scale: 8 });
  nativeEvent("onRegionChange", { causedBy: "update", type: "end" });
  await settle();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(200);
  });
  expect(await ref.current?.getViewState()).toMatchObject({
    center: [30, 40],
    zoom: 8,
  });
  expect(NATIVE.props.longitude).toBe(0);
  expect(NATIVE.props.latitude).toBe(20);
  expect(NATIVE.props.scale).toBe(5);
});
it("recenter restores the opening camera after a different view", async () => {
  vi.useFakeTimers();
  const { ref } = await mount(<Map.Controls recenter compass />, {
    center: [0, 20],
    coordinateSystem: "gcj02",
    zoom: 5,
  });
  act(() => ref.current?.flyTo({ center: [30, 40], duration: 0, zoom: 8 }));
  await settle();
  fireEvent.click(screen.getByRole("button", { name: "Recenter map" }));
  act(() => vi.advanceTimersByTime(640));
  await settle();
  expect(NATIVE.props.longitude).toBe(0);
  expect(NATIVE.props.latitude).toBe(20);
  expect(NATIVE.props.scale).toBe(5);
});
it("face north is visibly unavailable when the camera is already facing north", async () => {
  await mount(<Map.Controls compass />);
  expect(
    screen
      .getByRole("button", { name: "Face north" })
      .getAttribute("aria-disabled")
  ).toBe("true");
});
it("face north resets rotation and pitch while keeping the current center", async () => {
  vi.useFakeTimers();
  await mount(<Map.Controls compass />, {
    bearing: 35,
    center: [10, 30],
    coordinateSystem: "gcj02",
    pitch: 20,
  });
  fireEvent.click(screen.getByRole("button", { name: "Face north" }));
  await settle();
  act(() => vi.advanceTimersByTime(352));
  await settle();
  expect(NATIVE.props.rotate).toBe(0);
  expect(NATIVE.props.skew).toBe(0);
  expect(NATIVE.props.longitude).toBe(10);
  expect(NATIVE.props.latitude).toBe(30);
});
it("does not roll a completed camera move back to a stale native read", async () => {
  vi.useFakeTimers();
  const { ref } = await mount(undefined, {
    center: [0, 20],
    coordinateSystem: "gcj02",
    zoom: 5,
  });
  NATIVE.context.getScale.mockResolvedValue({ scale: 5 });
  act(() => ref.current?.flyTo({ center: [30, 40], duration: 160, zoom: 8 }));
  act(() => vi.advanceTimersByTime(192));
  await settle();
  expect(NATIVE.props.scale).toBe(8);
});
it("does not treat an unspecified native update origin as a user gesture", async () => {
  vi.useFakeTimers();
  const { ref } = await mount(undefined, {
    center: [0, 20],
    coordinateSystem: "gcj02",
    zoom: 5,
  });
  act(() => ref.current?.flyTo({ center: [30, 40], duration: 160, zoom: 8 }));
  nativeEvent("onRegionChange", { causedBy: undefined, type: "begin" });
  act(() => vi.advanceTimersByTime(192));
  await settle();
  expect(NATIVE.props.scale).toBe(8);
});
it("keeps flyTo animation running through native update-origin begin events", async () => {
  vi.useFakeTimers();
  const { ref } = await mount(undefined, {
    center: [0, 20],
    coordinateSystem: "gcj02",
    zoom: 5,
  });
  act(() => ref.current?.flyTo({ center: [30, 40], duration: 160, zoom: 8 }));
  nativeEvent("onRegionChange", { causedBy: "update", type: "begin" });
  act(() => vi.advanceTimersByTime(192));
  await settle();
  expect(NATIVE.props.longitude).toBe(30);
  expect(NATIVE.props.latitude).toBe(40);
  expect(NATIVE.props.scale).toBe(8);
});
const canvasContext = () => ({
  arc: vi.fn(),
  beginPath: vi.fn(),
  clearRect: vi.fn(),
  closePath: vi.fn(),
  createImageData: (width: number, height: number) => ({
    data: new Uint8ClampedArray(width * height * 4),
    height,
    width,
  }),
  fill: vi.fn(),
  lineTo: vi.fn(),
  moveTo: vi.fn(),
  putImageData: vi.fn(),
  scale: vi.fn(),
  setTransform: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  setLineDash: vi.fn(),
  stroke: vi.fn(),
});
it("renders data after delayed Canvas node binding instead of waiting for a later camera movement", async () => {
  setTestMeasurement(320, 375);
  NATIVE.delay = true;
  render(
    <PanelUIProvider>
      <Map coordinateSystem="gcj02">
        <Map.Route
          coordinates={[
            [0, 0],
            [10, 10],
          ]}
        />
      </Map>
    </PanelUIProvider>
  );
  await settle();
  const canvas = document.querySelector("canvas");
  if (!canvas) {
    throw new Error("Missing map route canvas");
  }
  const context = canvasContext();
  setElementCanvasNode(canvas.id, {
    getContext: () => context,
    height: 0,
    width: 0,
  });
  nativeEvent("onUpdated");
  await settle();
  expect(NATIVE.fields).not.toHaveLength(0);
  act(() => {
    NATIVE.delay = false;
    for (const complete of NATIVE.fields) {
      complete();
    }
  });
  await settle();
  expect(context.stroke).toHaveBeenCalled();
});
it("reports custom MapLibre styles visibly and through typed acceptNode without silently discarding them", async () => {
  const issue = vi.fn();
  await mount(undefined, {
    mapStyle: { layers: [], sources: {}, version: 8 },
    onAdapterIssue: issue,
  });
  expect(issue).toHaveBeenCalledWith(
    expect.objectContaining({ capability: "basemap-style" })
  );
  expect(
    screen.getByText(/cannot load a MapLibre style document/u)
  ).toBeTruthy();
  expect(NATIVE.location).not.toHaveBeenCalled();
});
it("updates the camera baseline after a native drag before subsequent imperative moves", async () => {
  vi.useFakeTimers();
  const { ref } = await mount(<Map.Controls />, {
    center: [0, 20],
    coordinateSystem: "gcj02",
    zoom: 5,
  });
  NATIVE.context.getCenterLocation.mockResolvedValue({
    latitude: 30,
    longitude: 110,
  });
  NATIVE.context.getScale.mockResolvedValue({ scale: 9 });
  nativeEvent("onRegionChange", { causedBy: "drag", type: "end" });
  await settle();
  expect(await ref.current?.getViewState()).toMatchObject({
    center: [110, 30],
    zoom: 9,
  });
  expect(NATIVE.props.longitude).toBe(0);
  expect(NATIVE.props.scale).toBe(5);
  fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
  await settle();
  expect(NATIVE.props.longitude).toBe(110);
  expect(NATIVE.props.latitude).toBe(30);
  expect(NATIVE.props.scale).toBe(9);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(300);
  });
  expect(NATIVE.props.scale).toBe(10);
});
it("retains data layer paint order when an earlier layer changes style", async () => {
  const coordinates: LngLat[] = [
    [0, 0],
    [10, 10],
  ];
  const { view } = await mount(
    <>
      <Map.Route id="first" coordinates={coordinates} color="#ff0000" />
      <Map.Route id="second" coordinates={coordinates} color="#0000ff" />
    </>
  );
  const order = [...document.querySelectorAll("canvas")].map(
    (canvas) => canvas.id
  );
  view.rerender(
    <PanelUIProvider>
      <Map>
        <>
          <Map.Route id="first" coordinates={coordinates} color="#00ff00" />
          <Map.Route id="second" coordinates={coordinates} color="#0000ff" />
        </>
      </Map>
    </PanelUIProvider>
  );
  await settle();
  expect(
    [...document.querySelectorAll("canvas")].map((canvas) => canvas.id)
  ).toEqual(order);
});
it("renders GeoJSON holes and dispatches native feature taps against the visible geometry", async () => {
  setTestMeasurement(320, 375);
  const selected = vi.fn();
  const mapPressed = vi.fn();
  const data = {
    geometry: {
      coordinates: [
        [
          [0, 0],
          [80, 0],
          [80, 80],
          [0, 80],
          [0, 0],
        ],
        [
          [20, 20],
          [60, 20],
          [60, 60],
          [20, 60],
          [20, 20],
        ],
      ],
      type: "Polygon",
    },
    properties: { name: "Area" },
    type: "Feature",
  };
  render(
    <PanelUIProvider>
      <Map coordinateSystem="gcj02" onPress={mapPressed}>
        <Map.GeoJSON data={data} onPress={selected} />
      </Map>
    </PanelUIProvider>
  );
  await settle();
  const canvas = document.querySelector("canvas");
  if (!canvas) {
    throw new Error("Missing polygon canvas");
  }
  const context = canvasContext();
  setElementCanvasNode(canvas.id, {
    getContext: () => context,
    height: 0,
    width: 0,
  });
  nativeEvent("onUpdated");
  await settle();
  expect(context.fill).toHaveBeenCalledWith("evenodd");
  nativeEvent("onTap", { latitude: 10, longitude: 10 });
  await settle();
  expect(selected).toHaveBeenCalledWith(data);
  nativeEvent("onTap", { latitude: 40, longitude: 40 });
  await settle();
  expect(selected).toHaveBeenCalledOnce();
  expect(mapPressed).toHaveBeenCalledWith([40, 40], [190, 60]);
});
it("uses the native Canvas density raster for heatmaps", async () => {
  setTestMeasurement(320, 375);
  render(
    <PanelUIProvider>
      <Map coordinateSystem="gcj02" zoom={8}>
        <Map.Heatmap
          data={{
            geometry: { coordinates: [-140, 90], type: "Point" },
            properties: { weight: 1 },
            type: "Feature",
          }}
          weight="weight"
        />
      </Map>
    </PanelUIProvider>
  );
  await settle();
  const canvas = document.querySelector("canvas");
  if (!canvas) {
    throw new Error("Missing heatmap canvas");
  }
  const context = canvasContext();
  setElementCanvasNode(canvas.id, {
    getContext: () => context,
    height: 0,
    width: 0,
  });
  nativeEvent("onUpdated");
  await settle();
  expect(context.putImageData).toHaveBeenCalled();
  const image = context.putImageData.mock.calls.at(-1)?.[0] as {
    data: Uint8ClampedArray;
  };
  expect(image.data.some((value, index) => index % 4 === 3 && value > 0)).toBe(
    true
  );
});
it("redraws after a delayed resized Canvas binding even when the previous node was already ready", async () => {
  setTestMeasurement(320, 375);
  NATIVE.delay = true;
  render(
    <PanelUIProvider>
      <Map coordinateSystem="gcj02">
        <Map.Route
          coordinates={[
            [0, 0],
            [10, 10],
          ]}
        />
      </Map>
    </PanelUIProvider>
  );
  await settle();
  const canvas = document.querySelector("canvas");
  if (!canvas) {
    throw new Error("Missing route canvas");
  }
  const context = canvasContext();
  setElementCanvasNode(canvas.id, {
    getContext: () => context,
    height: 0,
    width: 0,
  });
  nativeEvent("onUpdated");
  await settle();
  act(() => {
    NATIVE.delay = false;
    for (const complete of NATIVE.fields) {
      complete();
    }
  });
  await settle();
  expect(context.stroke).toHaveBeenCalled();
  context.stroke.mockClear();
  NATIVE.fields = [];
  setTestMeasurement(640, 375);
  act(() => emitTestResize());
  await settle();
  act(() => {
    NATIVE.delay = false;
    for (const complete of NATIVE.fields) {
      complete();
    }
  });
  await settle();
  expect(context.stroke).toHaveBeenCalled();
});
it("clears the unsupported style status when the caller returns to the native basemap", async () => {
  const { view } = await mount(undefined, {
    mapStyle: "https://example.com/maplibre-style.json",
  });
  expect(
    screen.queryByText(/cannot load a MapLibre style document/u)
  ).toBeTruthy();
  view.rerender(
    <PanelUIProvider>
      <Map />
    </PanelUIProvider>
  );
  await settle();
  expect(
    screen.queryByText(/cannot load a MapLibre style document/u)
  ).toBeNull();
});
it("requests location only after explicit locate activation and returns source coordinates", async () => {
  const locate = vi.fn();
  await mount(<Map.Controls locate zoom={false} onLocate={locate} />);
  expect(NATIVE.location).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Show my location" }));
  await settle();
  expect(NATIVE.location).toHaveBeenCalledWith({ type: "gcj02" });
  expect(locate).toHaveBeenCalledWith(gcj02ToWgs84([121.4, 31.2]));
});
it("keeps zoom controls independent of unrelated native bounds queries", async () => {
  await mount(<Map.Controls />, { zoom: 10 });
  NATIVE.context.getRegion.mockClear();
  fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
  await settle();
  expect(NATIVE.context.getRegion).not.toHaveBeenCalled();
});
it("rejects an old native camera read after a newer imperative move", async () => {
  const { ref } = await mount(undefined, {
    center: [0, 20],
    coordinateSystem: "gcj02",
    zoom: 5,
  });
  const delayed = deferred<{
    longitude: number;
    latitude: number;
  }>();
  NATIVE.context.getCenterLocation.mockImplementationOnce(
    () => delayed.promise
  );
  nativeEvent("onRegionChange", { causedBy: "drag", type: "end" });
  act(() => ref.current?.flyTo({ center: [30, 40], duration: 0, zoom: 8 }));
  await settle();
  expect(NATIVE.props.longitude).toBe(30);
  act(() => delayed.resolve({ latitude: 20, longitude: 0 }));
  await settle();
  expect(NATIVE.props.longitude).toBe(30);
  expect(NATIVE.props.scale).toBe(8);
});
const advanceFrames = async (count: number): Promise<void> => {
  if (!count) {
    return;
  }
  act(() => vi.advanceTimersByTime(48));
  await settle();
  await advanceFrames(count - 1);
};
it("publishes projected markers throughout a gesture when the native bridge is slower than the frame timer", async () => {
  vi.useFakeTimers();
  await mount(
    <Map.Marker
      lngLat={[0, 20]}
      accessibilityLabel="Moving marker"
      onPress={() => {}}
    />
  );
  const marker = screen.getByRole("button", { name: "Moving marker" });
  const initial = marker.parentElement?.dataset.taroStyle;
  const start = Date.now();
  NATIVE.context.toScreenLocation.mockImplementation(
    ({ longitude, latitude }: { longitude: number; latitude: number }) =>
      new globalThis.Promise((resolve) => {
        setTimeout(
          () =>
            resolve({
              x: 150 + longitude + (Date.now() - start) / 10,
              y: 100 - latitude,
            }),
          80
        );
      })
  );
  nativeEvent("onRegionChange", { causedBy: "gesture", type: "begin" });
  await advanceFrames(6);
  expect(marker.parentElement?.dataset.taroStyle).not.toBe(initial);
});
it("supports StrictMode effect remounts without disabling native camera operations", async () => {
  setTestMeasurement(320, 375);
  const ref = createRef<MapHandle>();
  render(
    <StrictMode>
      <PanelUIProvider>
        <Map ref={ref} coordinateSystem="gcj02" center={[0, 20]} zoom={5} />
      </PanelUIProvider>
    </StrictMode>
  );
  await settle();
  nativeEvent("onUpdated");
  await settle();
  act(() => ref.current?.flyTo({ center: [30, 40], duration: 0, zoom: 8 }));
  await settle();
  expect(NATIVE.props.longitude).toBe(30);
});
it("rejects infinite camera durations without cancelling an existing valid animation", async () => {
  vi.useFakeTimers();
  const { ref } = await mount(undefined, {
    center: [0, 20],
    coordinateSystem: "gcj02",
  });
  act(() => ref.current?.flyTo({ center: [30, 40], duration: 160, zoom: 8 }));
  expect(() =>
    ref.current?.flyTo({ center: [10, 10], duration: Number.POSITIVE_INFINITY })
  ).toThrow(/duration must be finite/u);
  act(() => vi.advanceTimersByTime(192));
  await settle();
  expect(NATIVE.props.longitude).toBe(30);
});
it("limits native projection concurrency and coalesces continuous frame requests", async () => {
  vi.useFakeTimers();
  setTestMeasurement(320, 375);
  const pending = deferred<{
    x: number;
    y: number;
  }>();
  NATIVE.context.toScreenLocation.mockImplementation(() => pending.promise);
  render(
    <PanelUIProvider>
      <Map coordinateSystem="gcj02">
        <Map.Route
          coordinates={Array.from({ length: 30 }, (_, i) => [i, 20] as LngLat)}
        />
      </Map>
    </PanelUIProvider>
  );
  await settle();
  const canvas = document.querySelector("canvas");
  if (!canvas) {
    throw new Error("Missing route canvas");
  }
  setElementCanvasNode(canvas.id, {
    getContext: () => canvasContext(),
    height: 0,
    width: 0,
  });
  nativeEvent("onUpdated");
  await settle();
  nativeEvent("onRegionChange", { causedBy: "gesture", type: "begin" });
  await advanceFrames(10);
  expect(NATIVE.context.toScreenLocation.mock.calls.length).toBeLessThanOrEqual(
    6
  );
});
it("reports the data layer coordinate budget before dispatching oversized native projection jobs", async () => {
  setTestMeasurement(320, 375);
  const data = {
    features: Array.from({ length: 10_000 }, (_, index) => ({
      geometry: { coordinates: [-100 + index * 0.01, 30], type: "Point" },
      properties: {},
      type: "Feature",
    })),
    type: "FeatureCollection",
  };
  render(
    <PanelUIProvider>
      <Map coordinateSystem="gcj02">
        <Map.Heatmap data={data} />
      </Map>
    </PanelUIProvider>
  );
  await settle();
  const canvas = document.querySelector("canvas");
  if (!canvas) {
    throw new Error("Missing heatmap canvas");
  }
  setElementCanvasNode(canvas.id, {
    getContext: () => canvasContext(),
    height: 0,
    width: 0,
  });
  nativeEvent("onUpdated");
  await settle();
  expect(NATIVE.context.toScreenLocation).not.toHaveBeenCalled();
  expect(screen.getByText(/at most 2048 projected coordinates/u)).toBeTruthy();
});

it("fills a bounded Taro parent even when the host does not use flex layout", async () => {
  render(
    <PanelUIProvider>
      <div style={{ height: 450 }}>
        <Map />
      </div>
    </PanelUIProvider>
  );
  await settle();
  expect(
    document.querySelector("[data-native-map]")?.parentElement?.className
  ).toMatch(/\bh-full\b/u);
});

it("projects simulator markers using native region reads when screen projection does not reply", async () => {
  NATIVE.platform = "devtools";
  const unavailable = deferred<{ x: number; y: number }>();
  NATIVE.context.toScreenLocation.mockImplementation(() => unavailable.promise);
  NATIVE.context.getRegion.mockResolvedValue({
    northeast: { latitude: 40, longitude: 10 },
    southwest: { latitude: 0, longitude: -10 },
  });
  await mount(
    <Map.Marker lngLat={[0, 20]} accessibilityLabel="Region marker">
      <Map.Label>Center marker</Map.Label>
    </Map.Marker>,
    { center: [0, 20], coordinateSystem: "gcj02" }
  );
  await settle();
  expect(screen.getByText("Center marker")).toBeTruthy();
  expect(NATIVE.context.toScreenLocation).not.toHaveBeenCalled();
});

it("centers labels and stacks popup title above its content using the source column layout", async () => {
  await mount(
    <Map.Marker lngLat={[0, 20]} accessibilityLabel="Open source popup">
      <Map.Label>Source label</Map.Label>
      <Map.Popup title="Source heading">Source body</Map.Popup>
    </Map.Marker>
  );
  expect(
    screen.getByText("Source label").parentElement?.parentElement?.className
  ).toContain("flex-col");
  fireEvent.click(screen.getByRole("button", { name: "Open source popup" }));
  await settle();
  expect(screen.getByText("Source heading").parentElement?.className).toContain(
    "flex-col"
  );
});
it("keeps native data Canvas below marker and popup chrome", async () => {
  await mount(
    <>
      <Map.Route
        coordinates={[
          [0, 20],
          [1, 21],
        ]}
      />
      <Map.Marker
        lngLat={[0, 20]}
        accessibilityLabel="Layer marker"
        onPress={() => {}}
      />
    </>
  );
  const canvas = document.querySelector<HTMLCanvasElement>("canvas");
  expect(JSON.parse(canvas?.dataset.taroStyle ?? "{}").zIndex).toBe(1);
  const marker = screen.getByRole("button", { name: "Layer marker" });
  expect(
    Number(
      JSON.parse(marker.parentElement?.parentElement?.dataset.taroStyle ?? "{}")
        .zIndex
    )
  ).toBeGreaterThan(
    Number(JSON.parse(canvas?.dataset.taroStyle ?? "{}").zIndex)
  );
});

it("centers native map control icons and preserves source column gaps", async () => {
  await mount(<Map.Controls recenter />);
  const zoom = screen.getByRole("button", { name: "Zoom in" });
  expect(zoom.className).toMatch(/\bflex\b/u);
  expect(zoom.parentElement?.parentElement?.className).toContain("flex-col");
});

it("uses a visible native Canvas for map data while preserving popup stacking order", async () => {
  await mount(
    <Map.Route
      coordinates={[
        [0, 20],
        [1, 21],
      ]}
    />
  );
  const canvas = document.querySelector<HTMLCanvasElement>("canvas");
  expect(canvas?.className).toContain("inset-0");
  const style = JSON.parse(canvas?.dataset.taroStyle ?? "{}");
  expect(style.zIndex).toBe(1);
  expect(style.left).toBeUndefined();
  expect(document.querySelector('img[src^="data:image/svg"]')).toBeNull();
});

it("paints heatmap pixels directly without generating a PNG image frame", async () => {
  setTestMeasurement(320, 375);
  render(
    <PanelUIProvider>
      <Map>
        <Map.Heatmap
          data={{
            geometry: { coordinates: [0, 20], type: "Point" },
            properties: {},
            type: "Feature",
          }}
        />
      </Map>
    </PanelUIProvider>
  );
  await settle();
  const canvas = document.querySelector("canvas");
  if (!canvas) {
    throw new Error("Missing heatmap Canvas");
  }
  const snapshot = vi.fn(() => "data:image/png;base64,AAAA");
  setElementCanvasNode(canvas.id, {
    getContext: () => canvasContext(),
    height: 0,
    toDataURL: snapshot,
    width: 0,
  });
  nativeEvent("onUpdated");
  await settle();
  expect(snapshot).not.toHaveBeenCalled();
  expect(
    document.querySelector('img[src="data:image/png;base64,AAAA"]')
  ).toBeNull();
});

it.each([
  { causedBy: "update", detail: {}, type: "end" },
  { detail: { causedBy: "update", type: "end" }, type: "regionchange" },
])(
  "refreshes simulator projection after native camera settlement %#",
  async (event) => {
    NATIVE.platform = "devtools";
    NATIVE.context.getRegion.mockResolvedValue({
      northeast: { latitude: 40, longitude: 10 },
      southwest: { latitude: 0, longitude: -10 },
    });
    const { ref } = await mount(
      <Map.Marker
        lngLat={[5, 20]}
        accessibilityLabel="Zoom projection marker"
        onPress={vi.fn()}
      />,
      { center: [0, 20], coordinateSystem: "gcj02", zoom: 10 }
    );
    const marker = screen.getByRole("button", {
      name: "Zoom projection marker",
    });
    const position = () =>
      JSON.parse(marker.parentElement?.dataset.taroStyle ?? "{}").left;
    expect(position()).toBe("480rpx");
    act(() => ref.current?.flyTo({ center: [0, 20], duration: 0, zoom: 11 }));
    await settle();
    expect(NATIVE.props.scale).toBe(11);
    expect(position()).toBe("480rpx");
    NATIVE.context.getRegion.mockResolvedValue({
      northeast: { latitude: 30, longitude: 5 },
      southwest: { latitude: 10, longitude: -5 },
    });
    const changed = NATIVE.props.onRegionChange;
    expect(typeof changed).toBe("function");
    act(() => (changed as (value: unknown) => void)(event));
    await settle();
    expect(position()).toBe("640rpx");
  }
);

it("refreshes projection when native camera settles after its last early region end", async () => {
  vi.useFakeTimers();
  NATIVE.platform = "devtools";
  NATIVE.context.getScale.mockResolvedValue({ scale: 10 });
  NATIVE.context.getRegion.mockResolvedValue({
    northeast: { latitude: 40, longitude: 10 },
    southwest: { latitude: 0, longitude: -10 },
  });
  const { ref } = await mount(
    <Map.Marker
      lngLat={[5, 20]}
      accessibilityLabel="Late native marker"
      onPress={vi.fn()}
    />,
    { center: [0, 20], coordinateSystem: "gcj02", zoom: 10 }
  );
  const marker = screen.getByRole("button", { name: "Late native marker" });
  const position = () =>
    JSON.parse(marker.parentElement?.dataset.taroStyle ?? "{}").left;
  expect(position()).toBe("480rpx");
  act(() => ref.current?.flyTo({ center: [0, 20], duration: 160, zoom: 11 }));
  await act(async () => {
    vi.advanceTimersByTime(200);
    await flushMicrotasks(12);
    if (vi.isFakeTimers()) await vi.advanceTimersByTimeAsync(24);
    else await new Promise((resolve) => setTimeout(resolve, 24));
    await flushMicrotasks(12);
  });
  nativeEvent("onRegionChange", { causedBy: "update", type: "end" });
  await settle();
  expect(NATIVE.props.scale).toBe(11);
  expect(position()).toBe("480rpx");
  NATIVE.context.getScale.mockResolvedValue({ scale: 11 });
  NATIVE.context.getRegion.mockResolvedValue({
    northeast: { latitude: 30, longitude: 5 },
    southwest: { latitude: 10, longitude: -5 },
  });
  await act(async () => {
    vi.advanceTimersByTime(100);
    await flushMicrotasks(12);
    if (vi.isFakeTimers()) await vi.advanceTimersByTimeAsync(24);
    else await new Promise((resolve) => setTimeout(resolve, 24));
    await flushMicrotasks(12);
  });
  expect(position()).toBe("640rpx");
  const reads = NATIVE.context.getScale.mock.calls.length;
  await act(async () => {
    await vi.advanceTimersByTimeAsync(3000);
  });
  expect(NATIVE.context.getScale).toHaveBeenCalledTimes(reads);
});

it.each(["unsettled", "read-failure"])(
  "bounds native camera settlement retries and reports %s only once",
  async (failure) => {
    vi.useFakeTimers();
    const issue = vi.fn();
    const { ref } = await mount(undefined, {
      center: [0, 20],
      coordinateSystem: "gcj02",
      onAdapterIssue: issue,
      zoom: 5,
    });
    NATIVE.context.getScale.mockResolvedValue({ scale: 5 });
    if (failure === "read-failure") {
      NATIVE.context.getRegion.mockRejectedValue(
        new Error("Native camera unavailable")
      );
    }
    act(() => ref.current?.flyTo({ center: [0, 20], duration: 0, zoom: 8 }));
    await settle();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2200);
    });
    expect(
      issue.mock.calls.filter(([value]) => value.capability === "camera-state")
    ).toHaveLength(1);
    const reads = NATIVE.context.getScale.mock.calls.length;
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4000);
    });
    expect(NATIVE.context.getScale).toHaveBeenCalledTimes(reads);
    expect(
      issue.mock.calls.filter(([value]) => value.capability === "camera-state")
    ).toHaveLength(1);
  }
);

it.each(["replacement", "unmount", "gesture"])(
  "cancels pending native settlement after %s",
  async (action) => {
    vi.useFakeTimers();
    const issue = vi.fn();
    const { ref, view } = await mount(undefined, {
      center: [0, 20],
      coordinateSystem: "gcj02",
      onAdapterIssue: issue,
      zoom: 5,
    });
    NATIVE.context.getScale.mockResolvedValue({ scale: 5 });
    act(() => ref.current?.flyTo({ center: [0, 20], duration: 0, zoom: 8 }));
    await settle();
    if (action === "replacement") {
      act(() => ref.current?.flyTo({ center: [0, 20], duration: 0, zoom: 5 }));
    } else if (action === "unmount") {
      view.unmount();
    } else {
      nativeEvent("onRegionChange", { causedBy: "gesture", type: "begin" });
    }
    await settle();
    const reads = NATIVE.context.getScale.mock.calls.length;
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(NATIVE.context.getScale).toHaveBeenCalledTimes(reads);
    expect(
      issue.mock.calls.filter(([value]) => value.capability === "camera-state")
    ).toHaveLength(0);
  }
);

it("ends settlement at its wall-clock deadline and ignores a native read resolving afterward", async () => {
  vi.useFakeTimers();
  const issue = vi.fn();
  const change = vi.fn();
  const { ref } = await mount(undefined, {
    center: [0, 20],
    coordinateSystem: "gcj02",
    onAdapterIssue: issue,
    onViewStateChange: change,
    zoom: 5,
  });
  const pending = deferred<{
    northeast: { latitude: number; longitude: number };
    southwest: { latitude: number; longitude: number };
  }>();
  NATIVE.context.getRegion.mockImplementation(() => pending.promise);
  change.mockClear();
  act(() => ref.current?.flyTo({ center: [0, 20], duration: 0, zoom: 8 }));
  await settle();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2100);
  });
  expect(
    issue.mock.calls.filter(([value]) => value.capability === "camera-state")
  ).toHaveLength(1);
  pending.resolve({
    northeast: { latitude: 40, longitude: 10 },
    southwest: { latitude: 0, longitude: -10 },
  });
  await settle();
  expect(change).not.toHaveBeenCalled();
  const reads = NATIVE.context.getScale.mock.calls.length;
  await act(async () => {
    await vi.advanceTimersByTimeAsync(4000);
  });
  expect(NATIVE.context.getScale).toHaveBeenCalledTimes(reads);
  expect(
    issue.mock.calls.filter(([value]) => value.capability === "camera-state")
  ).toHaveLength(1);
});

it.each([
  { bearing: 360, native: 0 },
  { bearing: -180, native: 180 },
])(
  "accepts equivalent native bearing %# without a settlement timeout",
  async ({ bearing, native }) => {
    vi.useFakeTimers();
    const issue = vi.fn();
    const { ref } = await mount(undefined, {
      bearing,
      center: [0, 20],
      coordinateSystem: "gcj02",
      onAdapterIssue: issue,
      zoom: 5,
    });
    NATIVE.context.getRotate.mockResolvedValue({ rotate: native });
    act(() => ref.current?.flyTo({ center: [0, 20], duration: 0, zoom: 8 }));
    await settle();
    const reads = NATIVE.context.getScale.mock.calls.length;
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(NATIVE.context.getScale).toHaveBeenCalledTimes(reads);
    expect(
      issue.mock.calls.filter(([value]) => value.capability === "camera-state")
    ).toHaveLength(0);
  }
);

it("keeps the newest native fit pending when an older fit rejects afterward", async () => {
  vi.useFakeTimers();
  const issue = vi.fn();
  const pending = deferred<unknown>();
  const { ref } = await mount(undefined, {
    center: [0, 20],
    coordinateSystem: "gcj02",
    onAdapterIssue: issue,
    zoom: 5,
  });
  NATIVE.context.includePoints.mockImplementationOnce(() => pending.promise);
  act(() => ref.current?.fitBounds([0, 10, 10, 30], { duration: 0 }));
  await settle();
  act(() => ref.current?.fitBounds([25, 35, 35, 45], { duration: 0 }));
  await settle();
  pending.reject(new Error("Obsolete native fit"));
  await settle();
  NATIVE.context.getCenterLocation.mockResolvedValue({
    latitude: 40,
    longitude: 30,
  });
  NATIVE.context.getScale.mockResolvedValue({ scale: 8 });
  nativeEvent("onRegionChange", { causedBy: "update", type: "end" });
  await settle();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(200);
  });
  expect(await ref.current?.getViewState()).toMatchObject({
    center: [30, 40],
    zoom: 8,
  });
  expect(NATIVE.props.longitude).toBe(0);
  expect(NATIVE.props.latitude).toBe(20);
  expect(NATIVE.props.scale).toBe(5);
  expect(
    issue.mock.calls.some(([value]) => value.message === "Obsolete native fit")
  ).toBe(false);
});

it("uses the latest view-state callback while native settlement is pending", async () => {
  vi.useFakeTimers();
  const oldChange = vi.fn();
  const newChange = vi.fn();
  const { ref, view } = await mount(undefined, {
    center: [0, 20],
    coordinateSystem: "gcj02",
    onViewStateChange: oldChange,
    zoom: 5,
  });
  NATIVE.context.getScale.mockResolvedValue({ scale: 5 });
  act(() => ref.current?.flyTo({ center: [0, 20], duration: 0, zoom: 8 }));
  await settle();
  oldChange.mockClear();
  view.rerender(
    <PanelUIProvider>
      <Map
        ref={ref}
        center={[0, 20]}
        coordinateSystem="gcj02"
        onViewStateChange={newChange}
        zoom={5}
      />
    </PanelUIProvider>
  );
  NATIVE.context.getScale.mockResolvedValue({ scale: 8 });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(100);
  });
  expect(newChange).toHaveBeenCalledWith(expect.objectContaining({ zoom: 8 }));
  expect(oldChange).not.toHaveBeenCalled();
});

it.each(["initial", "imperative"])(
  "adopts %s bounds after stable final native reads rather than an early end event",
  async (mode) => {
    vi.useFakeTimers();
    NATIVE.context.getRegion.mockResolvedValue({
      northeast: { latitude: 40, longitude: 5 },
      southwest: { latitude: 0, longitude: -5 },
    });
    const { ref } = await mount(undefined, {
      center: [0, 20],
      coordinateSystem: "gcj02",
      zoom: 14,
      ...(mode === "initial" ? { bounds: [-8, 5, 8, 35] } : {}),
    });
    if (mode === "imperative") {
      act(() => ref.current?.fitBounds([-8, 5, 8, 35], { duration: 0 }));
    }
    await settle();
    NATIVE.context.getScale.mockResolvedValue({ scale: 13.99 });
    nativeEvent("onRegionChange", { causedBy: "update", type: "end" });
    await settle();
    expect(NATIVE.props.scale).toBe(14);
    NATIVE.context.getScale.mockResolvedValue({ scale: 13 });
    NATIVE.context.getRegion.mockResolvedValue({
      northeast: { latitude: 40, longitude: 10 },
      southwest: { latitude: 0, longitude: -10 },
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    const observed = await ref.current?.getViewState();
    expect(observed?.zoom).toBe(13);
    expect(NATIVE.props.scale).toBe(14);
  }
);

it("bounds a hanging native fit read and ignores includePoints failing after the timeout", async () => {
  vi.useFakeTimers();
  const issue = vi.fn();
  const change = vi.fn();
  const { ref } = await mount(undefined, {
    center: [0, 20],
    coordinateSystem: "gcj02",
    onAdapterIssue: issue,
    onViewStateChange: change,
    zoom: 14,
  });
  const pending = deferred<unknown>();
  const region = deferred<{
    northeast: { latitude: number; longitude: number };
    southwest: { latitude: number; longitude: number };
  }>();
  NATIVE.context.includePoints.mockImplementation(() => pending.promise);
  NATIVE.context.getRegion.mockImplementation(() => region.promise);
  change.mockClear();
  act(() => ref.current?.fitBounds([-8, 5, 8, 35], { duration: 0 }));
  await settle();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2100);
  });
  expect(
    issue.mock.calls.filter(([value]) => value.capability === "fit-bounds")
  ).toHaveLength(1);
  pending.reject(new Error("Late includePoints rejection"));
  region.resolve({
    northeast: { latitude: 40, longitude: 10 },
    southwest: { latitude: 0, longitude: -10 },
  });
  await settle();
  expect(change).not.toHaveBeenCalled();
  expect(NATIVE.props.scale).toBe(14);
  expect(
    issue.mock.calls.filter(([value]) => value.capability === "fit-bounds")
  ).toHaveLength(1);
});

it("does not adopt an already-containing view before includePoints acknowledges the fit", async () => {
  vi.useFakeTimers();
  const pending = deferred<unknown>();
  const { ref } = await mount(undefined, {
    center: [0, 20],
    coordinateSystem: "gcj02",
    zoom: 14,
  });
  NATIVE.context.includePoints.mockImplementation(() => pending.promise);
  NATIVE.context.getScale.mockResolvedValue({ scale: 13.99 });
  act(() => ref.current?.fitBounds([25, 35, 35, 45], { duration: 0 }));
  await settle();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(500);
  });
  expect(NATIVE.props.scale).toBe(14);
  pending.resolve({});
  NATIVE.context.getScale.mockResolvedValue({ scale: 13 });
  await settle();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(200);
  });
  const observed = await ref.current?.getViewState();
  expect(observed?.zoom).toBe(13);
  expect(NATIVE.props.scale).toBe(14);
});

it.each([
  { expected: 13, platform: "devtools", target: 13.75 },
  { expected: 13, platform: "devtools", target: 13.04 },
  { expected: 13.75, platform: "ios", target: 13.75 },
])(
  "applies fractional explicit zoom commands using the observed platform contract %#",
  async ({ expected, platform, target }) => {
    NATIVE.platform = platform;
    const { ref } = await mount(undefined, {
      center: [0, 20],
      coordinateSystem: "gcj02",
      zoom: 5,
    });
    act(() =>
      ref.current?.flyTo({ center: [0, 20], duration: 0, zoom: target })
    );
    await settle();
    expect(NATIVE.props.scale).toBe(expected);
  }
);

it("keeps fractional native fit observation separate from a new controlled scale command", async () => {
  vi.useFakeTimers();
  NATIVE.platform = "devtools";
  const { ref } = await mount(undefined, {
    center: [0, 20],
    coordinateSystem: "gcj02",
    zoom: 13,
  });
  NATIVE.context.getScale.mockResolvedValue({ scale: 13.04 });
  act(() => ref.current?.fitBounds([25, 35, 35, 45], { duration: 0 }));
  await settle();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(200);
  });
  const observed = await ref.current?.getViewState();
  expect(observed?.zoom).toBe(13.04);
  expect(NATIVE.props.scale).toBe(13);
});

it.each([
  { immediate: 13, platform: "devtools" },
  { immediate: 14, platform: "ios" },
])(
  "submits one native target on DevTools while preserving iOS interpolation %#",
  async ({ immediate, platform }) => {
    vi.useFakeTimers();
    NATIVE.platform = platform;
    const { ref } = await mount(undefined, {
      center: [0, 20],
      coordinateSystem: "gcj02",
      zoom: 14,
    });
    act(() =>
      ref.current?.flyTo({ center: [30, 40], duration: 250, zoom: 13 })
    );
    await settle();
    expect(NATIVE.props.scale).toBe(immediate);
    if (platform === "devtools") {
      expect(NATIVE.props.longitude).toBe(30);
      expect(NATIVE.props.latitude).toBe(40);
    }
    await act(async () => {
      await vi.advanceTimersByTimeAsync(128);
    });
    if (platform === "ios") {
      expect(Number(NATIVE.props.scale)).toBeGreaterThan(13);
      expect(Number(NATIVE.props.scale)).toBeLessThan(14);
    } else {
      expect(NATIVE.props.scale).toBe(13);
      expect(NATIVE.props.longitude).toBe(30);
      expect(NATIVE.props.latitude).toBe(40);
    }
  }
);

it("uses the native map wrapper scope after deep Taro rendering", async () => {
  render(
    <PanelUIProvider>
      <Map center={[121.48, 31.23]} />
    </PanelUIProvider>
  );
  const owner = { name: "nested-map-owner" };
  const scopeId = `${NATIVE.props.id}-scope`;
  const existing = document.querySelector(`#${scopeId}`);
  const wrapper = Object.assign(existing ?? document.createElement("div"), {
    ctx: owner,
  });
  wrapper.setAttribute("id", scopeId);
  if (!existing) {
    document.body.append(wrapper);
  }
  try {
    expect(taroDocument.querySelector(`#${NATIVE.props.id}-scope`)).toBe(
      wrapper
    );
    nativeEvent("onUpdated");
    await settle();
    expect(NATIVE.create).toHaveBeenLastCalledWith(NATIVE.props.id, owner);
  } finally {
    if (!existing) {
      wrapper.remove();
    }
  }
});
