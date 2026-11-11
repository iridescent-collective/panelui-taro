// @vitest-environment happy-dom

import { act, render, renderHook, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Direction } from "../src/components/Direction";
import { PanelUIProvider } from "../src/components/Provider";
import { useDebouncedValue } from "../src/hooks/use-debounced-value";
import { useDirection, useDirectionSign } from "../src/hooks/use-direction";
import { useDisclosure } from "../src/hooks/use-disclosure";
import {
  IconColorProvider,
  ChevronLeftIcon,
  CheckIcon,
  GoogleIcon,
  BadgeCheckIcon,
} from "../src/icons";
import { useControllableState } from "../src/primitives/controllable-state";
import { resetTheme } from "../src/theme/store";
import { useTheme, useThemeMode } from "../src/theme/use-theme";

afterEach(() => {
  resetTheme();
  vi.useRealTimers();
});

const getValueKey = (value: { count: number }) => value.count;

describe("上游共享基础层", () => {
  it("受控请求不提前渲染，外部重置后解除受控保留最后接受的值", () => {
    const onChange = vi.fn();
    const onSettled = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }: { value: number | undefined }) =>
        useControllableState({ defaultValue: 1, onChange, onSettled, value }),
      { initialProps: { value: 4 as number | undefined } }
    );
    act(() => result.current.setValue(9));
    expect(onChange).toHaveBeenCalledWith(9);
    expect(result.current.value).toBe(4);
    expect(onSettled).not.toHaveBeenCalled();
    rerender({ value: 9 });
    expect(onSettled).toHaveBeenCalledWith(9);
    rerender({ value: undefined });
    expect(result.current.value).toBe(9);
    act(() => result.current.setValue((value) => value + 1));
    expect(result.current.value).toBe(10);
  });

  it("归一化的无变化请求不会通知，语义相同的受控对象不反复归一化", () => {
    const normalize = vi.fn((value: { count: number }) => ({
      count: Math.max(0, value.count),
    }));
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }) =>
        useControllableState({
          defaultValue: { count: 0 },
          getValueKey,
          isEqual: (a, b) => a.count === b.count,
          normalize,
          onChange,
          value,
        }),
      { initialProps: { value: { count: 4 } } }
    );
    const accepted = result.current.value;
    rerender({ value: { count: 4 } });
    expect(result.current.value).toBe(accepted);
    act(() => result.current.setValue({ count: 4 }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("Disclosure 在受控和非受控模式下遵循同一所有权契约", () => {
    const onOpenChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ open }) => useDisclosure({ onOpenChange, open }),
      { initialProps: { open: false as boolean | undefined } }
    );
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(false);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    rerender({ open: undefined });
    act(() => result.current.toggle());
    expect(result.current.props.open).toBe(true);
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  it("防抖值取消旧计时器并在卸载时清理", () => {
    vi.useFakeTimers();
    const { result, rerender, unmount } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: "a" } }
    );
    rerender({ value: "b" });
    act(() => vi.advanceTimersByTime(200));
    rerender({ value: "c" });
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe("a");
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe("c");
    rerender({ value: "d" });
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("嵌套 Direction 默认继承，显式方向覆盖只作用于子树", () => {
    const inherited = renderHook(() => [useDirection(), useDirectionSign()], {
      wrapper: ({ children }) => (
        <Direction dir="rtl">
          <Direction>{children}</Direction>
        </Direction>
      ),
    });
    expect(inherited.result.current).toEqual(["rtl", -1]);
    const local = renderHook(() => [useDirection(), useDirectionSign()], {
      wrapper: ({ children }) => (
        <Direction dir="rtl">
          <Direction dir="ltr">{children}</Direction>
        </Direction>
      ),
    });
    expect(local.result.current).toEqual(["ltr", 1]);
  });

  it("切换主题家族保留模式，切换模式保留家族，系统主题恢复 Panel", () => {
    const { result } = renderHook(() => ({ ...useTheme(), ...useThemeMode() }));
    act(() => result.current.setTheme("moon-dark"));
    expect(result.current.family.id).toBe("moon");
    act(() => result.current.setFamily("grass"));
    expect(result.current.theme).toBe("grass-dark");
    act(() => result.current.toggleMode());
    expect(result.current.theme).toBe("grass");
    act(() => result.current.setTheme("system"));
    expect(result.current.family.id).toBe("panel");
  });

  it("图标继承颜色且方向图标镜像，显式颜色优先", () => {
    render(
      <IconColorProvider color="#fafafa">
        <Direction dir="rtl">
          <ChevronLeftIcon />
          <CheckIcon color="#2783de" />
        </Direction>
      </IconColorProvider>
    );
    const images = screen.getAllByRole("img", { hidden: true });
    expect(decodeURIComponent(images[0].getAttribute("src") ?? "")).toContain(
      "#fafafa"
    );
    expect(images[0].parentElement?.getAttribute("style")).toContain(
      "scaleX(-1)"
    );
    expect(decodeURIComponent(images[1].getAttribute("src") ?? "")).toContain(
      "#2783de"
    );
  });

  it("品牌与双色图标保留源码配色，不被普通图标上下文覆盖", () => {
    render(
      <IconColorProvider color="#2783de">
        <GoogleIcon />
        <BadgeCheckIcon checkColor="#ff0000" />
      </IconColorProvider>
    );
    const images = screen.getAllByRole("img", { hidden: true });
    const google = decodeURIComponent(images[0].getAttribute("src") ?? "");
    for (const color of ["#4285F4", "#34A853", "#FBBC05", "#EA4335"]) {
      expect(google).toContain(color);
    }
    expect(decodeURIComponent(images[1].getAttribute("src") ?? "")).toContain(
      "#ff0000"
    );
  });

  it("Provider 关闭背景时保留主题变量和 children", () => {
    render(<PanelUIProvider background={false}>内容</PanelUIProvider>);
    expect(
      screen.getByText("内容").closest(".panelui-theme")?.className
    ).toContain("panelui-background-transparent");
  });
});
