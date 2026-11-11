// @vitest-environment happy-dom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it } from "vitest";

import { SelectShowcase } from "../example/src/components/SelectShowcase";
import { PanelUIProvider } from "../src/components/Provider";

it("the preview sheet exposes grouped options to real Select search", async () => {
  render(
    <PanelUIProvider reducedMotion>
      <SelectShowcase />
    </PanelUIProvider>
  );
  fireEvent.click(screen.getAllByRole("combobox")[1]);
  const field = screen.getByPlaceholderText("搜索科目");
  fireEvent.input(field, { target: { value: "missing" } });
  await waitFor(() => {
    expect(screen.getByText("No matches")).toBeTruthy();
    expect(screen.queryByRole("menuitem")).toBeNull();
  });
  fireEvent.input(field, { target: { value: "数学" } });
  await waitFor(() => {
    expect(screen.getAllByRole("menuitem")).toHaveLength(1);
    expect(screen.getByRole("menuitem").textContent).toContain("数学");
  });
});
