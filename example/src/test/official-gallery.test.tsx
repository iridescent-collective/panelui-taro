// @vitest-environment happy-dom
import { render } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";

import { setTheme, resetTheme } from "../../../src/theme/store";
import { ActivityBlock } from "../blocks/activity";
import { BoardingPassBlock } from "../blocks/boarding-pass";
import { SmartHomeBlock } from "../blocks/smart-home";
import { WalletBlock } from "../blocks/wallet";
import type { ComponentEntry } from "../types";

const modules = import.meta.glob<{ entry: ComponentEntry }>(
  "../official/*.tsx",
  { eager: true }
);

afterEach(resetTheme);

for (const { entry } of Object.values(modules)) {
  for (const demo of entry.demos) {
    it.each(["light", "dark"] as const)(
      `renders ${entry.name} / ${demo.label} in %s`,
      (theme) => {
        setTheme(theme);
        const Demo = demo.render;
        const { container } = render(<Demo />);
        expect(container.childNodes.length).toBeGreaterThan(0);
      }
    );
  }
}

for (const Block of [
  ActivityBlock,
  BoardingPassBlock,
  SmartHomeBlock,
  WalletBlock,
]) {
  it.each(["light", "dark"] as const)(
    `renders official block ${Block.name} in %s`,
    (theme) => {
      setTheme(theme);
      const { container } = render(<Block />);
      expect(container.childNodes.length).toBeGreaterThan(0);
    }
  );
}
