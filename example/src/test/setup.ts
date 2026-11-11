import type * as PanelTestModule0 from "@testing-library/react";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

vi.mock("@testing-library/react", async (importOriginal) => {
  const actual = await importOriginal<typeof PanelTestModule0>();
  const { createElement } = await import("react");
  const { PanelUIProvider } = await import("panelui-taro/provider");
  return {
    ...actual,
    render: (
      ui: Parameters<typeof actual.render>[0],
      options?: Parameters<typeof actual.render>[1]
    ) => {
      const Wrapper = options?.wrapper;
      return actual.render(ui, {
        ...options,
        wrapper: ({ children }) =>
          createElement(
            PanelUIProvider,
            { reducedMotion: true },
            Wrapper ? createElement(Wrapper, null, children) : children
          ),
      });
    },
  };
});

vi.mock("../../../src/primitives/back-handler-host", () => ({
  BackHandlerHost: () => null,
}));
