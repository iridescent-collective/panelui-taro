import { View } from "@tarojs/components";
import { Avatar } from "panelui-taro/avatar";
import { Button } from "panelui-taro/button";
import {
  FileUpload,
  useFileUpload,
} from "panelui-taro/file-upload";
import { Typography } from "panelui-taro/typography";

export const ProfilePhoto = () => {
  const { files, remove } = useFileUpload();
  const [photo] = files;
  return (
    <View
      id="panel-file-upload-avatar"
      className="flex flex-col items-start gap-[16px]"
    >
      <Avatar
        size="xl"
        source={photo ? { uri: photo.uri } : undefined}
        fallback="KA"
      />
      <FileUpload.Trigger>
        <Button variant="secondary">Change photo</Button>
      </FileUpload.Trigger>
      {photo ? (
        <>
          <Typography type="body-sm">{photo.name}</Typography>
          <Button variant="ghost" onPress={() => remove(photo.id)}>
            Remove photo
          </Button>
        </>
      ) : null}
    </View>
  );
};
