import { redirectTo } from "@tarojs/taro";
// @vitest-environment happy-dom
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { ComponentPage } from "../components/docs/ComponentPage";
import { entry as accordion } from "../official/accordion";
import { entry as alert } from "../official/alert";
import { entry as avatar } from "../official/avatar";
import { entry as button } from "../official/button";
import { entry as theme } from "../official/theme-selector";

it("renders the original accordion FAQ, switches variants and navigates to a separate page", async () => {
  render(<ComponentPage entry={accordion} />);
  expect(
    screen.getByText("Standard delivery arrives in three to five working days.")
  ).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Choose variant" }));
  fireEvent.click(
    await screen.findByRole("button", { name: "Accordion Surface variant" })
  );
  fireEvent.click(
    await screen.findByRole("button", { name: "What is your returns policy?" })
  );
  expect(
    screen.getByText("Send anything back within 30 days for a full refund.")
  ).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Button" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Browse components" }));
  fireEvent.input(
    await screen.findByRole("textbox", { name: "Search directory" }),
    {
      target: { value: "Button" },
    }
  );
  expect(screen.queryByRole("button", { name: "Avatar" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Button" }));
  expect(redirectTo).toHaveBeenCalledWith({
    url: expect.stringContaining("/button/index"),
  });
});
for (const entry of [button, alert, avatar, theme]) {
  for (const demo of entry.demos) {
    it(`mounts ${entry.name}: ${demo.label}`, () => {
      const Demo = demo.render;
      const result = render(<Demo />);
      expect(result.container.childNodes.length).toBeGreaterThan(0);
    });
  }
}
