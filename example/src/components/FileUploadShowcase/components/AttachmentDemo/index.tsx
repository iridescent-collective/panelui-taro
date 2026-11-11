import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { FileUpload } from "panelui-taro/file-upload";
import type { FileUploadFile } from "panelui-taro/file-upload";
import { Input } from "panelui-taro/input";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

import { ATTACHMENT_FIXTURE } from "../../constant";

export const AttachmentDemo = () => {
  const [files, setFiles] = useState<FileUploadFile[]>([]);
  const [event, setEvent] = useState("");
  return (
    <View
      id="panel-file-upload-attachments"
      className="flex flex-col gap-[16px]"
    >
      <Typography type="h6">Message attachments · horizontal</Typography>
      <Button
        size="sm"
        variant="outline"
        onPress={() =>
          setFiles(ATTACHMENT_FIXTURE.map((file) => ({ ...file })))
        }
      >
        Load attachment fixture
      </Button>
      <FileUpload
        value={files}
        onValueChange={setFiles}
        sources={["camera", "library", "files"]}
        multiple
        maxFiles={10}
        onError={(error) => setEvent(error.message)}
        onReject={(rejected) =>
          setEvent(rejected.map(({ message }) => message).join(" · "))
        }
      >
        <FileUpload.List horizontal size="sm" />
        <View className="flex flex-row items-center gap-[16px]">
          <FileUpload.Trigger>
            <Button variant="ghost" size="sm">
              Attach
            </Button>
          </FileUpload.Trigger>
          <Input placeholder="Message" />
        </View>
      </FileUpload>
      <Typography type="body-sm" id="panel-file-upload-attachment-events">
        {event}
      </Typography>
    </View>
  );
};
