import { expect, it } from "vitest";

import {
  createFileId,
  describeRules,
  extensionOf,
  fitWithin,
  formatFileSize,
  kindOf,
  libraryMediaTypes,
  matchesAccept,
  nextToStart,
  partitionFiles,
  pickerTypes,
  truncateMiddle,
} from "../src/components/FileUpload/core";
import type { FileUploadFile } from "../src/components/FileUpload/types";

const file = (id: string, name = "report.pdf"): FileUploadFile => ({
  id,
  kind: "document",
  name,
  size: 1024,
  status: "idle",
  uri: id,
});
it("retains upstream file detection and chooser filtering", () => {
  expect(extensionOf("photo.JPG")).toBe("jpg");
  expect(extensionOf(".hidden")).toBe("");
  expect(kindOf({ name: "movie.mp4" })).toBe("video");
  expect(matchesAccept({ name: "photo.PNG" }, ["image/*"])).toBe(true);
  expect(matchesAccept({ name: "report.pdf" }, ["image/*"])).toBe(false);
  expect(pickerTypes([".pdf", ".txt"])).toEqual([
    "application/pdf",
    "text/plain",
  ]);
  expect(pickerTypes([".unknown"])).toEqual(["*/*"]);
  expect(libraryMediaTypes(["application/pdf"])).toEqual([]);
});
it("retains formatting, resizing and identity helpers", () => {
  expect(formatFileSize(2.4 * 1024 ** 2)).toBe("2.4 MB");
  expect(formatFileSize(-1)).toBe("");
  expect(describeRules({ accept: [".pdf"], maxFiles: 3, maxSize: 1024 })).toBe(
    "PDF · up to 1 KB · 3 files max"
  );
  expect(fitWithin({ height: 500, width: 1000 }, { maxWidth: 200 })).toEqual({
    height: 100,
    width: 200,
  });
  expect(fitWithin({ height: 10, width: 10 }, { maxWidth: 100 })).toBe(null);
  expect(truncateMiddle("a-very-long-report-document-name.pdf", 20)).toMatch(
    /\.pdf$/u
  );
  expect(createFileId()).not.toBe(createFileId());
});
it("checks type and size before count so rejected files consume no capacity", () => {
  const result = partitionFiles(
    [file("a", "a.jpg"), { ...file("b"), size: 5000 }, file("c"), file("d")],
    0,
    { accept: [".pdf"], maxFiles: 1, maxSize: 2000 }
  );
  expect(result.accepted.map((f) => f.id)).toEqual(["c"]);
  expect(result.rejected.map((f) => f.reason)).toEqual([
    "type",
    "size",
    "count",
  ]);
});
it("holds processing slots and starts FIFO queued files", () => {
  expect(
    nextToStart(
      [
        { ...file("a"), status: "processing" },
        { ...file("b"), status: "queued" },
        { ...file("c"), status: "queued" },
      ],
      2
    )
  ).toEqual(["b"]);
});
it.each([
  [[".jpg"], ["images"]],
  [[".png"], ["images"]],
  [["image/png"], ["images"]],
  [[".webp"], ["images"]],
  [["image/webp"], ["images"]],
  [[".pdf"], []],
  [["video/quicktime"], ["videos"]],
  [[".mov"], ["videos"]],
  [
    [".pdf", ".png", ".mov"],
    ["images", "videos"],
  ],
  [["*/*"], ["images", "videos"]],
])(
  "keeps the media picker available for accepted formats %j",
  (accept, expected) => {
    expect(libraryMediaTypes(accept)).toEqual(expected);
  }
);
