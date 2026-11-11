import { View } from "@tarojs/components";
import { CodeBlock } from "panelui-taro/code-block";
import { FileIcon } from "panelui-taro/icons";
import { Message } from "panelui-taro/message";
import { Response } from "panelui-taro/response";
import { Table } from "panelui-taro/table";
import { Typography } from "panelui-taro/typography";

const SAMPLE_CODE =
  'const reading = { value: 42, status: "ready" };\n\nfunction renderReading() {\n  return reading.value;\n}';
export const TranscriptShowcase = () => (
  <View className="flex flex-col gap-[24px]">
    <Typography.Heading type="h3">对话与代码</Typography.Heading>
    <Message.Group align="end">
      <Message>
        <Message.Content>
          <Message.Header>家长</Message.Header>
          <Message.Bubble>
            <Message.BubbleContent>小书包今天在线吗？</Message.BubbleContent>
            <FileIcon size={16} />
          </Message.Bubble>
          <Message.Footer>已发送</Message.Footer>
        </Message.Content>
      </Message>
      <Message>
        <Message.Content>
          <Message.Bubble>
            <Message.BubbleContent>继续验证默认主题。</Message.BubbleContent>
          </Message.Bubble>
        </Message.Content>
      </Message>
    </Message.Group>
    <Message align="start">
      <Message.Content>
        <Message.Bubble>
          <Message.BubbleContent>这是接收气泡。</Message.BubbleContent>
        </Message.Bubble>
      </Message.Content>
    </Message>
    <CodeBlock
      id="panel-code"
      code={SAMPLE_CODE}
      language="typescript"
      showLineNumbers
    >
      <CodeBlock.Header>
        <CodeBlock.Filename>reading.ts</CodeBlock.Filename>
        <CodeBlock.Actions>
          <CodeBlock.CopyButton />
        </CodeBlock.Actions>
      </CodeBlock.Header>
    </CodeBlock>
    <Table.Frame
      id="panel-table"
      title="列模型"
      striped
      columns={[{ flex: 2 }, { align: "end", width: 70 }]}
    >
      <Table.Header>
        <Table.Row>
          <Table.Head>项目</Table.Head>
          <Table.Head>读数</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell>电量</Table.Cell>
          <Table.Cell>42</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>在线时长</Table.Cell>
          <Table.Cell>12</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table.Frame>
    <Response id="panel-response">
      {
        "## Markdown 回答\n\n保留 **强调**、`代码` 和流式解析。\n\n> 引用中的说明\n\n| 项目 | 读数 |\n| :--- | ---: |\n| 电量 | 42 |"
      }
    </Response>
  </View>
);
