// @vitest-environment happy-dom

import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { Sources } from "../src/components/Sources";
import { sourceHost } from "../src/components/Sources/source";
import { setClipboardData } from "./taro-api";

it("source host labels tolerate malformed citations without URL construction", () => {
  expect(sourceHost("https://www.example.test/docs?a=1")).toBe("example.test");
  expect(sourceHost("not a URL")).toBeUndefined();
  expect(sourceHost()).toBeUndefined();
});
it("source count labels and expanded state follow uncontrolled toggles", () => {
  const click = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Sources>
        <Sources.Trigger count={1} onClick={click} />
        <Sources.Content>
          <Sources.Source href="https://example.test" />
        </Sources.Content>
      </Sources>
    </PanelUIProvider>
  );
  const trigger = screen.getByRole("button", { name: "Used 1 source" });
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  fireEvent.click(trigger);
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  expect(click).toHaveBeenCalledTimes(1);
});
it("controlled refusal preserves the folded state and custom trigger content", () => {
  const change = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Sources open={false} onOpenChange={change}>
        <Sources.Trigger>查看出处</Sources.Trigger>
      </Sources>
    </PanelUIProvider>
  );
  const trigger = screen.getByRole("button", { name: "查看出处" });
  fireEvent.click(trigger);
  expect(change).toHaveBeenCalledWith(true);
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
});
it("citation opening is a user click delegated to the host and never a clipboard operation", () => {
  const link = vi.fn();
  const click = vi.fn();
  render(
    <PanelUIProvider>
      <Sources.Source
        title="文档"
        href="https://www.example.test/docs"
        onClick={click}
        onLinkPress={link}
      />
    </PanelUIProvider>
  );
  expect(link).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("link", { name: "文档" }));
  expect(click).toHaveBeenCalledTimes(1);
  expect(link).toHaveBeenCalledWith("https://www.example.test/docs");
  expect(setClipboardData).not.toHaveBeenCalled();
  expect(screen.getByText("example.test")).toBeTruthy();
});
it("unsafe schemes and disabled rows never reach the platform link callback", () => {
  const link = vi.fn();
  render(
    <PanelUIProvider>
      <Sources.Source
        title="脚本"
        href={["javascript", "alert(1)"].join(":")}
        onLinkPress={link}
      />
      <Sources.Source
        title="禁用"
        href="https://example.test"
        disabled
        onLinkPress={link}
      />
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("link", { name: "脚本" }));
  fireEvent.click(screen.getByRole("link", { name: "禁用" }));
  expect(link).not.toHaveBeenCalled();
});
