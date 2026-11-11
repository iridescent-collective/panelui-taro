// @vitest-environment happy-dom

import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { Support } from "../src/components/Support";

it("availability reaches status and agent, with explicit overrides and typing priority", () => {
  render(
    <PanelUIProvider>
      <Support availability="away">
        <Support.Status />
        <Support.Agent name="Ada" role="Support" />
        <Support.Agent name="Lin" availability="online" typing />
        <Support.Status availability="offline" />
      </Support>
    </PanelUIProvider>
  );
  expect(screen.getByText("Away at the moment")).toBeTruthy();
  expect(screen.getByText("Nobody is here right now")).toBeTruthy();
  expect(screen.getByLabelText("Ada, Support, Away")).toBeTruthy();
  expect(screen.getByLabelText("Lin, typing")).toBeTruthy();
  expect(screen.getByText("Typing…")).toBeTruthy();
});
it("topics own one selection, refuse disabled rows, and native callbacks preserve selection", () => {
  const change = vi.fn();
  const press = vi.fn();
  render(
    <PanelUIProvider>
      <Support.Topics onValueChange={change}>
        <Support.Topic value="a" label="Billing" onClick={press} />
        <Support.Topic value="b" label="Offline" disabled />
      </Support.Topics>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByLabelText("Billing"));
  expect(change).toHaveBeenCalledWith("a");
  expect(screen.getByLabelText("Billing").getAttribute("aria-selected")).toBe(
    "true"
  );
  expect(press).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByLabelText("Offline"));
  expect(change).toHaveBeenCalledTimes(1);
});
it("controlled topics request changes without replacing the caller's value", () => {
  const change = vi.fn();
  render(
    <PanelUIProvider>
      <Support.Topics value="a" onValueChange={change}>
        <Support.Topic value="a" label="Alpha" />
        <Support.Topic value="b" label="Beta" />
      </Support.Topics>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByLabelText("Beta"));
  expect(change).toHaveBeenCalledWith("b");
  expect(screen.getByLabelText("Alpha").getAttribute("aria-selected")).toBe(
    "true"
  );
  expect(screen.getByLabelText("Beta").getAttribute("aria-selected")).toBe(
    "false"
  );
});
it("reply passes declared values or its label, and disabled reply never sends", () => {
  const reply = vi.fn();
  render(
    <PanelUIProvider>
      <Support.Replies>
        <Support.Reply label="Talk to someone" value="human" onPress={reply} />
        <Support.Reply label="Resolved" onPress={reply} />
        <Support.Reply label="Disabled" disabled onPress={reply} />
      </Support.Replies>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByLabelText("Talk to someone"));
  fireEvent.click(screen.getByLabelText("Resolved"));
  fireEvent.click(screen.getByLabelText("Disabled"));
  expect(reply.mock.calls).toEqual([["human"], ["Resolved"]]);
});
it("all conversation states preserve source wording, unread precedence and ticket metadata", () => {
  render(
    <PanelUIProvider>
      <Support.Conversations title="Requests">
        <Support.Conversation
          title="Payment"
          status="pending"
          unread
          updated
          timestamp="2h"
          onPress={vi.fn()}
        />
        <Support.Conversation title="Account" status="solved" />
      </Support.Conversations>
      <Support.Ticket reference="A-12" subject="Login" status="closed" />
    </PanelUIProvider>
  );
  expect(
    screen.getByLabelText("Payment, Waiting on you, unread, 2h")
  ).toBeTruthy();
  expect(screen.getByText("Solved")).toBeTruthy();
  expect(screen.getByLabelText("Login, A-12, Closed")).toBeTruthy();
});
it("keeps every public part and source dimensions and theme classes", () => {
  const { container } = render(
    <PanelUIProvider>
      <Support>
        <Support.Header title="Help" description="Support team" />
        <Support.Status />
        <Support.Channels>
          <Support.Channel label="Message" icon={<span>icon</span>} />
        </Support.Channels>
        <Support.Articles>
          <Support.Article title="Guide" />
        </Support.Articles>
        <Support.Handoff>Transferred</Support.Handoff>
        <Support.Note>Wait here</Support.Note>
        <Support.Resolution />
      </Support>
    </PanelUIProvider>
  );
  expect(
    Object.keys(Support).filter((key) => key !== "$$typeof" && key !== "render")
  ).toEqual(
    expect.arrayContaining([
      "Header",
      "Status",
      "Channels",
      "Channel",
      "Topics",
      "Topic",
      "Conversations",
      "Conversation",
      "Articles",
      "Article",
      "Agent",
      "Ticket",
      "Handoff",
      "Note",
      "Replies",
      "Reply",
      "Resolution",
    ])
  );
  expect(container.querySelector(".size-\\[16px\\]")).toBeTruthy();
  expect(screen.getByText("icon").parentElement?.className).toContain(
    "size-[72px]"
  );
  expect(screen.getByText("Transferred").className).toContain("text-[24px]");
  expect(screen.getByText("Wait here").className).toContain("text-[24px]");
  expect(screen.getByText("Did this solve it?")).toBeTruthy();
});
it("publishes semantic roles through the WeChat template channel", () => {
  render(
    <PanelUIProvider>
      <Support.Topics title="Topics">
        <Support.Topic value="a" label="A" />
      </Support.Topics>
      <Support.Agent name="Ada" />
      <Support.Handoff>Human handoff</Support.Handoff>
    </PanelUIProvider>
  );
  expect(screen.getByRole("radiogroup").dataset.weappRole).toBe("radiogroup");
  expect(screen.getByRole("heading").dataset.weappRole).toBe("heading");
  expect(screen.getByRole("alert").dataset.weappRole).toBe("alert");
});
