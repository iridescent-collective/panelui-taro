import { Button } from "panelui-taro/button";
import {
  BookmarkIcon,
  DownloadIcon,
  EllipsisIcon,
  LockIcon,
  PackageIcon,
  PencilIcon,
  PlusSquareIcon,
  ShareNodesIcon,
  TrashIcon,
} from "panelui-taro/icons";
import { Item } from "panelui-taro/item";
import { Label } from "panelui-taro/label";
import { Menu } from "panelui-taro/menu";
import { Text } from "panelui-taro/primitives/text";
import { RadioGroup } from "panelui-taro/radio-group";
import { Separator } from "panelui-taro/separator";
import { useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
function MenuViewOptionsDemo() {
  const [density, setDensity] = useState("comfortable");
  const [showDone, setShowDone] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  return (
    <View className="w-full items-center py-4">
      <Menu haptics>
        <Menu.Trigger>
          <Button variant="outline">View options</Button>
        </Menu.Trigger>
        <Menu.Content align="start" width={248}>
          <Menu.Label>Density</Menu.Label>

          <Menu.RadioGroup value={density} onValueChange={setDensity}>
            <Menu.RadioItem value="comfortable" indicator="dot">
              Comfortable
            </Menu.RadioItem>
            <Menu.RadioItem value="compact" indicator="dot">
              Compact
            </Menu.RadioItem>
          </Menu.RadioGroup>
          <Menu.Separator />
          <Menu.Label>Show</Menu.Label>

          <Menu.CheckboxItem checked={showDone} onCheckedChange={setShowDone}>
            Completed
          </Menu.CheckboxItem>
          <Menu.CheckboxItem
            checked={showArchived}
            onCheckedChange={setShowArchived}
          >
            Archived
          </Menu.CheckboxItem>
        </Menu.Content>
      </Menu>
    </View>
  );
}
function MenuSubmenuDemo() {
  const [moved, setMoved] = useState<string | null>(null);
  return (
    <View className="w-full items-center gap-3 py-4">
      <Menu>
        <Menu.Trigger>
          <Button variant="outline">File actions</Button>
        </Menu.Trigger>
        <Menu.Content align="start" width={244}>
          <Menu.Item icon={<PencilIcon size={16} />} shortcut="⌘R">
            Rename
          </Menu.Item>

          <Menu.Sub>
            <Menu.SubTrigger icon={<PackageIcon size={16} />}>
              Move to
            </Menu.SubTrigger>
            <Menu.SubContent>
              {["Inbox", "Projects", "Archive"].map((folder) => (
                <Menu.Item key={folder} onSelect={() => setMoved(folder)}>
                  {folder}
                </Menu.Item>
              ))}
            </Menu.SubContent>
          </Menu.Sub>
          <Menu.Separator />
          <Menu.Item
            variant="destructive"
            icon={<TrashIcon size={16} />}
            description="This cannot be undone"
          >
            Delete
          </Menu.Item>
        </Menu.Content>
      </Menu>
      <Text size="sm" muted>
        {moved ? `Moved to ${moved}` : "Nothing moved yet"}
      </Text>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "menu",
  name: "Menu",
  summary: "The list of things you can do to something",
  demos: [
    {
      label: "Putting something behind the panel",
      render: () => (
        <View className="w-full items-center py-4">
          <Menu>
            <Menu.Trigger>
              <Button variant="outline">Tinted panel</Button>
            </Menu.Trigger>
            <Menu.Content align="start" width={224}>
              <Menu.Background className="bg-overlay">
                <View className="bg-foreground/5 flex-1" />
              </Menu.Background>
              <Menu.Item icon={<PencilIcon size={16} />}>Rename</Menu.Item>
              <Menu.Item icon={<ShareNodesIcon size={16} />}>Share</Menu.Item>
              <Menu.Separator />
              <Menu.Item variant="destructive" icon={<TrashIcon size={16} />}>
                Delete
              </Menu.Item>
            </Menu.Content>
          </Menu>
        </View>
      ),
    },
    {
      label: "A menu of actions",
      render: () => (
        <View className="w-full items-center py-4">
          <Menu>
            <Menu.Trigger>
              <Button variant="outline">Options</Button>
            </Menu.Trigger>

            <Menu.Content align="start" width={224}>
              <Menu.Item icon={<ShareNodesIcon size={16} />} shortcut="⌘S">
                Share
              </Menu.Item>
              <Menu.Item icon={<PlusSquareIcon size={16} />}>
                Add to list
              </Menu.Item>
              <Menu.Item icon={<DownloadIcon size={16} />} disabled>
                Download
              </Menu.Item>
              <Menu.Separator />
              <Menu.Item variant="destructive" icon={<TrashIcon size={16} />}>
                Delete
              </Menu.Item>
            </Menu.Content>
          </Menu>
        </View>
      ),
    },
    {
      label: "Checkboxes and a radio group",
      render: () => <MenuViewOptionsDemo />,
    },
    {
      label: "A submenu, and a row that explains itself",
      render: () => <MenuSubmenuDemo />,
    },
    {
      label: "Labels, and rows that line up without an icon",
      render: () => (
        <View className="w-full items-center py-4">
          <Menu>
            <Menu.Trigger>
              <Button variant="ghost" size="icon" accessibilityLabel="More">
                <EllipsisIcon size={18} />
              </Button>
            </Menu.Trigger>
            <Menu.Content align="end" width={232}>
              <Menu.Label inset>Account</Menu.Label>

              <Menu.Item inset>Profile</Menu.Item>
              <Menu.Item inset shortcut="⌘,">
                Settings
              </Menu.Item>
              <Menu.Separator />
              <Menu.Item icon={<LockIcon size={16} />}>Lock screen</Menu.Item>
            </Menu.Content>
          </Menu>
        </View>
      ),
    },
    {
      label: "A long menu, scrolled",
      render: () => (
        <View className="w-full items-center py-4">
          <Menu>
            <Menu.Trigger>
              <Button variant="outline">Jump to section</Button>
            </Menu.Trigger>

            <Menu.Content align="start" width={230} maxHeight={260}>
              {Array.from({ length: 14 }, (_, index) => (
                <Menu.Item key={index} inset>
                  {`Section ${index + 1}`}
                </Menu.Item>
              ))}
            </Menu.Content>
          </Menu>
        </View>
      ),
    },
    {
      label: "As a bottom sheet",
      render: () => (
        <View className="w-full items-center py-4">
          <Menu presentation="bottom-sheet">
            <Menu.Trigger>
              <Button variant="outline">Open as a sheet</Button>
            </Menu.Trigger>
            <Menu.Content>
              <Menu.Item icon={<ShareNodesIcon size={16} />}>Share</Menu.Item>
              <Menu.Item icon={<BookmarkIcon size={16} />}>
                Save for later
              </Menu.Item>
              <Menu.Separator />
              <Menu.Item variant="destructive" icon={<TrashIcon size={16} />}>
                Delete
              </Menu.Item>
            </Menu.Content>
          </Menu>
        </View>
      ),
    },
  ],
};
