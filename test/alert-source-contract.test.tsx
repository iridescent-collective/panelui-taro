// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { Alert } from "../src/components/Alert";
import { THEME_TOKENS } from "../src/theme/tokens";
import { readTaroStyle } from "./taro-style";

it("status indicator resolves original status glyph color and honors explicit override", () => {
  const { rerender } = render(
    <Alert variant="success">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>成功</Alert.Title>
        <Alert.Description>已保存</Alert.Description>
      </Alert.Content>
    </Alert>
  );
  expect(
    decodeURIComponent(
      screen.getByRole("img", { hidden: true }).getAttribute("src") ?? ""
    )
  ).toContain(THEME_TOKENS.light["success-foreground"]);
  expect(screen.getByRole("alert").className).toContain(
    "bg-[var(--panel-success-soft)]"
  );
  rerender(
    <Alert variant="warning">
      <Alert.Indicator iconProps={{ color: "#123456", size: 30 }} />
    </Alert>
  );
  expect(
    decodeURIComponent(
      screen.getByRole("img", { hidden: true }).getAttribute("src") ?? ""
    )
  ).toContain("#123456");
  expect(readTaroStyle(screen.getByRole("img", { hidden: true }))).toContain(
    "60rpx"
  );
});
it("indicator children and legacy root icon preserve both source composition paths", () => {
  const { rerender } = render(
    <Alert>
      <Alert.Indicator>自定义</Alert.Indicator>
    </Alert>
  );
  expect(screen.queryByRole("img", { hidden: true })).toBeNull();
  rerender(<Alert icon={<span>图标</span>}>正文</Alert>);
  expect(screen.getByRole("alert").textContent).toBe("图标正文");
});
