// @vitest-environment happy-dom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { Questionnaire } from "../src/components/Questionnaire";
import type { QuestionnaireAnswers } from "../src/components/Questionnaire";
import {
  questionnaireDrag,
  questionnaireRelease,
} from "../src/components/Questionnaire/use-pan";
import { isAnswered, shortcutAt } from "../src/components/Questionnaire/utils";
import fixtures from "./fixtures/questionnaire-source.json";
import { setTestMeasurement } from "./taro-api";

const point = (x: number, y: number) => ({
  clientX: x,
  clientY: y,
  identifier: 1,
});
const FOOTER = (
  <Questionnaire.Footer>
    <Questionnaire.Back />
    <Questionnaire.Skip />
    <Questionnaire.Spacer />
    <Questionnaire.Next />
    <Questionnaire.Submit />
  </Questionnaire.Footer>
);
it("required questions dim the action but explain failed validation and clear errors when answered", () => {
  const submit = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Questionnaire onSubmit={submit} frame={false}>
        <Questionnaire.Progress variant="count" />
        <Questionnaire.Item name="one" required>
          <Questionnaire.Question>Question one</Questionnaire.Question>
          <Questionnaire.Choices>
            <Questionnaire.Choice value="a" label="Answer A" />
          </Questionnaire.Choices>
          <Questionnaire.Error />
        </Questionnaire.Item>
        <Questionnaire.Item name="two">
          <Questionnaire.Question>Question two</Questionnaire.Question>
        </Questionnaire.Item>
        {FOOTER}
      </Questionnaire>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: /Continue/u }));
  expect(screen.getByRole("alert").textContent).toBe(
    "Choose an answer to continue."
  );
  fireEvent.click(screen.getByRole("radio", { name: "Answer A" }));
  expect(screen.queryByRole("alert")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
  expect(screen.getByText("Question two")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Submit" }));
  expect(submit).toHaveBeenCalledWith({ one: "a" });
});
it("single choice toggles clear, multiple choices coexist with one freeform entry, and optional skip reports skipped", () => {
  const answers = vi.fn();
  const status = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Questionnaire frame={false} onAnswersChange={answers}>
        <Questionnaire.Item name="one" multiple onStatusChange={status}>
          <Questionnaire.Choices>
            <Questionnaire.Choice value="a" label="A" />
            <Questionnaire.Choice value="b" label="B" />
            <Questionnaire.Input placeholder="Other" />
          </Questionnaire.Choices>
        </Questionnaire.Item>
        <Questionnaire.Item name="two">
          <Questionnaire.Question>Second</Questionnaire.Question>
        </Questionnaire.Item>
        {FOOTER}
      </Questionnaire>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("checkbox", { name: "A" }));
  fireEvent.click(screen.getByRole("checkbox", { name: "B" }));
  fireEvent.input(screen.getByPlaceholderText("Other"), {
    target: { value: "Typed" },
  });
  expect(answers).toHaveBeenLastCalledWith({ one: ["a", "b", "Typed"] });
  fireEvent.input(screen.getByPlaceholderText("Other"), {
    target: { value: "Updated" },
  });
  expect(answers).toHaveBeenLastCalledWith({ one: ["a", "b", "Updated"] });
  fireEvent.click(screen.getByRole("button", { name: "Skip" }));
  expect(status).toHaveBeenLastCalledWith("skipped");
  expect(screen.getByText("Second")).toBeTruthy();
});
it("item definition metadata controls the rendered multiple choice grammar and answer shape", () => {
  const answers = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Questionnaire
        frame={false}
        items={[{ multiple: true, name: "one", required: true }]}
        onAnswersChange={answers}
      >
        <Questionnaire.Item name="one">
          <Questionnaire.Choices>
            <Questionnaire.Choice value="a" label="A" />
            <Questionnaire.Choice value="b" label="B" />
          </Questionnaire.Choices>
        </Questionnaire.Item>
        {FOOTER}
      </Questionnaire>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("checkbox", { name: "A" }));
  fireEvent.click(screen.getByRole("checkbox", { name: "B" }));
  expect(answers).toHaveBeenLastCalledWith({ one: ["a", "b"] });
});
it("all legal item names remain own properties in emitted answer records", () => {
  const result: QuestionnaireAnswers[] = [];
  render(
    <PanelUIProvider reducedMotion>
      <Questionnaire
        frame={false}
        onAnswersChange={(answer) => result.push(answer)}
      >
        <Questionnaire.Item name="__proto__">
          <Questionnaire.Choice value="safe" label="Safe" />
        </Questionnaire.Item>
        {FOOTER}
      </Questionnaire>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("radio", { name: "Safe" }));
  expect(Object.hasOwn(result[0] ?? {}, "__proto__")).toBe(true);
  expect(Object.getPrototypeOf(result[0] ?? {})).toBe(Object.prototype);
});
it("native click callback does not bypass the flow action", () => {
  const click = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Questionnaire frame={false}>
        <Questionnaire.Item name="one">
          <Questionnaire.Question>First</Questionnaire.Question>
        </Questionnaire.Item>
        <Questionnaire.Item name="two">
          <Questionnaire.Question>Second</Questionnaire.Question>
        </Questionnaire.Item>
        <Questionnaire.Footer>
          <Questionnaire.Next onClick={click} />
        </Questionnaire.Footer>
      </Questionnaire>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
  expect(click).toHaveBeenCalledTimes(1);
  expect(screen.getByText("Second")).toBeTruthy();
});
for (const [index, fixture] of fixtures.gestures.entries()) {
  it(`source Pan callbacks ${index}`, () => {
    expect(
      questionnaireDrag(fixture.translation, fixture.forward, fixture.back)
    ).toBe(fixture.offset);
    expect(
      questionnaireRelease(
        fixture.translation,
        fixture.width,
        fixture.forward,
        fixture.back
      )
    ).toBe(fixture.delta);
  });
}
for (const [index, fixture] of fixtures.answers.entries()) {
  it(`source answered ${index}`, () => {
    expect(isAnswered(fixture.input)).toBe(fixture.result);
  });
}
for (const fixture of fixtures.shortcuts) {
  it(`source shortcut ${fixture.mode}/${fixture.index}`, () => {
    expect(
      shortcutAt(fixture.mode as "letters" | "numbers", fixture.index)
    ).toBe(fixture.result);
  });
}
it("controlled answers and active question emit requests while disabled questions stay out of progress", () => {
  const answers = vi.fn();
  const item = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Questionnaire
        frame={false}
        item="one"
        answers={{}}
        onAnswersChange={answers}
        onItemChange={item}
      >
        <Questionnaire.Progress variant="numbers" />
        <Questionnaire.Item name="hidden" disabled>
          <Questionnaire.Question>Hidden</Questionnaire.Question>
        </Questionnaire.Item>
        <Questionnaire.Item name="one">
          <Questionnaire.Choice value="a" label="A" />
        </Questionnaire.Item>
        <Questionnaire.Item name="two">
          <Questionnaire.Question>Second</Questionnaire.Question>
        </Questionnaire.Item>
        {FOOTER}
      </Questionnaire>
    </PanelUIProvider>
  );
  expect(screen.getByRole("progressbar").getAttribute("aria-valuetext")).toBe(
    "Question 1 of 2"
  );
  fireEvent.click(screen.getByRole("radio", { name: "A" }));
  expect(answers).toHaveBeenCalledWith({ one: "a" });
  expect(
    screen.getByRole("radio", { name: "A" }).getAttribute("aria-selected")
  ).toBe("false");
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
  expect(item).toHaveBeenCalledWith("two");
  expect(screen.queryByText("Second")).toBeNull();
});
it("all progress variants and custom progress children expose source current/total; long pips fall back to count", () => {
  const items = Array.from({ length: 9 }, (_, index) => (
    <Questionnaire.Item key={index} name={String(index)}>
      <Questionnaire.Question>{String(index)}</Questionnaire.Question>
    </Questionnaire.Item>
  ));
  const { rerender } = render(
    <PanelUIProvider reducedMotion>
      <Questionnaire frame={false}>
        <Questionnaire.Progress variant="pips" />
        {items}
      </Questionnaire>
    </PanelUIProvider>
  );
  expect(screen.getByText("Question 1 of 9")).toBeTruthy();
  rerender(
    <PanelUIProvider reducedMotion>
      <Questionnaire frame={false}>
        <Questionnaire.Progress>
          {(state) => <span>{`Custom ${state.current}/${state.total}`}</span>}
        </Questionnaire.Progress>
        {items}
      </Questionnaire>
    </PanelUIProvider>
  );
  expect(screen.getByText("Custom 1/9")).toBeTruthy();
});
it("disabled choices do not consume shortcut letters, selecting a fixed answer clears a typed alternative, and untitled framed question moves to header", () => {
  const { container } = render(
    <PanelUIProvider reducedMotion>
      <Questionnaire shortcuts="letters">
        <Questionnaire.Progress />
        <Questionnaire.Item name="one">
          <Questionnaire.Question>What next?</Questionnaire.Question>
          <Questionnaire.Choices>
            <Questionnaire.Choice value="x" label="Disabled" disabled />
            <Questionnaire.Choice value="yes" label="Choose" />
            <Questionnaire.Input placeholder="Other" />
          </Questionnaire.Choices>
        </Questionnaire.Item>
        {FOOTER}
      </Questionnaire>
    </PanelUIProvider>
  );
  expect(screen.getAllByText("What next?")).toHaveLength(1);
  expect(screen.getByRole("radio", { name: "Choose" }).textContent).toContain(
    "A"
  );
  fireEvent.input(screen.getByPlaceholderText("Other"), {
    target: { value: "typed" },
  });
  fireEvent.click(screen.getByRole("radio", { name: "Choose" }));
  expect((screen.getByPlaceholderText("Other") as HTMLInputElement).value).toBe(
    ""
  );
  expect(container.querySelectorAll('[role="radio"]')).toHaveLength(2);
});

it("native horizontal swipe shares validation, vertical drags remain page scroll, and cancelled touches never navigate", async () => {
  setTestMeasurement(300, 300);
  const { container } = render(
    <PanelUIProvider reducedMotion>
      <Questionnaire frame={false}>
        <Questionnaire.Item name="one" required>
          <Questionnaire.Question>First</Questionnaire.Question>
          <Questionnaire.Choice value="a" label="A" />
          <Questionnaire.Error />
        </Questionnaire.Item>
        <Questionnaire.Item name="two">
          <Questionnaire.Question>Second</Questionnaire.Question>
        </Questionnaire.Item>
        {FOOTER}
      </Questionnaire>
    </PanelUIProvider>
  );
  await act(async () => {
    await Promise.resolve();
  });
  const body = container.querySelector<HTMLElement>("[data-taro-catch-move]");
  if (!body) {
    throw new Error("Questionnaire body missing");
  }

  fireEvent.touchStart(body, { touches: [point(200, 20)] });
  fireEvent.touchMove(body, { touches: [point(70, 35)] });
  fireEvent.touchEnd(body, { changedTouches: [point(70, 35)] });
  expect(screen.queryByRole("alert")).toBeNull();
  fireEvent.touchStart(body, { touches: [point(200, 20)] });
  fireEvent.touchMove(body, { touches: [point(70, 20)] });
  fireEvent.touchEnd(body, { changedTouches: [point(70, 20)] });
  expect(screen.getByRole("alert").textContent).toContain("Choose an answer");
  fireEvent.click(screen.getByRole("radio", { name: "A" }));
  fireEvent.touchStart(body, { touches: [point(200, 20)] });
  fireEvent.touchMove(body, { touches: [point(70, 20)] });
  fireEvent.touchCancel(body);
  fireEvent.touchEnd(body, { changedTouches: [point(70, 20)] });
  expect(screen.queryByText("Second")).toBeNull();
  fireEvent.touchStart(body, { touches: [point(200, 20)] });
  fireEvent.touchMove(body, { touches: [point(70, 20)] });
  fireEvent.touchEnd(body, { changedTouches: [point(70, 20)] });
  expect(screen.getByText("Second")).toBeTruthy();
});
it.each([false, true])(
  "frame=%s preserves upstream column gaps and separates choice descriptions",
  (frame) => {
    const style = document.createElement("style");
    style.textContent =
      '.flex{display:flex}.flex-col{flex-direction:column}.items-center{align-items:center}.justify-center{justify-content:center}[class~="gap-[32px]"]{gap:32px}[class~="gap-[20px]"]{gap:20px}[class~="gap-[8px]"]{gap:8px}';
    document.head.append(style);
    try {
      render(
        <PanelUIProvider reducedMotion>
          <Questionnaire frame={frame} shortcuts="letters">
            <Questionnaire.Item name="subject" data-testid="question-item">
              <Questionnaire.Question>Subject?</Questionnaire.Question>
              <Questionnaire.Description>
                Choose a subject
              </Questionnaire.Description>
              <Questionnaire.Choices data-testid="choices">
                <Questionnaire.Choice
                  value="reading"
                  label="Reading"
                  description="Stories and imagination"
                />
              </Questionnaire.Choices>
            </Questionnaire.Item>
          </Questionnaire>
        </PanelUIProvider>
      );
      const item = screen.getByTestId("question-item");
      const choice = screen.getByRole("radio", { name: "Reading" });
      const columns = [
        item.parentElement,
        item,
        screen.getByTestId("choices"),
        screen.getByText("Reading").parentElement,
      ];
      for (const node of columns) {
        expect(node).toBeTruthy();
        const layout = getComputedStyle(node as Element);
        expect(layout.display).toBe("flex");
        expect(layout.flexDirection).toBe("column");
      }
      expect(getComputedStyle(item).gap).toBe("32px");
      expect(getComputedStyle(screen.getByTestId("choices")).gap).toBe("20px");
      for (const node of [choice.firstElementChild, choice.lastElementChild]) {
        const layout = getComputedStyle(node as Element);
        expect(layout.display).toBe("flex");
        expect(layout.alignItems).toBe("center");
        expect(layout.justifyContent).toBe("center");
      }
    } finally {
      style.remove();
    }
  }
);
