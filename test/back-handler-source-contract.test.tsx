// @vitest-environment happy-dom

import { act, render } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { useBackHandler } from "../src/hooks/use-back-handler";
import { BackHandlerStore } from "../src/primitives/back-handler-store";
import { ModalPortal } from "../src/primitives/portal";
import { dispatchTaroEvent, TARO_TEST_EVENTS } from "./taro-components";

const Owner = ({ onBack }: { onBack: () => void }) => {
  useBackHandler(true, onBack);
  return null;
};
it("visual layer order wins even when descendant effects register before their parent", () => {
  const store = new BackHandlerStore();
  const parent = vi.fn();
  const child = vi.fn();
  store.acquire("child", 2, child);
  store.acquire("parent", 1, parent);
  store.trigger();
  expect(child).toHaveBeenCalledOnce();
  expect(parent).not.toHaveBeenCalled();
});
it("a page elects one native host and transfers it when the current provider unmounts", () => {
  const store = new BackHandlerStore();
  const first = store.registerHost("first");
  store.registerHost("second");
  expect(store.getSnapshot().host).toBe("first");
  first();
  expect(store.getSnapshot().host).toBe("second");
});
it("shared page hosts render one PageContainer and rearm after a refused close", () => {
  const back = vi.fn();
  const { container } = render(
    <>
      <PanelUIProvider>
        <ModalPortal>
          <Owner onBack={back} />
        </ModalPortal>
      </PanelUIProvider>
      <PanelUIProvider>second provider</PanelUIProvider>
    </>
  );
  const initial = container.querySelectorAll("section");
  expect(initial).toHaveLength(1);
  act(() => dispatchTaroEvent(initial[0], TARO_TEST_EVENTS.beforeLeave, {}));
  expect(back).toHaveBeenCalledOnce();
  act(() => dispatchTaroEvent(initial[0], TARO_TEST_EVENTS.afterLeave, {}));
  expect(container.querySelector("section")).not.toBe(initial[0]);
});
