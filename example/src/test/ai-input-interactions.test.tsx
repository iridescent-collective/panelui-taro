// @vitest-environment happy-dom
import { chooseMedia, chooseMessageFile, showToast } from "@tarojs/taro";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { ComponentPage } from "../components/docs/ComponentPage";
import { entry } from "../official/ai-input";

vi.mock("@tarojs/taro", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tarojs/taro")>()),
  chooseMedia: vi.fn(async () => ({
    tempFiles: [{ tempFilePath: "/tmp/photo.jpg" }],
  })),
  chooseMessageFile: vi.fn(async () => ({
    tempFiles: [{ path: "/tmp/example.txt" }],
  })),
  showToast: vi.fn(async () => ({})),
}));

const mount = (label = "At rest") => {
  const Demo = entry.demos.find((demo) => demo.label === label)!.render;
  return render(<Demo />);
};
const click = (name: string) =>
  fireEvent.click(screen.getByRole("button", { name }));

it("switches through all eight variants and can reopen the picker after each switch", async () => {
  render(<ComponentPage entry={entry} />);
  for (const demo of entry.demos) {
    click("Choose variant");
    const choice = await screen.findByRole("button", {
      name: `aiInput ${demo.label} variant`,
    });
    fireEvent.click(choice);
    if (demo.label === "The sheet it opens") {
      fireEvent.click(await screen.findByRole("button", { name: "Close" }));
    }
    expect(
      (await screen.findByRole("button", { name: "Choose variant" }))
        .textContent
    ).toContain(demo.label);
  }
});

for (const label of [
  "At rest",
  "On one line",
  "Past one line",
  "While the answer arrives",
  "While recording",
  "In a chat",
]) {
  it(`supports add, recording and send/stop in ${label}`, async () => {
    mount(label);
    if (label === "While recording") click("Discard recording");
    if (label === "While the answer arrives") click("Stop");
    click("Add to chat");
    expect(await screen.findByText("Tool access")).toBeDefined();
    click("Close");
    click("Dictate");
    expect(screen.getByText(/no microphone capture/)).toBeDefined();
    click("Discard recording");
    click("Dictate");
    click("Use recording");
    expect(screen.getByRole("textbox")).toHaveProperty(
      "value",
      "Recorded prompt"
    );
    click("Send");
    expect(screen.getByRole("button", { name: "Stop" })).toBeDefined();
    if (label === "In a chat")
      expect(screen.getByText("Recorded prompt")).toBeDefined();
    click("Stop");
    expect(
      screen
        .getByRole("button", { name: "Voice mode" })
        .getAttribute("aria-disabled")
    ).not.toBe("true");
  });
}

for (const label of ["At rest", "In a chat"]) {
  it(`changes model and opens/closes voice mode in ${label}`, async () => {
    mount(label);
    click("Change model");
    fireEvent.click(await screen.findByRole("radio", { name: /Opus 4.6/ }));
    expect(
      screen.getByRole("button", { name: "Change model" }).textContent
    ).toContain("Opus 4.6");
    click("Voice mode");
    fireEvent.click(await screen.findByRole("button", { name: "Mute" }));
    expect(screen.getByText("Muted")).toBeDefined();
    click("Unmute");
    click("End voice mode");
    expect(
      screen.getAllByRole("dialog", { hidden: true }).length
    ).toBeGreaterThan(0);
    expect(await screen.findByRole("textbox")).toBeDefined();
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { hidden: true })).toBeNull()
    );
  });
}

it("supports nested sheet choices, toggles, new projects and real file picker adapters", async () => {
  mount("The sheet it opens");
  click("All photos");
  await waitFor(() =>
    expect(chooseMedia).toHaveBeenCalledWith(
      expect.objectContaining({ sourceType: ["album"] })
    )
  );
  fireEvent.click(screen.getByRole("button", { name: /Camera/ }));
  await waitFor(() =>
    expect(chooseMedia).toHaveBeenCalledWith(
      expect.objectContaining({ sourceType: ["camera"] })
    )
  );
  fireEvent.click(screen.getByRole("button", { name: /Add files/ }));
  await waitFor(() => expect(chooseMessageFile).toHaveBeenCalled());
  expect(
    await screen.findByText("1 file selected · not uploaded")
  ).toBeDefined();
  const research = screen.getByRole("switch", { name: "Research" });
  fireEvent.click(research);
  expect(research.getAttribute("aria-checked")).toBe("true");
  fireEvent.click(screen.getByRole("button", { name: /Tool access/ }));
  fireEvent.click(
    await screen.findByRole("radio", { name: /Always available/ })
  );
  click("Back");
  expect(await screen.findByText("Always available")).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: /Add to project/ }));
  click("New project");
  expect(await screen.findByText("Demo project 3")).toBeDefined();
  click("Back");
  expect(await screen.findByText("Demo project 3")).toBeDefined();
  click("Close");
  click("Add to chat");
  expect(await screen.findByText("Demo project 3")).toBeDefined();
});

it("reports picker failures while treating cancellation as a normal dismissal", async () => {
  mount("The sheet it opens");
  vi.mocked(chooseMedia).mockRejectedValueOnce({
    errMsg: "chooseMedia:fail cancel",
  });
  click("All photos");
  await waitFor(() => expect(chooseMedia).toHaveBeenCalled());
  expect(showToast).not.toHaveBeenCalled();
  vi.mocked(chooseMessageFile).mockRejectedValueOnce({
    errMsg: "chooseMessageFile:fail permission denied",
  });
  fireEvent.click(screen.getByRole("button", { name: /Add files/ }));
  await waitFor(() =>
    expect(showToast).toHaveBeenCalledWith({
      title: "Unable to select a file",
      icon: "none",
    })
  );
});

it("keeps the centered sheet title from intercepting header button taps", () => {
  mount("The sheet it opens");
  const titleLayer = screen.getByText("Add to chat").parentElement;
  expect(titleLayer?.classList.contains("pointer-events-none")).toBe(true);
});
