import { Button } from "panelui-taro/button";
import { EmptyState } from "panelui-taro/empty-state";
import { BellIcon, SearchIcon } from "panelui-taro/icons";

import { demoAction } from "../runtime/demo-action";
import { View } from "../runtime/native";
import { ComponentEntry } from "../types";

export const entry: ComponentEntry = {
  slug: "empty-state",
  name: "EmptyState",
  summary: "Placeholder for a view with no content",
  demos: [
    {
      label: "With icon",
      render: () => (
        <EmptyState>
          <EmptyState.Header>
            <EmptyState.Media variant="icon">
              <SearchIcon size={18} />
            </EmptyState.Media>
            <EmptyState.Title>No results found</EmptyState.Title>
            <EmptyState.Description>
              Try adjusting your search or filters to find what you're looking
              for.
            </EmptyState.Description>
          </EmptyState.Header>
          <EmptyState.Content>
            <Button
              variant="outline"
              fullWidth
              onPress={demoAction("Clear filters")}
            >
              Clear filters
            </Button>
          </EmptyState.Content>
        </EmptyState>
      ),
    },
    {
      label: "Text only",
      render: () => (
        <EmptyState>
          <EmptyState.Header>
            <EmptyState.Title>Nothing here yet</EmptyState.Title>
            <EmptyState.Description>
              Projects you create will show up on this screen.
            </EmptyState.Description>
          </EmptyState.Header>
        </EmptyState>
      ),
    },
    {
      label: "In a card",
      render: () => (
        <EmptyState variant="card" size="sm" className="w-full">
          <EmptyState.Header>
            <EmptyState.Media variant="icon">
              <BellIcon size={16} />
            </EmptyState.Media>
            <EmptyState.Title>No notifications</EmptyState.Title>
            <EmptyState.Description>
              You're all caught up.
            </EmptyState.Description>
          </EmptyState.Header>
        </EmptyState>
      ),
    },
    {
      label: "Sizes",
      render: () => (
        <View className="w-full gap-3">
          {(["sm", "default", "lg"] as const).map((size) => (
            <EmptyState
              key={size}
              variant="card"
              size={size}
              className="w-full"
            >
              <EmptyState.Header>
                <EmptyState.Title>Size {size}</EmptyState.Title>
                <EmptyState.Description>
                  Padding and type scale together.
                </EmptyState.Description>
              </EmptyState.Header>
            </EmptyState>
          ))}
        </View>
      ),
    },
  ],
};
