// @vitest-environment happy-dom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Attachment } from "../src/components/Attachment";
import { PanelUIProvider } from "../src/components/Provider";
import { readTaroStyle } from "./taro-style";

it("busy states shimmer the title and clamp the upload bar at source boundaries", async () => {
  const { container, rerender } = render(
    <PanelUIProvider>
      <Attachment state="uploading" progress={0.25}>
        <Attachment.Title>report.pdf</Attachment.Title>
      </Attachment>
    </PanelUIProvider>
  );
  await waitFor(() =>
    expect(readTaroStyle(screen.getByText("report.pdf"))).toContain("animation")
  );
  expect(readTaroStyle(container.querySelector(".h-full"))).toContain(
    '"width":"25%"'
  );
  rerender(
    <PanelUIProvider>
      <Attachment state="processing" progress={2}>
        <Attachment.Title>report.pdf</Attachment.Title>
      </Attachment>
    </PanelUIProvider>
  );
  expect(readTaroStyle(container.querySelector(".h-full"))).toContain(
    '"width":"100%"'
  );
  rerender(
    <PanelUIProvider>
      <Attachment state="idle" progress={0.5}>
        <Attachment.Title>report.pdf</Attachment.Title>
      </Attachment>
    </PanelUIProvider>
  );
  expect(container.querySelector(".h-full")).toBeNull();
});
it("error state carries destructive border, name and description without changing the row structure", () => {
  render(
    <PanelUIProvider>
      <Attachment state="error" data-testid="row">
        <Attachment.Media>file</Attachment.Media>
        <Attachment.Content>
          <Attachment.Title>failed.pdf</Attachment.Title>
          <Attachment.Description>Upload failed</Attachment.Description>
        </Attachment.Content>
      </Attachment>
    </PanelUIProvider>
  );
  expect(screen.getByTestId("row").className).toContain(
    "border-[var(--panel-destructive)]"
  );
  expect(screen.getByText("failed.pdf").className).toContain(
    "text-[color:var(--panel-destructive)]"
  );
  expect(screen.getByText("Upload failed").className).toContain(
    "text-[color:var(--panel-destructive)]"
  );
});
it("action remains labelled and disabled actions refuse native clicks", () => {
  const action = vi.fn();
  render(
    <PanelUIProvider>
      <Attachment>
        <Attachment.Actions>
          <Attachment.Action accessibilityLabel="Remove" onClick={action}>
            x
          </Attachment.Action>
          <Attachment.Action
            accessibilityLabel="Disabled"
            disabled
            onClick={action}
          >
            x
          </Attachment.Action>
        </Attachment.Actions>
      </Attachment>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByLabelText("Remove"));
  fireEvent.click(screen.getByLabelText("Disabled"));
  expect(action).toHaveBeenCalledTimes(1);
});
it("non-finite progress never creates an invalid width", () => {
  const { container } = render(
    <PanelUIProvider>
      <Attachment state="uploading" progress={Number.NaN}>
        <Attachment.Title>Unknown</Attachment.Title>
      </Attachment>
    </PanelUIProvider>
  );
  expect(readTaroStyle(container.querySelector(".h-full"))).toContain(
    '"width":"0%"'
  );
});
it("an attachment action consumes its press without opening the containing file row", () => {
  const open = vi.fn();
  const remove = vi.fn();
  render(
    <PanelUIProvider>
      <Attachment onPress={open}>
        <Attachment.Title>clickable.pdf</Attachment.Title>
        <Attachment.Actions>
          <Attachment.Action accessibilityLabel="Remove file" onPress={remove}>
            x
          </Attachment.Action>
        </Attachment.Actions>
      </Attachment>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByLabelText("Remove file"));
  expect(remove).toHaveBeenCalledTimes(1);
  expect(open).not.toHaveBeenCalled();
});
