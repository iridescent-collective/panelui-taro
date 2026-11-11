import { ScrollView, View } from "@tarojs/components";
import { PanelUIProvider } from "panelui-taro/provider";
import { Typography } from "panelui-taro/typography";
import type { ReactNode } from "react";

import { PageLayout } from "@/components/navigation/PageLayout";

export interface PreviewLayoutProps {
  children: ReactNode;
}

export const PreviewLayout = ({ children }: PreviewLayoutProps) => (
  <PageLayout bodyClassName={false}>
    <ScrollView id="panel-preview-scroll" scrollY style={{ height: "100%" }}>
      <PanelUIProvider className="min-h-screen">
        <View className="flex flex-col gap-[48px] p-[32px]">
          <Typography.Heading type="h2">PanelUI</Typography.Heading>
          <Typography.Paragraph muted>
            Panel 默认浅色 · Taro 组件验收
          </Typography.Paragraph>
          {children}
        </View>
      </PanelUIProvider>
    </ScrollView>
  </PageLayout>
);
