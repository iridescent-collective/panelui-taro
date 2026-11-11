import { Button } from "panelui-taro/button";
import { Toast, useToast } from "panelui-taro/toast";
import { useEffect } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
function ToastVersion({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  useEffect(() => () => toast.hideAll(), [toast]);
  return <View className="flex-1 justify-center gap-3 px-5">{children}</View>;
}
function ToastStringVersion() {
  const { toast } = useToast();
  return (
    <ToastVersion>
      <Button
        variant="outline"
        onPress={() => toast.show("Link copied to clipboard")}
      >
        Simple string
      </Button>
    </ToastVersion>
  );
}
function ToastActionVersion() {
  const { toast } = useToast();
  return (
    <ToastVersion>
      <Button
        variant="outline"
        onPress={() =>
          toast.show({
            variant: "success",
            label: "Deployment complete",
            description: "panelui.dev is live on production.",
            actionLabel: "View",
          })
        }
      >
        With action
      </Button>
    </ToastVersion>
  );
}
function ToastDestructiveVersion() {
  const { toast } = useToast();
  return (
    <ToastVersion>
      <Button
        variant="outline"
        onPress={() =>
          toast.show({
            variant: "destructive",
            label: "Upload failed",
            description: "The file exceeds the 25 MB limit.",
            placement: "top",
          })
        }
      >
        Destructive, top
      </Button>
    </ToastVersion>
  );
}
function ToastStackVersion() {
  const { toast } = useToast();
  return (
    <ToastVersion>
      <Button
        variant="outline"
        onPress={() => {
          (["default", "info", "success", "warning"] as const).forEach(
            (variant, index) =>
              setTimeout(
                () =>
                  toast.show({
                    variant,
                    label: `Notification ${index + 1}`,
                    description: "Swipe down to dismiss the front one.",
                    duration: 8000,
                  }),
                index * 220
              )
          );
        }}
      >
        Stack four
      </Button>
    </ToastVersion>
  );
}
function ToastHideAllVersion() {
  const { toast } = useToast();
  return (
    <ToastVersion>
      <Button
        variant="outline"
        onPress={() =>
          (["info", "success", "warning"] as const).forEach((variant, index) =>
            setTimeout(
              () =>
                toast.show({
                  variant,
                  label: `Notification ${index + 1}`,
                  duration: 20000,
                }),
              index * 220
            )
          )
        }
      >
        Raise three
      </Button>
      <Button variant="ghost" onPress={() => toast.hideAll()}>
        Hide all
      </Button>
    </ToastVersion>
  );
}
function ToastCustomVersion() {
  const { toast } = useToast();
  return (
    <ToastVersion>
      <Button
        variant="outline"
        onPress={() =>
          toast.show({
            duration: 6000,
            component: ({ hide }) => (
              <Toast variant="info" onHide={hide}>
                <Toast.Indicator />
                <Toast.Content>
                  <Toast.Title>Custom component</Toast.Title>
                  <Toast.Description>
                    Rendered entirely by the caller.
                  </Toast.Description>
                </Toast.Content>
                <Toast.Close />
              </Toast>
            ),
          })
        }
      >
        Custom component
      </Button>
    </ToastVersion>
  );
}
export const entry: ComponentEntry = {
  slug: "toast",
  name: "Toast",
  summary: "Transient notification with swipe to dismiss",
  demos: [
    {
      label: "Simple string",
      id: "string",
      fullPage: true,
      description:
        "A string on its own, for a result that needs no title and no action.",
      render: () => <ToastStringVersion />,
    },
    {
      label: "With action",
      id: "action",
      fullPage: true,
      description: "A title, a description and one thing to do about it.",
      render: () => <ToastActionVersion />,
    },
    {
      label: "Destructive, top",
      id: "destructive",
      fullPage: true,
      description: "A failure, raised at the top edge instead of the bottom.",
      render: () => <ToastDestructiveVersion />,
    },
    {
      label: "Stack four",
      id: "stack",
      fullPage: true,
      description:
        "Four arriving in turn — the newest in front, the rest peeking out behind it.",
      render: () => <ToastStackVersion />,
    },
    {
      label: "Hide all",
      id: "hide-all",
      fullPage: true,
      description: "Clearing the whole queue at once, whatever is in it.",
      render: () => <ToastHideAllVersion />,
    },
    {
      label: "Custom component",
      id: "custom",
      fullPage: true,
      description:
        "The toast drawn entirely by the caller, with the deck still managing it.",
      render: () => <ToastCustomVersion />,
    },
    {
      label: "Anatomy",
      render: () => (
        <View className="w-full gap-3">
          <Toast variant="success">
            <Toast.Indicator />
            <Toast.Content>
              <Toast.Title>Changes saved</Toast.Title>
              <Toast.Description>Your profile is up to date.</Toast.Description>
            </Toast.Content>
            <Toast.Close />
          </Toast>
          <Toast variant="warning">
            <Toast.Indicator />
            <Toast.Content>
              <Toast.Title>Storage almost full</Toast.Title>
            </Toast.Content>
            <Toast.Action>Upgrade</Toast.Action>
          </Toast>
        </View>
      ),
    },
  ],
};
