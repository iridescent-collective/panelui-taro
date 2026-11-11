import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { FileUpload } from "panelui-taro/file-upload";
import type { FileUploadFile } from "panelui-taro/file-upload";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

import { AVATAR_FIXTURE } from "../../constant";
import { ProfilePhoto } from "../ProfilePhoto";

export const AvatarDemo = () => {
  const [files, setFiles] = useState<FileUploadFile[]>([]);
  const [event, setEvent] = useState("");
  return (
    <View className="flex flex-col gap-[16px]">
      <Typography type="h6">Profile photo · single replacement</Typography>
      <Button
        size="sm"
        variant="outline"
        onPress={() => setFiles(AVATAR_FIXTURE.map((file) => ({ ...file })))}
      >
        Load avatar fixture
      </Button>
      <FileUpload
        value={files}
        onValueChange={setFiles}
        sources={["camera", "library"]}
        accept={["image/*"]}
        image={{ crop: { aspect: [1, 1] }, maxWidth: 1024 }}
        onError={(error) => setEvent(error.message)}
        onReject={(rejected) =>
          setEvent(rejected.map(({ message }) => message).join(" · "))
        }
      >
        <ProfilePhoto />
      </FileUpload>
      <Typography type="body-sm" id="panel-file-upload-avatar-events">
        {event}
      </Typography>
    </View>
  );
};
