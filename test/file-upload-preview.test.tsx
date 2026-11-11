// @vitest-environment happy-dom

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { expect, it } from "vitest";

import { FileUploadShowcase } from "../example/src/components/FileUploadShowcase";
import { PanelUIProvider } from "../src/components/Provider";

it("runs explicit fixture uploads through progress, processing, failure and retry", async () => {
  render(
    <PanelUIProvider reducedMotion>
      <FileUploadShowcase />
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Load queue fixture" }));
  fireEvent.click(screen.getByRole("button", { name: "Upload queued files" }));
  await waitFor(() =>
    expect(
      document.querySelector("#panel-file-upload-state")?.textContent
    ).toContain('"status":"uploading"')
  );
  fireEvent.click(screen.getByRole("button", { name: "Report 50%" }));
  await waitFor(() =>
    expect(
      document.querySelector("#panel-file-upload-state")?.textContent
    ).toContain('"progress":0.5')
  );
  fireEvent.click(screen.getByRole("button", { name: "Process uploads" }));
  await waitFor(() =>
    expect(
      document.querySelector("#panel-file-upload-state")?.textContent
    ).toContain('"status":"processing"')
  );
  act(() => {
    fireEvent.click(screen.getByRole("button", { name: "Fail uploads" }));
  });
  await waitFor(() =>
    expect(
      document.querySelector("#panel-file-upload-state")?.textContent
    ).toContain('"status":"error"')
  );
  fireEvent.click(screen.getByRole("button", { name: "Upload queued files" }));
  await waitFor(() =>
    expect(
      document.querySelector("#panel-file-upload-state")?.textContent
    ).toContain('"status":"uploading"')
  );
  act(() => {
    fireEvent.click(screen.getByRole("button", { name: "Complete uploads" }));
  });
  await waitFor(() =>
    expect(
      document.querySelector("#panel-file-upload-events")?.textContent
    ).toContain("Uploaded")
  );
});

it("loads all four compositions and clears fixture files through the public context", () => {
  render(
    <PanelUIProvider reducedMotion>
      <FileUploadShowcase />
    </PanelUIProvider>
  );
  for (const name of [
    "Load queue fixture",
    "Load avatar fixture",
    "Load grid fixture",
    "Load attachment fixture",
  ]) {
    fireEvent.click(screen.getByRole("button", { name }));
  }
  fireEvent.click(screen.getByRole("button", { name: "Horizontal grid" }));
  expect(
    document.querySelector("#panel-file-upload-avatar")?.textContent
  ).toContain("profile.jpg");
  expect(
    document.querySelector("#panel-file-upload-grid")?.textContent
  ).toContain("Cover");
  expect(
    document.querySelector("#panel-file-upload-attachments")?.textContent
  ).toContain("message.pdf");
  fireEvent.click(screen.getByRole("button", { name: "Clear queue" }));
  expect(document.querySelector("#panel-file-upload-state")?.textContent).toBe(
    "[]"
  );
  fireEvent.click(screen.getByRole("button", { name: "Remove photo" }));
  expect(
    document.querySelector("#panel-file-upload-avatar")?.textContent
  ).not.toContain("profile.jpg");
});

it("cancels active fixture uploads and prevents fixture replacement until they stop", async () => {
  render(
    <PanelUIProvider reducedMotion>
      <FileUploadShowcase />
    </PanelUIProvider>
  );
  const load = screen.getByRole("button", { name: "Load queue fixture" });
  fireEvent.click(load);
  fireEvent.click(screen.getByRole("button", { name: "Upload queued files" }));
  await waitFor(() =>
    expect(
      document.querySelector("#panel-file-upload-state")?.textContent
    ).toContain('"status":"uploading"')
  );
  expect(load.getAttribute("aria-disabled")).toBe("true");
  fireEvent.click(screen.getByRole("button", { name: "Cancel uploads" }));
  await waitFor(() =>
    expect(
      document.querySelector("#panel-file-upload-state")?.textContent
    ).toContain('"status":"canceled"')
  );
  fireEvent.click(screen.getByRole("button", { name: "Complete uploads" }));
  expect(
    document.querySelector("#panel-file-upload-events")?.textContent
  ).not.toContain("Uploaded");
  fireEvent.click(screen.getByRole("button", { name: "Disable uploads" }));
  expect(
    screen
      .getByRole("button", { name: /^Add documents or photos/u })
      .getAttribute("aria-disabled")
  ).toBe("true");
});

const gridState = () =>
  document.querySelector("#panel-file-upload-grid-state")?.textContent;

it("runs grid fixture progress rings, processing overlays, retry and completion", async () => {
  render(
    <PanelUIProvider reducedMotion>
      <FileUploadShowcase />
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Load grid fixture" }));
  fireEvent.click(screen.getByRole("button", { name: "Horizontal grid" }));
  fireEvent.click(screen.getByRole("button", { name: "Grid upload files" }));

  await waitFor(() => expect(gridState()).toContain('"status":"uploading"'));
  fireEvent.click(screen.getByRole("button", { name: "Grid report 50%" }));
  await waitFor(() => expect(gridState()).toContain('"progress":0.5'));
  fireEvent.click(screen.getByRole("button", { name: "Grid process uploads" }));
  expect(gridState()).toContain('"status":"processing"');
  expect(
    document.querySelector("#panel-file-upload-grid")?.textContent
  ).toContain("Processing");
  act(() => {
    fireEvent.click(screen.getByRole("button", { name: "Grid fail uploads" }));
  });
  await waitFor(() => expect(gridState()).toContain('"status":"error"'));
  fireEvent.click(screen.getByRole("button", { name: "Retry cover.jpg" }));
  await waitFor(() => expect(gridState()).toContain('"status":"uploading"'));
  act(() => {
    fireEvent.click(
      screen.getByRole("button", { name: "Grid complete uploads" })
    );
  });
  await waitFor(() =>
    expect(
      document.querySelector("#panel-file-upload-grid-events")?.textContent
    ).toBe("Uploaded cover.jpg")
  );
  expect(gridState()).toContain('"status":"done"');
  fireEvent.click(screen.getByRole("button", { name: "Grid clear files" }));
  expect(gridState()).toBe("[]");
});
