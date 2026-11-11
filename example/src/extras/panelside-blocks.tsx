import BubbleChatIcon from "@hugeicons/core-free-icons/BubbleChatIcon";
import Cancel01Icon from "@hugeicons/core-free-icons/Cancel01Icon";
import Delete02Icon from "@hugeicons/core-free-icons/Delete02Icon";
import Image01Icon from "@hugeicons/core-free-icons/Image01Icon";
import Menu01Icon from "@hugeicons/core-free-icons/Menu01Icon";
import Mic01Icon from "@hugeicons/core-free-icons/Mic01Icon";
import Package01Icon from "@hugeicons/core-free-icons/Package01Icon";
import PencilEdit02Icon from "@hugeicons/core-free-icons/PencilEdit02Icon";
import PlusSignIcon from "@hugeicons/core-free-icons/PlusSignIcon";
import Share01Icon from "@hugeicons/core-free-icons/Share01Icon";
import SourceCodeIcon from "@hugeicons/core-free-icons/SourceCodeIcon";
import StarIcon from "@hugeicons/core-free-icons/StarIcon";
import { AIInput } from "panelui-taro/ai-input";
import { Avatar } from "panelui-taro/avatar";
import { BottomSheet } from "panelui-taro/bottom-sheet";
import { Button } from "panelui-taro/button";
import { useIconColor } from "panelui-taro/icons";
import { Item } from "panelui-taro/item";
import { Marker } from "panelui-taro/marker";
import { Menu } from "panelui-taro/menu";
import { Message } from "panelui-taro/message";
import { MessageScroller } from "panelui-taro/message-scroller";
import {
  Panelside,
  usePanelside,
  type PanelsideProps,
  type PanelsideSceneProps,
} from "panelui-taro/panelside";
import { Text } from "panelui-taro/primitives/text";
import { useRef, useState, type ReactNode } from "react";

import { Glass } from "../runtime/glass";
import { HugeiconsIcon, type IconSvgElement } from "../runtime/icons";
import { Pressable, View } from "../runtime/native";
import { useSafeAreaInsets } from "../runtime/native";
import { router } from "../runtime/router";
import { useCSSVariable } from "../runtime/theme";
function Glyph({ icon, size = 20 }: { icon: IconSvgElement; size?: number }) {
  const color = useIconColor();
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      color={color ?? "#737373"}
      strokeWidth={1.8}
    />
  );
}
const NAV = [
  { id: "chats", label: "Chats", icon: <Glyph icon={BubbleChatIcon} /> },
  {
    id: "projects",
    label: "Projects",
    icon: <Glyph icon={Package01Icon} />,
    badge: 4,
  },
  { id: "artifacts", label: "Artifacts", icon: <Glyph icon={Image01Icon} /> },
  { id: "code", label: "Code", icon: <Glyph icon={SourceCodeIcon} /> },
];
const STARRED = [
  "Launch announcement thread",
  "Pricing page rewrite",
  "Onboarding email sequence",
];
const RECENTS = [
  "Migrating the design tokens",
  "Why is the bundle 4 MB",
  "Draft: quarterly retro notes",
  "Refactor the settings screen",
  "Copy for the empty states",
  "Comparing chart libraries",
  "Accessibility pass on forms",
  "Weekly standup summary",
];
function AssistantPanel({
  native = false,
  activeId,
  onSelect,
  routed = false,
  actions,
  starred = STARRED,
  recents = RECENTS,
  onSearch,
  onAccount,
}: {
  native?: boolean;
  activeId?: string;
  onSelect?: (title: string) => void;
  routed?: boolean;
  actions?: (title: string) => ReactNode;
  starred?: readonly string[];
  recents?: readonly string[];
  onSearch?: () => void;
  onAccount?: () => void;
}) {
  const { setOpen } = usePanelside();
  const select = onSelect
    ? (title: string) => {
        onSelect(title);
        setOpen(false);
      }
    : undefined;
  const control = native ? undefined : ("outline" as const);
  return (
    <Panelside.Panel>
      <Panelside.Header
        title="Assistant"
        action={
          <Panelside.SearchTrigger
            native={native}
            glass={native}
            variant={control}
            onPress={onSearch}
          />
        }
      />

      <Panelside.Content>
        <Panelside.Group>
          {NAV.map((item, index) => (
            <Panelside.Item
              key={item.id}
              icon={item.icon}
              label={item.label}
              badge={item.badge}
              active={index === 0}
            />
          ))}
        </Panelside.Group>

        {starred.length > 0 && (
          <Panelside.Group>
            <Panelside.GroupLabel>Starred</Panelside.GroupLabel>

            {starred.map((title) => (
              <Panelside.Item
                key={title}
                label={title}
                to={routed ? title : undefined}
                active={routed ? undefined : title === activeId}
                onPress={select && (() => select(title))}
              >
                {actions?.(title)}
              </Panelside.Item>
            ))}
          </Panelside.Group>
        )}

        {recents.length > 0 && (
          <Panelside.Group>
            <Panelside.GroupLabel>Recents</Panelside.GroupLabel>
            {recents.map((title) => (
              <Panelside.Item
                key={title}
                label={title}
                to={routed ? title : undefined}
                active={routed ? undefined : title === activeId}
                onPress={select && (() => select(title))}
              >
                {actions?.(title)}
              </Panelside.Item>
            ))}
          </Panelside.Group>
        )}
      </Panelside.Content>

      <Panelside.Footer>
        <Panelside.Cta
          className="shrink-0"
          icon={<Glyph icon={PlusSignIcon} size={18} />}
          label="New chat"
          size={native ? "xl" : "default"}
          native={native}
          glass={native}
        />
        <View className="flex-1" />
        {native ? (
          <Button
            native
            glass
            size="xl"
            variant="ghost"
            accessibilityLabel="Account"
            onPress={onAccount}
          >
            K
          </Button>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Account"
            className="shrink-0"
            onPress={onAccount}
          >
            <Avatar size="md" fallback="K" />
          </Pressable>
        )}
      </Panelside.Footer>
    </Panelside.Panel>
  );
}
function SceneBar({
  title,
  native = false,
}: {
  title: string;
  native?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const { docked } = usePanelside();
  const tint = useCSSVariable("--color-foreground");
  const glyph = typeof tint === "string" ? tint : undefined;
  const shape = native ? undefined : "h-10 w-10 rounded-full";
  const variant = native ? "ghost" : "outline";
  return (
    <View
      style={{ paddingTop: insets.top + 8 }}
      className="flex-row items-center gap-2 px-3 pb-3"
    >
      <Panelside.Trigger>
        <Button
          native={native}
          glass={native}
          size="icon"
          variant={variant}
          className={shape}
          accessibilityLabel="Open navigation panel"
        >
          <HugeiconsIcon
            icon={Menu01Icon}
            size={20}
            color={glyph ?? "#737373"}
            strokeWidth={1.8}
          />
        </Button>
      </Panelside.Trigger>

      <Text
        size="lg"
        weight="semibold"
        numberOfLines={1}
        className={docked ? "flex-1" : "flex-1 text-center"}
      >
        {title}
      </Text>

      <Button
        native={native}
        glass={native}
        size="icon"
        variant={variant}
        className={shape}
        accessibilityLabel="Close demo"
        onPress={() => router.back()}
      >
        <HugeiconsIcon
          icon={Cancel01Icon}
          size={18}
          color={glyph ?? "#737373"}
          strokeWidth={1.8}
        />
      </Button>
    </View>
  );
}
interface Turn {
  id: string;
  role: "user" | "assistant";
  text: string;
}
const THREAD: Turn[] = [
  {
    id: "t1",
    role: "user",
    text: "Where should the semantic colours live once the primitives move?",
  },
  {
    id: "t2",
    role: "assistant",
    text: "Keep the primitives in one file and derive every semantic name from them in a second. Nothing outside the theme should reference a primitive directly.",
  },
  { id: "t3", role: "user", text: "And the dark values?" },
  {
    id: "t4",
    role: "assistant",
    text: "Same names, resolved per theme. A component asks for the semantic token and never learns which theme answered.",
  },
  { id: "t5", role: "user", text: "What breaks if someone reaches past it?" },
  {
    id: "t6",
    role: "assistant",
    text: "Nothing visible, at first. Then a theme lands where that primitive means something else, and the component is the only thing on the screen still wearing last season.",
  },
];
function Turn({ turn }: { turn: Turn }) {
  return turn.role === "user" ? (
    <Message align="end">
      <Message.Content>
        <Message.Bubble>
          <Message.BubbleContent>{turn.text}</Message.BubbleContent>
        </Message.Bubble>
      </Message.Content>
    </Message>
  ) : (
    <Message>
      <Message.Avatar>
        <Avatar size="sm" fallback="AI" />
      </Message.Avatar>
      <Message.Content>
        <Message.Bubble>
          <Message.BubbleContent>{turn.text}</Message.BubbleContent>
        </Message.Bubble>
      </Message.Content>
    </Message>
  );
}
function Transcript() {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-1 gap-3 px-4"
      style={{ paddingBottom: insets.bottom + 12 }}
    >
      {THREAD.slice(0, 4).map((turn) => (
        <Turn key={turn.id} turn={turn} />
      ))}
    </View>
  );
}
function AssistantDemo({
  sceneProps,
  scene,
  native = false,
  title = "Migrating the design tokens",
  activeId,
  onSelect,
  routed,
  actions,
  starred,
  recents,
  ...props
}: Partial<PanelsideProps> & {
  sceneProps?: Partial<PanelsideSceneProps>;
  scene?: React.ReactNode;
  native?: boolean;
  title?: string;
  activeId?: string;
  onSelect?: (title: string) => void;
  routed?: boolean;
  actions?: (title: string) => ReactNode;
  starred?: readonly string[];
  recents?: readonly string[];
}) {
  return (
    <Panelside haptics {...props}>
      <AssistantPanel
        native={native}
        activeId={activeId}
        onSelect={onSelect}
        routed={routed}
        actions={actions}
        starred={starred}
        recents={recents}
      />
      <Panelside.Scene {...sceneProps}>
        <SceneBar title={title} native={native} />
        {scene ?? <Transcript />}
      </Panelside.Scene>
    </Panelside>
  );
}
export function PanelsideAssistantBlock() {
  return <AssistantDemo title="Migrating the design tokens" />;
}
export function PanelsideOverlayBlock() {
  return <AssistantDemo mode="overlay" title="Why is the bundle 4 MB" />;
}
function DockedScene() {
  const { docked } = usePanelside();
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-1 gap-3 px-4"
      style={{ paddingBottom: insets.bottom + 12 }}
    >
      <View className="bg-secondary rounded-xl p-4">
        <Text weight="semibold">{docked ? "Docked" : "Not docked yet"}</Text>
        <Text size="sm" muted className="mt-1">
          {docked
            ? "The panel is a column of this layout. It has no trigger, no gesture and no scrim, because there is nothing to open."
            : "Rotate the device. Past 700 points the panel stops being an overlay and takes a column of its own."}
        </Text>
      </View>
      {THREAD.slice(0, 2).map((turn) => (
        <Turn key={turn.id} turn={turn} />
      ))}
    </View>
  );
}
export function PanelsideDockedBlock() {
  return (
    <AssistantDemo
      dock={700}
      title="Weekly standup summary"
      scene={<DockedScene />}
    />
  );
}
export function PanelsideCurveBlock() {
  return (
    <AssistantDemo
      title="Copy for the empty states"
      sceneProps={{ scale: 0.72, radius: 44, dim: 0.7 }}
    />
  );
}
const REPLY =
  "Looking at it now. The token file resolves every semantic name per theme, so a component asking for the muted foreground gets the right value in all six without knowing any of them exist. The only rule is that nothing outside the theme reads a primitive.";
function ChatScene() {
  const [turns, setTurns] = useState<Turn[]>(THREAD.slice(0, 4));
  const [streaming, setStreaming] = useState(false);
  const insets = useSafeAreaInsets();
  const send = () => {
    if (streaming) return;
    const askId = `ask-${Date.now()}`;
    const replyId = `reply-${Date.now()}`;
    setTurns((current) => [
      ...current,
      {
        id: askId,
        role: "user",
        text: "Show me how a theme resolves one token.",
      },
      { id: replyId, role: "assistant", text: "" },
    ]);
    setStreaming(true);
    const words = REPLY.split(" ");
    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setTurns((current) =>
        current.map((turn) =>
          turn.id === replyId
            ? { ...turn, text: words.slice(0, index).join(" ") }
            : turn
        )
      );
      if (index >= words.length) {
        clearInterval(timer);
        setStreaming(false);
      }
    }, 70);
  };
  return (
    <View className="flex-1">
      <MessageScroller autoScroll className="flex-1">
        <MessageScroller.Viewport>
          <MessageScroller.Content>
            {turns.map((turn) => (
              <MessageScroller.Item
                key={turn.id}
                messageId={turn.id}
                scrollAnchor={turn.role === "user"}
              >
                <Turn turn={turn} />
              </MessageScroller.Item>
            ))}
            {streaming ? (
              <Marker>
                <Marker.Content shimmer>Thinking…</Marker.Content>
              </Marker>
            ) : null}
          </MessageScroller.Content>
        </MessageScroller.Viewport>
        <MessageScroller.Button />
      </MessageScroller>

      <View
        className="border-border border-t px-4 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        <Button onPress={send} loading={streaming} fullWidth>
          {streaming ? "Streaming" : "Send a message"}
        </Button>
      </View>
    </View>
  );
}
export function PanelsideChatBlock() {
  return <AssistantDemo scene={<ChatScene />} title="Theme tokens" />;
}
function NativeChatScene() {
  const [turns, setTurns] = useState<Turn[]>(THREAD.slice(0, 2));
  const [draft, setDraft] = useState("");
  const [attaching, setAttaching] = useState(false);
  const insets = useSafeAreaInsets();
  const nextId = useRef(0);
  const send = (value: string) => {
    const text = value.trim();
    if (!text) return;
    nextId.current += 1;
    const id = nextId.current;
    setDraft("");
    setTurns((current) => [...current, { id: `u${id}`, role: "user", text }]);
    setTimeout(() => {
      setTurns((current) => [
        ...current,
        {
          id: `a${id}`,
          role: "assistant",
          text: "Noted. Anything that reads a primitive directly is the thing to change first.",
        },
      ]);
    }, 700);
  };
  return (
    <View className="flex-1">
      <MessageScroller autoScroll className="flex-1">
        <MessageScroller.Viewport>
          <MessageScroller.Content>
            {turns.map((turn) => (
              <MessageScroller.Item
                key={turn.id}
                messageId={turn.id}
                scrollAnchor={turn.role === "user"}
              >
                <Turn turn={turn} />
              </MessageScroller.Item>
            ))}
          </MessageScroller.Content>
        </MessageScroller.Viewport>
        <MessageScroller.Button />
      </MessageScroller>

      <View
        className="px-3 pt-2"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        <AIInput
          native
          value={draft}
          onValueChange={setDraft}
          onSubmit={send}
          keyboardBottomInset={Math.max(insets.bottom, 12)}
          keyboardGap={12}
        >
          <AIInput.Field placeholder="Message the assistant" />
          <AIInput.Toolbar>
            <AIInput.Action
              label="Attach"
              icon={<Glyph icon={PlusSignIcon} size={17} />}
              onPress={() => setAttaching(true)}
            />
            <AIInput.Spacer />
            <AIInput.Action
              label="Dictate"
              icon={<Glyph icon={Mic01Icon} size={15} />}
            />
            <AIInput.Submit />
          </AIInput.Toolbar>
        </AIInput>
      </View>

      <BottomSheet
        native
        open={attaching}
        onOpenChange={setAttaching}
        snapPoints={["half"]}
      >
        <BottomSheet.Content>
          <BottomSheet.Header
            title="Attach"
            description="Anything the assistant should read."
          />
          <BottomSheet.Body>
            {["Photo library", "Files", "Camera"].map((label) => (
              <Item key={label}>
                <Item.Content>
                  <Item.Title>{label}</Item.Title>
                </Item.Content>
              </Item>
            ))}
          </BottomSheet.Body>
        </BottomSheet.Content>
      </BottomSheet>
    </View>
  );
}
export function PanelsideNativeBlock() {
  return (
    <AssistantDemo
      native
      scene={<NativeChatScene />}
      title="Refactor the settings screen"
    />
  );
}
function conversation(title: string): Turn[] {
  return [
    {
      id: `${title}-1`,
      role: "user",
      text: `${title} — where did we leave this?`,
    },
    {
      id: `${title}-2`,
      role: "assistant",
      text: `Two things outstanding on “${title}”. The first is a decision, the second is only work.`,
    },
    { id: `${title}-3`, role: "user", text: "Which is the decision?" },
    {
      id: `${title}-4`,
      role: "assistant",
      text: "Whether it ships behind a flag. Everything after that follows from the answer, so it is the one worth spending the meeting on.",
    },
  ];
}
function ConversationScene({ title }: { title: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-1 gap-3 px-4"
      style={{ paddingBottom: insets.bottom + 12 }}
    >
      {conversation(title).map((turn) => (
        <Turn key={turn.id} turn={turn} />
      ))}
    </View>
  );
}
const CONVERSATIONS = [...STARRED, ...RECENTS];
export function PanelsideNavigateBlock() {
  const [route, setRoute] = useState(CONVERSATIONS[0] as string);
  return (
    <AssistantDemo
      routed
      route={route}
      onRouteChange={setRoute}
      title={route}
      scene={
        <Panelside.Pages>
          {["New chat", ...CONVERSATIONS].map((title) => (
            <Panelside.Page key={title} value={title}>
              <ConversationScene title={title} />
            </Panelside.Page>
          ))}
        </Panelside.Pages>
      }
    />
  );
}
export function PanelsideActionsBlock() {
  const [starred, setStarred] = useState<readonly string[]>(STARRED);
  const [recents, setRecents] = useState<readonly string[]>(RECENTS);
  const [active, setActive] = useState(STARRED[0] as string);
  const rename = (title: string) => {
    const next = `${title} (renamed)`;
    const swap = (list: readonly string[]) =>
      list.map((entry) => (entry === title ? next : entry));
    setStarred(swap);
    setRecents(swap);
    setActive((current) => (current === title ? next : current));
  };
  const star = (title: string) => {
    if (starred.includes(title)) return;
    setStarred((list) => [...list, title]);
    setRecents((list) => list.filter((entry) => entry !== title));
  };
  const remove = (title: string) => {
    const drop = (list: readonly string[]) =>
      list.filter((entry) => entry !== title);
    setStarred(drop);
    setRecents(drop);
  };
  return (
    <AssistantDemo
      title={active}
      activeId={active}
      onSelect={setActive}
      starred={starred}
      recents={recents}
      scene={<ConversationScene title={active} />}
      actions={(title) => (
        <Panelside.ItemActions>
          <Menu.Item
            icon={<Glyph icon={PencilEdit02Icon} size={17} />}
            onSelect={() => rename(title)}
          >
            Rename
          </Menu.Item>
          <Menu.Item
            icon={<Glyph icon={StarIcon} size={17} />}
            onSelect={() => star(title)}
          >
            Star
          </Menu.Item>
          <Menu.Item icon={<Glyph icon={Share01Icon} size={17} />}>
            Share
          </Menu.Item>
          <Menu.Separator />
          <Menu.Item
            variant="destructive"
            icon={<Glyph icon={Delete02Icon} size={17} />}
            onSelect={() => remove(title)}
          >
            Delete
          </Menu.Item>
        </Panelside.ItemActions>
      )}
    />
  );
}
