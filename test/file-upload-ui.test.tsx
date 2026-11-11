// @vitest-environment happy-dom

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Button } from "../src/components/Button";
import {
  FileUpload,
  describeFileStatus,
  useFileUpload,
} from "../src/components/FileUpload";
import type { FileUploadFile } from "../src/components/FileUpload";
import { PanelUIProvider } from "../src/components/Provider";
import { deferred } from "./helpers/deferred";
import { setElementMeasurement } from "./taro-api";
import { readTaroStyle } from "./taro-style";

const file = (
  status: FileUploadFile["status"],
  id = status
): FileUploadFile => ({
  id,
  kind: "document",
  name: `${id}.pdf`,
  progress: 0.5,
  size: 1024,
  status,
  uri: `/tmp/${id}.pdf`,
});
const Controls = () => {
  const state = useFileUpload();
  return <Button onPress={state.clear}>Clear upload list</Button>;
};
it("renders each row status and wires cancel, retry and remove to queue state", async () => {
  const upload = vi.fn(() => deferred<unknown>().promise);
  render(
    <PanelUIProvider>
      <FileUpload
        multiple
        defaultValue={[
          file("idle"),
          file("queued"),
          file("processing"),
          file("done"),
          file("error"),
          file("canceled"),
        ]}
        upload={upload}
        concurrency={0}
      >
        <FileUpload.List />
        <Controls />
      </FileUpload>
    </PanelUIProvider>
  );
  expect(screen.getByText("PDF · 1 KB")).toBeTruthy();
  expect(screen.getByText("Waiting · 1 KB")).toBeTruthy();
  expect(screen.getByText("Processing…")).toBeTruthy();
  expect(screen.getByText("1 KB · Uploaded")).toBeTruthy();
  fireEvent.click(screen.getByLabelText("Cancel upload of queued.pdf"));
  await waitFor(() =>
    expect(screen.getByLabelText("Retry queued.pdf")).toBeTruthy()
  );
  fireEvent.click(screen.getByLabelText("Retry error.pdf"));
  await waitFor(() =>
    expect(screen.getByLabelText("Cancel upload of error.pdf")).toBeTruthy()
  );
  fireEvent.click(screen.getByLabelText("Remove done.pdf"));
  expect(screen.queryByText("done.pdf")).toBeNull();
  fireEvent.click(screen.getByText("Clear upload list"));
  expect(screen.queryByText("idle.pdf")).toBeNull();
});
it("full multiple dropzone locks both default and custom trigger but single replace stays enabled", () => {
  const { rerender } = render(
    <PanelUIProvider>
      <FileUpload multiple maxFiles={1} defaultValue={[file("idle")]}>
        <FileUpload.Dropzone />
        <FileUpload.Trigger>
          <Button>Add</Button>
        </FileUpload.Trigger>
      </FileUpload>
    </PanelUIProvider>
  );
  expect(
    screen.getByText("1 of 1 added. Remove one to add another.")
  ).toBeTruthy();
  expect(
    screen.getByText("Add").closest('[aria-disabled="true"]')
  ).toBeTruthy();
  rerender(
    <PanelUIProvider>
      <FileUpload defaultValue={[file("idle")]}>
        <FileUpload.Dropzone />
      </FileUpload>
    </PanelUIProvider>
  );
  expect(screen.getByRole("button").getAttribute("aria-disabled")).not.toBe(
    "true"
  );
});
it("disabled row actions cannot remove files or retry an error", () => {
  const changed = vi.fn();
  render(
    <PanelUIProvider>
      <FileUpload
        disabled
        defaultValue={[file("error")]}
        upload={vi.fn()}
        onValueChange={changed}
      >
        <FileUpload.List />
      </FileUpload>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByLabelText("Retry error.pdf"));
  fireEvent.click(screen.getByLabelText("Remove error.pdf"));
  expect(changed).not.toHaveBeenCalled();
});
it("grid uses measured logical width, first cover and remaining row placeholders", async () => {
  setElementMeasurement("upload-grid", {
    height: 100,
    left: 0,
    top: 0,
    width: 342,
  });
  const image: FileUploadFile = {
    ...file("done"),
    kind: "image",
    name: "cover.jpg",
    uri: "/photo.jpg",
  };
  const { container } = render(
    <PanelUIProvider>
      <FileUpload multiple maxFiles={5} defaultValue={[image]}>
        <FileUpload.Grid id="upload-grid" cover placeholders />
      </FileUpload>
    </PanelUIProvider>
  );
  await waitFor(() => expect(screen.getByText("Cover")).toBeTruthy());
  const add = screen.getByLabelText("Add photos, 1 of 5");
  expect(readTaroStyle(add)).toContain('"width":"216rpx"');
  expect(container.querySelectorAll('[aria-hidden="true"]')).not.toHaveLength(
    0
  );
});
it("horizontal grid retains fixed tile size and horizontal list keeps source row width", () => {
  render(
    <PanelUIProvider>
      <FileUpload multiple defaultValue={[file("done")]}>
        <FileUpload.Grid horizontal tileSize={88} />
        <FileUpload.List horizontal />
      </FileUpload>
    </PanelUIProvider>
  );
  expect(readTaroStyle(screen.getByLabelText("Add photos"))).toContain(
    '"width":"176rpx"'
  );
  expect(
    screen
      .getAllByText("done.pdf")
      .some((node) => node.closest(".w-\\[576px\\]"))
  ).toBe(true);
});
it("status wording preserves progress, fallback errors and unknown sizes", () => {
  expect(describeFileStatus({ ...file("uploading"), size: undefined })).toBe(
    "Uploading · 50%"
  );
  expect(describeFileStatus(file("uploading"))).toBe("512 B of 1 KB · 50%");
  expect(describeFileStatus({ ...file("error"), error: "Denied" })).toBe(
    "Denied"
  );
});
it("multiplies existing muted alpha by source opacity for dropzone and add tile", async () => {
  const { container } = render(
    <PanelUIProvider>
      <FileUpload multiple>
        <FileUpload.Dropzone />
        <FileUpload.Grid horizontal />
      </FileUpload>
    </PanelUIProvider>
  );
  await waitFor(() =>
    expect(container.querySelector('[aria-label="Add photos"]')).toBeTruthy()
  );
  const dropzone = screen.getByLabelText("Choose files");
  expect(readTaroStyle(dropzone)).toContain(
    '"backgroundColor":"rgba(0, 0, 0, 0.024)"'
  );
  const add = screen.getByLabelText("Add photos");
  expect(add.className).toContain("bg-[var(--panel-muted-opacity-40)]");
  const themeClass = Array.from(
    add.closest(".panelui-theme")?.classList ?? []
  ).find((name) => name.startsWith("panelui-theme--"));
  const opacityStyles = readFileSync(
    resolve(
      dirname(fileURLToPath(import.meta.url)),
      "../src/styles/variant-opacity.scss"
    ),
    "utf8"
  );
  const themeStyles = opacityStyles.split(`.${themeClass} {`)[1]?.split("}")[0];
  expect(themeStyles).toContain(
    "--panel-muted-opacity-40: rgba(0, 0, 0, 0.024);"
  );
  expect(readTaroStyle(add)).not.toContain('"backgroundColor":');
});
