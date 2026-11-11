import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { useFileUpload } from "panelui-taro/file-upload";
import { Typography } from "panelui-taro/typography";

export const QueueActions = () => {
  const model = useFileUpload();
  return (
    <View className="flex flex-col gap-[16px]">
      <View className="flex flex-row flex-wrap gap-[12px]">
        <Button size="sm" onPress={() => model.upload()}>
          Upload queued files
        </Button>
        <Button
          size="sm"
          variant="outline"
          onPress={() => {
            for (const file of model.files) {
              model.cancel(file.id);
            }
          }}
        >
          Cancel uploads
        </Button>
        <Button size="sm" variant="ghost" onPress={model.clear}>
          Clear queue
        </Button>
      </View>
      <Typography type="body-sm" id="panel-file-upload-state">
        {JSON.stringify(
          model.files.map(({ id, status, progress }) => ({
            id,
            progress,
            status,
          }))
        )}
      </Typography>
    </View>
  );
};
