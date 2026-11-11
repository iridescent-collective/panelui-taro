// @vitest-environment happy-dom
import { setClipboardData } from "@tarojs/taro";
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import type { ChatTurn } from "../../type";
import { ReplyActions } from "./index";
const turn: ChatTurn = {
  id: "answer",
  role: "assistant",
  text: "An answer",
  kind: "general",
  phase: "complete",
};
for (const phase of ["complete", "error", "stopped"] as const) {
  it(`keeps upstream Copy / Retry labels for a ${phase} reply`, () => {
    const retry = vi.fn();
    render(
      <ReplyActions
        turn={{ ...turn, phase }}
        last
        busy={false}
        onRetry={retry}
      />
    );
    expect(
      screen.getAllByRole("button").map((button) => button.textContent?.trim())
    ).toEqual(["Copy", "Retry"]);
    expect(screen.queryByText("Regenerate")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(retry).toHaveBeenCalledTimes(1);
  });
}
it("copies through the WeChat adapter without adding a custom inline status", async () => {
  vi.mocked(setClipboardData).mockResolvedValueOnce({
    errMsg: "ok",
    data: "An answer",
  });
  render(<ReplyActions turn={turn} last busy={false} onRetry={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "Copy" }));
  expect(setClipboardData).toHaveBeenCalledWith({ data: "An answer" });
  expect(screen.queryByRole("status")).toBeNull();
});
