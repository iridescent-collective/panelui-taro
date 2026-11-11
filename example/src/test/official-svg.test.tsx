// @vitest-environment happy-dom
import { render } from "@testing-library/react";
import { expect, it } from "vitest";

import Svg, { Path, Circle } from "../runtime/svg";

it("keeps ticket artwork coordinates in its measured viewport rather than a 24-pixel icon box", () => {
  const { container } = render(
    <Svg width={280} height={400}>
      <Path d="M0 0H280V400H0Z" fill="#ffffff" />
      <Circle cx={140} cy={200} r={12} fill="#262626" />
    </Svg>
  );
  const image = container.querySelector("img");
  expect(decodeURIComponent(image?.getAttribute("src") ?? "")).toContain(
    'viewBox="0 0 280 400"'
  );
  expect(decodeURIComponent(image?.getAttribute("src") ?? "")).toContain(
    "<circle"
  );
});
