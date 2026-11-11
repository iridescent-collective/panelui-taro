import { Avatar } from "panelui-taro/avatar";
import { Badge } from "panelui-taro/badge";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
const AVATARS = [
  "https://i.pravatar.cc/150?img=12",
  "https://i.pravatar.cc/150?img=32",
  "https://i.pravatar.cc/150?img=47",
];
export const entry: ComponentEntry = {
  slug: "avatar",
  name: "Avatar",
  summary: "User image with initials fallback",
  demos: [
    {
      label: "Sizes",
      render: () => (
        <View className="flex-row items-end gap-3">
          <Avatar size="sm" fallback="KA" />
          <Avatar fallback="KA" />
          <Avatar size="lg" fallback="PU" />
          <Avatar size="xl" fallback="P" />
        </View>
      ),
    },
    {
      label: "With image",
      render: () => (
        <View className="flex-row items-end gap-3">
          <Avatar size="sm" source={{ uri: AVATARS[0] }} fallback="AB" />
          <Avatar source={{ uri: AVATARS[1] }} fallback="CD" />
          <Avatar size="lg" source={{ uri: AVATARS[2] }} fallback="EF" />
        </View>
      ),
    },
    {
      label: "With notification badge",
      render: () => (
        <View className="flex-row items-center gap-6">
          <Avatar size="lg" source={{ uri: AVATARS[0] }} fallback="AB">
            <Avatar.Badge>
              <Badge variant="destructive" count={5} />
            </Avatar.Badge>
          </Avatar>
          <Avatar size="lg" source={{ uri: AVATARS[1] }} fallback="CD">
            <Avatar.Badge>
              <Badge variant="destructive" count={128} />
            </Avatar.Badge>
          </Avatar>
          <Avatar size="lg" fallback="EF">
            <Avatar.Badge>
              <Badge variant="success" shape="dot" />
            </Avatar.Badge>
          </Avatar>
        </View>
      ),
    },
    {
      label: "Stacked group",
      render: () => (
        <Avatar.Group>
          {AVATARS.map((uri, index) => (
            <Avatar
              key={uri}
              source={{ uri }}
              fallback={String.fromCharCode(65 + index)}
            />
          ))}
        </Avatar.Group>
      ),
    },
    {
      label: "A capped group",
      render: () => (
        <View className="w-full gap-5">
          <Avatar.Group size="sm" max={3} total={40}>
            {AVATARS.map((uri, index) => (
              <Avatar
                key={uri}
                source={{ uri }}
                fallback={String.fromCharCode(65 + index)}
              />
            ))}
          </Avatar.Group>

          <Avatar.Group max={2}>
            {AVATARS.map((uri, index) => (
              <Avatar
                key={uri}
                source={{ uri }}
                fallback={String.fromCharCode(65 + index)}
              />
            ))}
          </Avatar.Group>

          <Avatar.Group size="lg" overlap={0} className="gap-2">
            {AVATARS.map((uri, index) => (
              <Avatar
                key={uri}
                source={{ uri }}
                fallback={String.fromCharCode(65 + index)}
              />
            ))}
          </Avatar.Group>
        </View>
      ),
    },
  ],
};
