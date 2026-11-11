// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import {
  CanvasPaintStack,
  useCanvasPaintOccluded,
} from "../src/primitives/canvas-paint-context";
import { ModalPortal, Portal } from "../src/primitives/portal";

const Probe = ({ name }: { name: string }) => (
  <output data-testid={name}>{String(useCanvasPaintOccluded())}</output>
);

it("retains higher-layer occlusion until its final owner releases and tolerates duplicate cleanup", () => {
  const stack = new CanvasPaintStack();
  const change = vi.fn();
  stack.subscribe(change);
  const low = stack.acquire(1);
  const high = stack.acquire(3);
  const duplicate = stack.acquire(3);
  low();
  expect(stack.getSnapshot()).toBe(3);
  high();
  high();
  expect(stack.getSnapshot()).toBe(3);
  duplicate();
  expect(stack.getSnapshot()).toBe(0);
  expect(change).toHaveBeenCalledTimes(3);
});

it("only occludes paint beneath the top portal and keeps exiting paint in the shared SVG layer", () => {
  const App = ({
    child = true,
    active = true,
  }: {
    child?: boolean;
    active?: boolean;
  }) => (
    <PanelUIProvider>
      <Probe name="page" />
      <ModalPortal interactive={active}>
        <Probe name="parent" />
        {child ? (
          <Portal>
            <Probe name="child" />
          </Portal>
        ) : null}
      </ModalPortal>
    </PanelUIProvider>
  );
  const { rerender } = render(<App />);
  expect(screen.getByTestId("page").textContent).toBe("true");
  expect(screen.getByTestId("parent").textContent).toBe("true");
  expect(screen.getByTestId("child").textContent).toBe("false");
  rerender(<App child={false} />);
  expect(screen.getByTestId("parent").textContent).toBe("false");
  rerender(<App child={false} active={false} />);
  expect(screen.getByTestId("parent").textContent).toBe("true");
  expect(screen.getByTestId("page").textContent).toBe("true");
  rerender(
    <PanelUIProvider>
      <Probe name="page" />
    </PanelUIProvider>
  );
  expect(screen.getByTestId("page").textContent).toBe("false");
});

it("shares occlusion across nested theme providers without requiring a portal for a standalone paint hook", () => {
  const { rerender } = render(<Probe name="plain" />);
  expect(screen.getByTestId("plain").textContent).toBe("false");
  rerender(
    <PanelUIProvider>
      <PanelUIProvider>
        <Probe name="nested" />
      </PanelUIProvider>
      <Portal>
        <Probe name="top" />
      </Portal>
    </PanelUIProvider>
  );
  expect(screen.getByTestId("nested").textContent).toBe("true");
  expect(screen.getByTestId("top").textContent).toBe("false");
});

it("coordinates sibling providers whose portals share the page viewport", () => {
  const { rerender } = render(
    <>
      <PanelUIProvider>
        <Probe name="sibling" />
      </PanelUIProvider>
      <PanelUIProvider>
        <Portal>
          <Probe name="modal" />
        </Portal>
      </PanelUIProvider>
    </>
  );
  expect(screen.getByTestId("sibling").textContent).toBe("true");
  expect(screen.getByTestId("modal").textContent).toBe("false");
  rerender(
    <>
      <PanelUIProvider>
        <Probe name="sibling" />
      </PanelUIProvider>
      <PanelUIProvider />
    </>
  );
  expect(screen.getByTestId("sibling").textContent).toBe("false");
});
