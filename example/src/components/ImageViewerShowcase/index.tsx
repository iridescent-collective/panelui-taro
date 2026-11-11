import { View } from "@tarojs/components";
import { ImageViewer } from "panelui-taro/image-viewer";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

import { VIEWER_IMAGES } from "./constants";

export const ImageViewerShowcase = () => {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography id="panel-image-viewer-result">
        {JSON.stringify({ index, open })}
      </Typography>
      <ImageViewer
        open={open}
        onOpenChange={setOpen}
        index={index}
        onIndexChange={setIndex}
      >
        <View className="flex flex-wrap gap-[16px]">
          {VIEWER_IMAGES.map((image, at) => (
            <ImageViewer.Trigger
              key={image.label}
              source={image.src}
              alt={image.label}
              caption={image.label}
              index={at}
              radius={12}
              width={600}
              height={400}
              className="h-[240px] w-[300px]"
            />
          ))}
        </View>
      </ImageViewer>
    </View>
  );
};
