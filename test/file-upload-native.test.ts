import { beforeEach, expect, it, vi } from "vitest";

import {
  hasFileUploadSource,
  pickUploadFiles,
} from "../src/components/FileUpload/native";

const api = vi.hoisted(() => ({
  canvasToTempFilePath: vi.fn(),
  chooseMedia: vi.fn(),
  chooseMessageFile: vi.fn(),
  compressImage: vi.fn(),
  createOffscreenCanvas: vi.fn(),
  cropImage: vi.fn(),
  getFileInfo: vi.fn(),
  getImageInfo: vi.fn(),
}));
vi.mock("@tarojs/taro", () => api);

beforeEach(() => {
  vi.resetAllMocks();
  api.chooseMedia.mockResolvedValue({
    tempFiles: [
      {
        fileType: "image",
        height: 800,
        size: 9000,
        tempFilePath: "wxfile://photo.jpg",
        width: 1200,
      },
    ],
  });
  api.chooseMessageFile.mockResolvedValue({
    tempFiles: [
      { name: "Report.pdf", path: "wxfile://report.pdf", size: 3000 },
    ],
  });
  api.cropImage.mockResolvedValue({ tempFilePath: "wxfile://crop.jpg" });
  api.compressImage.mockResolvedValue({
    tempFilePath: "wxfile://compressed.jpg",
  });
  api.getImageInfo.mockImplementation(({ src }: { src: string }) =>
    Promise.resolve({
      height: src.includes("compressed") ? 400 : 800,
      type: "jpeg",
      width: src.includes("compressed") ? 600 : 1200,
    })
  );
  api.getFileInfo.mockResolvedValue({ size: 1200 });
});

it("reports available native sources", () => {
  expect(hasFileUploadSource("camera")).toBe(true);
  expect(hasFileUploadSource("library")).toBe(true);
  expect(hasFileUploadSource("files")).toBe(true);
});
it("maps message files without dropping real byte counts", async () => {
  const files = await pickUploadFiles("files", {
    multiple: true,
    remaining: 3,
  });
  expect(api.chooseMessageFile).toHaveBeenCalledWith({ count: 3, type: "all" });
  expect(files).toEqual([
    expect.objectContaining({
      kind: "document",
      name: "Report.pdf",
      size: 3000,
      status: "idle",
      uri: "wxfile://report.pdf",
    }),
  ]);
  expect(files?.[0].id).toBeTruthy();
});
it("leaves MIME filtering to the core rather than excluding mixed documents", async () => {
  await pickUploadFiles("files", {
    accept: [".pdf", "image/*"],
    multiple: true,
  });
  expect(api.chooseMessageFile).toHaveBeenCalledWith({
    count: 100,
    type: "all",
  });
});
it("limits media selection to the remaining native maximum", async () => {
  await pickUploadFiles("library", { multiple: true, remaining: 30 });
  expect(api.chooseMedia).toHaveBeenCalledWith(
    expect.objectContaining({
      count: 9,
      mediaType: ["image", "video"],
      sourceType: ["album"],
    })
  );
});
it("limits a single photo to one and only camera images", async () => {
  await pickUploadFiles("camera", { multiple: true, remaining: 8 });
  expect(api.chooseMedia).toHaveBeenCalledWith(
    expect.objectContaining({
      count: 1,
      mediaType: ["image"],
      sourceType: ["camera"],
    })
  );
});
it("offers only accepted library media families", async () => {
  await pickUploadFiles("library", { accept: ["image/*"] });
  expect(api.chooseMedia).toHaveBeenCalledWith(
    expect.objectContaining({ mediaType: ["image"] })
  );
});
it("does not open a picker when no slots remain", async () => {
  expect(
    await pickUploadFiles("files", { multiple: true, remaining: 0 })
  ).toEqual([]);
  expect(api.chooseMessageFile).not.toHaveBeenCalled();
});
it("does not offer a media picker for document-only accept", async () => {
  expect(
    await pickUploadFiles("library", { accept: ["application/pdf"] })
  ).toEqual([]);
  expect(api.chooseMedia).not.toHaveBeenCalled();
});
it.each(["files", "library", "camera"] as const)(
  "returns null only for %s cancellation",
  async (source) => {
    api.chooseMedia.mockRejectedValue({ errMsg: "chooseMedia:fail cancel" });
    api.chooseMessageFile.mockRejectedValue({
      errMsg: "chooseMessageFile:fail cancel",
    });
    expect(await pickUploadFiles(source, {})).toBeNull();
  }
);
it("preserves permission failures as actionable errors", async () => {
  api.chooseMedia.mockRejectedValue({ errMsg: "chooseMedia:fail auth deny" });
  await expect(pickUploadFiles("camera", {})).rejects.toThrow("auth deny");
});
it("resizes with a real native request and measures the resulting bytes", async () => {
  const files = await pickUploadFiles("library", {
    image: { maxHeight: 500, maxWidth: 600, quality: 0.8 },
  });
  expect(api.compressImage).toHaveBeenCalledWith({
    compressedHeight: 400,
    compressedWidth: 600,
    quality: 80,
    src: "wxfile://photo.jpg",
  });
  expect(files?.[0]).toMatchObject({
    height: 400,
    size: 1200,
    uri: "wxfile://compressed.jpg",
    width: 600,
  });
});
it("fails if a platform silently ignores requested resize", async () => {
  api.getImageInfo.mockResolvedValue({
    height: 800,
    type: "jpeg",
    width: 1200,
  });
  await expect(
    pickUploadFiles("library", { image: { maxWidth: 600 } })
  ).rejects.toThrow(/resize/iu);
});
it("does not enlarge a smaller original", async () => {
  const files = await pickUploadFiles("library", {
    image: { maxHeight: 1600, maxWidth: 2400, quality: 1 },
  });
  expect(api.compressImage).not.toHaveBeenCalled();
  expect(files?.[0].size).toBe(9000);
});
it("opens the supported crop ratio and remeasures cropped dimensions and bytes", async () => {
  const files = await pickUploadFiles("library", {
    image: { crop: { aspect: [2, 2] }, quality: 1 },
  });
  expect(api.cropImage).toHaveBeenCalledWith({
    cropScale: "1:1",
    src: "wxfile://photo.jpg",
  });
  expect(files?.[0]).toMatchObject({ size: 1200, uri: "wxfile://crop.jpg" });
});
it("rejects unsupported ratios before opening a picker", async () => {
  await expect(
    pickUploadFiles("library", { image: { crop: { aspect: [2, 1] } } })
  ).rejects.toThrow(/ratio/iu);
  expect(api.chooseMedia).not.toHaveBeenCalled();
});
it("skips crop for multiple library selection like upstream", async () => {
  await pickUploadFiles("library", {
    image: { crop: { aspect: [2, 1] }, quality: 1 },
    multiple: true,
    remaining: 2,
  });
  expect(api.cropImage).not.toHaveBeenCalled();
});
it.each([-1, 2, Number.NaN])("rejects invalid quality %s", async (quality) => {
  await expect(
    pickUploadFiles("library", { image: { quality } })
  ).rejects.toThrow(/quality/iu);
  expect(api.chooseMedia).not.toHaveBeenCalled();
});
it("preserves video metadata without attempting image transforms", async () => {
  api.chooseMedia.mockResolvedValue({
    tempFiles: [
      {
        fileType: "video",
        height: 1080,
        size: 12_345,
        tempFilePath: "wxfile://video.mp4",
        width: 1920,
      },
    ],
  });
  const files = await pickUploadFiles("library", { image: { maxWidth: 600 } });
  expect(files?.[0]).toMatchObject({
    height: 1080,
    kind: "video",
    mimeType: "video/mp4",
    size: 12_345,
    width: 1920,
  });
  expect(api.compressImage).not.toHaveBeenCalled();
});

it("converts non-JPEG images before applying JPEG quality", async () => {
  const nativeImage = {
    onerror: undefined as (() => void) | undefined,
    onload: undefined as (() => void) | undefined,
    get src() {
      return "";
    },
    set src(_value: string) {
      this.onload?.();
    },
  };
  const drawImage = vi.fn();
  const canvas = {
    createImage: () => nativeImage,
    getContext: () => ({ drawImage }),
  };
  api.getImageInfo.mockImplementation(({ src }: { src: string }) =>
    Promise.resolve({
      height: 800,
      type: src.includes("photo") ? "png" : "jpeg",
      width: 1200,
    })
  );
  api.createOffscreenCanvas.mockReturnValue(canvas);
  api.canvasToTempFilePath.mockResolvedValue({
    tempFilePath: "wxfile://prepared.jpg",
  });
  const files = await pickUploadFiles("library", { image: { quality: 0.7 } });
  expect(api.createOffscreenCanvas).toHaveBeenCalledWith({
    height: 800,
    type: "2d",
    width: 1200,
  });
  expect(drawImage).toHaveBeenCalledWith(nativeImage, 0, 0, 1200, 800);
  expect(api.canvasToTempFilePath).toHaveBeenCalledWith(
    expect.objectContaining({ canvas, fileType: "jpg", quality: 1 })
  );
  expect(api.compressImage).toHaveBeenCalledWith({
    quality: 70,
    src: "wxfile://prepared.jpg",
  });
  expect(files?.[0]).toMatchObject({ mimeType: "image/jpeg", size: 1200 });
});
it("does not fake a compressed image when offscreen preparation is unavailable", async () => {
  api.getImageInfo.mockResolvedValue({ height: 800, type: "png", width: 1200 });
  api.createOffscreenCanvas.mockImplementation(() => {
    throw new Error("offscreen unavailable");
  });
  await expect(
    pickUploadFiles("library", { image: { quality: 0.7 } })
  ).rejects.toThrow("offscreen unavailable");
  expect(api.compressImage).not.toHaveBeenCalled();
});
it("rejects unreadable post-transform byte counts instead of accepting unknown size", async () => {
  api.getFileInfo.mockResolvedValue({ errMsg: "getFileInfo:fail" });
  await expect(
    pickUploadFiles("library", { image: { maxWidth: 600 } })
  ).rejects.toThrow(/size/u);
});
it.each([
  [1, 1, "1:1"],
  [3, 4, "3:4"],
  [4, 3, "4:3"],
  [4, 5, "4:5"],
  [5, 4, "5:4"],
  [9, 16, "9:16"],
  [16, 9, "16:9"],
] as const)(
  "supports native crop ratio %s:%s",
  async (width, height, expected) => {
    await pickUploadFiles("library", {
      image: { crop: { aspect: [width, height] }, quality: 1 },
    });
    expect(api.cropImage).toHaveBeenCalledWith({
      cropScale: expected,
      src: "wxfile://photo.jpg",
    });
  }
);
it("treats crop editor cancellation as an untouched selection", async () => {
  api.cropImage.mockRejectedValue({ errMsg: "cropImage:fail cancel" });
  expect(
    await pickUploadFiles("library", { image: { crop: { aspect: [1, 1] } } })
  ).toBeNull();
});
it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
  "rejects invalid resize dimension %s before selection",
  async (maxWidth) => {
    await expect(
      pickUploadFiles("library", { image: { maxWidth } })
    ).rejects.toThrow(/dimensions/u);
    expect(api.chooseMedia).not.toHaveBeenCalled();
  }
);

it("uses measured image MIME when native temp paths do not retain extensions", async () => {
  api.chooseMedia.mockResolvedValue({
    tempFiles: [
      { fileType: "image", size: 9000, tempFilePath: "wxfile://temporary.tmp" },
    ],
  });
  api.getImageInfo.mockResolvedValue({ height: 800, type: "png", width: 1200 });
  const files = await pickUploadFiles("library", { image: { quality: 1 } });
  expect(files?.[0]).toMatchObject({ mimeType: "image/png", size: 9000 });
  expect(files?.[0].name.endsWith(".png")).toBe(true);
});
it("rejects a native compressor that silently leaves non-JPEG output", async () => {
  api.getImageInfo
    .mockResolvedValueOnce({ height: 800, type: "jpeg", width: 1200 })
    .mockResolvedValueOnce({ height: 400, type: "png", width: 600 });
  await expect(
    pickUploadFiles("library", { image: { maxWidth: 600 } })
  ).rejects.toThrow(/JPEG/u);
});

it("preserves a MOV video extension and MIME for real acceptance validation", async () => {
  api.chooseMedia.mockResolvedValue({
    tempFiles: [
      { fileType: "video", size: 2000, tempFilePath: "wxfile://clip.MOV" },
    ],
  });
  const files = await pickUploadFiles("library", { accept: ["video/*"] });
  expect(files?.[0]).toMatchObject({
    kind: "video",
    mimeType: "video/quicktime",
    size: 2000,
  });
  expect(files?.[0].name.endsWith(".mov")).toBe(true);
});
it("only falls back to MP4 when the native video path has no known extension", async () => {
  api.chooseMedia.mockResolvedValue({
    tempFiles: [
      { fileType: "video", size: 2000, tempFilePath: "wxfile://clip.tmp" },
    ],
  });
  const files = await pickUploadFiles("library", {});
  expect(files?.[0]).toMatchObject({ kind: "video", mimeType: "video/mp4" });
  expect(files?.[0].name.endsWith(".mp4")).toBe(true);
});
it("normalizes measured JPEG extension and MIME casing", async () => {
  api.chooseMedia.mockResolvedValue({
    tempFiles: [
      { fileType: "image", size: 2000, tempFilePath: "wxfile://photo.JPEG" },
    ],
  });
  api.getImageInfo.mockResolvedValue({
    height: 800,
    type: "JPEG",
    width: 1200,
  });
  const files = await pickUploadFiles("library", { image: { quality: 1 } });
  expect(files?.[0]).toMatchObject({ mimeType: "image/jpeg" });
  expect(files?.[0].name.endsWith(".jpg")).toBe(true);
});
