// @vitest-environment happy-dom
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Image } from "../src/components/Image";

it("shows loading until the image loads and forwards native dimensions", () => {
  const onLoad = vi.fn();
  const { container } = render(
    <Image
      source="/exercise.png"
      placeholder={<span>Loading image</span>}
      mode="widthFix"
      onLoad={onLoad}
    />
  );
  expect(screen.getByText("Loading image")).toBeTruthy();
  const image = container.querySelector("img")!;
  image.width = 200;
  image.height = 80;
  fireEvent.load(image);
  expect(screen.queryByText("Loading image")).toBeNull();
  expect(onLoad).toHaveBeenCalledWith({ detail: { height: 80, width: 200 } });
  expect(image.getAttribute("mode")).toBe("widthFix");
});

it("retries a failed source with a new image node and resets for a new source", () => {
  const onRetry = vi.fn();
  const { container, rerender } = render(
    <Image source="/broken.png" onRetry={onRetry} />
  );
  const failed = container.querySelector("img")!;
  fireEvent.error(failed);
  expect(screen.getByText("图片加载失败")).toBeTruthy();
  fireEvent.click(screen.getByText("重试"));
  expect(container.querySelector("img")).not.toBe(failed);
  expect(onRetry).toHaveBeenCalledOnce();
  fireEvent.error(container.querySelector("img")!);
  rerender(<Image source="/new.png" />);
  expect(screen.queryByText("图片加载失败")).toBeNull();
  expect(container.querySelector("img")?.getAttribute("src")).toBe("/new.png");
});
