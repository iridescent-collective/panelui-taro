// @vitest-environment happy-dom
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import {
  Avatar,
  avatarGroupCount,
  avatarGroupOverlap,
} from "../src/components/Avatar";
import { avatarSourceIdentity } from "../src/components/Avatar/avatar-source";
import { avatarImageUri } from "../src/components/Avatar/image-source";
import { Direction } from "../src/components/Direction";
import { sortCopy } from "../src/lib/sort-copy";
import { setTestMeasurement } from "./taro-api";
import { readTaroStyle } from "./taro-style";

it("failed equivalent sources stay on fallback and a changed request retries the image", () => {
  const error = vi.fn();
  const { container, rerender } = render(
    <Avatar
      source={{ uri: "/broken.png", width: 80 }}
      fallback="KA"
      imageProps={{ onError: error }}
    />
  );
  fireEvent.error(container.querySelector("img") as HTMLImageElement);
  expect(error).toHaveBeenCalledOnce();
  expect(screen.getByText("KA")).toBeTruthy();
  rerender(<Avatar source={{ uri: "/broken.png", width: 80 }} fallback="KA" />);
  expect(container.querySelector("img")).toBeNull();
  rerender(<Avatar source={{ uri: "/new.png" }} fallback="KA" />);
  expect(container.querySelector("img")?.getAttribute("src")).toBe("/new.png");
  expect(avatarSourceIdentity({ uri: "/broken.png", width: 80 })).toBe(
    avatarSourceIdentity({ uri: "/broken.png", width: 80 })
  );
});
it("group cap counts faces, preserves child size and keeps logical traversal order in RTL", () => {
  const { container } = render(
    <Direction dir="rtl">
      <Avatar.Group size="lg" max={2} total={6}>
        <Avatar key="a" fallback="A" size="sm" />
        <Avatar key="b" fallback="B" />
        <Avatar key="c" fallback="C" />
      </Avatar.Group>
    </Direction>
  );
  expect(screen.queryByText("C")).toBeNull();
  expect(screen.getByText("+4")).toBeTruthy();
  expect(screen.getByText("A").parentElement?.className).toContain("h-[64px]");
  const rows = container.querySelectorAll<HTMLElement>('[role="listitem"]');
  expect(readTaroStyle(rows[1])).toContain('"marginRight":"-36rpx"');
  expect(rows[0].textContent).toBe("A");
  expect(rows[2].textContent).toBe("+4");
  expect(avatarGroupCount(3, 0, 1)).toEqual({ overflow: 0, visible: 3 });
  expect(avatarGroupOverlap("sm", -4)).toBe(0);
});
it("overlay wrapper does not clip badges while the face and image stay circular", () => {
  const { container } = render(
    <Avatar fallback="A">
      <Avatar.Badge>2</Avatar.Badge>
    </Avatar>
  );
  expect(container.firstElementChild?.className).not.toContain(
    "overflow-hidden"
  );
  expect(screen.getByText("A").parentElement?.className).toContain(
    "rounded-full"
  );
  expect(screen.getByText("2").parentElement?.className).toContain("absolute");
});
it("Taro resource selection picks the smallest sufficient image without changing caller arrays", () => {
  setTestMeasurement(40, 375);
  const sources = [
    { uri: "large", width: 160 },
    { uri: "small", width: 40 },
    { uri: "fit", width: 80 },
  ];
  expect(avatarImageUri(sources, "md")).toBe("fit");
  expect(sources[0].uri).toBe("large");
  expect(sortCopy([3, 1, 2], (left, right) => left - right)).toEqual([1, 2, 3]);
});
