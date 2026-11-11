// @vitest-environment happy-dom
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { ThemeSelector } from "../src/components/ThemeSelector";
import { ThemePreview } from "../src/components/ThemeSelector/theme-preview";
import { serializeSvgChildren } from "../src/primitives/static-svg";
import { getTheme, getThemePreference, setTheme } from "../src/theme/store";
import { readTaroStyle } from "./taro-style";

it("selection reads the live theme and light/dark stay in its family", () => {
  setTheme("moon");
  const change = vi.fn(() => expect(getTheme()).toBe("moon"));
  render(<ThemeSelector label="主题" onValueChange={change} />);
  expect(
    screen.getByRole("radio", { name: "Light" }).getAttribute("aria-selected")
  ).toBe("true");
  fireEvent.click(screen.getByRole("radio", { name: "Dark" }));
  expect(change).toHaveBeenCalledWith("dark");
  expect(getTheme()).toBe("moon-dark");
});
it("staged choice and disabled selection do not apply a theme", () => {
  setTheme("light");
  const change = vi.fn();
  const { rerender } = render(
    <ThemeSelector value="dark" applyTheme={false} onValueChange={change} />
  );
  fireEvent.click(screen.getByRole("radio", { name: "System" }));
  expect(change).toHaveBeenCalledWith("system");
  expect(getTheme()).toBe("light");
  rerender(<ThemeSelector disabled onValueChange={change} />);
  change.mockClear();
  fireEvent.click(screen.getByRole("radio", { name: "Dark" }));
  expect(change).not.toHaveBeenCalled();
});
it("system follows the platform and custom options replace the default row", () => {
  setTheme("grass-dark");
  render(
    <ThemeSelector>
      <ThemeSelector.Option value="system" label="跟随系统">
        自定义图
      </ThemeSelector.Option>
    </ThemeSelector>
  );
  expect(screen.getAllByRole("radio")).toHaveLength(1);
  fireEvent.click(screen.getByRole("radio", { name: "跟随系统" }));
  expect(getThemePreference()).toBe("system");
});
it("both original previews retain exact geometry, palettes and SVG clip references", () => {
  const { container, rerender } = render(
    <ThemePreview mode="system" variant="card" width={88} />
  );
  const image = container.querySelector("img");
  const svg = decodeURIComponent(
    image?.getAttribute("src")?.split(",")[1] ?? ""
  );
  expect(svg).toContain('viewBox="0 0 88 70"');
  expect(svg).toContain('d="M88 0V70H0Z"');
  expect(svg).toContain('fill="#c1704f"');
  expect(svg).toContain('clip-path="url(#panelui-theme-');
  expect(svg).toContain('<clipPath id="panelui-theme-');
  expect(readTaroStyle(image)).toContain('"width":"176rpx"');
  rerender(<ThemePreview mode="light" width={72} />);
  const windowSvg = decodeURIComponent(
    image?.getAttribute("src")?.split(",")[1] ?? ""
  );
  expect(windowSvg).toContain('d="M10 12a4 4 0 0 1 4-4h74v62H10V12Z"');
  expect(windowSvg).toContain('fill="#ffffff"');
});
it("static SVG serialization escapes text and rejects executable or external content", () => {
  expect(serializeSvgChildren(<text>{'<script>"&'}</text>)).toContain(
    "&lt;script&gt;&quot;&amp;"
  );
  expect(() => serializeSvgChildren(<rect onClick={() => {}} />)).toThrow(
    "Unsupported"
  );
  expect(() =>
    serializeSvgChildren(<image href="https://example.com/a.svg" />)
  ).toThrow("only SVG shapes");
});

it("serializes the upstream pattern definition for Flow grids", () => {
  expect(
    serializeSvgChildren(
      <pattern id="grid" width={12} height={12} patternUnits="userSpaceOnUse">
        <circle cx={1} cy={1} r={1} />
      </pattern>
    )
  ).toContain(
    '<pattern id="grid" width="12" height="12" patternUnits="userSpaceOnUse">'
  );
});

it("retains SVG coordinate attribute casing while serializing presentation attributes", () => {
  const markup = serializeSvgChildren(
    <defs>
      <linearGradient
        id="paint"
        gradientUnits="userSpaceOnUse"
        gradientTransform="rotate(30)"
        spreadMethod="reflect"
      >
        <stop offset={0} stopColor="red" />
      </linearGradient>
      <clipPath id="clip" clipPathUnits="userSpaceOnUse">
        <rect width={10} height={10} strokeWidth={2} />
      </clipPath>
      <pattern
        id="p"
        width={12}
        height={12}
        patternContentUnits="userSpaceOnUse"
        patternTransform="translate(3 4)"
      >
        <text textLength={12} lengthAdjust="spacingAndGlyphs">
          Test
        </text>
      </pattern>
    </defs>
  );
  for (const attribute of [
    "gradientUnits",
    "gradientTransform",
    "spreadMethod",
    "clipPathUnits",
    "patternContentUnits",
    "patternTransform",
    "textLength",
    "lengthAdjust",
  ]) {
    expect(markup).toContain(`${attribute}=`);
  }
  expect(markup).toContain('stroke-width="2"');
  expect(markup).toContain('stop-color="red"');
});
