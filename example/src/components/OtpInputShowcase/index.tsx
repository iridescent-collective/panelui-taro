import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { OtpInput } from "panelui-taro/otp-input";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

export const OtpInputShowcase = () => {
  const [code, setCode] = useState("");
  const [complete, setComplete] = useState(0);
  return (
    <View className="flex flex-col gap-[32px]">
      <Typography.Heading type="h3">OtpInput · 单字段分格</Typography.Heading>
      <OtpInput
        id="panel-otp-field"
        accessibilityLabel="测试验证码"
        value={code}
        onChangeText={setCode}
        onComplete={() => setComplete((current) => current + 1)}
        length={6}
        groupEvery={3}
        placeholder="·"
      />
      <Typography id="panel-otp-result">{`完成次数：${complete}`}</Typography>
      <Button
        className="panel-otp-reset"
        variant="outline"
        onPress={() => setCode("")}
      >
        清空验证码
      </Button>
      <Typography.Heading type="h4">文本、掩码和错误状态</Typography.Heading>
      <OtpInput
        accessibilityLabel="四位口令"
        type="text"
        length={4}
        mask
        defaultValue="AB"
        size="sm"
        placeholder="·"
      />
      <OtpInput
        accessibilityLabel="无效验证码"
        length={4}
        defaultValue="123"
        errorMessage="Invalid code"
      />
      <OtpInput
        accessibilityLabel="禁用验证码"
        length={4}
        defaultValue="12"
        disabled
        editable
      />
    </View>
  );
};
