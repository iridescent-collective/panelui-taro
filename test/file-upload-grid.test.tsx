// @vitest-environment happy-dom
import "./geometry-renderer";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

import { FileUploadContext } from "../src/components/FileUpload/context";
import { FileUploadGrid } from "../src/components/FileUpload/grid";
import type {
  FileUploadContextValue,
  FileUploadFile,
  FileUploadGridProps,
} from "../src/components/FileUpload/types";
import { PanelUIProvider } from "../src/components/Provider";
import { setElementMeasurement, setTestMeasurement } from "./taro-api";

const callbacks = {
  cancel: vi.fn(),
  clear: vi.fn(),
  pick: vi.fn(async () => {}),
  remove: vi.fn(),
  retry: vi.fn(),
  upload: vi.fn(),
};
const photo = (
  id = "photo",
  status: FileUploadFile["status"] = "idle"
): FileUploadFile => ({
  height: 80,
  id,
  kind: "image",
  name: `${id}.jpg`,
  status,
  uri: `wxfile://${id}.jpg`,
  width: 100,
});
const context = (
  files: FileUploadFile[],
  overrides: Partial<FileUploadContextValue> = {}
): FileUploadContextValue => ({
  ...callbacks,
  canAddMore: true,
  disabled: false,
  files,
  hasUpload: true,
  invalid: false,
  multiple: true,
  rejections: [],
  sourceLabels: { camera: "Camera", files: "Files", library: "Library" },
  sources: ["library"],
  ...overrides,
});
const model = (
  files: FileUploadFile[],
  props: FileUploadGridProps = {},
  overrides: Partial<FileUploadContextValue> = {}
) => (
  <PanelUIProvider reducedMotion>
    <FileUploadContext.Provider value={context(files, overrides)}>
      <FileUploadGrid horizontal {...props} />
    </FileUploadContext.Provider>
  </PanelUIProvider>
);
const flush = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
beforeEach(() => {
  vi.clearAllMocks();
  setTestMeasurement(100, 375);
});

it("finishes just the measured grid row with placeholders and marks one cover", async () => {
  setElementMeasurement("upload-grid", {
    height: 200,
    left: 0,
    top: 0,
    width: 320,
  });
  const view = render(
    model(
      [photo()],
      {
        columns: 3,
        cover: true,
        horizontal: false,
        id: "upload-grid",
        placeholders: true,
      },
      { maxFiles: 9 }
    )
  );
  await flush();
  expect(screen.getAllByText("Cover")).toHaveLength(1);
  expect(
    view.container.querySelectorAll(
      '[aria-hidden="true"][class*="border-dashed"]'
    )
  ).toHaveLength(1);
  expect(
    screen.getByRole("button", { name: "Add photos, 1 of 9" }).dataset.taroStyle
  ).toContain("202rpx");
  expect(screen.getByText("1/9")).toBeTruthy();
});
it("renders all empty capacity slots in a horizontal strip and routes add through its source", async () => {
  const view = render(
    model([photo()], { placeholders: true }, { maxFiles: 5 })
  );
  expect(
    view.container.querySelectorAll(
      '[aria-hidden="true"][class*="border-dashed"]'
    )
  ).toHaveLength(3);
  fireEvent.click(screen.getByRole("button", { name: "Add photos, 1 of 5" }));
  await flush();
  expect(callbacks.pick).toHaveBeenCalledWith("library");
});
it("hides the add tile at capacity and honors hideAdd independently", () => {
  const view = render(model([photo()], {}, { canAddMore: false, maxFiles: 1 }));
  expect(screen.queryByRole("button", { name: /Add photos/u })).toBeNull();
  view.rerender(model([photo()], { hideAdd: true }));
  expect(screen.queryByRole("button", { name: /Add photos/u })).toBeNull();
});
it("opens an idle image in its viewer and closes it", async () => {
  vi.useFakeTimers();
  try {
    render(model([photo()], { hideAdd: true }));
    await flush();
    fireEvent.click(screen.getByLabelText("photo.jpg", { exact: true }));
    await flush();
    act(() => vi.advanceTimersByTime(400));
    expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await flush();
    act(() => vi.advanceTimersByTime(400));
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  } finally {
    vi.useRealTimers();
  }
});
it.each(["queued", "processing", "uploading"] as const)(
  "keeps %s preview locked and cancels instead of removing",
  async (status) => {
    render(model([photo("active", status)], { hideAdd: true }));
    await flush();
    fireEvent.click(screen.getByLabelText("active.jpg", { exact: true }));
    await flush();
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "Cancel upload of active.jpg" })
    );
    expect(callbacks.cancel).toHaveBeenCalledWith("active");
    expect(callbacks.remove).not.toHaveBeenCalled();
  }
);
it.each(["error", "canceled"] as const)(
  "offers retry for %s and routes dismiss to removal",
  (status) => {
    render(model([photo("failed", status)], { hideAdd: true }));
    fireEvent.click(screen.getByRole("button", { name: "Retry failed.jpg" }));
    expect(callbacks.retry).toHaveBeenCalledWith("failed");
    fireEvent.click(screen.getByRole("button", { name: "Remove failed.jpg" }));
    expect(callbacks.remove).toHaveBeenCalledWith("failed");
  }
);
it("disables every mutation while preserving source previews", () => {
  render(
    model(
      [photo("failed", "error")],
      { hideAdd: true },
      { canAddMore: false, disabled: true }
    )
  );
  fireEvent.click(screen.getByRole("button", { name: "Retry failed.jpg" }));
  fireEvent.click(screen.getByRole("button", { name: "Remove failed.jpg" }));
  expect(callbacks.retry).not.toHaveBeenCalled();
  expect(callbacks.remove).not.toHaveBeenCalled();
});
it.each([0, 0.5, 1, Number.NaN, 4])(
  "renders a clamped source progress ring at %s",
  (progress) => {
    const file = { ...photo("upload", "uploading"), progress };
    const view = render(model([file], { hideAdd: true }));
    const svg = [...view.container.querySelectorAll("img")]
      .map((image) => decodeURIComponent(image.getAttribute("src") ?? ""))
      .find((source) => source.includes('viewBox="0 0 36 36"'));
    const target = Number.isFinite(progress)
      ? Math.max(0, Math.min(1, progress))
      : 0;
    expect(svg).toContain(
      `stroke-dashoffset="${2 * Math.PI * 16.5 * (1 - target)}"`
    );
  }
);
it("uses names and kind icons for non-image attachments without registering a viewer trigger", () => {
  render(
    model([{ ...photo("report"), kind: "document", name: "Report.pdf" }], {
      hideAdd: true,
    })
  );
  expect(screen.getByText("Report.pdf")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Report.pdf" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Remove Report.pdf" }));
  expect(callbacks.remove).toHaveBeenCalledWith("report");
});
