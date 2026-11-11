// @vitest-environment happy-dom

import { fireEvent, render, renderHook, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Input } from "../src/components/Input";
import {
  InputFocusScope,
  useInputFocusScope,
} from "../src/primitives/input-focus";

it("a late blur cannot remove the new input holder and independent scopes do not share focus", () => {
  const scope = new InputFocusScope();
  const first = Symbol("first-input");
  const next = Symbol("next-input");
  scope.claim(first, "first");
  scope.claim(next, "next");
  scope.release(first);
  expect(scope.read()).toBe("next");
  expect(new InputFocusScope().read()).toBeNull();
  scope.release(next);
  expect(scope.read()).toBeNull();
});
it("actual Panel Input focus owns the page registry and unmount releases only its own field", () => {
  const hook = renderHook(useInputFocusScope);
  const tree = render(
    <>
      <Input id="focus-first" accessibilityLabel="First" />
      <Input id="focus-next" accessibilityLabel="Next" />
    </>
  );
  fireEvent.focus(screen.getByRole("textbox", { name: "First" }));
  expect(hook.result.current.read()).toBe("focus-first");
  fireEvent.focus(screen.getByRole("textbox", { name: "Next" }));
  fireEvent.blur(screen.getByRole("textbox", { name: "First" }));
  expect(hook.result.current.read()).toBe("focus-next");
  tree.unmount();
  expect(hook.result.current.read()).toBeNull();
});
