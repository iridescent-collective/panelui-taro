import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Direction } from "panelui-taro/direction";
import { BookIcon, PlusIcon } from "panelui-taro/icons";
import { Menu } from "panelui-taro/menu";
import { Panelside, usePanelside } from "panelui-taro/panelside";
import { Text } from "panelui-taro/primitives/text";
import { useState, useSyncExternalStore } from "react";

const Reading = () => {
  const state = usePanelside();
  const progress = useSyncExternalStore(
    state.progress.subscribe,
    state.progress.getSnapshot,
    state.progress.getSnapshot
  );
  return (
    <Text size="xs">
      {JSON.stringify({
        docked: state.docked,
        open: state.open,
        progress: Math.round(progress * 100) / 100,
        route: state.route,
      })}
    </Text>
  );
};
const PageCounter = () => {
  const [count, setCount] = useState(0);
  return (
    <Button onPress={() => setCount(count + 1)}>{`Page count ${count}`}</Button>
  );
};
export const PanelsideShowcase = () => {
  const [overlay, setOverlay] = useState(false);
  const [rtl, setRtl] = useState(false);
  const [edge, setEdge] = useState(false);
  const [docked, setDocked] = useState(false);
  const [action, setAction] = useState("No action");
  const [query, setQuery] = useState("");
  return (
    <View className="flex flex-col gap-[24px]">
      <View className="flex h-[1040px] flex-col overflow-hidden rounded-[24px] border-[2px] border-solid border-[var(--panel-border)]">
        <Direction dir={rtl ? "rtl" : "ltr"} className="h-full min-h-0">
          <Panelside
            defaultRoute="reading"
            mode={overlay ? "overlay" : "push"}
            swipeFrom={edge ? "edge" : "anywhere"}
            dock={docked ? 300 : false}
            className="h-full"
          >
            <Panelside.Panel>
              <Panelside.Header
                title="Assistant"
                action={
                  <Panelside.SearchTrigger
                    onPress={() => setAction("Search requested")}
                  />
                }
              >
                <Panelside.Search value={query} onChangeText={setQuery} />
              </Panelside.Header>
              <Panelside.Content>
                <Panelside.Group>
                  <Panelside.GroupLabel>Recents</Panelside.GroupLabel>
                  <Panelside.Item
                    label="Reading"
                    icon={<BookIcon size={20} />}
                    to="reading"
                    badge={3}
                  >
                    <Panelside.ItemActions>
                      <Menu.Item onSelect={() => setAction("Renamed reading")}>
                        Rename
                      </Menu.Item>
                      <Menu.Item
                        variant="destructive"
                        onSelect={() => setAction("Deleted reading")}
                      >
                        Delete
                      </Menu.Item>
                    </Panelside.ItemActions>
                  </Panelside.Item>
                  <Panelside.Item label="Activities" to="activities" />
                </Panelside.Group>
              </Panelside.Content>
              <Panelside.Footer surface="fade">
                <Panelside.Cta
                  label="New chat"
                  icon={<PlusIcon size={20} />}
                  onPress={() => setAction("New chat")}
                />
              </Panelside.Footer>
            </Panelside.Panel>
            <Panelside.Scene>
              <View className="flex flex-1 flex-col gap-[24px] p-[24px]">
                <Panelside.Trigger />
                <Panelside.Pages>
                  <Panelside.Page value="reading">
                    <Text size="lg" weight="semibold">
                      Reading page
                    </Text>
                    <PageCounter />
                  </Panelside.Page>
                  <Panelside.Page value="activities">
                    <Text size="lg" weight="semibold">
                      Activities page
                    </Text>
                    <Text size="sm">Swipe the scene to open navigation.</Text>
                  </Panelside.Page>
                </Panelside.Pages>
                <Reading />
              </View>
            </Panelside.Scene>
          </Panelside>
        </Direction>
      </View>
      <Text size="xs">
        {JSON.stringify({ action, docked, edge, overlay, query, rtl })}
      </Text>
      <Button onPress={() => setOverlay(!overlay)}>
        {overlay ? "Push mode" : "Overlay mode"}
      </Button>
      <Button onPress={() => setRtl(!rtl)}>
        {rtl ? "LTR panel" : "RTL panel"}
      </Button>
      <Button onPress={() => setEdge(!edge)}>
        {edge ? "Swipe anywhere" : "Swipe from edge"}
      </Button>
      <Button onPress={() => setDocked(!docked)}>
        {docked ? "Undock panel" : "Dock panel"}
      </Button>
    </View>
  );
};
