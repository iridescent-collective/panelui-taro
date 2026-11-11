import { Button } from "panelui-taro/button";
import { Message } from "panelui-taro/message";
import { Response } from "panelui-taro/response";
import { useEffect, useState } from "react";

import { ScrollView } from "../runtime/native";
import { ComponentEntry } from "../types";
const ANSWER = `## Paying down a card

Two orders work, and they answer different questions.

1. **Avalanche** — highest interest rate first. Costs the least overall.
2. **Snowball** — smallest balance first. Closes an account soonest, which
   is the one that keeps people going.

> Pick the one you will still be doing in six months.

Rough sketch of the avalanche order:

\`\`\`ts
const order = cards
  .slice()
  .sort((a, b) => b.apr - a.apr);
\`\`\`

| Card | Balance | APR |
| :--- | ------: | --: |
| Blue | £2,400 | 24.9% |
| Store | £310 | 29.9% |

See [the worked example](https://example.com) for the full month-by-month.`;
function ResponseDemo() {
  return (
    <ScrollView contentContainerClassName="px-5 pb-12 pt-2">
      <Response>{ANSWER}</Response>
    </ScrollView>
  );
}
function ResponseMarksDemo() {
  return (
    <Response>
      {`Rates are **fixed for 12 months**, then they *revert*. The old rate was ~~29.9%~~ and the call is \`cards.sort(byApr)\`. See [the summary](https://example.com).`}
    </Response>
  );
}
function ResponseTableDemo() {
  return (
    <Response>
      {`| Card | Balance | APR |\n| :--- | ------: | --: |\n| Blue | £2,400 | 24.9% |\n| Store | £310 | 29.9% |\n| Travel | £45 | 21.9% |`}
    </Response>
  );
}
function ResponseStreamDemo() {
  const [shown, setShown] = useState(ANSWER.length);
  const streaming = shown < ANSWER.length;
  useEffect(() => {
    if (!streaming) return;
    const timer = setInterval(() => {
      setShown((count) => Math.min(count + 4, ANSWER.length));
    }, 24);
    return () => clearInterval(timer);
  }, [streaming]);
  return (
    <ScrollView contentContainerClassName="gap-4 px-5 pb-12 pt-2">
      <Button
        variant="outline"
        onPress={() => setShown(0)}
        disabled={streaming}
      >
        {streaming ? "Answering…" : "Stream it in"}
      </Button>
      <Response isStreaming={streaming}>{ANSWER.slice(0, shown)}</Response>
    </ScrollView>
  );
}
function ResponseInTurnDemo() {
  return (
    <Message align="start">
      <Message.Content>
        <Message.Bubble>
          <Message.BubbleContent>
            <Response>
              {`Three things changed in **Reanimated 4**:\n\n- the worklet runtime\n- \`useAnimatedStyle\` composition\n- layout animations that respect shared values\n\nThe third is the one you will notice.`}
            </Response>
          </Message.BubbleContent>
        </Message.Bubble>
      </Message.Content>
    </Message>
  );
}
export const entry: ComponentEntry = {
  slug: "response",
  name: "Response",
  summary: "A model's answer, rendered as it arrives",
  demos: [
    { label: "Inside a turn", render: () => <ResponseInTurnDemo /> },
    { label: "Marks and links", render: () => <ResponseMarksDemo /> },
    { label: "A table", render: () => <ResponseTableDemo /> },
    {
      label: "A full answer",
      id: "answer",
      description:
        "Headings, a list, a quote, a fence and a table — the whole surface.",
      fullPage: true,
      render: () => <ResponseDemo />,
    },
    {
      label: "Streaming in",
      id: "streaming",
      description:
        "The same answer arriving a few characters at a time, without the styles flickering.",
      fullPage: true,
      render: () => <ResponseStreamDemo />,
    },
  ],
};
