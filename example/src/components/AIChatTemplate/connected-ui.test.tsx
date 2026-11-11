// @vitest-environment happy-dom
import type * as TaroComponents from "@tarojs/components";
import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { AIChatTemplate } from "./index";
vi.mock("@tarojs/components", async (importOriginal) => {
  const actual = await importOriginal<typeof TaroComponents>();
  return { ...actual, Canvas: actual.View };
});
vi.mock("./hooks/use-chat-demo", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./hooks/use-chat-demo")>();
  return {
    ...actual,
    useChatDemo: () => actual.useChatDemo({ initialMode: "live" }),
  };
});
it("labels the connected welcome screen consistently with its composer", () => {
  render(<AIChatTemplate />);
  expect(
    screen.queryByText(/Prepared responses.*No model connected/u)
  ).toBeNull();
  expect(
    screen.getByText(/Try asking for PanelUI documentation/u)
  ).toBeTruthy();
});
