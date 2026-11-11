import { expect, it } from "vitest";

import {
  mapViewMatches,
  stableMapBounds,
} from "../src/components/Map/camera-completion";
import { gcj02ToWgs84, wgs84ToGcj02 } from "../src/components/Map/coordinates";
import type { LngLatBounds, ViewState } from "../src/components/Map/types";

it.each([
  {
    accepted: true,
    box: [121, -10, 122, 10],
    native: [121.000005, -20, 123, 20],
  },
  {
    accepted: true,
    box: [179, -10, -179, 10],
    native: [179.000005, -20, -178, 20],
  },
  {
    accepted: false,
    box: [121, -10, 122, 10],
    native: [121.00002, -20, 123, 20],
  },
  {
    accepted: false,
    box: [179, -10, -179, 10],
    native: [179.00002, -20, -178, 20],
  },
  { accepted: true, box: [20, -10, 380, 10], native: [-180, -90, 180, 90] },
  {
    accepted: true,
    box: [121, -10, 121, 10],
    native: [121.000005, -20, 123, 20],
  },
  {
    accepted: false,
    box: [121, -10, 121, 10],
    native: [121.00002, -20, 123, 20],
  },
])(
  "settles stable bounds with longitude edge semantics %#",
  ({ accepted, box, native }) => {
    const nativeSpan = (((native[2] - native[0]) % 360) + 360) % 360 || 360;
    const accept = stableMapBounds(box as LngLatBounds, () => ({
      height: 2_000_000,
      width: nativeSpan / 0.00001,
    }));
    const view: ViewState = {
      bearing: 0,
      bounds: native as LngLatBounds,
      center: [0, 0],
      pitch: 0,
      zoom: 13,
    };
    expect(accept(view)).toBe(false);
    expect(accept(view)).toBe(false);
    expect(accept(view)).toBe(accepted);
  }
);

it.each([
  { accepted: true, next: 180, target: -180 },
  { accepted: true, next: -180, target: 180 },
  { accepted: false, next: 179.999, target: -180 },
  { accepted: false, next: 10, target: 11 },
])(
  "compares equivalent longitude centers without accepting a different view %#",
  ({ accepted, next, target }) => {
    const view: ViewState = {
      bearing: 0,
      bounds: [-180, -90, 180, 90],
      center: [next, 20],
      pitch: 0,
      zoom: 13,
    };
    expect(mapViewMatches(view, { ...view, center: [target, 20] })).toBe(
      accepted
    );
  }
);

it.each([
  { accepted: true, clipping: 0 },
  { accepted: false, clipping: 2 },
])(
  "accepts the recorded native fit within one physical pixel only %#",
  ({ accepted, clipping }) => {
    const width = 358;
    const height = 468;
    const west = 121.44761591934116;
    const east = 121.50741191253792;
    const southwest = gcj02ToWgs84([
      west + (clipping * (east - west)) / width,
      31.196125745001336,
    ]);
    const northeast = gcj02ToWgs84([east, 31.262967867193872]);
    const view: ViewState = {
      bearing: 0,
      bounds: [southwest[0], southwest[1], northeast[0], northeast[1]],
      center: [121.4737, 31.2304],
      pitch: 0,
      zoom: 13.04,
    };
    const accept = stableMapBounds(
      [121.443, 31.211, 121.503, 31.252],
      () => ({ height, width }),
      wgs84ToGcj02
    );
    accept(view);
    accept(view);
    expect(accept(view)).toBe(accepted);
  }
);
