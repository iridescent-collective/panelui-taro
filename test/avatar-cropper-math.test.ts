import { expect, it } from "vitest";

import { transformGesture } from "../src/components/AvatarCropper/gesture";
import {
  baseSize,
  coversMask,
  IDENTITY,
  maskPath,
  minScale,
  nextQuarterTurn,
  normalizeDegrees,
  present,
  rotateAbout,
  settle,
  sourceCrop,
  zoomAbout,
} from "../src/components/AvatarCropper/math";
import type { CropBounds } from "../src/components/AvatarCropper/math";
import FIXTURES from "./fixtures/avatar-cropper-source.json";

const point = (identifier: number, x: number, y: number) => ({
  clientX: x,
  clientY: y,
  identifier,
});
it.each(FIXTURES.results)("matches upstream geometry %#", (example) => {
  const { state, frame, source } = example;
  const bounds = example.bounds as CropBounds;
  expect(baseSize(source, frame.mask)).toEqual(frame.image);
  expect(present(state, bounds, frame)).toEqual(example.present);
  const settled = settle(state, bounds, frame);
  expect({
    ...settled,
    x: settled.x === 0 ? 0 : settled.x,
    y: settled.y === 0 ? 0 : settled.y,
  }).toEqual(example.settle);
  expect(sourceCrop(example.settle, frame, source)).toEqual(example.crop);
  expect(minScale(bounds, frame, state.rotation)).toEqual(example.min);
  expect(coversMask(state, bounds.shape, frame)).toEqual(example.covers);
});
it("holds the mask on the photo when rotated at every angle", () => {
  const frame = { image: { height: 240, width: 480 }, mask: 240 };
  for (const shape of ["circle", "squircle", "square"] as const) {
    for (let rotation = -180; rotation <= 180; rotation += 5) {
      const next = settle(
        { rotation, scale: 0.2, x: 200, y: -100 },
        { cover: true, maxZoom: 5, minZoom: 0.5, shape },
        frame
      );
      expect(coversMask(next, shape, frame)).toBe(true);
    }
  }
});
it("preserves the pinch focal point during simultaneous zoom, rotate and pan", () => {
  const next = transformGesture(
    IDENTITY,
    [point(1, 100, 100), point(2, 200, 100)],
    [point(1, 180, 60), point(2, 180, 260)],
    { x: 100, y: 100 },
    1
  );
  expect(next.scale).toBe(2);
  expect(next.rotation).toBe(90);
  expect(next.x).toBeCloseTo(80);
  expect(next.y).toBeCloseTo(-40);
});
it("tracks identifiers and does not jump when a finger is added or removed", () => {
  const a = { clientX: 100, clientY: 100, identifier: 1 };
  const b = { clientX: 200, clientY: 100, identifier: 2 };
  expect(
    transformGesture(IDENTITY, [a], [a, b], { x: 150, y: 150 }, 1)
  ).toEqual(IDENTITY);
  expect(
    transformGesture(IDENTITY, [a, b], [a], { x: 150, y: 150 }, 1)
  ).toEqual(IDENTITY);
  expect(
    transformGesture(
      IDENTITY,
      [a],
      [{ ...a, clientX: 120, clientY: 130 }],
      { x: 150, y: 150 },
      0.5
    )
  ).toEqual({ ...IDENTITY, x: 10, y: 15 });
});
it("retains quarter turn, angle, focal and mask contracts", () => {
  expect(nextQuarterTurn(35, 1)).toBe(90);
  expect(nextQuarterTurn(35, -1)).toBe(0);
  expect(nextQuarterTurn(90, -1)).toBe(0);
  expect(normalizeDegrees(-180)).toBe(180);
  expect(zoomAbout(IDENTITY, 2, 10, 20)).toEqual({
    ...IDENTITY,
    scale: 2,
    x: -10,
    y: -20,
  });
  expect(rotateAbout(IDENTITY, 90, 0, 0).rotation).toBe(90);
  expect(maskPath("square", 100, 100, 100)).toBe("M50 50H150V150H50Z");
  expect(maskPath("circle", 100, 100, 100)).toContain("A50 50");
  expect(maskPath("squircle", 100, 100, 100).split("L")).toHaveLength(128);
});
