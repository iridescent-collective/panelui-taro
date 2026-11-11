import { View } from "@tarojs/components";
import { Card } from "panelui-taro/card";
import { Label } from "panelui-taro/label";
import { Progress } from "panelui-taro/progress";
import { Separator } from "panelui-taro/separator";
import { Skeleton } from "panelui-taro/skeleton";
import { Spinner } from "panelui-taro/spinner";
import { Surface } from "panelui-taro/surface";
import { Typography } from "panelui-taro/typography";

export const ContentShowcase = () => (
  <Card>
    <Card.Header>
      <Card.Title>内容与反馈</Card.Title>
      <Card.Description>检查默认主题、表面层级、文本与进度。</Card.Description>
    </Card.Header>
    <Card.Content className="flex flex-col gap-[24px]">
      <Label isRequired>姓名</Label>
      <Label isInvalid>错误状态</Label>
      <Label isRequired isDisabled>
        禁用状态
      </Label>
      <Typography.Heading type="h3">Typography Heading</Typography.Heading>
      <Typography.Paragraph>
        普通正文包含中文、English、数字 123。
      </Typography.Paragraph>
      <Typography.Blockquote>引用内容</Typography.Blockquote>
      <Typography.Code>const panel = true</Typography.Code>
      <Typography.List ordered>
        <Typography.ListItem>第一项</Typography.ListItem>
        <Typography.ListItem>第二项</Typography.ListItem>
      </Typography.List>
      <Separator>分隔内容</Separator>
      <Progress label="上传" value={72} showValueLabel />
      <Progress label="处理中" indeterminate />
      <Progress value={45} color="success" size="lg" />
      <View className="flex flex-row items-center gap-[24px]">
        <Spinner size="sm" />
        <Spinner />
        <Spinner size="lg" label="加载" />
      </View>
      <Skeleton label="加载内容" className="h-[48px] w-full" />
      <Skeleton className="h-[32px] w-[240px]" />
      <Surface bordered>
        <Typography.Paragraph>默认表面</Typography.Paragraph>
        <Surface variant="secondary">
          <Typography.Paragraph>第二层</Typography.Paragraph>
          <Surface variant="tertiary">
            <Typography.Paragraph>第三层</Typography.Paragraph>
          </Surface>
        </Surface>
      </Surface>
    </Card.Content>
    <Card.Footer variant="panel">
      <Typography.Paragraph muted>PanelUI · 默认主题</Typography.Paragraph>
    </Card.Footer>
  </Card>
);
