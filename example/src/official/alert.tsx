import { Alert } from "panelui-taro/alert";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";

export const entry: ComponentEntry = {
  slug: "alert",
  name: "Alert",
  summary: "Status message with an icon",
  demos: [
    {
      label: "Variants",
      render: () => (
        <View className="w-full gap-3">
          {(["info", "success", "warning", "destructive"] as const).map(
            (variant) => (
              <Alert key={variant} variant={variant}>
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>
                    {variant === "info"
                      ? "Heads up"
                      : variant === "success"
                        ? "Payment received"
                        : variant === "warning"
                          ? "Storage almost full"
                          : "Something went wrong"}
                  </Alert.Title>
                  <Alert.Description>
                    {variant === "info"
                      ? "A new version of PanelUI is available."
                      : variant === "success"
                        ? "Your invoice has been paid."
                        : variant === "warning"
                          ? "You've used 92% of your quota."
                          : "Your session has expired."}
                  </Alert.Description>
                </Alert.Content>
              </Alert>
            )
          )}
        </View>
      ),
    },
    {
      label: "Title only",
      render: () => (
        <Alert variant="success">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Changes saved</Alert.Title>
          </Alert.Content>
        </Alert>
      ),
    },
    {
      label: "No icon",
      render: () => (
        <Alert>
          <Alert.Content>
            <Alert.Title>Plain alert</Alert.Title>
            <Alert.Description>
              Omit Alert.Indicator for a text-only alert.
            </Alert.Description>
          </Alert.Content>
        </Alert>
      ),
    },
  ],
};
