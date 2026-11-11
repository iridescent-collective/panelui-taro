import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Drawer } from "panelui-taro/drawer";
import { Input } from "panelui-taro/input";
import { Text } from "panelui-taro/primitives/text";
import { useState } from "react";

import type { ChatSession } from "../../type";

export const ChatHistory = ({
  open,
  onOpenChange,
  sessions,
  activeId,
  onChoose,
  onNew,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessions: ChatSession[];
  activeId: string;
  onChoose: (id: string) => void;
  onNew: () => void;
}) => {
  const [search, setSearch] = useState("");
  const results = sessions.filter((session) =>
    session.title.toLowerCase().includes(search.trim().toLowerCase())
  );
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content side="start" size="lg">
        <Drawer.Header
          title="Your conversations"
          description="This preview keeps history for this visit."
        />
        <Drawer.Body>
          <View className="flex flex-col gap-[20px]">
            <Input
              value={search}
              onChangeText={setSearch}
              placeholder="Search conversations"
            />
            <Button
              onPress={() => {
                onNew();
                onOpenChange(false);
              }}
            >
              New conversation
            </Button>
            {results.map((session) => (
              <Button
                key={session.id}
                fullWidth
                variant={activeId === session.id ? "secondary" : "ghost"}
                onPress={() => {
                  onChoose(session.id);
                  onOpenChange(false);
                }}
              >
                {session.title}
              </Button>
            ))}
            {results.length ? null : (
              <Text size="sm" muted>
                No matching conversations
              </Text>
            )}
          </View>
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close>
            <Button fullWidth variant="outline">
              Back to chat
            </Button>
          </Drawer.Close>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};
