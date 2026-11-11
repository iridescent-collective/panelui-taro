// @vitest-environment happy-dom
import { showToast } from "@tarojs/taro";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { emitKeyboardHeight } from "../../../test/taro-api";
import { entry as breadcrumb } from "../official/breadcrumb";
import { entry as button } from "../official/button";
import { entry as checkbox } from "../official/checkbox";
import { entry as switchEntry } from "../official/switch";
import { KeyboardAvoider, Pressable, View } from "../runtime/native";

vi.mock("@tarojs/taro", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tarojs/taro")>()),
  showToast: vi.fn(async () => ({})),
}));

it("maps noninteractive decoration to native hit testing instead of a discarded DOM prop", () => {
  render(
    <View data-testid="decoration" pointerEvents="none">
      <View>Decoration</View>
    </View>
  );
  const root = screen.getByTestId("decoration");
  expect(root.style.pointerEvents).toBe("none");
  expect(root.getAttribute("pointerEvents")).toBeNull();
});
it("keeps box-none children interactive while box-only pressable wrappers own the hit target", () => {
  render(
    <>
      <View data-testid="overlay" pointerEvents="box-none">
        <Pressable>Action</Pressable>
      </View>
      <Pressable data-testid="box" pointerEvents="box-only">
        Box
      </Pressable>
    </>
  );
  expect(screen.getByTestId("overlay").style.pointerEvents).toBe("none");
  expect(screen.getByTestId("overlay").className).toContain(
    "official-pointer-box-none"
  );
  expect(screen.getByTestId("box").style.pointerEvents).toBe("auto");
  expect(screen.getByTestId("box").className).toContain(
    "official-pointer-box-only"
  );
});
it("connects the docked input/textarea example adapter to keyboard height changes", async () => {
  render(
    <KeyboardAvoider data-testid="dock" mode="dock" bottomInset={34}>
      <View>Composer</View>
    </KeyboardAvoider>
  );
  act(() => emitKeyboardHeight(240));
  await waitFor(() =>
    expect(screen.getByTestId("dock").style.transform).toBe(
      "translateY(-412rpx)"
    )
  );
  act(() => emitKeyboardHeight(0));
  await waitFor(() =>
    expect(screen.getByTestId("dock").style.transform).toBe("translateY(0rpx)")
  );
});
for (const [entry, role] of [
  [checkbox, "checkbox"],
  [switchEntry, "switch"],
] as const) {
  for (const label of ["States", "Sizes"]) {
    it(`lets every enabled ${entry.name} ${label} control change and return to its original state`, () => {
      const Demo = entry.demos.find((d) => d.label === label)!.render;
      render(<Demo />);
      for (const control of screen.getAllByRole(role)) {
        const initial = control.getAttribute("aria-checked");
        fireEvent.click(control);
        if (control.getAttribute("aria-disabled") === "true")
          expect(control.getAttribute("aria-checked")).toBe(initial);
        else {
          expect(control.getAttribute("aria-checked")).not.toBe(initial);
          fireEvent.click(control);
          expect(control.getAttribute("aria-checked")).toBe(initial);
        }
      }
    });
  }
}
it("expands the hidden breadcrumbs rather than leaving Show more inert", () => {
  const Demo = breadcrumb.demos.find((d) => d.label === "Collapsed")!.render;
  render(<Demo />);
  expect(screen.queryByText("Library")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Show more" }));
  expect(screen.getByText("Library")).toBeDefined();
  expect(screen.queryByRole("button", { name: "Show more" })).toBeNull();
});
it("gives visual button variants local demonstration feedback", () => {
  const Demo = button.demos.find((d) => d.label === "Variants")!.render;
  render(<Demo />);
  fireEvent.click(screen.getByRole("button", { name: "Primary" }));
  expect(showToast).toHaveBeenCalledWith({
    title: "Primary · demo",
    icon: "none",
  });
});

it("opens the first variant when the default variant has a deep-link id", async () => {
  const { ComponentPage } = await import("../components/docs/ComponentPage");
  render(
    <ComponentPage
      entry={{
        ...button,
        demos: [
          {
            id: "first",
            label: "First variant",
            render: () => <View>First preview</View>,
          },
          {
            label: "Second variant",
            render: () => <View>Second preview</View>,
          },
        ],
      }}
    />
  );
  expect(
    screen.getByRole("button", { name: "Choose variant" }).textContent
  ).toContain("First variant");
  expect(screen.getByText("First preview")).toBeDefined();
});

const catalogModules = import.meta.glob<{ entry: typeof button }>(
  "../official/*.tsx",
  { eager: true }
);
for (const { entry } of Object.values(catalogModules)) {
  if (!entry.demos[0]?.id || !entry.demos.some((demo) => demo.id === undefined))
    continue;
  it(`keeps ${entry.name} on its first demo when no deep-link parameter is supplied`, async () => {
    const { ComponentPage } = await import("../components/docs/ComponentPage");
    render(<ComponentPage entry={entry} />);
    // Some first demos intentionally open a modal; the toolbar is still the state indicator.
    const toolbar = screen.getByRole("button", {
      name: "Choose variant",
      hidden: true,
    });
    expect(toolbar.textContent).toContain(entry.demos[0].label);
  });
}

it.each(["second", "unknown"])(
  "resolves the explicit demo parameter %s",
  async (demoId) => {
    const taro = await import("@tarojs/taro");
    const spy = vi.spyOn(taro, "getCurrentInstance").mockReturnValue({
      router: { params: { demo: demoId } },
    } as unknown as ReturnType<typeof taro.getCurrentInstance>);
    try {
      const { ComponentPage } =
        await import("../components/docs/ComponentPage");
      render(
        <ComponentPage
          entry={{
            ...button,
            demos: [
              {
                id: "first",
                label: "First",
                render: () => <View>First preview</View>,
              },
              {
                id: "second",
                label: "Second",
                render: () => <View>Second preview</View>,
              },
            ],
          }}
        />
      );
      expect(
        screen.getByRole("button", { name: "Choose variant" }).textContent
      ).toContain(demoId === "second" ? "Second" : "First");
    } finally {
      spy.mockRestore();
    }
  }
);

it("restarts the local image-generation sequence when Retry is pressed", async () => {
  const { entry } = await import("../official/image-generation");
  const Demo = entry.demos.find(
    (demo) => demo.label === "When it fails"
  )!.render;
  render(<Demo />);
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
});

for (const [slug, variant] of [
  ["input", "Docked composer"],
  ["textarea", "A composer that avoids the keyboard"],
]) {
  it(`keeps the ${slug} docked field at its intrinsic height inside a bounded scroller`, async () => {
    const { entry } = catalogModules[`../official/${slug}.tsx`];
    const Demo = entry.demos.find((demo) => demo.label === variant)!.render;
    const result = render(<Demo />);
    const field = screen.getByRole("textbox", { name: "Message" });
    expect(field.classList.contains("flex-1")).toBe(false);
    expect(result.container.querySelector(".h-0.flex-1")).not.toBeNull();
    expect(result.container.querySelector(".min-h-0.flex-1")).not.toBeNull();
  });
}

it("reserves the device bottom safe area so full-page demo descriptions clear the home indicator", async () => {
  const { ComponentPage } = await import("../components/docs/ComponentPage");
  const result = render(<ComponentPage entry={button} />);
  expect(
    (result.container.querySelector(".docs-shell") as HTMLElement).style
      .paddingBottom
  ).toBe("34px");
});
