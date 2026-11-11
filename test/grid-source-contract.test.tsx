// @vitest-environment happy-dom

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { URL as NodeURL, fileURLToPath } from "node:url";

import { render, screen, waitFor } from "@testing-library/react";
import ts from "typescript";
import { expect, it } from "vitest";

import { GridItem } from "../src/components/GridItem";
import { gridPlacements } from "../src/components/GridItem/layout";
import { setTestMeasurement } from "./taro-api";
import { readTaroStyle } from "./taro-style";

it("row-major packing fills beside a tall tile before opening a new row", () => {
  expect(gridPlacements([{ rowSpan: 2 }, {}, {}, { colSpan: 2 }], 2)).toEqual({
    placements: [
      { colSpan: 1, column: 0, row: 0, rowSpan: 2 },
      { colSpan: 1, column: 1, row: 0, rowSpan: 1 },
      { colSpan: 1, column: 1, row: 1, rowSpan: 1 },
      { colSpan: 2, column: 0, row: 2, rowSpan: 1 },
    ],
    rows: 3,
  });
});
it("measurement positions real tiles and caller styles preserve the calculated group height", async () => {
  setTestMeasurement(200, 375);
  render(
    <GridItem.Group columns={2} gap={12} style={{ backgroundColor: "red" }}>
      <GridItem rowSpan={2}>
        <GridItem.Title>A</GridItem.Title>
      </GridItem>
      <GridItem>
        <GridItem.Title>B</GridItem.Title>
      </GridItem>
      <GridItem>
        <GridItem.Title>C</GridItem.Title>
      </GridItem>
      <GridItem colSpan={2}>
        <GridItem.Title>D</GridItem.Title>
      </GridItem>
    </GridItem.Group>
  );
  await waitFor(() => expect(screen.getByText("C")).toBeTruthy());
  expect(readTaroStyle(screen.getByRole("list"))).toContain(
    '"height":"612rpx"'
  );
  const secondRow = screen.getByText("C").parentElement?.parentElement;
  expect(readTaroStyle(secondRow)).toContain('"top":"212rpx"');
});
it("invalid numeric spans cannot trap the placement scan in an infinite loop", () => {
  const path = fileURLToPath(
    new NodeURL("../src/components/GridItem/layout.ts", import.meta.url)
  );
  const code = ts.transpileModule(fs.readFileSync(path, "utf-8"), {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const output = execFileSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `${code}\nprocess.stdout.write(JSON.stringify(gridPlacements([{ colSpan: NaN, rowSpan: Infinity }], 2)));`,
    ],
    { encoding: "utf-8", timeout: 750 }
  );
  expect(JSON.parse(output)).toEqual({
    placements: [{ colSpan: 1, column: 0, row: 0, rowSpan: 1 }],
    rows: 1,
  });
});
it("pressable tiles retain column layout and their decoration neither takes touches nor loses positioning", () => {
  render(
    <GridItem onPress={() => {}}>
      <GridItem.Background
        style={{ backgroundColor: "red" }}
        data-testid="decoration"
      />
      <GridItem.Value>42</GridItem.Value>
      <GridItem.Footer>操作</GridItem.Footer>
    </GridItem>
  );
  expect(screen.getByRole("button").className).toContain("flex-col");
  expect(readTaroStyle(screen.getByTestId("decoration"))).toContain(
    '"pointerEvents":"none"'
  );
  expect(readTaroStyle(screen.getByTestId("decoration"))).toContain(
    '"position":"absolute"'
  );
});
