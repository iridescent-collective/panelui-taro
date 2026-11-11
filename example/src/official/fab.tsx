import { Button } from "panelui-taro/button";
import { ButtonGroup } from "panelui-taro/button-group";
import { Fab } from "panelui-taro/fab";
import {
  DownloadIcon,
  ImageIcon,
  MicIcon,
  PaperclipIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  SendIcon,
  StarIcon,
  TrashIcon,
} from "panelui-taro/icons";
import { Text } from "panelui-taro/primitives/text";
import { Surface } from "panelui-taro/surface";
import { useToast } from "panelui-taro/toast";
import { useState } from "react";

import { ScrollView, View } from "../runtime/native";
import { ComponentEntry } from "../types";
const FAB_NOTES = [
  "Rent, split three ways",
  "Return the drill",
  "Book the ferry",
  "Reply to Nadia",
  "Renew the domain",
  "Water the fig",
  "Cancel the trial",
  "Pick a paint colour",
  "Back up the phone",
  "Find the passport",
];
function FabListDemo() {
  const { toast } = useToast();
  return (
    <View className="min-h-0 flex-1">
      <ScrollView
        className="h-0 flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-2">
          {FAB_NOTES.map((note) => (
            <Surface
              key={note}
              variant="secondary"
              padding="default"
              className="rounded-xl"
            >
              <Text>{note}</Text>
            </Surface>
          ))}
        </View>
      </ScrollView>

      <Fab
        placement="bottom-right"
        icon={<PlusIcon size={24} />}
        accessibilityLabel="New note"
        haptics
        onPress={() =>
          toast.show({ variant: "success", label: "New note", duration: 1800 })
        }
      />
    </View>
  );
}
function FabPlacementsDemo() {
  const [placement, setPlacement] = useState<
    "bottom-left" | "bottom-center" | "bottom-right"
  >("bottom-right");
  return (
    <View className="min-h-0 flex-1">
      <View className="gap-3 p-4">
        <Text size="sm" muted>
          A lone glyph is a guess unless it is a plus, so this one spells itself
          out.
        </Text>
        <ButtonGroup fullWidth size="sm">
          {(["bottom-left", "bottom-center", "bottom-right"] as const).map(
            (option) => (
              <Button
                key={option}
                variant={placement === option ? "secondary" : "ghost"}
                onPress={() => setPlacement(option)}
              >
                {option === "bottom-left"
                  ? "Left"
                  : option === "bottom-center"
                    ? "Centre"
                    : "Right"}
              </Button>
            )
          )}
        </ButtonGroup>
      </View>

      <Fab extended placement={placement} icon={<PencilIcon size={20} />}>
        Write
      </Fab>
    </View>
  );
}
function FabGlassDemo({
  layout = "dial",
  appearance = "platform",
}: {
  layout?: "dial" | "menu" | "native";
  appearance?: "platform" | "wells";
}) {
  const { toast } = useToast();
  const pick = (what: string, destructive = false) =>
    toast.show({
      variant: destructive ? "destructive" : "info",
      label: what,
      duration: 1800,
    });
  return (
    <View className="min-h-0 flex-1">
      <ScrollView
        className="h-0 flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-2">
          {FAB_NOTES.map((note) => (
            <Surface
              key={note}
              variant="secondary"
              padding="default"
              className="rounded-xl"
            >
              <Text>{note}</Text>
            </Surface>
          ))}
        </View>
      </ScrollView>

      <Fab.Group
        glass
        layout={layout}
        appearance={appearance}
        icon={<PlusIcon size={24} />}
        accessibilityLabel="Add something"
        placement="bottom-right"
        haptics
        blur
      >
        <Fab.Action
          icon={<ImageIcon size={18} />}
          systemImage="photo"
          label="Photo"
          onPress={() => pick("Photo added")}
        />
        <Fab.Action
          icon={<PaperclipIcon size={18} />}
          systemImage="paperclip"
          label="Attachment"
          onPress={() => pick("Attachment added")}
        />
        <Fab.Action
          icon={<MicIcon size={18} />}
          systemImage="mic"
          label="Voice note"
          onPress={() => pick("Recording")}
        />
        <Fab.Action
          icon={<TrashIcon size={18} />}
          systemImage="trash"
          label="Empty drafts"
          destructive
          onPress={() => pick("Drafts emptied", true)}
        />
      </Fab.Group>
    </View>
  );
}
function FabDialDemo() {
  const { toast } = useToast();
  const pick = (what: string, destructive = false) =>
    toast.show({
      variant: destructive ? "destructive" : "info",
      label: what,
      duration: 1800,
    });
  return (
    <View className="min-h-0 flex-1">
      <View className="gap-2 p-4">
        <Text size="sm" muted>
          Press the button. The actions unfold one after another, and the screen
          behind them says the next tap either picks one or closes it.
        </Text>
      </View>

      <Fab.Group
        icon={<PlusIcon size={24} />}
        accessibilityLabel="Add something"
        placement="bottom-right"
        haptics
        blur
      >
        <Fab.Action
          icon={<ImageIcon size={18} />}
          label="Photo"
          onPress={() => pick("Photo added")}
        />
        <Fab.Action
          icon={<PaperclipIcon size={18} />}
          label="Attachment"
          onPress={() => pick("Attachment added")}
        />
        <Fab.Action
          icon={<MicIcon size={18} />}
          label="Voice note"
          onPress={() => pick("Recording")}
        />
        <Fab.Action
          icon={<TrashIcon size={18} />}
          label="Empty drafts"
          destructive
          onPress={() => pick("Drafts emptied", true)}
        />
      </Fab.Group>
    </View>
  );
}
function FabSizesDemo() {
  return (
    <View className="w-full gap-6 p-4">
      <View className="gap-2">
        <Text size="xs" muted>
          Sizes
        </Text>
        <View className="flex-row items-center gap-4">
          {(["sm", "md", "lg"] as const).map((size) => (
            <Fab
              key={size}
              size={size}
              icon={<PlusIcon size={20} />}
              accessibilityLabel={size}
            />
          ))}
        </View>
      </View>

      <View className="gap-2">
        <Text size="xs" muted>
          Variants
        </Text>
        <View className="flex-row items-center gap-4">
          <Fab icon={<PlusIcon size={20} />} accessibilityLabel="Primary" />
          <Fab
            variant="secondary"
            icon={<StarIcon size={20} />}
            accessibilityLabel="Secondary"
          />
          <Fab
            variant="surface"
            icon={<SearchIcon size={20} />}
            accessibilityLabel="Surface"
          />
          <Fab
            variant="destructive"
            icon={<TrashIcon size={20} />}
            accessibilityLabel="Delete"
          />
        </View>
      </View>

      <View className="gap-2">
        <Text size="xs" muted>
          Liquid Glass — needs iOS 26
        </Text>
        <View className="flex-row flex-wrap items-center gap-4">
          <Fab
            glass
            icon={<PlusIcon size={20} />}
            accessibilityLabel="Primary"
          />
          <Fab
            glass
            variant="secondary"
            icon={<StarIcon size={20} />}
            accessibilityLabel="Secondary"
          />
          <Fab
            glass
            variant="surface"
            icon={<SearchIcon size={20} />}
            accessibilityLabel="Surface"
          />
          <Fab
            glass
            variant="destructive"
            icon={<TrashIcon size={20} />}
            accessibilityLabel="Delete"
          />
          <Fab
            glass
            extended
            icon={<SendIcon size={18} />}
            size="sm"
            variant="surface"
          >
            Send
          </Fab>
          <Fab glass extended icon={<PlusIcon size={18} />} size="sm" disabled>
            Add
          </Fab>
        </View>
      </View>

      <View className="gap-2">
        <Text size="xs" muted>
          Extended, and disabled
        </Text>
        <View className="flex-row flex-wrap items-center gap-3">
          <Fab extended icon={<SendIcon size={18} />} size="sm">
            Send
          </Fab>
          <Fab
            extended
            icon={<DownloadIcon size={18} />}
            size="sm"
            variant="surface"
          >
            Export
          </Fab>
          <Fab extended icon={<PlusIcon size={18} />} size="sm" disabled>
            Add
          </Fab>
        </View>
      </View>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "fab",
  name: "Fab",
  summary: "The floating action button, and the dial behind it",
  demos: [
    {
      label: "Over a list",
      id: "list",
      fullPage: true,
      description:
        "The case it exists for — one action pinned over content that scrolls under it.",
      render: () => <FabListDemo />,
    },
    {
      label: "A speed dial",
      id: "dial",
      fullPage: true,
      description:
        "Actions unfolding out of the button, over a screen that says the dial is modal.",
      render: () => <FabDialDemo />,
    },
    {
      label: "Where it parks",
      id: "placement",
      fullPage: true,
      description:
        "The extended form, in each of the three corners it can take.",
      render: () => <FabPlacementsDemo />,
    },
    {
      label: "Liquid Glass",
      id: "glass",
      fullPage: true,
      description:
        "A dial in the platform material over the list — needs iOS 26. Anywhere else it is the filled one.",
      render: () => <FabGlassDemo />,
    },
    {
      label: "A menu",
      id: "menu",
      fullPage: true,
      description:
        "One panel of rows springing out of the button, in the material — the shape the platform's own menus take.",
      render: () => <FabGlassDemo layout="menu" />,
    },
    {
      label: "A menu, with wells",
      id: "menu-wells",
      fullPage: true,
      description:
        "The same menu in the wells appearance: the glyph leads in a tinted well and each row is its own pill.",
      render: () => <FabGlassDemo layout="menu" appearance="wells" />,
    },
    {
      label: "A native menu",
      id: "native-menu",
      fullPage: true,
      description:
        "The platform's own menu, drawn by SwiftUI or Jetpack Compose, over a page the scrim frosts.",
      render: () => <FabGlassDemo layout="native" />,
    },
    { label: "Sizes and variants", render: () => <FabSizesDemo /> },
  ],
};
