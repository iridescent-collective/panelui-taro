// @vitest-environment happy-dom

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Button } from "../src/components/Button";
import { FileUpload } from "../src/components/FileUpload";
import type { FileUploadFile } from "../src/components/FileUpload";
import { PanelUIProvider } from "../src/components/Provider";
import { deferred } from "./helpers/deferred";

const native = vi.hoisted(() => ({ pick: vi.fn() }));
vi.mock("../src/components/FileUpload/native", () => ({
  hasFileUploadSource: () => true,
  pickUploadFiles: native.pick,
}));
const photo: FileUploadFile = {
  id: "photo",
  kind: "image",
  mimeType: "image/png",
  name: "photo.png",
  size: 128,
  status: "idle",
  uri: "/photo.png",
};
it("single pending picker uses latest acceptance rules and reports rejection visibly", async () => {
  const pending = deferred<FileUploadFile[] | null>();
  native.pick.mockReturnValue(pending.promise);
  const rejected = vi.fn();
  const changed = vi.fn();
  const child = (
    <>
      <FileUpload.Trigger>
        <Button>Pick sample</Button>
      </FileUpload.Trigger>
      <FileUpload.Dropzone />
    </>
  );
  const { rerender } = render(
    <PanelUIProvider>
      <FileUpload
        sources={["library"]}
        accept={["image/png"]}
        onValueChange={changed}
        onReject={rejected}
      >
        {child}
      </FileUpload>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByText("Pick sample"));
  fireEvent.click(screen.getByText("Pick sample"));
  expect(native.pick).toHaveBeenCalledTimes(1);
  rerender(
    <PanelUIProvider>
      <FileUpload
        sources={["library"]}
        accept={["application/pdf"]}
        onValueChange={changed}
        onReject={rejected}
      >
        {child}
      </FileUpload>
    </PanelUIProvider>
  );
  await act(() => {
    pending.resolve([photo]);
  });
  expect(changed).not.toHaveBeenCalled();
  expect(rejected).toHaveBeenCalledTimes(1);
  expect(screen.getByText("photo.png isn't a PDF.")).toBeTruthy();
});
it("disabling during picker suppresses additions and later re-enable can pick again", async () => {
  const pending = deferred<FileUploadFile[] | null>();
  native.pick
    .mockReturnValueOnce(pending.promise)
    .mockResolvedValueOnce([photo]);
  const changed = vi.fn();
  const child = (
    <FileUpload.Trigger>
      <Button>Choose photo</Button>
    </FileUpload.Trigger>
  );
  const { rerender } = render(
    <FileUpload sources={["library"]} onValueChange={changed}>
      {child}
    </FileUpload>
  );
  fireEvent.click(screen.getByText("Choose photo"));
  rerender(
    <FileUpload sources={["library"]} disabled onValueChange={changed}>
      {child}
    </FileUpload>
  );
  await act(() => {
    pending.resolve([photo]);
  });
  expect(changed).not.toHaveBeenCalled();
  rerender(
    <FileUpload sources={["library"]} onValueChange={changed}>
      {child}
    </FileUpload>
  );
  fireEvent.click(screen.getByText("Choose photo"));
  await waitFor(() => expect(changed).toHaveBeenCalledWith([photo]));
});
it("unmounted picker completion and failure cannot update the consumer", async () => {
  const pending = deferred<FileUploadFile[] | null>();
  native.pick.mockReturnValueOnce(pending.promise);
  const changed = vi.fn();
  const error = vi.fn();
  const { unmount } = render(
    <FileUpload sources={["files"]} onValueChange={changed} onError={error}>
      <FileUpload.Trigger>
        <Button>Browse</Button>
      </FileUpload.Trigger>
    </FileUpload>
  );
  fireEvent.click(screen.getByText("Browse"));
  unmount();
  await act(() => {
    pending.reject(new Error("Permission denied"));
  });
  expect(changed).not.toHaveBeenCalled();
  expect(error).not.toHaveBeenCalled();
});
it("permission errors reach onError and cancellation preserves the current list", async () => {
  native.pick
    .mockRejectedValueOnce({ errMsg: "Permission denied" })
    .mockResolvedValueOnce(null);
  const error = vi.fn();
  const changed = vi.fn();
  render(
    <FileUpload
      sources={["files"]}
      defaultValue={[photo]}
      onValueChange={changed}
      onError={error}
    >
      <FileUpload.Trigger>
        <Button>Browse</Button>
      </FileUpload.Trigger>
    </FileUpload>
  );
  fireEvent.click(screen.getByText("Browse"));
  await waitFor(() => expect(error).toHaveBeenCalledTimes(1));
  fireEvent.click(screen.getByText("Browse"));
  await waitFor(() => expect(native.pick).toHaveBeenCalledTimes(2));
  expect(changed).not.toHaveBeenCalled();
});
it("single source composes native onClick with picker exactly once for trigger and dropzone", async () => {
  native.pick.mockResolvedValue(null);
  const clicked = vi.fn();
  const pressed = vi.fn();
  render(
    <FileUpload sources={["files"]}>
      <FileUpload.Trigger>
        <Button onClick={clicked} onPress={pressed}>
          Click add
        </Button>
      </FileUpload.Trigger>
      <FileUpload.Dropzone
        onClick={clicked}
        onPress={pressed}
        title="Click dropzone"
      />
    </FileUpload>
  );
  fireEvent.click(screen.getByText("Click add"));
  await waitFor(() => expect(native.pick).toHaveBeenCalledTimes(1));
  expect(clicked).toHaveBeenCalledTimes(1);
  expect(pressed).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText("Click dropzone"));
  await waitFor(() => expect(native.pick).toHaveBeenCalledTimes(2));
  expect(clicked).toHaveBeenCalledTimes(2);
  expect(pressed).not.toHaveBeenCalled();
});
