import { expect, it } from "vitest";

import { projectMapRegion } from "../src/components/Map/region-projection";

const frame = {
  bearing: 0,
  pitch: 0,
  region: {
    northeast: { latitude: 40, longitude: 10 },
    southwest: { latitude: 0, longitude: -10 },
  },
};
it("maps native region corners to logical viewport corners", () => {
  expect(projectMapRegion([-10, 40], frame, 320, 450)).toEqual([0, 0]);
  expect(projectMapRegion([10, 0], frame, 320, 450)).toEqual([320, 450]);
  const middle = projectMapRegion([0, 20], frame, 320, 450);
  expect(middle[0]).toBe(160);
  expect(middle[1]).toBeGreaterThan(225);
});
it("preserves antimeridian positions rather than stretching a dateline region", () => {
  const dateline = {
    ...frame,
    region: {
      northeast: { latitude: 40, longitude: -170 },
      southwest: { latitude: 0, longitude: 170 },
    },
  };
  expect(projectMapRegion([175, 40], dateline, 320, 450)).toEqual([80, 0]);
  expect(projectMapRegion([-175, 0], dateline, 320, 450)).toEqual([240, 450]);
});
it.each([
  { ...frame, bearing: 30 },
  { ...frame, pitch: 20 },
])(
  "explicitly rejects unavailable rotated simulator projection %#",
  (value) => {
    expect(() => projectMapRegion([0, 20], value, 320, 450)).toThrow(
      "unrotated, untilted"
    );
  }
);
it.each([0, Number.NaN, Infinity])(
  "rejects unmeasured or invalid projection sizes %#",
  (width) => {
    expect(() => projectMapRegion([0, 20], frame, width, 450)).toThrow(
      RangeError
    );
  }
);
