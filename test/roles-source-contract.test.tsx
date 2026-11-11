// @vitest-environment happy-dom

import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";

import { ButtonGroup } from "../src/components/ButtonGroup";
import { Separator } from "../src/components/Separator";
import { ToggleButtonGroup } from "../src/components/ToggleButton";
import { Typography } from "../src/components/Typography";

it("compound groups, rules and typography expose native WeChat roles", () => {
  render(
    <>
      <ButtonGroup />
      <ToggleButtonGroup selectionMode="single">{null}</ToggleButtonGroup>
      <Separator decorative={false} />
      <Typography.List>条目</Typography.List>
    </>
  );
  for (const role of [
    "toolbar",
    "radiogroup",
    "separator",
    "list",
    "listitem",
  ]) {
    expect(screen.getByRole(role).dataset.weappRole).toBe(role);
  }
});
