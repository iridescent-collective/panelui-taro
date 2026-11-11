import type { LngLat, PixelPoint } from "./types";

export const MAP_PROJECTION_CONCURRENCY = 6;
export const MAP_PROJECTION_COORDINATE_LIMIT = 2048;
export const projectMapCoordinates = async (
  coordinates: LngLat[],
  project: (point: LngLat) => Promise<PixelPoint>,
  isCurrent: () => boolean = () => true
): Promise<PixelPoint[]> => {
  if (coordinates.length > MAP_PROJECTION_COORDINATE_LIMIT) {
    throw new Error(
      `Map: a data layer supports at most ${MAP_PROJECTION_COORDINATE_LIMIT} projected coordinates`
    );
  }
  const output: PixelPoint[] = [];
  let cursor = 0;
  let failed = false;
  let failure: unknown;
  const worker = async (): Promise<void> => {
    if (failed || cursor >= coordinates.length) {
      return;
    }
    if (!isCurrent()) {
      throw new Error("Map: projection was superseded");
    }
    const index = cursor;
    cursor += 1;
    try {
      output[index] = await project(coordinates[index]);
      await worker();
    } catch (error) {
      if (!failed) {
        failed = true;
        failure = error;
      }
      throw error;
    }
  };
  const results = await Promise.allSettled(
    Array.from(
      { length: Math.min(MAP_PROJECTION_CONCURRENCY, coordinates.length) },
      worker
    )
  );
  if (failed) {
    throw failure;
  }
  const rejected = results.find((result) => result.status === "rejected");
  if (rejected?.status === "rejected") {
    throw rejected.reason;
  }
  return output;
};
