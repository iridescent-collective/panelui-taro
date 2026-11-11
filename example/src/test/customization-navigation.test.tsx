// @vitest-environment happy-dom

import { redirectTo } from "@tarojs/taro";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { DocsShell } from "../components/docs/DocsShell";

it("opens the customization directory from the existing docs navigation", () => {
  render(
    <DocsShell section="components" slug="accordion">
      Preview
    </DocsShell>
  );
  fireEvent.click(screen.getByRole("button", { name: "Customization" }));
  expect(redirectTo).toHaveBeenCalledWith({
    url: "/customization/colors/index",
  });
});
