import { View } from "@tarojs/components";
import { Sources } from "panelui-taro/sources";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

export const SourcesShowcase = () => {
  const [selected, setSelected] = useState("");
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Heading type="h3">引用与出处</Typography.Heading>
      <Sources>
        <Sources.Trigger id="panel-sources-open" count={2} />
        <Sources.Content>
          <Sources.Source
            id="panel-source-first"
            title="PanelUI 文档"
            href="https://panelui.dev/"
            onLinkPress={() => setSelected("文档点击已交给使用方")}
          />
          <Sources.Source href="https://github.com/panel-ui/PanelUI" />
        </Sources.Content>
      </Sources>
      <Typography.Paragraph id="panel-source-status">
        {selected || "尚未点击引用"}
      </Typography.Paragraph>
    </View>
  );
};
