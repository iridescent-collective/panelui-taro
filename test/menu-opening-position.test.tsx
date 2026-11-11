// @vitest-environment happy-dom
import { act, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Menu } from "../src/components/Menu";
import { PanelUIProvider } from "../src/components/Provider";
import * as taro from "./taro-api";
import { readTaroStyle } from "./taro-style";

it.each([false, true])(
  "waits for scroll content before revealing the first menu position (reduced: %s)",
  async (reduced) => {
    let releaseBody: (() => void) | undefined;
    const panelHeights: number[] = [];
    const query = vi
      .spyOn(taro, "createSelectorQuery")
      .mockImplementation(() => {
        let selector = "";
        let read:
          | ((rect: {
              width: number;
              height: number;
              left: number;
              top: number;
            }) => void)
          | undefined;
        const api = {
          in: () => api,
          select: (value: string) => {
            selector = value;
            return api;
          },
          boundingClientRect: (callback: typeof read) => {
            read = callback;
            return api;
          },
          exec: () =>
            queueMicrotask(() => {
              const id = selector.match(/#[^\s,]+/u)?.[0];
              const node = id ? document.querySelector(id) : null;
              const rect = { width: 200, height: 120, left: 100, top: 300 };
              if (node?.querySelector('[role="menu"]')) {
                const scroll = node.querySelector<HTMLElement>(
                  '[role="menu"] > .shrink'
                );
                const height =
                  Number.parseFloat(
                    JSON.parse(readTaroStyle(scroll) ?? "{}").height
                  ) / 2;
                panelHeights.push(height);
                read?.({ ...rect, height });
              } else if (node?.textContent?.includes("Share")) {
                releaseBody = () => read?.(rect);
              } else {
                read?.({ ...rect, width: 80, height: 40 });
              }
            }),
        };
        return api as unknown as ReturnType<typeof taro.createSelectorQuery>;
      });
    try {
      render(
        <PanelUIProvider reducedMotion={reduced}>
          <Menu defaultOpen>
            <Menu.Trigger>
              <button>Options</button>
            </Menu.Trigger>
            <Menu.Content>
              <Menu.Item>Share</Menu.Item>
            </Menu.Content>
          </Menu>
        </PanelUIProvider>
      );
      const flush = () =>
        act(async () => {
          for (let i = 0; i < 12; i += 1) await Promise.resolve();
        });
      await flush();
      const menu = screen.getByRole("menu", { hidden: true });
      expect(releaseBody).toBeTypeOf("function");
      expect(menu.style.opacity).toBe("0");
      expect(panelHeights).toEqual([]);
      await act(async () => releaseBody?.());
      await flush();
      expect(panelHeights[0]).toBe(120);
      await waitFor(() => expect(menu.style.opacity).toBe("1"));
      expect(JSON.parse(readTaroStyle(menu.parentElement) ?? "{}").top).toBe(
        "696rpx"
      );
    } finally {
      query.mockRestore();
    }
  }
);
