import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

import { resetElementMeasurements } from "./taro-api";

afterEach(() => {
  resetElementMeasurements();
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});
