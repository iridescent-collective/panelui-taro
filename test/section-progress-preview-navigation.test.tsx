// @vitest-environment happy-dom

import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { SectionProgressShowcase } from "../example/src/components/SectionProgressShowcase";
import { SectionRailShowcase } from "../example/src/components/SectionRailShowcase";
import { useSectionNavigation } from "../example/src/hooks/use-section-navigation";
import { PanelUIProvider } from "../src/components/Provider";
import { setElementCanvasNode } from "./taro-api";
import { TARO_TEST_EVENTS, dispatchTaroEvent } from "./taro-components";

it.each([
  {
    Showcase: SectionProgressShowcase,
    height: 300,
    id: "panel-sectionprogress-scroll",
    returnToStart: true,
  },
  {
    Showcase: SectionProgressShowcase,
    height: 300,
    id: "panel-sectionprogress-scroll",
    returnToStart: false,
  },
  {
    Showcase: SectionRailShowcase,
    height: 160,
    id: "panel-sectionrail-scroll",
    returnToStart: true,
  },
  {
    Showcase: SectionRailShowcase,
    height: 160,
    id: "panel-sectionrail-scroll",
    returnToStart: false,
  },
])(
  "native chapter navigation is independent of observed offsets: $id return=$returnToStart",
  async ({ Showcase, id, height, returnToStart }) => {
    const scrollTo = vi.fn();
    setElementCanvasNode(id, { scrollTo });
    const { container } = render(
      <PanelUIProvider reducedMotion>
        <Showcase />
      </PanelUIProvider>
    );
    const scroll = container.querySelector(`#${id}`) as Element;
    if (returnToStart) {
      act(() =>
        dispatchTaroEvent(scroll, TARO_TEST_EVENTS.scroll, {
          scrollHeight: 900,
          scrollTop: height * 2,
        })
      );
      expect(screen.getByText("当前：finish")).toBeTruthy();
    }
    fireEvent.click(screen.getByRole("button", { name: /Sections/u }));
    fireEvent.click(
      await screen.findByRole("menuitem", {
        name: returnToStart ? "Introduction" : /^Finish/u,
      })
    );
    await waitFor(() =>
      expect(scrollTo).toHaveBeenCalledWith({
        animated: true,
        duration: 300,
        top: returnToStart ? 0 : height * 2,
      })
    );
    act(() =>
      dispatchTaroEvent(scroll, TARO_TEST_EVENTS.scroll, {
        scrollHeight: 900,
        scrollTop: 200,
      })
    );
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scroll.getAttribute("scrolltop")).toBeNull();
  }
);

it.each(["superseded", "unmounted"] as const)(
  "ignores a %s native chapter request",
  async (reason) => {
    const scrollTo = vi.fn();
    setElementCanvasNode("chapter", { scrollTo });
    const sections = [{ id: "intro" }, { id: "finish" }];
    const { result, unmount } = renderHook(() =>
      useSectionNavigation("chapter", sections, 300)
    );
    act(() => {
      result.current("intro");
      if (reason === "superseded") {
        result.current("finish");
      }
    });
    if (reason === "unmounted") {
      unmount();
    }
    await act(async () => {
      await Promise.resolve();
    });
    expect(scrollTo).toHaveBeenCalledTimes(reason === "unmounted" ? 0 : 1);
    if (reason === "superseded") {
      expect(scrollTo).toHaveBeenCalledWith({
        animated: true,
        duration: 300,
        top: 300,
      });
    }
  }
);
