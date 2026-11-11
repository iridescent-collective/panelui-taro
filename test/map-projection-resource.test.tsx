// @vitest-environment happy-dom

import { act, render } from "@testing-library/react";
import { StrictMode } from "react";
import { expect, it, vi } from "vitest";

import { projectMapCoordinates } from "../src/components/Map/projection";
import type { LngLat, PixelPoint } from "../src/components/Map/types";
import { useMapProjectionJob } from "../src/components/Map/use-projection-job";
import { deferred } from "./helpers/deferred";

const settle = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};
it("drains failed projection batches before releasing their concurrency lease", async () => {
  const pending = Array.from({ length: 6 }, () => deferred<PixelPoint>());
  let calls = 0;
  const project = vi.fn(() => {
    const next = pending[calls];
    calls += 1;
    return next.promise;
  });
  let finished = false;
  const result = (async () => {
    try {
      return await projectMapCoordinates(
        Array.from({ length: 20 }, (_, index) => [index, 20] as LngLat),
        project
      );
    } catch (error) {
      finished = true;
      return error;
    }
  })();
  pending[0].reject(new Error("Native projection failed"));
  await settle();
  expect(finished).toBe(false);
  expect(project).toHaveBeenCalledTimes(6);
  for (const item of pending.slice(1)) {
    item.resolve([0, 0]);
  }
  expect(await result).toBeInstanceOf(Error);
  expect(project).toHaveBeenCalledTimes(6);
});
const identity = {};
const Probe = ({
  work,
}: {
  work: (isCurrent: () => boolean) => Promise<PixelPoint[]>;
}) => {
  useMapProjectionJob({
    enabled: true,
    fail: () => {},
    identity,
    receive: () => {},
    revision: 0,
    work,
  });
  return null;
};
it("keeps native requests leased across StrictMode cleanup and remount", async () => {
  const pending = deferred<PixelPoint>();
  const project = vi.fn(() => pending.promise);
  const work = (isCurrent: () => boolean) =>
    projectMapCoordinates(
      Array.from({ length: 20 }, (_, index) => [index, 20] as LngLat),
      project,
      isCurrent
    );
  const view = render(
    <StrictMode>
      <Probe work={work} />
    </StrictMode>
  );
  await act(settle);
  expect(project).toHaveBeenCalledTimes(6);
  view.unmount();
  pending.resolve([0, 0]);
  await act(settle);
  expect(project).toHaveBeenCalledTimes(6);
});
