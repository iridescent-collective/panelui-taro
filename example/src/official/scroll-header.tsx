import { Avatar } from "panelui-taro/avatar";
import { Badge } from "panelui-taro/badge";
import { Button } from "panelui-taro/button";
import { ButtonGroup } from "panelui-taro/button-group";
import { Chip } from "panelui-taro/chip";
import {
  BellIcon,
  BookmarkIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisIcon,
  GlobeIcon,
  LinkIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  ShareNodesIcon,
} from "panelui-taro/icons";
import { Item } from "panelui-taro/item";
import { Text } from "panelui-taro/primitives/text";
import { ScrollHeader } from "panelui-taro/scroll-header";
import { SearchBar } from "panelui-taro/search-bar";
import { Tabs } from "panelui-taro/tabs";
import { useState } from "react";

import { demoAction } from "../runtime/demo-action";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from "../runtime/motion";
import {
  FlatList,
  Image,
  ScrollView,
  SectionList,
  View,
} from "../runtime/native";
import { useCSSVariable } from "../runtime/theme";
import { ComponentEntry } from "../types";
function useSeriesRamp() {
  const one = useCSSVariable("--color-chart-1");
  const two = useCSSVariable("--color-chart-2");
  const three = useCSSVariable("--color-chart-3");
  const four = useCSSVariable("--color-chart-4");
  const five = useCSSVariable("--color-chart-5");
  return [one, two, three, four, five].map((value) =>
    typeof value === "string" ? value : "#6366f1"
  );
}
function repeat<T, U>(
  seed: readonly T[],
  count: number,
  build: (row: T, index: number, pass: number) => U
): U[] {
  return Array.from({ length: count }, (_, index) =>
    build(seed[index % seed.length], index, Math.floor(index / seed.length))
  );
}
function scatter(index: number, span: number) {
  let h = Math.imul(index + 1, 2654435761);
  h ^= h >>> 15;
  h = Math.imul(h, 2246822519);
  h ^= h >>> 13;
  return Math.abs(h) % span;
}
const TRACK_SEED = [
  { name: "Weightless Halls", artist: "Vela Sound", time: "4:12" },
  { name: "Paper Harbour", artist: "June Mould", time: "3:38" },
  { name: "Long Wave", artist: "Atlas Rooms", time: "5:04" },
  { name: "Ninth Street", artist: "Marisol Vane", time: "2:57" },
  { name: "Slow Ascent", artist: "Vela Sound", time: "6:21" },
  { name: "Northerly", artist: "Halden Pike", time: "3:11" },
  { name: "Blue Hour", artist: "June Mould", time: "4:45" },
  { name: "Quiet Signal", artist: "Atlas Rooms", time: "3:52" },
  { name: "Copper Field", artist: "Halden Pike", time: "5:30" },
  { name: "Tideline", artist: "Marisol Vane", time: "4:03" },
];
const TRACKS = repeat(TRACK_SEED, 40, (row, index, pass) => ({
  ...row,
  id: `t${index}`,
  name:
    pass === 0
      ? row.name
      : `${row.name} (${["Live", "Reprise", "Demo"][pass - 1]})`,
  time: `${2 + scatter(index, 5)}:${String(scatter(index + 11, 60)).padStart(2, "0")}`,
}));
function ScrollHeaderPlainVersion() {
  const ramp = useSeriesRamp();
  return (
    <ScrollHeader className="bg-background flex-1">
      <ScrollHeader.Bar>
        <ScrollHeader.Title>Library</ScrollHeader.Title>
        <ScrollHeader.Actions>
          <Button
            variant="ghost"
            size="icon"
            accessibilityLabel="Search"
            onPress={demoAction("Search")}
          >
            <SearchIcon size={18} />
          </Button>
        </ScrollHeader.Actions>
      </ScrollHeader.Bar>

      <ScrollHeader.Large>
        <ScrollHeader.Title>Library</ScrollHeader.Title>
        <ScrollHeader.Description>
          {TRACKS.length} songs · 2 hours 41 minutes
        </ScrollHeader.Description>
      </ScrollHeader.Large>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-1 px-4 pt-3 pb-16">
          {TRACKS.map((track, index) => (
            <Item key={track.id} size="sm">
              <Item.Media variant="image" className="h-11 w-11">
                <View
                  className="h-full w-full"
                  style={{ backgroundColor: ramp[index % ramp.length] }}
                />
              </Item.Media>
              <Item.Content>
                <Item.Title numberOfLines={1}>{track.name}</Item.Title>
                <Item.Description>{track.artist}</Item.Description>
              </Item.Content>
              <Text size="sm" muted>
                {track.time}
              </Text>
            </Item>
          ))}
        </View>
      </ScrollView>
    </ScrollHeader>
  );
}
const SCROLL_HEADER_COVER =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=70";
const ALBUM_SEED = [
  "photo-1470071459604-3b5ec3a7fe05",
  "photo-1554080353-a576cf803bda",
  "photo-1441974231531-c6227db76b6e",
  "photo-1501854140801-50d01698950b",
  "photo-1426604966848-d7adac402bff",
  "photo-1472214103451-9374bd1c798e",
  "photo-1433086966358-54859d0ed716",
  "photo-1444927714506-8492d94b4e3d",
  "photo-1418065460487-3e41a6c84dc5",
  "photo-1470770841072-f978cf4d019e",
  "photo-1469474968028-56623f02e42e",
  "photo-1447752875215-b2761acb3c5d",
];
const ALBUM_FRAMES = repeat(ALBUM_SEED, 36, (frame, index) => ({
  id: `f${index}`,
  frame,
}));
function ScrollHeaderCoverVersion() {
  return (
    <ScrollHeader className="bg-background flex-1">
      <ScrollHeader.Cover source={{ uri: SCROLL_HEADER_COVER }} />

      <ScrollHeader.Bar surface="none" divider={false}>
        <Button
          variant="ghost"
          size="icon"
          accessibilityLabel="Back"
          onPress={demoAction("Back")}
        >
          <ChevronLeftIcon size={20} color="#fff" />
        </Button>
        <ScrollHeader.Title className="text-white">
          Sierra Nevada
        </ScrollHeader.Title>
        <ScrollHeader.Actions>
          <Button
            variant="ghost"
            size="icon"
            accessibilityLabel="Share"
            onPress={demoAction("Share")}
          >
            <ShareNodesIcon size={18} color="#fff" />
          </Button>
        </ScrollHeader.Actions>
      </ScrollHeader.Bar>

      <ScrollHeader.Large className="h-56 justify-end pb-5">
        <ScrollHeader.Title className="text-white">
          Sierra Nevada
        </ScrollHeader.Title>
        <ScrollHeader.Description className="text-white/80">
          {ALBUM_FRAMES.length} photographs · September
        </ScrollHeader.Description>
      </ScrollHeader.Large>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-wrap gap-1 p-1 pb-16">
          {ALBUM_FRAMES.map((tile) => (
            <View
              key={tile.id}
              className="bg-muted aspect-square flex-1 basis-[31%] overflow-hidden rounded-md"
            >
              <Image
                source={{
                  uri: `https://images.unsplash.com/${tile.frame}?auto=format&fit=crop&w=400&q=60`,
                }}
                resizeMode="cover"
                className="h-full w-full"
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </ScrollHeader>
  );
}
const MESSAGE_SEED = [
  { from: "Ada Whitfield", initials: "AW", subject: "Re: quarterly figures" },
  { from: "Tobias Lund", initials: "TL", subject: "Draft for Thursday" },
  { from: "Priya Raman", initials: "PR", subject: "Studio visit next week?" },
  { from: "Marcus Feld", initials: "MF", subject: "Invoice 2261" },
  { from: "Ines Carvalho", initials: "IC", subject: "Photos from the coast" },
  { from: "Jonas Kerr", initials: "JK", subject: "Rescheduling" },
  {
    from: "Greta Lindqvist",
    initials: "GL",
    subject: "The east stair drawing",
  },
  { from: "Hugo Bellamy", initials: "HB", subject: "Signed and returned" },
  { from: "Nadia Haddad", initials: "NH", subject: "One more thing" },
  { from: "Soren Dahl", initials: "SD", subject: "Tender pack, revised" },
];
const WHEN = [
  "09:41",
  "08:02",
  "Yesterday",
  "Tuesday",
  "Monday",
  "28 Aug",
  "21 Aug",
  "14 Aug",
];
const MESSAGES = repeat(MESSAGE_SEED, 40, (row, index, pass) => ({
  ...row,
  id: `m${index}`,
  subject: pass === 0 ? row.subject : `Re: ${row.subject}`,
  time: WHEN[Math.min(WHEN.length - 1, Math.floor(index / 5))],
}));
function ScrollHeaderSearchVersion() {
  const [query, setQuery] = useState("");
  const rows = MESSAGES.filter((message) =>
    `${message.from} ${message.subject}`
      .toLowerCase()
      .includes(query.trim().toLowerCase())
  );
  return (
    <ScrollHeader className="bg-background flex-1" threshold={0.6}>
      <ScrollHeader.Bar>
        <ScrollHeader.Title>Inbox</ScrollHeader.Title>
      </ScrollHeader.Bar>

      <ScrollHeader.Large className="pb-4">
        <ScrollHeader.Title>Inbox</ScrollHeader.Title>
        <ScrollHeader.Description>
          {rows.length} of {MESSAGES.length}
        </ScrollHeader.Description>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search mail"
          className="mt-2"
        />
      </ScrollHeader.Large>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-1 px-4 pt-3 pb-16">
          {rows.map((message) => (
            <Item key={message.id} size="sm">
              <Item.Media>
                <Avatar size="sm" fallback={message.initials} />
              </Item.Media>
              <Item.Content>
                <Item.Title>{message.from}</Item.Title>
                <Item.Description numberOfLines={1}>
                  {message.subject}
                </Item.Description>
              </Item.Content>
              <Text size="xs" muted>
                {message.time}
              </Text>
            </Item>
          ))}
        </View>
      </ScrollView>
    </ScrollHeader>
  );
}
const HOLDING_SEED = [
  { ticker: "ARLO", name: "Arlo Materials" },
  { ticker: "NVEC", name: "Novec Systems" },
  { ticker: "KLDR", name: "Kelder Group" },
  { ticker: "BRWN", name: "Brunwick Rail" },
  { ticker: "SOLT", name: "Soltera Energy" },
  { ticker: "MRDN", name: "Meridian Foods" },
  { ticker: "HALV", name: "Halvorsen Marine" },
  { ticker: "PTRA", name: "Petra Instruments" },
  { ticker: "CYGN", name: "Cygnet Media" },
  { ticker: "ODRA", name: "Odra Chemical" },
];
const HOLDINGS = repeat(HOLDING_SEED, 40, (row, index, pass) => {
  const move = (scatter(index + 7, 90) - 45) / 10;
  return {
    ...row,
    id: `h${index}`,
    ticker:
      pass === 0 ? row.ticker : `${row.ticker}.${["L", "DE", "PA"][pass - 1]}`,
    price: (40 + scatter(index, 1800) / 10).toFixed(2),
    change: `${move >= 0 ? "+" : ""}${move.toFixed(1)}%`,
    up: move >= 0,
  };
});
function ScrollHeaderCrossingVersion() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <ScrollHeader
      className="bg-background flex-1"
      onCollapsedChange={setCollapsed}
    >
      <ScrollHeader.Bar>
        <ScrollHeader.Title>Portfolio</ScrollHeader.Title>
        <ScrollHeader.Actions>
          {collapsed ? <Badge variant="success">+2.4%</Badge> : null}
        </ScrollHeader.Actions>
      </ScrollHeader.Bar>

      <ScrollHeader.Large>
        <ScrollHeader.Title>$48,210.55</ScrollHeader.Title>
        <ScrollHeader.Description>
          Portfolio · +2.4% today
        </ScrollHeader.Description>
      </ScrollHeader.Large>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-1 px-4 pt-3 pb-16">
          {HOLDINGS.map((holding) => (
            <Item key={holding.id} size="sm">
              <Item.Content>
                <Item.Title>{holding.ticker}</Item.Title>
                <Item.Description>{holding.name}</Item.Description>
              </Item.Content>
              <View className="items-end gap-0.5">
                <Text size="sm" weight="medium">
                  {holding.price}
                </Text>
                <Text
                  size="xs"
                  className={holding.up ? "text-success" : "text-destructive"}
                >
                  {holding.change}
                </Text>
              </View>
            </Item>
          ))}
        </View>
      </ScrollView>
    </ScrollHeader>
  );
}
const SETTINGS_ROWS = [
  [
    <BellIcon size={16} />,
    [
      ["Notifications", "On"],
      ["Sounds", "Default"],
      ["Badges", "Unread only"],
      ["Quiet hours", "22:00 – 07:00"],
      ["Mentions", "Everyone"],
      ["Replies", "People I follow"],
    ],
  ],
  [
    <GlobeIcon size={16} />,
    [
      ["Appearance", "Dark"],
      ["Text size", "Large"],
      ["Bold text", "Off"],
      ["Reduce motion", "Off"],
      ["Language", "English (UK)"],
      ["Region", "United Kingdom"],
    ],
  ],
  [
    <CalendarIcon size={16} />,
    [
      ["Calendar", "3 accounts"],
      ["Default calendar", "Work"],
      ["Week starts", "Monday"],
      ["Time zone", "Automatic"],
      ["Alerts", "15 minutes before"],
      ["Travel time", "On"],
    ],
  ],
  [
    <BookmarkIcon size={16} />,
    [
      ["Saved items", "128"],
      ["Reading list", "41"],
      ["Highlights", "On"],
      ["Downloads", "Wi-Fi only"],
      ["Storage", "2.4 GB"],
      ["Offline maps", "3 areas"],
    ],
  ],
  [
    <LinkIcon size={16} />,
    [
      ["Linked apps", "6"],
      ["Sign-in method", "Passkey"],
      ["Two-factor", "On"],
      ["Blocked accounts", "2"],
      ["Muted words", "17"],
      ["Content filters", "Strict"],
    ],
  ],
  [
    <PencilIcon size={16} />,
    [
      ["Signature", "Edited"],
      ["Autocorrect", "On"],
      ["Dictation", "Off"],
      ["Keyboard shortcuts", "24"],
      ["Gestures", "Default"],
      ["Haptics", "On"],
    ],
  ],
  [
    <GlobeIcon size={16} />,
    [
      ["Backups", "Nightly"],
      ["Sync", "All devices"],
      ["Diagnostics", "Share"],
      ["About", "Version 4.2"],
    ],
  ],
].flatMap(([icon, rows], run) =>
  (rows as string[][]).map(([label, value], index) => ({
    id: `s${run}-${index}`,
    label,
    value,
    icon: icon as React.ReactElement,
  }))
);
function ScrollHeaderBarOnlyVersion() {
  return (
    <ScrollHeader className="bg-background flex-1">
      <ScrollHeader.Bar surface="muted">
        <Button
          variant="ghost"
          size="icon"
          accessibilityLabel="Back"
          onPress={demoAction("Back")}
        >
          <ChevronLeftIcon size={20} />
        </Button>
        <ScrollHeader.Title>Settings</ScrollHeader.Title>
        <ScrollHeader.Actions>
          <Button
            variant="ghost"
            size="icon"
            accessibilityLabel="More"
            onPress={demoAction("More")}
          >
            <EllipsisIcon size={18} />
          </Button>
        </ScrollHeader.Actions>
      </ScrollHeader.Bar>

      <Animated.ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-1 px-4 pt-3 pb-16">
          {SETTINGS_ROWS.map((row) => (
            <Item key={row.id} size="sm" variant="muted">
              <Item.Media
                variant="icon"
                className="h-8 w-8 items-center justify-center"
              >
                {row.icon}
              </Item.Media>
              <Item.Content>
                <Item.Title numberOfLines={1}>{row.label}</Item.Title>
              </Item.Content>
              <Text size="sm" muted>
                {row.value}
              </Text>
              <ChevronRightIcon size={16} />
            </Item>
          ))}
        </View>
      </Animated.ScrollView>
    </ScrollHeader>
  );
}
const POST_SEED = [
  {
    title: "The bridge reopened after eleven years",
    group: "r/infrastructure",
  },
  { title: "A field guide to reading a tide table", group: "r/sailing" },
  { title: "What happened to the third terminal?", group: "r/aviation" },
  { title: "Sourdough at 2,400 metres", group: "r/baking" },
  { title: "The quietest carriage on the network", group: "r/trains" },
  { title: "Mapping every public staircase in the city", group: "r/urbanism" },
  { title: "Why the harbour clock is four minutes fast", group: "r/horology" },
  { title: "Twelve years of rainfall, one chart", group: "r/dataisbeautiful" },
  {
    title: "The last manual telephone exchange in the county",
    group: "r/telecom",
  },
  {
    title: "Somebody has been repainting the mile markers",
    group: "r/cycling",
  },
  { title: "How the night ferry timetable actually works", group: "r/sailing" },
  { title: "A tram line that was never finished", group: "r/urbanism" },
  { title: "Reading a runway from the wrong end", group: "r/aviation" },
  { title: "Proofing in a cold kitchen: what changed", group: "r/baking" },
  { title: "The signal box nobody has entered since 1998", group: "r/trains" },
  { title: "Counting swifts from a fourth-floor window", group: "r/birding" },
  { title: "Every level crossing, ranked by wait", group: "r/dataisbeautiful" },
  { title: "The bakery that opens at three in the morning", group: "r/baking" },
  { title: "Why the new bridge has no footpath", group: "r/infrastructure" },
  {
    title: "Tide tables and the myth of the twelfths rule",
    group: "r/sailing",
  },
  {
    title: "A clock that has been wrong in the same way for decades",
    group: "r/horology",
  },
  { title: "The stairs behind the station car park", group: "r/urbanism" },
  { title: "Cross-country by the slowest possible route", group: "r/trains" },
  {
    title: "What the airport does with a diverted flight",
    group: "r/aviation",
  },
];
const POSTS = repeat(POST_SEED, 24, (row, index) => ({
  ...row,
  id: `p${index}`,
  votes: `${(0.4 + scatter(index, 52) / 10).toFixed(1)}k`,
  comments: 18 + scatter(index + 3, 420),
}));
function ScrollHeaderTabsVersion() {
  const [tab, setTab] = useState("posts");
  const rows =
    tab === "posts" ? POSTS : POSTS.slice(0, tab === "comments" ? 18 : 12);
  return (
    <ScrollHeader className="bg-background flex-1" barHeight={94}>
      <ScrollHeader.Bar className="flex-col items-stretch gap-0 px-0">
        <View className="h-12 flex-row items-center gap-3 px-4">
          <ScrollHeader.Title>u/economist</ScrollHeader.Title>

          <ScrollHeader.Actions className="bg-card rounded-full px-1">
            <Button
              variant="ghost"
              size="icon"
              accessibilityLabel="Create"
              onPress={demoAction("Create")}
            >
              <PlusIcon size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              accessibilityLabel="Search"
              onPress={demoAction("Search")}
            >
              <SearchIcon size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              accessibilityLabel="Share"
              onPress={demoAction("Share")}
            >
              <ShareNodesIcon size={18} />
            </Button>
          </ScrollHeader.Actions>
        </View>

        <Tabs
          value={tab}
          onValueChange={setTab}
          defaultValue="posts"
          variant="underline"
        >
          <Tabs.List className="px-4">
            <Tabs.Trigger value="posts">Posts</Tabs.Trigger>
            <Tabs.Trigger value="comments">Comments</Tabs.Trigger>
            <Tabs.Trigger value="saved">Saved</Tabs.Trigger>
          </Tabs.List>
        </Tabs>
      </ScrollHeader.Bar>

      <ScrollHeader.Large>
        <ScrollHeader.Title>Economist</ScrollHeader.Title>
        <ScrollHeader.Description>
          Joined 2019 · 12.4k karma
        </ScrollHeader.Description>
      </ScrollHeader.Large>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-2 px-4 pt-3 pb-16">
          {rows.map((post) => (
            <View key={post.id} className="border-border gap-1.5 border-b pb-3">
              <Text size="xs" muted>
                {post.group}
              </Text>
              <Text weight="medium">{post.title}</Text>
              <Text size="xs" muted>
                {post.votes} upvotes · {post.comments} comments
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScrollHeader>
  );
}
const RELEASE_SEED = [
  { name: "Harbour Lights", artist: "Vela Sound", year: "2021" },
  { name: "Cold Open", artist: "Atlas Rooms", year: "2019" },
  { name: "A Slower Country", artist: "June Mould", year: "2023" },
  { name: "Ninth Street Sessions", artist: "Marisol Vane", year: "2018" },
  { name: "Every Window Lit", artist: "Halden Pike", year: "2022" },
  { name: "Signal Hill", artist: "Vela Sound", year: "2016" },
  { name: "Paper Weather", artist: "June Mould", year: "2020" },
  { name: "The Long Room", artist: "Atlas Rooms", year: "2024" },
];
const RELEASES = repeat(RELEASE_SEED, 40, (row, index, pass) => ({
  ...row,
  id: `r${index}`,
  name:
    pass === 0
      ? row.name
      : `${row.name} — ${["Remastered", "Deluxe", "Live", "Instrumental"][pass - 1]}`,
  tracks: 7 + scatter(index, 12),
}));
function ScrollHeaderBlurVersion() {
  const ramp = useSeriesRamp();
  return (
    <ScrollHeader className="bg-background flex-1">
      <ScrollHeader.Bar surface="blur" divider={false}>
        <ScrollHeader.Title>Releases</ScrollHeader.Title>
        <ScrollHeader.Actions>
          <Button
            variant="ghost"
            size="icon"
            accessibilityLabel="Shuffle"
            onPress={demoAction("Shuffle")}
          >
            <SearchIcon size={18} />
          </Button>
        </ScrollHeader.Actions>
      </ScrollHeader.Bar>

      <ScrollHeader.Large>
        <ScrollHeader.Title>Releases</ScrollHeader.Title>
        <ScrollHeader.Description>
          {RELEASES.length} albums · every label
        </ScrollHeader.Description>
      </ScrollHeader.Large>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-2 px-4 pt-3 pb-16">
          {RELEASES.map((release, index) => (
            <View key={release.id} className="flex-row items-center gap-3">
              <View
                className="h-16 w-16 rounded-lg"
                style={{ backgroundColor: ramp[index % ramp.length] }}
              />
              <View className="flex-1 gap-0.5">
                <Text weight="medium" numberOfLines={1}>
                  {release.name}
                </Text>
                <Text size="sm" muted>
                  {release.artist} · {release.year}
                </Text>
                <Text size="xs" muted>
                  {release.tracks} tracks
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScrollHeader>
  );
}
const CONTACT_NAMES = [
  "Ada Whitfield",
  "Bruno Sasaki",
  "Camille Duforest",
  "Dmitri Volkov",
  "Elena Marsh",
  "Farid Nazari",
  "Greta Lindqvist",
  "Hugo Bellamy",
  "Imani Osei",
  "Jonas Kerr",
  "Kiara Ndlovu",
  "Lars Petersen",
  "Marisol Vane",
  "Nadia Haddad",
  "Otto Brenner",
  "Priya Raman",
  "Quentin Roche",
  "Rosa Iglesias",
  "Soren Dahl",
  "Tabitha Cole",
  "Ulises Marin",
  "Vera Kaminski",
  "Wren Ashby",
  "Xiulan Chen",
  "Yusuf Demir",
  "Zofia Nowak",
  "Anders Holm",
  "Beatriz Rocha",
  "Callum Findlay",
  "Delphine Roux",
];
const CONTACT_GROUPS = ["All", "Work", "Family"] as const;
const CONTACTS = repeat(CONTACT_NAMES, 120, (name, index) => ({
  id: `c${index}`,
  name,
  group: CONTACT_GROUPS[index % CONTACT_GROUPS.length],
  initials: name
    .split(" ")
    .map((part) => part[0])
    .join(""),
  handle: `@${name.split(" ")[0].toLowerCase()}${index > 29 ? index : ""}`,
}));
function ScrollHeaderListVersion() {
  const [group, setGroup] = useState<(typeof CONTACT_GROUPS)[number]>("All");
  const rows =
    group === "All" ? CONTACTS : CONTACTS.filter((row) => row.group === group);
  return (
    <ScrollHeader className="bg-background flex-1">
      <ScrollHeader.Bar>
        <Button
          variant="ghost"
          size="icon"
          accessibilityLabel="Back"
          onPress={demoAction("Back")}
        >
          <ChevronLeftIcon size={20} />
        </Button>

        <ScrollHeader.Title className="text-center">
          Contacts
        </ScrollHeader.Title>
        <ScrollHeader.Actions>
          <Button
            variant="ghost"
            size="icon"
            accessibilityLabel="Add contact"
            onPress={demoAction("Add contact")}
          >
            <PlusIcon size={18} />
          </Button>
        </ScrollHeader.Actions>
      </ScrollHeader.Bar>

      <ScrollHeader.Large className="pb-3">
        <ScrollHeader.Title>Contacts</ScrollHeader.Title>
        <View className="mt-1 flex-row gap-2">
          {CONTACT_GROUPS.map((name) => (
            <Chip
              key={name}
              selected={group === name}
              onPress={() => setGroup(name)}
            >
              {name}
            </Chip>
          ))}
        </View>
      </ScrollHeader.Large>

      <FlatList
        data={rows}
        keyExtractor={(row) => row.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 64,
        }}
        renderItem={({ item }) => (
          <Item size="sm">
            <Item.Media>
              <Avatar size="sm" fallback={item.initials} />
            </Item.Media>
            <Item.Content>
              <Item.Title>{item.name}</Item.Title>
            </Item.Content>
            <Text size="sm" muted>
              {item.handle}
            </Text>
          </Item>
        )}
      />
    </ScrollHeader>
  );
}
const SETTINGS_SECTIONS = [
  [
    "Account",
    [
      ["Profile", "Public"],
      ["Display name", "Economist"],
      ["Email", "Verified"],
      ["Password", "Changed in June"],
      ["Passkeys", "2 devices"],
      ["Delete account", ""],
    ],
  ],
  [
    "Content",
    [
      ["Saved", "128"],
      ["Drafts", "4"],
      ["Highlights", "On"],
      ["Reading history", "30 days"],
      ["Downloads", "Wi-Fi only"],
      ["Autoplay", "Never"],
    ],
  ],
  [
    "Notifications",
    [
      ["Push", "On"],
      ["Email digest", "Weekly"],
      ["Mentions", "Everyone"],
      ["Replies", "People I follow"],
      ["Quiet hours", "22:00 – 07:00"],
      ["Sounds", "Default"],
    ],
  ],
  [
    "Privacy",
    [
      ["Discoverability", "By handle"],
      ["Blocked", "2"],
      ["Muted words", "17"],
      ["Read receipts", "Off"],
      ["Analytics", "Off"],
      ["Ad personalisation", "Limited"],
    ],
  ],
  [
    "Connections",
    [
      ["Linked apps", "6"],
      ["Shared with", "12 people"],
      ["Calendar", "3 accounts"],
      ["Contacts", "Not synced"],
      ["Photos", "Selected only"],
      ["Wallet", "Connected"],
    ],
  ],
  [
    "Advanced",
    [
      ["Sync", "All devices"],
      ["Backups", "Nightly"],
      ["Storage", "2.4 GB"],
      ["Beta updates", "Off"],
      ["Diagnostics", "Share"],
      ["Reset preferences", ""],
    ],
  ],
].map(([title, rows], section) => ({
  title: title as string,
  data: (rows as string[][]).map(([label, value], index) => ({
    id: `g${section}-${index}`,
    label,
    value,
  })),
}));
function ScrollHeaderGroupedVersion() {
  return (
    <ScrollHeader className="bg-background flex-1">
      <ScrollHeader.Bar surface="muted" divider={false}>
        <ScrollHeader.Title>Preferences</ScrollHeader.Title>
      </ScrollHeader.Bar>

      <ScrollHeader.Large>
        <ScrollHeader.Title>Preferences</ScrollHeader.Title>
        <ScrollHeader.Description>
          {SETTINGS_SECTIONS.length} groups
        </ScrollHeader.Description>
      </ScrollHeader.Large>

      <SectionList
        sections={SETTINGS_SECTIONS}
        keyExtractor={(row) => row.id}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 64 }}
        renderSectionHeader={({ section }) => (
          <Text
            size="xs"
            weight="semibold"
            muted
            className="pt-4 pb-1 uppercase"
          >
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <Item size="sm" variant="muted" className="mb-1">
            <Item.Content>
              <Item.Title>{item.label}</Item.Title>
            </Item.Content>
            <Text size="sm" muted>
              {item.value}
            </Text>
          </Item>
        )}
      />
    </ScrollHeader>
  );
}
const DRAFT_SEED = [
  {
    subject: "Re: studio visit",
    preview: "Thursday works, though I would need to leave by four…",
  },
  {
    subject: "Notes from the site walk",
    preview: "The east stair is narrower than the drawing says.",
  },
  {
    subject: "Invoice query",
    preview: "Attaching the revised schedule of rates.",
  },
  { subject: "(no subject)", preview: "Just checking you got the" },
  {
    subject: "Coast photographs",
    preview: "Picked fourteen of them. The light on the second morning…",
  },
  {
    subject: "Re: quarterly figures",
    preview: "The variance is in the third column, not the second.",
  },
  {
    subject: "Handover, part two",
    preview: "The keys are with the office until Friday afternoon.",
  },
  {
    subject: "Re: drainage strategy",
    preview: "They want the calculations resubmitted with the survey.",
  },
];
const DRAFTS = repeat(DRAFT_SEED, 36, (row, index, pass) => ({
  ...row,
  id: `d${index}`,
  subject: pass === 0 ? row.subject : `${row.subject} (${pass + 1})`,
  time:
    index < 4
      ? `${9 + index}:${String(10 + index * 7).padStart(2, "0")}`
      : `${28 - index} Aug`,
}));
function ScrollHeaderBorrowedVersion() {
  const collapse = useSharedValue(0);
  const [collapsed, setCollapsed] = useState(false);
  const pill = useAnimatedStyle(() => ({
    opacity: collapse.value,
    transform: [
      { translateY: interpolate(collapse.value, [0, 1], [16, 0], "clamp") },
    ],
  }));
  return (
    <View className="flex-1">
      <ScrollHeader
        className="bg-background flex-1"
        progress={collapse}
        onCollapsedChange={setCollapsed}
      >
        <ScrollHeader.Bar divider={false}>
          <ScrollHeader.Title>Drafts</ScrollHeader.Title>
        </ScrollHeader.Bar>

        <ScrollHeader.Large>
          <ScrollHeader.Title>Drafts</ScrollHeader.Title>
          <ScrollHeader.Description>
            {DRAFTS.length} unsent
          </ScrollHeader.Description>
        </ScrollHeader.Large>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="gap-3 px-4 pt-3 pb-24">
            {DRAFTS.map((draft) => (
              <View
                key={draft.id}
                className="border-border gap-1 border-b pb-3"
              >
                <View className="flex-row items-baseline justify-between gap-3">
                  <Text weight="medium" numberOfLines={1} className="flex-1">
                    {draft.subject}
                  </Text>
                  <Text size="xs" muted>
                    {draft.time}
                  </Text>
                </View>
                <Text size="sm" muted numberOfLines={1}>
                  {draft.preview}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </ScrollHeader>

      <Animated.View
        pointerEvents={collapsed ? "box-none" : "none"}
        accessibilityElementsHidden={!collapsed}
        importantForAccessibility={collapsed ? "auto" : "no-hide-descendants"}
        style={pill}
        className="absolute end-4 bottom-8"
      >
        <Button size="sm" onPress={demoAction("New draft")}>
          New draft
        </Button>
      </Animated.View>
    </View>
  );
}
const PLAYLIST_SEED = [
  "Morning, slowly",
  "Long drives",
  "Rain on glass",
  "Kitchen radio",
  "Late desk",
  "Anything but this",
  "Two-hour commute",
  "Washing up",
  "Reading weather",
  "Second coffee",
  "Walk to the station",
  "Nothing with words",
];
const PLAYLISTS = repeat(PLAYLIST_SEED, 36, (name, index, pass) => ({
  id: `l${index}`,
  name: pass === 0 ? name : `${name} ${pass + 1}`,
  count: 14 + scatter(index, 148),
}));
const PLAYLIST_VIEWS = ["Recent", "A–Z", "Length"] as const;
function ScrollHeaderGradientVersion() {
  const ramp = useSeriesRamp();
  const cover: [string, string] = [ramp[2], ramp[3]];
  const [view, setView] = useState<(typeof PLAYLIST_VIEWS)[number]>("Recent");
  const sorted =
    view === "A–Z"
      ? [...PLAYLISTS].sort((a, b) => a.name.localeCompare(b.name))
      : view === "Length"
        ? [...PLAYLISTS].sort((a, b) => b.count - a.count)
        : PLAYLISTS;
  return (
    <ScrollHeader className="bg-background flex-1" stretch={false}>
      <ScrollHeader.Cover colors={cover} scrim={false} />

      <ScrollHeader.Bar surface="none" divider={false}>
        <ButtonGroup size="sm" className="mx-auto">
          {PLAYLIST_VIEWS.map((name) => (
            <Button
              key={name}
              variant={view === name ? "secondary" : "ghost"}
              onPress={() => setView(name)}
            >
              {name}
            </Button>
          ))}
        </ButtonGroup>
      </ScrollHeader.Bar>

      <ScrollHeader.Large className="h-40 justify-end pb-5">
        <ScrollHeader.Title className="text-white">
          Playlists
        </ScrollHeader.Title>
        <ScrollHeader.Description className="text-white/80">
          Made for you
        </ScrollHeader.Description>
      </ScrollHeader.Large>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-1 px-4 pt-3 pb-16">
          {sorted.map((playlist, index) => (
            <Item key={playlist.id} size="sm">
              <Item.Media variant="image" className="h-12 w-12">
                <View
                  className="h-full w-full"
                  style={{ backgroundColor: ramp[index % ramp.length] }}
                />
              </Item.Media>
              <Item.Content>
                <Item.Title>{playlist.name}</Item.Title>
                <Item.Description>{playlist.count} songs</Item.Description>
              </Item.Content>
              <ChevronRightIcon size={16} />
            </Item>
          ))}
        </View>
      </ScrollView>
    </ScrollHeader>
  );
}
const ARCHIVE_SEED = [
  "Site survey, east elevation",
  "Planning correspondence",
  "Structural calculations v4",
  "Tender returns",
  "Soil report",
  "Access statement",
  "Drainage strategy",
  "Party wall notices",
  "Contractor prequalification",
  "Insurance certificates",
  "Asbestos survey",
  "Boundary agreement",
];
const ARCHIVE_FROM = new Date(2026, 7, 28);
function archiveDate(index: number) {
  const when = new Date(ARCHIVE_FROM);
  when.setDate(when.getDate() - (index * 4 + scatter(index, 4)));
  const day = String(when.getDate()).padStart(2, "0");
  return `${day} ${when.toLocaleDateString("en-GB", { month: "short" })}`;
}
const ARCHIVE = repeat(ARCHIVE_SEED, 40, (label, index, pass) => ({
  id: `a${index}`,
  label: pass === 0 ? label : `${label}, rev ${pass}`,
  date: archiveDate(index),
}));
function ScrollHeaderLooseVersion() {
  return (
    <ScrollHeader className="bg-background flex-1" snap={false}>
      <ScrollHeader.Bar>
        <ScrollHeader.Title>Archive</ScrollHeader.Title>
        <ScrollHeader.Actions>
          <Badge variant="secondary" className="self-center">
            {ARCHIVE.length}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            accessibilityLabel="Filter"
            onPress={demoAction("Filter")}
          >
            <EllipsisIcon size={18} />
          </Button>
        </ScrollHeader.Actions>
      </ScrollHeader.Bar>

      <ScrollHeader.Large>
        <ScrollHeader.Title>Archive</ScrollHeader.Title>
        <ScrollHeader.Description>
          Last synced 11 minutes ago
        </ScrollHeader.Description>
      </ScrollHeader.Large>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-2 pb-16">
          {ARCHIVE.map((entry) => (
            <View
              key={entry.id}
              className="border-border flex-row items-center justify-between gap-3 border-b py-3"
            >
              <Text size="sm" numberOfLines={1} className="flex-1">
                {entry.label}
              </Text>
              <Text size="xs" muted>
                {entry.date}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScrollHeader>
  );
}
function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("");
}
export const entry: ComponentEntry = {
  slug: "scroll-header",
  name: "ScrollHeader",
  summary:
    "A screen title that hands over to a compact bar as the page scrolls",
  demos: [
    {
      label: "Large title over a list",
      id: "title",
      fullPage: true,
      fullBleed: true,
      backSwipe: true,
      description:
        "A music library, with every default left alone. The title is large at rest and the same title is on the pinned bar once the list is moving.",
      render: () => <ScrollHeaderPlainVersion />,
    },
    {
      label: "A cover behind the title",
      id: "cover",
      fullPage: true,
      fullBleed: true,
      backSwipe: true,
      description:
        "A photo album. The cover fills the band and the bar is drawn on nothing, so pulling the grid down stretches the picture instead of opening a gap.",
      render: () => <ScrollHeaderCoverVersion />,
    },
    {
      label: "A field in the block",
      id: "search",
      fullPage: true,
      fullBleed: true,
      backSwipe: true,
      description:
        "An inbox with the search field in the block. The block is as tall as what is in it, and `threshold` finishes the crossing before it empties.",
      render: () => <ScrollHeaderSearchVersion />,
    },
    {
      label: "Something only the bar carries",
      id: "crossing",
      fullPage: true,
      fullBleed: true,
      backSwipe: true,
      description:
        "A portfolio whose large title is the figure itself. The crossing is reported to React once each way, so the day's change can appear with the bar.",
      render: () => <ScrollHeaderCrossingVersion />,
    },
    {
      label: "A bar on its own",
      id: "bar",
      fullPage: true,
      fullBleed: true,
      backSwipe: true,
      description:
        "A settings screen with no block to cross, over a scroller the demo animated itself. The bar is the only title it has, so the title is there from the first frame.",
      render: () => <ScrollHeaderBarOnlyVersion />,
    },
    {
      label: "Navigation that survives the collapse",
      id: "tabs",
      fullPage: true,
      fullBleed: true,
      backSwipe: true,
      description:
        "A profile. A taller bar holds an identity row and a tab row, and everything in the bar is pinned, so the tabs are still there once the title has gone.",
      render: () => <ScrollHeaderTabsVersion />,
    },
    {
      label: "A bar you can see through",
      id: "blur",
      fullPage: true,
      fullBleed: true,
      backSwipe: true,
      description:
        '`surface="blur"` frosts the bar instead of filling it, so the artwork passing underneath stays legible as shape and colour. Without `expo-blur`, or under Reduce Transparency, the same bar draws the plain background token.',
      render: () => <ScrollHeaderBlurVersion />,
    },
    {
      label: "A list that recycles",
      id: "list",
      fullPage: true,
      fullBleed: true,
      backSwipe: true,
      description:
        "A contact list of 120 rows in a `FlatList`, under a centred title and a row of filters. The child is cloned whatever kind it is, and this is where the snap is worth watching.",
      render: () => <ScrollHeaderListVersion />,
    },
    {
      label: "A grouped list",
      id: "grouped",
      fullPage: true,
      fullBleed: true,
      backSwipe: true,
      description:
        "Grouped preferences in a `SectionList`, under a bar drawn on the card token with no hairline. Section headers travel with the rows — a sticky one would pin behind the band.",
      render: () => <ScrollHeaderGroupedVersion />,
    },
    {
      label: "The collapse, borrowed",
      id: "borrowed",
      fullPage: true,
      fullBleed: true,
      backSwipe: true,
      description:
        "A drafts list whose bar carries nothing but the title, because the compose button lives outside the header. `progress` mirrors the transition into a shared value, so it arrives at the pace the title leaves at.",
      render: () => <ScrollHeaderBorrowedVersion />,
    },
    {
      label: "A gradient instead of a picture",
      id: "gradient",
      fullPage: true,
      fullBleed: true,
      backSwipe: true,
      description:
        "Playlists under a ramp mixed from the theme's own series tokens, with a segmented control where the bar title would be. `stretch={false}` holds the band at its resting height.",
      render: () => <ScrollHeaderGradientVersion />,
    },
    {
      label: "Left where you let go",
      id: "loose",
      fullPage: true,
      fullBleed: true,
      backSwipe: true,
      description:
        "A document archive. With `snap={false}` a part-scrolled band stays half-collapsed instead of settling at whichever end is nearer.",
      render: () => <ScrollHeaderLooseVersion />,
    },
  ],
};
