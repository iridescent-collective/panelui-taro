import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Toast, toast } from "panelui-taro/toast";
import { Typography } from "panelui-taro/typography";
import { useEffect, useState } from "react";

export const ToastShowcase = () => {
  const [actions, setActions] = useState(0);
  useEffect(() => () => toast.hideAll(), []);
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Heading type="h3">Toast · 通知与队列</Typography.Heading>
      <Button
        className="panel-toast-show"
        onPress={() =>
          toast.show({
            description: "Your changes are ready.",
            duration: 0,
            label: "Saved",
            variant: "success",
          })
        }
      >
        显示通知
      </Button>
      <Button
        variant="outline"
        onPress={() =>
          toast.show({
            duration: 4000,
            label: "New message",
            placement: "top",
            variant: "info",
          })
        }
      >
        顶部 · 四秒
      </Button>
      <Button
        variant="outline"
        onPress={() =>
          toast.show({
            actionLabel: "Undo",
            duration: 0,
            label: "Removed",
            onActionPress: () => setActions((count) => count + 1),
          })
        }
      >
        操作通知
      </Button>
      <Button
        variant="outline"
        onPress={() => {
          for (const variant of [
            "info",
            "success",
            "warning",
            "destructive",
          ] as const) {
            toast.show({ duration: 0, label: variant, variant });
          }
        }}
      >
        堆叠四条
      </Button>
      <Button
        variant="outline"
        onPress={() =>
          toast.show({
            component: (handle) => (
              <Toast onHide={handle.hide}>
                <Toast.Content>
                  <Toast.Title>Custom notification</Toast.Title>
                  <Toast.Description>
                    Original component anatomy
                  </Toast.Description>
                </Toast.Content>
                <Toast.Close />
              </Toast>
            ),
            duration: 0,
          })
        }
      >
        自定义
      </Button>
      <Button
        className="panel-toast-clear"
        variant="ghost"
        onPress={() => toast.hideAll()}
      >
        关闭全部
      </Button>
      <Typography id="panel-toast-actions">{`操作次数：${actions}`}</Typography>
      <Toast variant="warning">
        <Toast.Indicator />
        <Toast.Content>
          <Toast.Title>Warning</Toast.Title>
          <Toast.Description>Static source surface</Toast.Description>
        </Toast.Content>
      </Toast>
      <Toast variant="destructive">
        <Toast.Indicator />
        <Toast.Content>
          <Toast.Title>Could not save</Toast.Title>
        </Toast.Content>
        <Toast.Close />
      </Toast>
    </View>
  );
};
