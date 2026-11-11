import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { useFileUpload } from "panelui-taro/file-upload";
import { Typography } from "panelui-taro/typography";

export const GridActions = () => {
  const model = useFileUpload();
  return (
    <View className="flex flex-col gap-[16px]">
      <View className="flex flex-row flex-wrap gap-[12px]">
        <Button size="sm" onPress={() => model.upload()}>
          Grid upload files
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
          Grid cancel uploads
        </Button>
        <Button size="sm" variant="ghost" onPress={model.clear}>
          Grid clear files
        </Button>
      </View>
      <Typography type="body-sm" id="panel-file-upload-grid-state">
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
