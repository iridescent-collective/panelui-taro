// @vitest-environment happy-dom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  Button,
  ButtonGroupProvider,
  useButtonGroup,
} from "../src/components/Button";
import { PanelUIProvider } from "../src/components/Provider";
import { CheckIcon } from "../src/icons";
import { useTheme } from "../src/theme/use-theme";

const Consumer = () => <Button>{useButtonGroup()?.size}</Button>;

describe("Button 逐项源码契约", () => {
  it("可配置按压幅度与透明度，并转发按入、按出和取消事件", () => {
    const onPressIn = vi.fn();
    const onPressOut = vi.fn();
    render(
      <Button
        pressScale={0.8}
        pressOpacity={0.4}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        按住
      </Button>
    );
    const button = screen.getByRole("button");
    fireEvent.touchStart(button, { touches: [{ clientX: 10, clientY: 10 }] });
    expect(button.getAttribute("style")).toContain("scale(0.8)");
    expect(button.getAttribute("style")).toContain("opacity: 0.4");
    expect(onPressIn).toHaveBeenCalledTimes(1);
    fireEvent.touchCancel(button);
    expect(button.getAttribute("style")).toContain("scale(1)");
    expect(onPressOut).toHaveBeenCalledTimes(1);
  });

  it("加载中不触发按压，减弱动态时保持静态", () => {
    const onPressIn = vi.fn();
    const { rerender } = render(
      <Button loading pressScale={0.7} onPressIn={onPressIn}>
        等待
      </Button>
    );
    fireEvent.touchStart(screen.getByRole("button"));
    expect(onPressIn).not.toHaveBeenCalled();
    rerender(
      <PanelUIProvider reducedMotion>
        <Button pressScale={0.7} onPressIn={onPressIn}>
          确认
        </Button>
      </PanelUIProvider>
    );
    fireEvent.touchStart(screen.getByRole("button"));
    expect(screen.getByRole("button").getAttribute("style")).toContain(
      "scale(1)"
    );
  });

  it("按钮图标随前景色与主题同步，显式图标颜色优先", () => {
    let changeTheme: ReturnType<typeof useTheme>["setTheme"] | undefined;
    const ThemeControl = () => {
      changeTheme = useTheme().setTheme;
      return <Button startContent={<CheckIcon />}>保存</Button>;
    };
    render(
      <PanelUIProvider>
        <ThemeControl />
      </PanelUIProvider>
    );
    expect(
      decodeURIComponent(
        screen.getByRole("img", { hidden: true }).getAttribute("src") ?? ""
      )
    ).toContain("#fafafa");
    act(() => changeTheme?.("dark"));
    expect(
      decodeURIComponent(
        screen.getByRole("img", { hidden: true }).getAttribute("src") ?? ""
      )
    ).toContain("#262626");
    act(() => changeTheme?.("light"));
  });

  it("公开分组 Provider 与 hook 可由其他组件复用", () => {
    render(
      <ButtonGroupProvider
        value={{
          attached: true,
          fullWidth: true,
          size: "xs",
          variant: "outline",
        }}
      >
        <Consumer />
      </ButtonGroupProvider>
    );
    expect(screen.getByRole("button").textContent).toBe("xs");
  });

  it("native 使用微信原生按钮并忽略自绘 slots 与 loading", () => {
    render(
      <Button
        native
        glass
        size="sm"
        loading
        startContent="图标"
        endContent="后置"
      >
        原生
      </Button>
    );
    expect(screen.queryByText("图标")).toBeNull();
    expect(screen.queryByText("后置")).toBeNull();
    expect(screen.getByRole("button").className).toContain(
      "panelui-button-native"
    );
  });

  it("无障碍名称接受上游 accessibilityLabel 并保留加载状态", () => {
    render(
      <Button loading accessibilityLabel="保存资料">
        <CheckIcon />
      </Button>
    );
    expect(
      screen.getByRole("button", { name: "保存资料" }).getAttribute("aria-busy")
    ).toBe("true");
  });
});

it("扩展触摸区域不改变根布局，也不重复原生授权按钮或 id", () => {
  const press = vi.fn();
  const { container } = render(
    <Button
      id="authorize-phone"
      openType="getPhoneNumber"
      className="flex-1"
      onPress={press}
    >
      授权
    </Button>
  );
  const button = screen.getByRole("button");
  expect(container.firstElementChild).toBe(button);
  expect(container.querySelectorAll("#authorize-phone")).toHaveLength(1);
  expect(container.querySelectorAll("button")).toHaveLength(1);
  expect(button.className).toContain("flex-1");
});
