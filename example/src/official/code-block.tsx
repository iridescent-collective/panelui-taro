import { CodeBlock } from "panelui-taro/code-block";
import { Message } from "panelui-taro/message";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
const AI_SNIPPET = `const inRange = !!range?.to && isWithin(date, range.from, range.to);

// The band carries on past this cell's edge unless it stops here.
const openStart = inRange && !isStart && dayIndex > 0;
const openEnd = inRange && !isEnd && dayIndex < 6;`;
const AI_PATCH = `@@ calendar/index.tsx
-  const inRange = !!range?.to && isWithin(date, range.from, range.to) && !selected;
+  const inRange = !!range?.to && isWithin(date, range.from, range.to);`;
function CodeBlockInTurnDemo() {
  return (
    <Message align="start">
      <Message.Content>
        <Message.Bubble>
          <Message.BubbleContent>Here is the fix:</Message.BubbleContent>
        </Message.Bubble>
        <CodeBlock code={AI_SNIPPET} language="ts">
          <CodeBlock.Header>
            <CodeBlock.Filename>calendar/index.tsx</CodeBlock.Filename>
            <CodeBlock.Actions>
              <CodeBlock.CopyButton />
            </CodeBlock.Actions>
          </CodeBlock.Header>
        </CodeBlock>
      </Message.Content>
    </Message>
  );
}
export const entry: ComponentEntry = {
  slug: "code-block",
  name: "CodeBlock",
  summary: "A fenced snippet, coloured and scrolled sideways",
  demos: [
    { label: "In a turn", render: () => <CodeBlockInTurnDemo /> },
    {
      label: "Numbered lines",
      render: () => (
        <CodeBlock showLineNumbers code={AI_SNIPPET} language="ts">
          <CodeBlock.Header>
            <CodeBlock.Filename>calendar/index.tsx</CodeBlock.Filename>
            <CodeBlock.Actions>
              <CodeBlock.CopyButton />
            </CodeBlock.Actions>
          </CodeBlock.Header>
        </CodeBlock>
      ),
    },
    {
      label: "Languages",
      render: () => (
        <View className="w-full gap-4">
          <CodeBlock
            code={'{\n  "addedIn": "0.30.0",\n  "group": "ai-components"\n}'}
            language="json"
          />
          <CodeBlock code={"npx expo install expo-clipboard"} language="bash" />
          <CodeBlock code={AI_PATCH} language="diff" />
        </View>
      ),
    },
  ],
};
