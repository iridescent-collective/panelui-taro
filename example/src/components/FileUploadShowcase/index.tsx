import { View } from "@tarojs/components";

import { AttachmentDemo } from "./components/AttachmentDemo";
import { AvatarDemo } from "./components/AvatarDemo";
import { GridDemo } from "./components/GridDemo";
import { QueueDemo } from "./components/QueueDemo";

export const FileUploadShowcase = () => (
  <View className="flex flex-col gap-[48px]">
    <QueueDemo />
    <AvatarDemo />
    <GridDemo />
    <AttachmentDemo />
  </View>
);
