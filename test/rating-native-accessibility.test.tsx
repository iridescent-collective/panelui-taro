// @vitest-environment happy-dom

import type * as TaroComponents from "@tarojs/components";
import { render } from "@testing-library/react";
import type { ComponentProps } from "react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { Rating } from "../src/components/Rating";

const native = vi.hoisted(() => ({
  views: [] as { role: unknown; nativeRole: unknown; value: unknown }[],
}));
vi.mock("@tarojs/components", async (original) => {
  const actual = await original<typeof TaroComponents>();
  const { createElement } = await import("react");
  return {
    ...actual,
    View: (props: ComponentProps<typeof actual.View>) => {
      if (Reflect.get(props, "aria-label") === "Rating role contract") {
        native.views.push({
          nativeRole: Reflect.get(props, "aria-role"),
          role: props.role,
          value: Reflect.get(props, "aria-valuenow"),
        });
      }
      return createElement(actual.View, props);
    },
  };
});

it.each([
  { disabled: false, nativeRole: "slider", readOnly: false, role: "slider" },
  { disabled: false, nativeRole: "image", readOnly: true, role: "img" },
  { disabled: true, nativeRole: "image", readOnly: false, role: "img" },
])(
  "uses the native Rating role with readOnly=$readOnly and disabled=$disabled",
  ({ disabled, readOnly, role, nativeRole }) => {
    native.views = [];
    render(
      <PanelUIProvider reducedMotion>
        <Rating
          label="Rating role contract"
          value={4.5}
          disabled={disabled}
          readOnly={readOnly}
        />
      </PanelUIProvider>
    );
    expect(native.views.length).toBeGreaterThan(0);
    for (const view of native.views) {
      expect(view).toEqual({ nativeRole, role, value: 4.5 });
    }
  }
);
