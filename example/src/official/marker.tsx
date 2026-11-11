import { Avatar } from "panelui-taro/avatar";
import {
  CheckIcon,
  InfoIcon,
  SearchIcon,
  ShieldCheckIcon,
} from "panelui-taro/icons";
import { Marker } from "panelui-taro/marker";
import { Message } from "panelui-taro/message";

import { demoAction } from "../runtime/demo-action";
import { View } from "../runtime/native";
import { ComponentEntry } from "../types";

export const entry: ComponentEntry = {
  slug: "marker",
  name: "Marker",
  summary: "Inline note between conversation turns",
  demos: [
    {
      label: "Status rows",
      render: () => (
        <View className="w-full">
          <Marker>
            <Marker.Icon>
              <SearchIcon size={14} />
            </Marker.Icon>
            <Marker.Content>Explored 4 files</Marker.Content>
          </Marker>
          <Marker>
            <Marker.Icon>
              <CheckIcon size={14} />
            </Marker.Icon>
            <Marker.Content>Applied 2 edits to invoice.ts</Marker.Content>
          </Marker>
          <Marker>
            <Marker.Icon>
              <ShieldCheckIcon size={14} />
            </Marker.Icon>
            <Marker.Content>Type check passed</Marker.Content>
          </Marker>
        </View>
      ),
    },
    {
      label: "A step still running",
      render: () => (
        <View className="w-full">
          <Marker>
            <Marker.Icon>
              <CheckIcon size={14} />
            </Marker.Icon>
            <Marker.Content>Read 12 files</Marker.Content>
          </Marker>

          <Marker>
            <Marker.Icon>
              <SearchIcon size={14} />
            </Marker.Icon>
            <Marker.Content shimmer>Searching the codebase…</Marker.Content>
          </Marker>
        </View>
      ),
    },
    {
      label: "Variants",
      render: () => (
        <View className="w-full gap-2">
          <Marker>
            <Marker.Icon>
              <InfoIcon size={14} />
            </Marker.Icon>
            <Marker.Content>default — the plain status row</Marker.Content>
          </Marker>
          <Marker variant="border">
            <Marker.Icon>
              <InfoIcon size={14} />
            </Marker.Icon>
            <Marker.Content>border — closed by a hairline</Marker.Content>
          </Marker>
          <Marker variant="separator">
            <Marker.Content>Yesterday</Marker.Content>
          </Marker>
        </View>
      ),
    },
    {
      label: "In a transcript",
      render: () => (
        <View className="w-full gap-3">
          <Marker variant="separator">
            <Marker.Content>Today</Marker.Content>
          </Marker>

          <Message align="end">
            <Message.Content>
              <Message.Bubble>
                <Message.BubbleContent>
                  Where is the invoice total calculated?
                </Message.BubbleContent>
              </Message.Bubble>
            </Message.Content>
          </Message>

          <Marker onPress={demoAction("Searched 128 files")}>
            <Marker.Icon>
              <SearchIcon size={14} />
            </Marker.Icon>
            <Marker.Content>Searched 128 files</Marker.Content>
          </Marker>

          <Message>
            <Message.Avatar>
              <Avatar size="sm" fallback="AI" />
            </Message.Avatar>
            <Message.Content>
              <Message.Bubble>
                <Message.BubbleContent>
                  In `billing/total.ts` — it sums the line items, then applies
                  tax.
                </Message.BubbleContent>
              </Message.Bubble>
            </Message.Content>
          </Message>
        </View>
      ),
    },
  ],
};
