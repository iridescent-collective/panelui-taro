// @vitest-environment happy-dom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { AIInput } from "../src/components/AIInput";
import { submitMode } from "../src/components/AIInput/controls";
import {
  AI_INPUT_METRICS,
  growthBounds,
} from "../src/components/AIInput/growth";
import { PanelUIProvider } from "../src/components/Provider";
import { PlusIcon } from "../src/icons";
import fixtures from "./fixtures/ai-input-source.json";
import { TARO_TEST_EVENTS, dispatchTaroEvent } from "./taro-components";

for (const fixture of fixtures.bounds) {
  it(`source field bounds ${fixture.size}/${fixture.minRows}/${fixture.maxRows}`, () => {
    expect(
      growthBounds(
        AI_INPUT_METRICS[fixture.size as keyof typeof AI_INPUT_METRICS],
        fixture.minRows,
        fixture.maxRows
      )
    ).toEqual(fixture.result);
  });
}
for (const [index, fixture] of fixtures.modes.entries()) {
  it(`source submit mode ${index}`, () => {
    expect(submitMode(fixture.input.status, fixture.input.value)).toBe(
      fixture.result.mode
    );
    const { container } = render(
      <PanelUIProvider reducedMotion>
        <AIInput
          avoidKeyboard={false}
          value={fixture.input.value}
          status={
            fixture.input.status as
              | "ready"
              | "recording"
              | "submitted"
              | "streaming"
          }
          disabled={fixture.input.disabled}
          onVoice={fixture.input.canVoice ? () => false : undefined}
          onStop={fixture.input.canStop ? () => false : undefined}
        >
          <AIInput.Submit />
        </AIInput>
      </PanelUIProvider>
    );
    expect(
      container
        .querySelector<HTMLElement>('[role="button"]')
        ?.getAttribute("aria-disabled")
    ).toBe(String(fixture.result.inert));
  });
}
it("uncontrolled field emits every keystroke and sends the original untrimmed prompt without clearing it", () => {
  const send = vi.fn();
  const change = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <AIInput avoidKeyboard={false} onSubmit={send} onValueChange={change}>
        <AIInput.Field placeholder="Prompt" />
        <AIInput.Toolbar>
          <AIInput.Submit />
        </AIInput.Toolbar>
      </AIInput>
    </PanelUIProvider>
  );
  fireEvent.input(screen.getByPlaceholderText("Prompt"), {
    target: { value: " ask me " },
  });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
  expect(change).toHaveBeenCalledWith(" ask me ");
  expect(send).toHaveBeenCalledWith(" ask me ");
  expect(
    (screen.getByPlaceholderText("Prompt") as HTMLTextAreaElement).value
  ).toBe(" ask me ");
});
it("native lineCount clamps growth independent of reported content height and inline empty field centres in the control height", () => {
  const { container } = render(
    <PanelUIProvider reducedMotion>
      <AIInput avoidKeyboard={false} minRows={2} maxRows={3}>
        <AIInput.Field placeholder="Stacked" />
      </AIInput>
      <AIInput avoidKeyboard={false}>
        <AIInput.Row>
          <AIInput.Field placeholder="Inline" />
          <AIInput.Submit />
        </AIInput.Row>
      </AIInput>
    </PanelUIProvider>
  );
  const field = screen.getByPlaceholderText("Stacked");
  act(() =>
    dispatchTaroEvent(field, TARO_TEST_EVENTS.lineChange, {
      height: 1,
      lineCount: 20,
    })
  );
  expect(JSON.parse(field.dataset.taroStyle ?? "{}").height).toBe("180rpx");
  act(() =>
    dispatchTaroEvent(field, TARO_TEST_EVENTS.lineChange, {
      height: 2000,
      lineCount: 1,
    })
  );
  expect(JSON.parse(field.dataset.taroStyle ?? "{}").height).toBe("136rpx");
  expect(
    JSON.parse(
      container.querySelector<HTMLElement>('textarea[placeholder="Inline"]')
        ?.dataset.taroStyle ?? "{}"
    ).height
  ).toBe("60rpx");
});
it("voice and stop callbacks are independent of prompt submission; detached controls work outside a root", () => {
  const voice = vi.fn();
  const stop = vi.fn();
  const add = vi.fn();
  const { rerender } = render(
    <PanelUIProvider reducedMotion>
      <AIInput avoidKeyboard={false} onVoice={voice}>
        <AIInput.Submit />
      </AIInput>
      <AIInput.Action icon={<PlusIcon />} label="Add" onPress={add} />
      <AIInput.Pill label="Model" detail="High" />
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Voice mode" }));
  fireEvent.click(screen.getByRole("button", { name: "Add" }));
  expect(voice).toHaveBeenCalledTimes(1);
  expect(add).toHaveBeenCalledTimes(1);
  rerender(
    <PanelUIProvider reducedMotion>
      <AIInput avoidKeyboard={false} status="streaming" onStop={stop}>
        <AIInput.Submit />
      </AIInput>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Stop" }));
  expect(stop).toHaveBeenCalledTimes(1);
});
it("sheet pushes, pops and closes then reopens at root, retaining controlled toggle and choice rows", () => {
  const changed = vi.fn();
  const toggle = vi.fn();
  const choice = vi.fn();
  const opened = vi.fn();
  const sample = (open: boolean) => (
    <PanelUIProvider reducedMotion>
      <AIInput.Sheet open={open} onOpenChange={opened} onScreenChange={changed}>
        <AIInput.Sheet.Screen id="root" title="Options">
          <AIInput.Sheet.Group footnote="Settings">
            <AIInput.Sheet.Row label="Project" to="project" />
            <AIInput.Sheet.Toggle
              label="Web search"
              value={false}
              onValueChange={toggle}
            />
            <AIInput.Sheet.Choice label="Model A" selected onPress={choice} />
          </AIInput.Sheet.Group>
        </AIInput.Sheet.Screen>
        <AIInput.Sheet.Screen id="project" title="Projects">
          <AIInput.Sheet.Row label="Project A" />
        </AIInput.Sheet.Screen>
      </AIInput.Sheet>
    </PanelUIProvider>
  );
  const { rerender } = render(sample(true));
  fireEvent.click(screen.getByRole("switch", { name: "Web search" }));
  expect(toggle).toHaveBeenCalledWith(true);
  fireEvent.click(screen.getByRole("radio"));
  expect(choice).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button", { name: "Project" }));
  expect(changed).toHaveBeenLastCalledWith("project");
  expect(screen.getByText("Projects")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Back" }));
  expect(changed).toHaveBeenLastCalledWith("root");
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(opened).toHaveBeenCalledWith(false);
  rerender(sample(false));

  rerender(sample(true));
  expect(screen.getByText("Options")).toBeTruthy();
});
it("recording decisions and explicit native click controls respect the global disabled boundary", () => {
  const cancel = vi.fn();
  const confirm = vi.fn();
  const add = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <AIInput
        avoidKeyboard={false}
        disabled
        status="recording"
        onRecordCancel={cancel}
        onRecordConfirm={confirm}
      >
        <AIInput.Recording />
        <AIInput.Action
          label="Add"
          icon={<PlusIcon />}
          disabled={false}
          onClick={add}
        />
      </AIInput>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Discard recording" }));
  fireEvent.click(screen.getByRole("button", { name: "Use recording" }));
  fireEvent.click(screen.getByRole("button", { name: "Add" }));
  expect(cancel).not.toHaveBeenCalled();
  expect(confirm).not.toHaveBeenCalled();
  expect(add).not.toHaveBeenCalled();
});

it("centers the sheet grabber in a column surface and anchors its header title", () => {
  render(
    <PanelUIProvider reducedMotion>
      <AIInput.Sheet defaultOpen>
        <AIInput.Sheet.Screen id="options" title="Options">
          Settings
        </AIInput.Sheet.Screen>
      </AIInput.Sheet>
    </PanelUIProvider>
  );
  const grabber = document.querySelector(".self-center");
  expect(grabber).toBeTruthy();
  expect(grabber?.parentElement?.classList.contains("flex")).toBe(true);
  expect(grabber?.parentElement?.classList.contains("flex-col")).toBe(true);
  expect(grabber?.nextElementSibling?.classList.contains("relative")).toBe(
    true
  );
});
