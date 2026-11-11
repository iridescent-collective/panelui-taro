import { expect, it } from "vitest";

import { resolvePreviewStoryId } from "./initial-story";

const STORIES = [{ id: "plot" }, { id: "feedback" }, { id: "time-picker" }];

it("opens the requested registered preview without needing a catalogue selection", () => {
  expect(resolvePreviewStoryId("feedback", STORIES)).toBe("feedback");
  expect(resolvePreviewStoryId("time-picker", STORIES)).toBe("time-picker");
});

it("keeps the default preview for missing or unknown routes", () => {
  expect(resolvePreviewStoryId(undefined, STORIES)).toBe("plot");
  expect(resolvePreviewStoryId("unknown", STORIES)).toBe("plot");
});
