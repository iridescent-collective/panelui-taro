import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Fab } from "panelui-taro/fab";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from "panelui-taro/icons";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

export const FabShowcase = () => {
  const [layout, setLayout] = useState<"dial" | "menu" | "native">("dial");
  const [action, setAction] = useState("");
  const [open, setOpen] = useState(false);
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography id="panel-fab-result">
        {JSON.stringify({ action, layout, open })}
      </Typography>
      <Button
        variant="outline"
        onPress={() =>
          setLayout(
            ({ dial: "menu", menu: "native", native: "dial" } as const)[layout]
          )
        }
      >
        Layout: {layout}
      </Button>
      <View className="relative flex h-[700px] flex-col rounded-[24px] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-card)] p-[32px]">
        <Typography>Floating actions stay in this screen.</Typography>
        <Fab.Group
          open={open}
          onOpenChange={setOpen}
          layout={layout}
          icon={<PlusIcon size={24} />}
          accessibilityLabel="Add item"
          label="Create"
        >
          <Fab.Action
            icon={<PencilIcon size={18} />}
            label="Write note"
            onPress={() => setAction("Write note")}
          />
          <Fab.Action
            label="Unavailable"
            disabled
            onPress={() => setAction("Unavailable")}
          />
          <Fab.Action
            icon={<TrashIcon size={18} />}
            label="Remove"
            destructive
            onPress={() => setAction("Remove")}
          />
        </Fab.Group>
      </View>
      <Fab
        extended
        icon={<PencilIcon size={20} />}
        accessibilityLabel="Write"
        onPress={() => setAction("Write")}
      >
        Write
      </Fab>
    </View>
  );
};
