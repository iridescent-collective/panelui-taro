import { Avatar } from "panelui-taro/avatar";
import { Badge } from "panelui-taro/badge";
import { Button } from "panelui-taro/button";
import {
  CalendarIcon,
  ChevronLeftIcon,
  EllipsisIcon,
  IconColorProvider,
  LinkIcon,
  GlobeIcon,
  PencilIcon,
  PlusIcon,
  ShareNodesIcon,
} from "panelui-taro/icons";
import { PageHeader } from "panelui-taro/page-header";
import { Text } from "panelui-taro/primitives/text";
import { Spinner } from "panelui-taro/spinner";
import { useThemeMode } from "panelui-taro/theme";
import { useEffect, useState } from "react";

import logoDark from "../assets/logo-dark.png";
import logoLight from "../assets/logo-light.png";
import { CircleButton } from "../extras/screen-header";
import { demoAction } from "../runtime/demo-action";
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "../runtime/motion";
import { useSafeAreaInsets } from "../runtime/native";
import {
  Image,
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from "../runtime/native";
import { useRouter } from "../runtime/router";
import { useCSSVariable } from "../runtime/theme";
import { ComponentEntry } from "../types";
const PROFILE_FACE = "https://avatars.githubusercontent.com/u/127331761?v=4";
const COVER_RAMPS = {
  centred: ["#22d3ee", "#3b82f6"],
  hero: ["#f472b6", "#8b5cf6", "#312e81"],
  brand: ["#fbbf24", "#f97316", "#db2777"],
  leading: ["#34d399", "#0ea5e9"],
} as const;
const PULL_THRESHOLD = 90;
const REFRESH_DURATION = 1400;
const INDICATOR_FADE = 180;
function ProfileScroll({
  contentContainerStyle,
  children,
}: {
  contentContainerStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const pull = useSharedValue(0);
  const busy = useSharedValue(0);
  useEffect(() => {
    busy.value = withTiming(refreshing ? 1 : 0, { duration: INDICATOR_FADE });
  }, [refreshing, busy]);
  useEffect(() => {
    if (!refreshing) return;
    const timer = setTimeout(() => setRefreshing(false), REFRESH_DURATION);
    return () => clearTimeout(timer);
  }, [refreshing]);
  const onScroll = useAnimatedScrollHandler((event) => {
    const over = -event.contentOffset.y;
    pull.value = over > 0 ? over : 0;
  });
  const onScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (refreshing) return;
    if (-event.nativeEvent.contentOffset.y >= PULL_THRESHOLD)
      setRefreshing(true);
  };
  const indicatorStyle = useAnimatedStyle(() => {
    const drawn = Math.min(pull.value / PULL_THRESHOLD, 1);
    const shown = drawn > busy.value ? drawn : busy.value;
    return {
      opacity: shown,
      transform: [
        { scale: 0.7 + shown * 0.3 },
        { translateY: (shown - 1) * 10 },
      ],
    };
  });
  return (
    <>
      <Animated.ScrollView
        onScroll={onScroll}
        onScrollEndDrag={onScrollEndDrag}
        scrollEventThrottle={16}
        contentContainerStyle={contentContainerStyle}
      >
        {children}
      </Animated.ScrollView>
      <Animated.View
        pointerEvents="none"
        accessibilityElementsHidden={!refreshing}
        importantForAccessibility={refreshing ? "yes" : "no-hide-descendants"}
        style={[
          { position: "absolute", top: insets.top + 4, alignSelf: "center" },
          indicatorStyle,
        ]}
        className="border-border bg-surface h-11 w-11 items-center justify-center rounded-full border"
      >
        <Spinner size="sm" label={refreshing ? "Refreshing" : undefined} />
      </Animated.View>
    </>
  );
}
function VersionBack() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const foreground = useCSSVariable("--color-foreground");
  return (
    <View className="absolute start-4 z-10" style={{ top: insets.top + 4 }}>
      <CircleButton onPress={() => router.back()} label="Go back">
        <ChevronLeftIcon
          size={20}
          color={typeof foreground === "string" ? foreground : undefined}
        />
      </CircleButton>
    </View>
  );
}
function StoryBadge() {
  const background = useCSSVariable("--color-background");
  return (
    <View className="border-background bg-foreground h-7 w-7 items-center justify-center rounded-full border-2">
      <IconColorProvider
        color={typeof background === "string" ? background : undefined}
      >
        <PlusIcon size={13} />
      </IconColorProvider>
    </View>
  );
}
function PageHeaderProfileVersion() {
  const insets = useSafeAreaInsets();
  return (
    <View className="bg-background flex-1">
      <VersionBack />
      <ProfileScroll
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <PageHeader variant="page" align="start">
          <PageHeader.Cover height={insets.top + 120} />
          <PageHeader.Avatar
            source={{ uri: PROFILE_FACE }}
            fallback="KA"
            verified
          />
          <PageHeader.Content>
            <PageHeader.Title>Khalid Abdi</PageHeader.Title>
            <PageHeader.Description>@Khalidabdi1</PageHeader.Description>
            <Text className="pt-2">
              Building high-performance React Native components for Expo. Open
              source, shipping in public.
            </Text>
            <View className="flex-row flex-wrap gap-x-4 pt-2">
              <PageHeader.Meta icon={<LinkIcon size={14} />}>
                panelui.dev
              </PageHeader.Meta>
              <PageHeader.Meta icon={<CalendarIcon size={14} />}>
                Joined February 2022
              </PageHeader.Meta>
            </View>
            <PageHeader.Stats layout="inline" className="pt-2">
              <PageHeader.Stat
                value="188"
                label="Following"
                onPress={demoAction("Following")}
              />
              <PageHeader.Stat
                value="533"
                label="Followers"
                onPress={demoAction("Followers")}
              />
            </PageHeader.Stats>
          </PageHeader.Content>
          <PageHeader.Actions>
            <Button
              variant="secondary"
              className="flex-1"
              onPress={demoAction("Share profile")}
            >
              Share profile
            </Button>
            <Button className="flex-1" onPress={demoAction("Edit profile")}>
              Edit profile
            </Button>
          </PageHeader.Actions>
        </PageHeader>
      </ProfileScroll>
    </View>
  );
}
function PageHeaderStatsVersion() {
  const insets = useSafeAreaInsets();
  return (
    <View className="bg-background flex-1">
      <VersionBack />
      <ProfileScroll
        contentContainerStyle={{
          paddingTop: insets.top + 52,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <PageHeader variant="page" align="start">
          <PageHeader.Row>
            <PageHeader.Avatar
              size="lg"
              source={{ uri: PROFILE_FACE }}
              fallback="KA"
              badge={<StoryBadge />}
            />
            <PageHeader.Stats className="flex-1">
              <PageHeader.Stat value="3" label="Posts" />
              <PageHeader.Stat
                value="788"
                label="Followers"
                onPress={demoAction("Followers")}
              />
              <PageHeader.Stat
                value="1,882"
                label="Following"
                onPress={demoAction("Following")}
              />
            </PageHeader.Stats>
          </PageHeader.Row>
          <PageHeader.Content>
            <PageHeader.Title>Khalid Abdi</PageHeader.Title>
            <PageHeader.Description>
              Science &amp; Technology
            </PageHeader.Description>
            <Text size="sm" className="pt-1">
              Components, clips and the odd screen recording. Live well, sleep
              well.
            </Text>
            <PageHeader.Meta icon={<LinkIcon size={14} />} className="pt-1">
              panelui.dev
            </PageHeader.Meta>
          </PageHeader.Content>
          <PageHeader.Actions>
            <Button
              variant="secondary"
              className="flex-1"
              onPress={demoAction("Edit profile")}
            >
              Edit profile
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onPress={demoAction("Share profile")}
            >
              Share profile
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onPress={demoAction("Button selected")}
            >
              <EllipsisIcon size={18} />
            </Button>
          </PageHeader.Actions>
        </PageHeader>
      </ProfileScroll>
    </View>
  );
}
function PageHeaderHeroVersion() {
  const insets = useSafeAreaInsets();
  return (
    <View className="bg-background flex-1">
      <VersionBack />
      <ProfileScroll
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <PageHeader variant="page" align="start">
          <PageHeader.Cover
            height={insets.top + 300}
            colors={COVER_RAMPS.hero}
          />

          <PageHeader.Content className="pt-4">
            <View className="flex-row items-center gap-3">
              <PageHeader.Title className="flex-1">
                Coastline Weekly
              </PageHeader.Title>
              <Button
                variant="secondary"
                size="sm"
                onPress={demoAction("Edit")}
              >
                Edit
              </Button>
            </View>
            <PageHeader.Description>
              u/coastlineweekly · 0 followers
            </PageHeader.Description>
          </PageHeader.Content>
          <PageHeader.Stats divided className="px-4 pt-4">
            <PageHeader.Stat value="73" label="Karma" />
            <PageHeader.Stat
              value="33"
              label="Posts"
              onPress={demoAction("Posts")}
            />
            <PageHeader.Stat value="2mo" label="Age" />
          </PageHeader.Stats>
          <PageHeader.Actions>
            <Button className="flex-1" onPress={demoAction("Follow")}>
              Follow
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onPress={demoAction("Button selected")}
            >
              <ShareNodesIcon size={18} />
            </Button>
          </PageHeader.Actions>
        </PageHeader>
      </ProfileScroll>
    </View>
  );
}
function PageHeaderCenteredVersion() {
  const insets = useSafeAreaInsets();
  return (
    <View className="bg-background flex-1">
      <VersionBack />
      <ProfileScroll
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <PageHeader variant="page">
          <PageHeader.Cover
            height={insets.top + 140}
            colors={COVER_RAMPS.centred}
          />
          <PageHeader.Avatar
            source={{ uri: PROFILE_FACE }}
            fallback="KA"
            verified
          />
          <PageHeader.Content>
            <PageHeader.Title>Khalid Abdi</PageHeader.Title>
            <PageHeader.Description>khalid@panelui.dev</PageHeader.Description>
            <PageHeader.Meta icon={<GlobeIcon size={14} />} className="pt-1">
              Remote · GMT+3
            </PageHeader.Meta>
            <PageHeader.Stats className="pt-3">
              <PageHeader.Stat value="127" label="Components" />
              <PageHeader.Stat
                value="533"
                label="Followers"
                onPress={demoAction("Followers")}
              />
              <PageHeader.Stat value="0.92" label="Version" />
            </PageHeader.Stats>
          </PageHeader.Content>
          <PageHeader.Actions>
            <Button
              variant="secondary"
              className="flex-1"
              onPress={demoAction("Message")}
            >
              Message
            </Button>
            <Button className="flex-1" onPress={demoAction("Follow")}>
              Follow
            </Button>
          </PageHeader.Actions>
        </PageHeader>
      </ProfileScroll>
    </View>
  );
}
function PageHeaderBrandVersion() {
  const insets = useSafeAreaInsets();
  const { mode } = useThemeMode();
  return (
    <View className="bg-background flex-1">
      <VersionBack />
      <ProfileScroll
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <PageHeader variant="page" align="start">
          <PageHeader.Cover
            height={insets.top + 120}
            colors={COVER_RAMPS.brand}
          />

          <PageHeader.Avatar>
            <View className="bg-card h-full w-full items-center justify-center">
              <Image
                source={mode === "dark" ? logoDark : logoLight}
                style={{ width: 46, height: 46 }}
                resizeMode="contain"
                accessibilityLabel="PanelUI"
              />
            </View>
          </PageHeader.Avatar>
          <PageHeader.Content>
            <View className="flex-row items-center gap-2">
              <PageHeader.Title>PanelUI</PageHeader.Title>
              <Badge variant="secondary">Open source</Badge>
            </View>
            <PageHeader.Description>
              High-performance React Native components for Expo
            </PageHeader.Description>
            <View className="flex-row flex-wrap gap-x-4 pt-2">
              <PageHeader.Meta icon={<LinkIcon size={14} />}>
                panelui.dev
              </PageHeader.Meta>
              <PageHeader.Meta icon={<CalendarIcon size={14} />}>
                Since 2025
              </PageHeader.Meta>
            </View>
            <PageHeader.Stats layout="inline" divided className="pt-3">
              <PageHeader.Stat value="127" label="Components" />
              <PageHeader.Stat value="6" label="Themes" />
            </PageHeader.Stats>
          </PageHeader.Content>
          <PageHeader.Actions>
            <Button className="flex-1" onPress={demoAction("Install")}>
              Install
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onPress={demoAction("Button selected")}
            >
              <PencilIcon size={18} />
            </Button>
          </PageHeader.Actions>
        </PageHeader>
      </ProfileScroll>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "page-header",
  name: "PageHeader",
  summary: "Cover, face and actions at the top of a profile",
  demos: [
    {
      label: "Profile screen",
      id: "profile",
      fullPage: true,
      fullBleed: true,
      backSwipe: true,
      description:
        "The gradient to the screen edges, the face at the leading edge, and the account under it.",
      render: () => <PageHeaderProfileVersion />,
    },
    {
      label: "Counts beside the face",
      id: "stats",
      fullPage: true,
      fullBleed: true,
      backSwipe: true,
      description:
        "No banner, so the face does not lift, and the counts sit next to it instead of under the name.",
      render: () => <PageHeaderStatsVersion />,
    },
    {
      label: "Everything centred",
      id: "centred",
      fullPage: true,
      fullBleed: true,
      backSwipe: true,
      description:
        "The face centred over the gradient, with the counts and the actions on the same line under it.",
      render: () => <PageHeaderCenteredVersion />,
    },
    {
      label: "A hero, and no face",
      id: "hero",
      fullPage: true,
      fullBleed: true,
      backSwipe: true,
      description:
        "The picture is the account, so there is no avatar over it — and the counts are ruled apart.",
      render: () => <PageHeaderHeroVersion />,
    },
    {
      label: "An organisation",
      id: "brand",
      fullPage: true,
      fullBleed: true,
      backSwipe: true,
      description:
        "A mark rather than a face, with the square corner a logo needs, and the counts run inline.",
      render: () => <PageHeaderBrandVersion />,
    },
    {
      label: "Profile card",
      render: () => (
        <PageHeader className="w-full">
          <PageHeader.Cover />
          <PageHeader.Avatar
            source={{ uri: PROFILE_FACE }}
            fallback="KA"
            verified
          />
          <PageHeader.Content>
            <PageHeader.Title>Khalid Abdi</PageHeader.Title>
            <PageHeader.Description>khalid@panelui.dev</PageHeader.Description>
          </PageHeader.Content>
          <PageHeader.Actions>
            <Button
              variant="secondary"
              className="flex-1"
              onPress={demoAction("Message")}
            >
              Message
            </Button>
            <Button className="flex-1" onPress={demoAction("Follow")}>
              Follow
            </Button>
          </PageHeader.Actions>
        </PageHeader>
      ),
    },
    {
      label: "Card, face at the leading edge",
      render: () => (
        <PageHeader align="start" className="w-full">
          <PageHeader.Cover colors={COVER_RAMPS.leading} />
          <PageHeader.Avatar
            size="lg"
            source={{ uri: PROFILE_FACE }}
            fallback="KA"
            verified
          />
          <PageHeader.Content>
            <PageHeader.Title>Khalid Abdi</PageHeader.Title>
            <PageHeader.Description>
              Building in public, Nairobi
            </PageHeader.Description>
            <PageHeader.Stats layout="inline" divided className="pt-2">
              <PageHeader.Stat value="127" label="Components" />
              <PageHeader.Stat value="4.2K" label="Followers" />
            </PageHeader.Stats>
          </PageHeader.Content>
          <PageHeader.Actions>
            <Button className="flex-1" onPress={demoAction("Follow")}>
              Follow
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onPress={demoAction("Button selected")}
            >
              <ShareNodesIcon size={18} />
            </Button>
          </PageHeader.Actions>
        </PageHeader>
      ),
    },
  ],
};
