import { View } from "@tarojs/components";
import { Attachment } from "panelui-taro/attachment";
import { FileIcon, XIcon } from "panelui-taro/icons";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

export const AttachmentShowcase = () => {
  const [action, setAction] = useState("");
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Heading type="h3">附件</Typography.Heading>
      <Attachment.Group>
        <Attachment
          state="uploading"
          progress={0.35}
          onPress={() => setAction("行点击")}
        >
          <Attachment.Media>
            <FileIcon size={18} />
          </Attachment.Media>
          <Attachment.Content>
            <Attachment.Title>数学练习.pdf</Attachment.Title>
            <Attachment.Description>PDF · 正在上传</Attachment.Description>
          </Attachment.Content>
          <Attachment.Actions>
            <Attachment.Action
              className="panel-attachment-cancel"
              accessibilityLabel="取消上传"
              onPress={() => setAction("取消上传")}
            >
              <XIcon size={14} />
            </Attachment.Action>
          </Attachment.Actions>
        </Attachment>
        <Attachment state="error">
          <Attachment.Media>
            <FileIcon size={18} />
          </Attachment.Media>
          <Attachment.Content>
            <Attachment.Title>语文练习.pdf</Attachment.Title>
            <Attachment.Description>上传失败</Attachment.Description>
          </Attachment.Content>
        </Attachment>
        <Attachment state="done">
          <Attachment.Media>
            <FileIcon size={18} />
          </Attachment.Media>
          <Attachment.Content>
            <Attachment.Title>英语练习.pdf</Attachment.Title>
            <Attachment.Description>PDF · 2.4 MB</Attachment.Description>
          </Attachment.Content>
        </Attachment>
      </Attachment.Group>
      <Typography.Paragraph id="panel-attachment-result">
        操作：{action || "无"}
      </Typography.Paragraph>
    </View>
  );
};
