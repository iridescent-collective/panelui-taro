import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { createForm } from "panelui-taro/form";
import { Input } from "panelui-taro/input";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

import type { PreviewFormValues } from "./types";

const ProfileForm = createForm<PreviewFormValues>();
export const FormRuntimeShowcase = () => {
  const [submitted, setSubmitted] = useState("");
  const form = ProfileForm.useForm({
    defaultValues: { name: "" },
    onSubmit: (values) => setSubmitted(values.name),
    validate: (values) => (values.name.trim() ? {} : { name: "请输入姓名" }),
  });
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Heading type="h3">表单状态与校验</Typography.Heading>
      <ProfileForm form={form}>
        <ProfileForm.Field name="name">
          {(field) => (
            <Input
              label="姓名"
              placeholder="测试姓名"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={async () => {
                await field.onBlur();
              }}
              errorMessage={field.error}
            />
          )}
        </ProfileForm.Field>
        <Button
          className="panel-form-submit"
          disabled={form.isSubmitting}
          onPress={async () => {
            await form.handleSubmit();
          }}
        >
          提交
        </Button>
      </ProfileForm>
      <Typography id="panel-form-result">提交：{submitted || "无"}</Typography>
    </View>
  );
};
