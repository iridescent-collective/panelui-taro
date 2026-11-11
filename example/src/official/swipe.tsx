import { Button } from "panelui-taro/button";
import { Direction } from "panelui-taro/direction";
import {
  BookmarkIcon,
  BellIcon,
  CheckIcon,
  FileIcon,
  TrashIcon,
} from "panelui-taro/icons";
import { Item } from "panelui-taro/item";
import { Text } from "panelui-taro/primitives/text";
import { Separator } from "panelui-taro/separator";
import { Swipe } from "panelui-taro/swipe";
import { useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
function SwipeDeleteDemo() {
  const [rows, setRows] = useState([
    { name: "Invoice.pdf", meta: "2.4 MB" },
    { name: "Contract.docx", meta: "812 KB" },
    { name: "Notes.md", meta: "4 KB" },
  ]);
  if (rows.length === 0) {
    return (
      <View className="w-full gap-3">
        <Text size="sm" muted>
          Every row deleted.
        </Text>
        <Button
          variant="outline"
          size="sm"
          onPress={() =>
            setRows([
              { name: "Invoice.pdf", meta: "2.4 MB" },
              { name: "Contract.docx", meta: "812 KB" },
              { name: "Notes.md", meta: "4 KB" },
            ])
          }
        >
          Put them back
        </Button>
      </View>
    );
  }
  return (
    <View className="border-border w-full overflow-hidden rounded-xl border">
      {rows.map((row, index) => (
        <View key={row.name}>
          <Swipe haptics>
            <Swipe.End>
              <Swipe.Action
                icon={<TrashIcon />}
                label="Delete"
                color="destructive"
                onPress={() =>
                  setRows((current) =>
                    current.filter((r) => r.name !== row.name)
                  )
                }
              />
            </Swipe.End>
            <Item>
              <Item.Media variant="icon">
                <FileIcon />
              </Item.Media>
              <Item.Content>
                <Item.Title>{row.name}</Item.Title>
                <Item.Description>{row.meta}</Item.Description>
              </Item.Content>
            </Item>
          </Swipe>
          {index < rows.length - 1 ? <Item.Separator /> : null}
        </View>
      ))}
    </View>
  );
}
const SWIPE_MAIL = [
  { id: "m1", from: "Nadia Rahman", subject: "Re: the Q3 numbers" },
  { id: "m2", from: "Build bot", subject: "main is green again" },
  { id: "m3", from: "Tomas Lind", subject: "Lunch Thursday?" },
  { id: "m4", from: "Registry", subject: "Your domain renews in 14 days" },
];
function SwipeGroupDemo() {
  const [log, setLog] = useState<string | null>(null);
  return (
    <View className="w-full gap-3">
      <Swipe.Group className="border-border overflow-hidden rounded-xl border">
        <Item.Group>
          {SWIPE_MAIL.map((message, index) => (
            <View key={message.id}>
              <Swipe haptics>
                <Swipe.End>
                  <Swipe.Action
                    icon={<BookmarkIcon />}
                    label="Archive"
                    color="info"
                    onPress={() => setLog(`Archived ${message.from}.`)}
                  />
                  <Swipe.Action
                    icon={<TrashIcon />}
                    label="Delete"
                    color="destructive"
                    onPress={() => setLog(`Deleted ${message.from}.`)}
                  />
                </Swipe.End>
                <Item>
                  <Item.Content>
                    <Item.Title>{message.from}</Item.Title>
                    <Item.Description>{message.subject}</Item.Description>
                  </Item.Content>
                </Item>
              </Swipe>
              {index < SWIPE_MAIL.length - 1 ? <Item.Separator /> : null}
            </View>
          ))}
        </Item.Group>
      </Swipe.Group>
      <Text size="sm" muted>
        {log ?? "Open one row, then another — the first closes itself."}
      </Text>
    </View>
  );
}
function SwipeBothSidesDemo() {
  const [status, setStatus] = useState("Drag the row either way.");
  return (
    <View className="w-full gap-3">
      <View className="border-border overflow-hidden rounded-xl border">
        <Swipe
          haptics
          onOpenChange={(side) => side && setStatus(`Open on the ${side}.`)}
        >
          <Swipe.Start>
            <Swipe.Action
              icon={<CheckIcon />}
              label="Done"
              color="success"
              onPress={() => setStatus("Marked done.")}
            />
          </Swipe.Start>
          <Swipe.End>
            <Swipe.Action
              icon={<BellIcon />}
              label="Snooze"
              color="warning"
              onPress={() => setStatus("Snoozed until tomorrow.")}
            />
            <Swipe.Action
              icon={<TrashIcon />}
              label="Delete"
              color="destructive"
              onPress={() => setStatus("Deleted.")}
            />
          </Swipe.End>
          <Item>
            <Item.Content>
              <Item.Title>Renew the domain</Item.Title>
              <Item.Description>Due Friday</Item.Description>
            </Item.Content>
          </Item>
        </Swipe>
      </View>
      <Text size="sm" muted>
        {status}
      </Text>
    </View>
  );
}
function SwipeFullSwipeDemo() {
  const [log, setLog] = useState("Nothing fired yet.");
  return (
    <View className="w-full gap-4">
      <View className="gap-2">
        <Text size="sm" weight="medium">
          fullSwipe (default)
        </Text>
        <View className="border-border overflow-hidden rounded-xl border">
          <Swipe haptics>
            <Swipe.End>
              <Swipe.Action
                icon={<TrashIcon />}
                label="Delete"
                color="destructive"
                onPress={() => setLog("Fired by the swipe.")}
              />
            </Swipe.End>
            <Item>
              <Item.Content>
                <Item.Title>Draft note</Item.Title>
                <Item.Description>Carry the drag all the way</Item.Description>
              </Item.Content>
            </Item>
          </Swipe>
        </View>
      </View>

      <View className="gap-2">
        <Text size="sm" weight="medium">
          fullSwipe={"{false}"}
        </Text>
        <View className="border-border overflow-hidden rounded-xl border">
          <Swipe fullSwipe={false}>
            <Swipe.End>
              <Swipe.Action
                icon={<TrashIcon />}
                label="Delete"
                color="destructive"
                onPress={() => setLog("Fired by the tile.")}
              />
            </Swipe.End>
            <Item>
              <Item.Content>
                <Item.Title>Production database</Item.Title>
                <Item.Description>The tile has to be tapped</Item.Description>
              </Item.Content>
            </Item>
          </Swipe>
        </View>
      </View>

      <Text size="sm" muted>
        {log}
      </Text>
    </View>
  );
}
function SwipeKeepOpenDemo() {
  const [saved, setSaved] = useState(false);
  return (
    <View className="border-border w-full overflow-hidden rounded-xl border">
      <Swipe>
        <Swipe.Start>
          <Swipe.Action
            icon={<BookmarkIcon />}
            label={saved ? "Saved" : "Save"}
            color={saved ? "success" : "primary"}
            keepOpen
            onPress={() => setSaved((current) => !current)}
          />
        </Swipe.Start>
        <Item>
          <Item.Content>
            <Item.Title>Weekly digest</Item.Title>
            <Item.Description>
              {saved ? "Saved for later" : "Not saved"}
            </Item.Description>
          </Item.Content>
        </Item>
      </Swipe>
    </View>
  );
}
function SwipeRtlDemo() {
  return (
    <Direction dir="rtl" className="w-full">
      <View className="border-border overflow-hidden rounded-xl border">
        <Swipe>
          <Swipe.End>
            <Swipe.Action
              icon={<TrashIcon />}
              label="حذف"
              color="destructive"
            />
          </Swipe.End>
          <Item>
            <Item.Content>
              <Item.Title>فاتورة يوليو</Item.Title>
              <Item.Description>٢٫٤ ميغابايت</Item.Description>
            </Item.Content>
          </Item>
        </Swipe>
      </View>
    </Direction>
  );
}
export const entry: ComponentEntry = {
  slug: "swipe",
  name: "Swipe",
  summary: "A row that slides aside to reveal its actions",
  demos: [
    { label: "Swipe to delete", render: () => <SwipeDeleteDemo /> },
    { label: "Both sides", render: () => <SwipeBothSidesDemo /> },
    { label: "One row open at a time", render: () => <SwipeGroupDemo /> },
    { label: "Full swipe", render: () => <SwipeFullSwipeDemo /> },
    { label: "Keeping the row open", render: () => <SwipeKeepOpenDemo /> },
    { label: "Right to left", render: () => <SwipeRtlDemo /> },
  ],
};
