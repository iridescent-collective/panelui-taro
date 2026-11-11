import { View } from "@tarojs/components";
import { Alert } from "panelui-taro/alert";
import { Button } from "panelui-taro/button";
import { Checkbox } from "panelui-taro/checkbox";
import { Field } from "panelui-taro/field";
import { CheckIcon, GoogleIcon } from "panelui-taro/icons";
import { Input } from "panelui-taro/input";
import { RadioGroup } from "panelui-taro/radio-group";
import { Switch } from "panelui-taro/switch";
import { Textarea } from "panelui-taro/textarea";
import {
  ToggleButton,
  ToggleButtonGroup,
} from "panelui-taro/toggle-button";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

export const FormShowcase = () => {
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const [radio, setRadio] = useState("a");
  const [checked, setChecked] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [marks, setMarks] = useState<string[]>(["reading"]);
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Heading type="h3">表单与原版图标</Typography.Heading>
      <View className="flex flex-row items-center gap-[24px]">
        <Button variant="secondary" size="icon">
          <CheckIcon size={24} />
        </Button>
        <GoogleIcon size={24} />
      </View>
      <Input
        label="单行输入"
        placeholder="试试输入与焦点"
        value={text}
        onChangeText={setText}
        startContent={<CheckIcon />}
        avoidKeyboard
      />
      <Textarea
        label="自动增长文本域"
        rows={2}
        maxRows={4}
        autoGrow
        maxLength={80}
        showCount
        value={note}
        onChangeText={setNote}
        placeholder="输入多行文本"
        avoidKeyboard
      />
      <Alert variant="success">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>状态提示</Alert.Title>
          <Alert.Description>保留默认主题语义色</Alert.Description>
        </Alert.Content>
      </Alert>
      <RadioGroup
        value={radio}
        onValueChange={setRadio}
        variant="card"
        orientation="horizontal"
      >
        <RadioGroup.Item value="a" label="阅读" />
        <RadioGroup.Item value="b" label="练习" />
      </RadioGroup>
      <Checkbox
        checked={checked}
        onCheckedChange={setChecked}
        label="选择教材"
        description="点击整行切换"
      />
      <Checkbox checked={false} indeterminate label="半选状态" />
      <Checkbox
        checked
        variant="card"
        label="卡片选项"
        description="内容在前，勾选框在后"
      />
      <Field orientation="horizontal">
        <Field.Content>
          <Field.Title>学习提醒</Field.Title>
          <Field.Description>受控开关</Field.Description>
        </Field.Content>
        <Switch
          value={enabled}
          onValueChange={setEnabled}
          accessibilityLabel="学习提醒"
        />
      </Field>
      <ToggleButtonGroup value={marks} onValueChange={setMarks}>
        <ToggleButton id="reading">阅读</ToggleButton>
        <ToggleButton id="practice">练习</ToggleButton>
      </ToggleButtonGroup>
      <Typography.Paragraph>
        教材：{checked ? "已选" : "未选"} · 提醒：{enabled ? "开启" : "关闭"} ·{" "}
        {marks.join("、") || "无选择"}
      </Typography.Paragraph>
    </View>
  );
};
