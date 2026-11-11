// @vitest-environment happy-dom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { PageHeader } from "../src/components/PageHeader";
import { PanelUIProvider } from "../src/components/Provider";
import { THEME_TOKENS } from "../src/theme/tokens";
import { setElementMeasurement } from "./taro-api";
import { readTaroStyle } from "./taro-style";

it("default card follows upstream theme, cover size and avatar overlap", () => {
  render(
    <PanelUIProvider>
      <PageHeader data-testid="root">
        <PageHeader.Cover data-testid="cover" />
        <PageHeader.Avatar fallback="OR" data-testid="avatar" verified />
        <PageHeader.Content>
          <PageHeader.Title>Olivia</PageHeader.Title>
          <PageHeader.Description>@olivia</PageHeader.Description>
        </PageHeader.Content>
      </PageHeader>
    </PanelUIProvider>
  );
  expect(screen.getByTestId("root").className).toContain("panel-card");
  expect(readTaroStyle(screen.getByTestId("cover"))).toContain(
    '"height":"240rpx"'
  );
  expect(
    (screen.getByTestId("cover").firstElementChild as HTMLElement).style
      .backgroundImage
  ).toContain(THEME_TOKENS.light["chart-2"]);
  expect(readTaroStyle(screen.getByTestId("avatar"))).toContain(
    '"marginTop":"-80rpx"'
  );
  expect(screen.getByRole("heading", { name: "Olivia" })).toBeTruthy();
  expect(screen.getByText("@olivia").className).toContain(
    "panel-muted-foreground"
  );
});
it("coverless profiles stay in flow and explicit overlap overrides detection", () => {
  const tree = render(
    <PanelUIProvider>
      <PageHeader variant="page" align="start">
        <PageHeader.Avatar fallback="LC" data-testid="avatar" />
      </PageHeader>
    </PanelUIProvider>
  );
  expect(screen.getByTestId("avatar").style.marginTop).toBe("");
  tree.rerender(
    <PanelUIProvider>
      <PageHeader>
        <PageHeader.Cover />
        <PageHeader.Avatar
          size="sm"
          overlap={false}
          fallback="LC"
          data-testid="avatar"
        />
      </PageHeader>
    </PanelUIProvider>
  );
  expect(screen.getByTestId("avatar").style.marginTop).toBe("");
});
it("cover switches between vertical multi-stop gradients and labelled image", () => {
  const tree = render(
    <PanelUIProvider>
      <PageHeader>
        <PageHeader.Cover
          height={90}
          colors={["red", "green", "blue"]}
          data-testid="cover"
        />
      </PageHeader>
    </PanelUIProvider>
  );
  expect(readTaroStyle(screen.getByTestId("cover"))).toContain(
    '"height":"180rpx"'
  );
  expect(
    (screen.getByTestId("cover").firstElementChild as HTMLElement).style
      .backgroundImage
  ).toContain("red, green, blue");
  tree.rerender(
    <PanelUIProvider>
      <PageHeader>
        <PageHeader.Cover source={{ uri: "/cover.png" }} alt="Mountain" />
      </PageHeader>
    </PanelUIProvider>
  );
  expect(
    screen.getByRole("img", { name: "Mountain" }).getAttribute("src")
  ).toBe("/cover.png");
});
it("rows own inset and custom avatar badges take precedence over verification", () => {
  render(
    <PanelUIProvider>
      <PageHeader>
        <PageHeader.Row>
          <PageHeader.Avatar
            size="sm"
            verified
            badge={<span>Badge</span>}
            data-testid="avatar"
          >
            <span>Logo</span>
          </PageHeader.Avatar>
        </PageHeader.Row>
      </PageHeader>
    </PanelUIProvider>
  );
  const avatar = screen.getByTestId("avatar");
  expect(avatar.className).not.toContain("px-[24px]");
  expect(avatar.className).toContain("self-start");
  expect(readTaroStyle(avatar.firstElementChild as HTMLElement)).toContain(
    '"width":"80rpx"'
  );
  expect(screen.getByText("Badge")).toBeTruthy();
});
it("centered stacked stats share width, insert rules and respect explicit rule overrides", () => {
  render(
    <PanelUIProvider>
      <PageHeader>
        <PageHeader.Stats divided>
          <PageHeader.Stat value={533} label="Followers" data-testid="first" />
          <PageHeader.Stat value={24} label="Posts" data-testid="second" />
          <PageHeader.Stat
            value={8}
            label="Following"
            divided={false}
            data-testid="third"
          />
        </PageHeader.Stats>
      </PageHeader>
    </PanelUIProvider>
  );
  expect(screen.getByTestId("first").className).toContain("flex-1");
  expect(screen.getByTestId("first").className).not.toContain("border-s-[2px]");
  expect(screen.getByTestId("second").className).toContain("border-s-[2px]");
  expect(screen.getByTestId("third").className).not.toContain("border-s-[2px]");
  expect(screen.getByTestId("first").getAttribute("aria-label")).toBe(
    "533 Followers"
  );
});
it("inline stats are intrinsic width and activate only with an explicit callback", () => {
  const press = vi.fn();
  render(
    <PanelUIProvider>
      <PageHeader align="start">
        <PageHeader.Stats layout="inline">
          <PageHeader.Stat value={533} label="Followers" onPress={press} />
          <PageHeader.Stat value={24} label="Posts" />
        </PageHeader.Stats>
      </PageHeader>
    </PanelUIProvider>
  );
  const button = screen.getByRole("button", { name: "533 Followers" });
  expect(button.className).toContain("flex-row");
  expect(button.className).not.toContain("flex-1");
  fireEvent.click(button);
  expect(press).toHaveBeenCalledOnce();
  expect(screen.getAllByRole("button")).toHaveLength(1);
});
it("wide covers select an image for their measured dimensions instead of avatar dimensions", async () => {
  setElementMeasurement("profile-image-cover", {
    height: 120,
    left: 0,
    top: 0,
    width: 300,
  });
  render(
    <PanelUIProvider>
      <PageHeader>
        <PageHeader.Cover
          id="profile-image-cover"
          alt="Cover"
          source={[
            { height: 100, uri: "/avatar-sized.png", width: 200 },
            { height: 400, uri: "/cover-sized.png", width: 800 },
          ]}
        />
      </PageHeader>
    </PanelUIProvider>
  );
  await act(async () => {
    await Promise.resolve();
  });
  expect(screen.getByRole("img", { name: "Cover" }).getAttribute("src")).toBe(
    "/cover-sized.png"
  );
});
