import { CodeBlock } from "panelui-taro/code-block";
import { Plan } from "panelui-taro/plan";
import { Text } from "panelui-taro/primitives/text";
import { Sources } from "panelui-taro/sources";
import { useState } from "react";

import { EXAMPLE_CODE } from "../../constant";
import type { ReplyKind } from "../../type";

export const ReplyExtras = ({ kind }: { kind: ReplyKind }) => {
  const [source, setSource] = useState("");
  return (
    <>
      {kind === "code" ? (
        <CodeBlock code={EXAMPLE_CODE} language="tsx" showLineNumbers>
          <CodeBlock.Header>
            <CodeBlock.Filename>Button.tsx</CodeBlock.Filename>
            <CodeBlock.Actions>
              <CodeBlock.CopyButton />
            </CodeBlock.Actions>
          </CodeBlock.Header>
        </CodeBlock>
      ) : null}
      {kind === "research" ? (
        <Plan defaultOpen>
          <Plan.Header>
            <Plan.Title>Your weekend, in three steps</Plan.Title>
            <Plan.Progress />
          </Plan.Header>
          <Plan.Trigger />
          <Plan.Content>
            <Plan.Steps>
              <Plan.Step status="done">Choose a neighbourhood</Plan.Step>
              <Plan.Step status="done">Group nearby activities</Plan.Step>
              <Plan.Step status="pending" last>
                Check dates and opening hours
              </Plan.Step>
            </Plan.Steps>
          </Plan.Content>
        </Plan>
      ) : null}
      <Sources>
        <Sources.Trigger count={2} />
        <Sources.Content>
          <Sources.Source
            title="PanelUI · Chat UI pattern"
            href="https://panelui.dev/docs/ai/chat-ui"
            onLinkPress={setSource}
          />
          <Sources.Source
            title="PanelUI · Tools pattern"
            href="https://panelui.dev/docs/ai/tools"
            onLinkPress={setSource}
          />
          <Text size="xs" muted className="block">
            These sources describe this interface, not live research.
          </Text>
          {source ? (
            <Text size="xs" className="block break-all" selectable>
              {source}
            </Text>
          ) : null}
        </Sources.Content>
      </Sources>
    </>
  );
};
