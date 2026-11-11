// @vitest-environment happy-dom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Feedback } from "../src/components/Feedback";
import { PanelUIProvider } from "../src/components/Provider";

const Body = ({ onSubmit }: { onSubmit: (value: string) => void }) => (
  <Feedback.Content>
    <Feedback.Panel>
      <Feedback.Title>Feedback title</Feedback.Title>
      <Feedback.Close />
      <Feedback.Field accessibilityLabel="Message" />
    </Feedback.Panel>
    <Feedback.Footer>
      <Feedback.Cancel />
      <Feedback.Submit onSubmit={onSubmit} />
    </Feedback.Footer>
  </Feedback.Content>
);
it("opens, holds a message and submits without automatically closing", async () => {
  const submit = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Feedback>
        <Feedback.Trigger>
          <button>Open feedback</button>
        </Feedback.Trigger>
        <Body onSubmit={submit} />
      </Feedback>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByText("Open feedback"));
  expect(
    screen.getByText("Submit").parentElement?.getAttribute("aria-disabled")
  ).toBe("true");
  fireEvent.input(screen.getByLabelText("Message"), {
    target: { value: "Fix this" },
  });
  fireEvent.click(screen.getByText("Submit"));
  expect(submit).toHaveBeenCalledWith("Fix this");
  expect(screen.getByRole("dialog")).toBeTruthy();
  fireEvent.click(screen.getByText("Cancel"));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
});
it("controlled open and value requests preserve the owner's refusal", () => {
  const change = vi.fn();
  const state = vi.fn();
  const submit = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Feedback
        open
        value="Original"
        onOpenChange={state}
        onValueChange={change}
      >
        <Body onSubmit={submit} />
      </Feedback>
    </PanelUIProvider>
  );
  fireEvent.input(screen.getByLabelText("Message"), {
    target: { value: "Rejected" },
  });
  expect(change).toHaveBeenCalledWith("Rejected");
  fireEvent.click(screen.getByText("Submit"));
  expect(submit).toHaveBeenCalledWith("Original");
  fireEvent.click(screen.getByText("Cancel"));
  expect(state).toHaveBeenCalledWith(false);
  expect(screen.getByRole("dialog")).toBeTruthy();
});
it("a field's own controlled value determines whether and what Submit sends", () => {
  const submit = vi.fn();
  const change = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Feedback defaultOpen>
        <Feedback.Content>
          <Feedback.Panel>
            <Feedback.Field
              value="Owned by field"
              onChangeText={change}
              accessibilityLabel="Owned field"
            />
          </Feedback.Panel>
          <Feedback.Submit onSubmit={submit} />
        </Feedback.Content>
      </Feedback>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByText("Submit"));
  expect(submit).toHaveBeenCalledWith("Owned by field");
  fireEvent.input(screen.getByLabelText("Owned field"), {
    target: { value: "Not accepted" },
  });
  expect(change).toHaveBeenCalledWith("Not accepted");
  fireEvent.click(screen.getByText("Submit"));
  expect(submit).toHaveBeenLastCalledWith("Owned by field");
});
it("an explicit false disabled flag cannot enable an empty feedback submission", () => {
  const submit = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Feedback defaultOpen defaultValue="   ">
        <Feedback.Content>
          <Feedback.Submit disabled={false} onSubmit={submit} />
        </Feedback.Content>
      </Feedback>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByText("Submit"));
  expect(submit).not.toHaveBeenCalled();
});
it("non-dismissible content refuses outside close and custom close handlers replace default closure", () => {
  const custom = vi.fn();
  const state = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Feedback defaultOpen onOpenChange={state}>
        <Feedback.Content dismissible={false}>
          <Feedback.Panel>
            <Feedback.Title>Fixed</Feedback.Title>
            <Feedback.Close onPress={custom} />
          </Feedback.Panel>
        </Feedback.Content>
      </Feedback>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByLabelText("Close dialog"));
  expect(state).not.toHaveBeenCalled();
  fireEvent.click(screen.getByLabelText("Close"));
  expect(custom).toHaveBeenCalledTimes(1);
  expect(state).not.toHaveBeenCalled();
});
it("restores a rejected textarea value without replacing the focused field", async () => {
  render(
    <PanelUIProvider reducedMotion>
      <Feedback defaultOpen value="Owner">
        <Feedback.Content>
          <Feedback.Field accessibilityLabel="Rejected field" />
        </Feedback.Content>
      </Feedback>
    </PanelUIProvider>
  );
  const field = screen.getByLabelText("Rejected field") as HTMLTextAreaElement;
  fireEvent.input(field, { target: { value: "Native optimistic value" } });
  await waitFor(() => expect(field.value).toBe("Owner"));
  expect(screen.getByLabelText("Rejected field")).toBe(field);
});
it("keeps the source's unlimited default rather than truncating feedback at WeChat's 140 characters", () => {
  const submit = vi.fn();
  const text = "反馈".repeat(100);
  render(
    <PanelUIProvider reducedMotion>
      <Feedback defaultOpen>
        <Body onSubmit={submit} />
      </Feedback>
    </PanelUIProvider>
  );
  fireEvent.input(screen.getByLabelText("Message"), {
    target: { value: text },
  });
  fireEvent.click(screen.getByText("Submit"));
  expect(screen.getByLabelText("Message").getAttribute("maxlength")).toBe("-1");
  expect(submit).toHaveBeenCalledWith(text);
});
