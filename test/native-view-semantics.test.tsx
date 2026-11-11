// @vitest-environment happy-dom

import type * as TaroComponents from "@tarojs/components";
import { render } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { expect, it, vi } from "vitest";

import { AIInput } from "../src/components/AIInput";
import { Panelside } from "../src/components/Panelside";
import { Post } from "../src/components/Post";
import { PanelUIProvider } from "../src/components/Provider";
import { Questionnaire } from "../src/components/Questionnaire";
import { Select } from "../src/components/Select";
import { Timeline } from "../src/components/Timeline";

const native = vi.hoisted(() => ({
  views: [] as { role: unknown; nativeRole: unknown }[],
}));
vi.mock("@tarojs/components", async (original) => {
  const actual = await original<typeof TaroComponents>();
  const { createElement } = await import("react");
  return {
    ...actual,
    View: (props: ComponentProps<typeof actual.View>) => {
      native.views.push({
        nativeRole: Reflect.get(props, "aria-role"),
        role: props.role,
      });
      return createElement(actual.View, props);
    },
  };
});

const cases: { name: string; role: string; element: ReactNode }[] = [
  {
    element: (
      <AIInput>
        <AIInput.Toolbar>Actions</AIInput.Toolbar>
      </AIInput>
    ),
    name: "AIInput.Toolbar",
    role: "toolbar",
  },
  {
    element: <Panelside.GroupLabel>Group</Panelside.GroupLabel>,
    name: "Panelside.GroupLabel",
    role: "heading",
  },
  {
    element: (
      <Post>
        <Post.Votes score={12} />
      </Post>
    ),
    name: "Post.Votes",
    role: "group",
  },
  {
    element: (
      <Questionnaire>
        <Questionnaire.Item name="one">Question</Questionnaire.Item>
      </Questionnaire>
    ),
    name: "Questionnaire.Item",
    role: "radiogroup",
  },
  {
    element: (
      <Questionnaire>
        <Questionnaire.Item name="one" invalid>
          <Questionnaire.Error>Required</Questionnaire.Error>
        </Questionnaire.Item>
      </Questionnaire>
    ),
    name: "Questionnaire.Error",
    role: "alert",
  },
  {
    element: (
      <Questionnaire items={[{ name: "one" }]}>
        <Questionnaire.Progress />
      </Questionnaire>
    ),
    name: "Questionnaire.Progress",
    role: "progressbar",
  },
  {
    element: <Select.Group label="Choices">Options</Select.Group>,
    name: "Select.Group",
    role: "heading",
  },
  {
    element: (
      <Timeline.List
        data={["one"]}
        renderItem={() => <Timeline.Item step={0}>Event</Timeline.Item>}
      />
    ),
    name: "Timeline.List",
    role: "list",
  },
];

it.each(cases)("passes $name semantics to native View", ({ element, role }) => {
  native.views = [];
  render(<PanelUIProvider reducedMotion>{element}</PanelUIProvider>);
  const matching = native.views.filter((view) => view.role === role);
  expect(matching.length).toBeGreaterThan(0);
  for (const view of matching) {
    expect(view.nativeRole).toBe(role);
  }
});

it("keeps multiple Questionnaire.Item ungrouped on native View", () => {
  native.views = [];
  render(
    <PanelUIProvider reducedMotion>
      <Questionnaire>
        <Questionnaire.Item name="many" multiple>
          Questions
        </Questionnaire.Item>
      </Questionnaire>
    </PanelUIProvider>
  );
  expect(native.views.some((view) => view.role === "radiogroup")).toBe(false);
  expect(native.views.some((view) => view.nativeRole === "radiogroup")).toBe(
    false
  );
});
