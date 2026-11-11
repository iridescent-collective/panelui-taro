// @vitest-environment happy-dom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Post } from "../src/components/Post";
import { PostCount } from "../src/components/Post/motion-parts";
import { initials, numeric, tokenize } from "../src/components/Post/utils";
import { PanelUIProvider } from "../src/components/Provider";
import { HeartIcon } from "../src/icons";
import fixtures from "./fixtures/post-source.json";

it("a changed count retains the exiting value for source 160ms and settles the new value", () => {
  vi.useFakeTimers();
  const { rerender } = render(
    <PanelUIProvider>
      <PostCount value={215} />
    </PanelUIProvider>
  );
  rerender(
    <PanelUIProvider>
      <PostCount value={216} />
    </PanelUIProvider>
  );
  expect(screen.getByText("215")).toBeTruthy();
  act(() => vi.advanceTimersByTime(80));
  expect(screen.getByText("215")).toBeTruthy();
  act(() => vi.advanceTimersByTime(80));
  expect(screen.queryByText("215")).toBeNull();
  expect(screen.getByText("216")).toBeTruthy();
  vi.useRealTimers();
});
it("nested vote and tag interactions do not open the parent post", () => {
  const open = vi.fn();
  const vote = vi.fn();
  const tag = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Post onPress={open}>
        <Post.Body onTagPress={tag}>Read #Learning.</Post.Body>
        <Post.Footer>
          <Post.Votes score={12} onVote={vote} />
        </Post.Footer>
      </Post>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Upvote" }));
  expect(vote).toHaveBeenCalledWith("up");
  expect(open).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText("#Learning"));
  expect(tag).toHaveBeenCalledWith("Learning");
  expect(open).not.toHaveBeenCalled();
});
it("root Taro click, nested stat click and source haptics compose", () => {
  const open = vi.fn();
  const stat = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Post onClick={open}>
        <Post.Footer>
          <Post.Stat icon={HeartIcon} value={20} active onClick={stat} />
        </Post.Footer>
      </Post>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByText("20"));
  expect(stat).toHaveBeenCalledTimes(1);
  expect(open).not.toHaveBeenCalled();
});

for (const fixture of fixtures.tokens) {
  it(`upstream tokenization ${fixture.input}`, () => {
    expect(tokenize(fixture.input)).toEqual(fixture.result);
  });
}
for (const fixture of fixtures.numeric) {
  it(`upstream numeric ${fixture.input}`, () => {
    expect(numeric(fixture.input)).toEqual(fixture.result);
  });
}
for (const fixture of fixtures.initials) {
  it(`upstream initials ${fixture.input}`, () => {
    expect(initials(fixture.input)).toEqual(fixture.result);
  });
}
it("source header places actions last, compact author inlines handle, and all anatomy composes", () => {
  const { container } = render(
    <PanelUIProvider reducedMotion>
      <Post variant="compact">
        <Post.Header id="header">
          <Post.Action id="action">Menu</Post.Action>
          <Post.Author
            name="Dwayne White"
            handle="@dwayne"
            verified
            timestamp="3m ago"
          />
        </Post.Header>
        <Post.Community name="r/learning" meta="today" />
        <Post.Title>Headline</Post.Title>
        <Post.Body>Body</Post.Body>
        <Post.Footer>
          <Post.Stat value="Save" align="end" />
        </Post.Footer>
      </Post>
    </PanelUIProvider>
  );
  expect(container.querySelector("#header")?.lastElementChild?.id).toBe(
    "action"
  );
  for (const label of [
    "@dwayne",
    "Dwayne White",
    "r/learning",
    "Headline",
    "Save",
  ]) {
    expect(screen.getByText(label)).toBeTruthy();
  }
});
it.each(["feed", "vote", "compact", "media"] as const)(
  "source %s variant retains its media scrim rule and fixed geometry",
  (variant) => {
    const { container } = render(
      <PanelUIProvider reducedMotion>
        <Post variant={variant}>
          <Post.Media
            source={{ uri: "https://example.com/photo.png" }}
            alt="Photo"
            id="photo"
            overlay={<span>Overlay</span>}
          />
        </Post>
      </PanelUIProvider>
    );
    expect(container.querySelector("img")?.getAttribute("src")).toBe(
      "https://example.com/photo.png"
    );
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBe(
      variant === "media" ? 1 : 0
    );
    expect(screen.getByText("Overlay")).toBeTruthy();
  }
);
it("vote selection is controlled, repeated arrows clear, disabled arrows suppress callbacks", () => {
  const vote = vi.fn();
  const { rerender } = render(
    <PanelUIProvider reducedMotion>
      <Post.Votes score="1,200" vote="up" onVote={vote} />
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Upvote" }));
  expect(vote).toHaveBeenLastCalledWith(null);
  fireEvent.click(screen.getByRole("button", { name: "Downvote" }));
  expect(vote).toHaveBeenLastCalledWith("down");
  rerender(
    <PanelUIProvider reducedMotion>
      <Post.Votes score="1,200" vote="up" onVote={vote} disabled />
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Downvote" }));
  expect(vote).toHaveBeenCalledTimes(2);
});
it("mention callbacks receive the unprefixed source token and media click preserves root isolation", () => {
  const mention = vi.fn();
  const media = vi.fn();
  const open = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Post onPress={open}>
        <Post.Body onMentionPress={mention}>Hello @parent.</Post.Body>
        <Post.Media
          source="https://example.com/photo.png"
          alt="Open image"
          onPress={media}
        />
      </Post>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByText("@parent"));
  expect(mention).toHaveBeenCalledWith("parent");
  expect(open).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Open image" }));
  expect(media).toHaveBeenCalledTimes(1);
  expect(open).not.toHaveBeenCalled();
});
