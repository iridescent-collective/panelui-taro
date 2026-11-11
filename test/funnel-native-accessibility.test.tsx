// @vitest-environment happy-dom

import type * as TaroComponents from "@tarojs/components";
import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { expect, it, vi } from "vitest";

import { FunnelChart } from "../src/components/FunnelChart";
import { PanelUIProvider } from "../src/components/Provider";
import { setTestMeasurement } from "./taro-api";

const native = vi.hoisted(() => ({
  buttons: [] as { label: unknown; role: unknown; selected: unknown }[],
}));
vi.mock("@tarojs/components", async (original) => {
  const actual = await original<typeof TaroComponents>();
  const { createElement } = await import("react");
  return {
    ...actual,
    View: (props: ComponentProps<typeof actual.View>) => {
      if (props.role === "button") {
        native.buttons.push({
          label: Reflect.get(props, "aria-label"),
          role: Reflect.get(props, "aria-role"),
          selected: Reflect.get(props, "aria-selected"),
        });
      }
      return createElement(actual.View, props);
    },
  };
});
it.each(["labels", "legend"] as const)(
  "passes the native button role and selected state to FunnelChart %s",
  async (part) => {
    native.buttons = [];
    setTestMeasurement(300, 375);
    const Piece = part === "labels" ? FunnelChart.Labels : FunnelChart.Legend;
    render(
      <PanelUIProvider reducedMotion>
        <FunnelChart
          data={[
            { label: "Visits", value: 100 },
            { label: "Paid", value: 50 },
          ]}
        >
          <Piece />
        </FunnelChart>
      </PanelUIProvider>
    );
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });
    const label =
      part === "labels"
        ? "Paid, 50, 50%"
        : "Paid, 50 percent of the first stage";
    const before = native.buttons.find((button) => button.label === label);
    expect(before).toEqual({ label, role: "button", selected: false });
    native.buttons = [];
    fireEvent.click(screen.getByRole("button", { name: label }));
    expect(native.buttons.find((button) => button.label === label)).toEqual({
      label,
      role: "button",
      selected: true,
    });
  }
);
