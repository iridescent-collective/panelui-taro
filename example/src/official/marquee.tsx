import { Badge } from "panelui-taro/badge";
import { Chip } from "panelui-taro/chip";
import { MessageCircleIcon } from "panelui-taro/icons";
import { Marquee } from "panelui-taro/marquee";
import { Post } from "panelui-taro/post";
import { Text } from "panelui-taro/primitives/text";
import { Surface } from "panelui-taro/surface";
import { Switch } from "panelui-taro/switch";
import { useState } from "react";

import { Pressable, View } from "../runtime/native";
import Svg, { Path } from "../runtime/svg";
import { useCSSVariable } from "../runtime/theme";
import { ComponentEntry } from "../types";
const MARQUEE_STACK = [
  "Reanimated 4",
  "Expo SDK 57",
  "Uniwind",
  "Tailwind v4",
  "TypeScript",
  "New Architecture",
];
const MARQUEE_RELEASES = [
  "Marquee",
  "Planner",
  "Flow",
  "Plot",
  "Panelside",
  "SelectionMode",
];
const MARQUEE_BRANDS: {
  name: string;
  path: string;
}[] = [
  {
    name: "Stripe",
    path: "M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z",
  },
  {
    name: "Linear",
    path: "M2.886 4.18A11.982 11.982 0 0 1 11.99 0C18.624 0 24 5.376 24 12.009c0 3.64-1.62 6.903-4.18 9.105L2.887 4.18ZM1.817 5.626l16.556 16.556c-.524.33-1.075.62-1.65.866L.951 7.277c.247-.575.537-1.126.866-1.65ZM.322 9.163l14.515 14.515c-.71.172-1.443.282-2.195.322L0 11.358a12 12 0 0 1 .322-2.195Zm-.17 4.862 9.823 9.824a12.02 12.02 0 0 1-9.824-9.824Z",
  },
  {
    name: "Figma",
    path: "M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441c0 2.503-2.047 4.539-4.563 4.539zm-.024-7.51a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.365 3.019 3.044 3.019 1.705 0 3.093-1.376 3.093-3.068v-2.97H8.148z",
  },
  {
    name: "Supabase",
    path: "M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C-.33 13.427.65 15.455 2.409 15.455h9.579l.113 7.51c.014.985 1.259 1.408 1.873.636l9.262-11.653c1.093-1.375.113-3.403-1.645-3.403h-9.642z",
  },
  {
    name: "GitHub",
    path: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  },
  {
    name: "Vercel",
    path: "m12 1.608 12 20.784H0Z",
  },
  {
    name: "Notion",
    path: "M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933z",
  },
  {
    name: "Airbnb",
    path: "M12.001 18.275c-1.353-1.697-2.148-3.184-2.413-4.457-.263-1.027-.16-1.848.291-2.465.477-.71 1.188-1.056 2.121-1.056s1.643.345 2.12 1.063c.446.61.558 1.432.286 2.465-.291 1.298-1.085 2.785-2.412 4.458zm9.601 1.14c-.185 1.246-1.034 2.28-2.2 2.783-2.253.98-4.483-.583-6.392-2.704 3.157-3.951 3.74-7.028 2.385-9.018-.795-1.14-1.933-1.695-3.394-1.695-2.944 0-4.563 2.49-3.927 5.382.37 1.565 1.352 3.343 2.917 5.332-.98 1.085-1.91 1.856-2.732 2.333-.636.344-1.245.558-1.828.609-2.679.399-4.778-2.2-3.825-4.88.132-.345.395-.98.845-1.961l.025-.053c1.464-3.178 3.242-6.79 5.285-10.795l.053-.132.58-1.116c.45-.822.635-1.19 1.351-1.643.346-.21.77-.315 1.246-.315.954 0 1.698.558 2.016 1.007.158.239.345.557.582.9z",
  },
];
function BrandMark({ name, path }: { name: string; path: string }) {
  const foreground = useCSSVariable("--color-foreground");
  const fill = typeof foreground === "string" ? foreground : "#ffffff";
  return (
    <View className="border-border h-11 flex-row items-center gap-2.5 rounded-xl border px-4">
      <Svg width={18} height={18} viewBox="0 0 24 24" accessibilityLabel={name}>
        <Path d={path} fill={fill} />
      </Svg>
      <Text weight="medium" className="tracking-tight">
        {name}
      </Text>
    </View>
  );
}
function MarqueeStripDemo() {
  return (
    <Marquee spacing={12} speed={40} className="w-full">
      <View className="flex-row gap-3">
        {MARQUEE_STACK.map((label) => (
          <Badge key={label} variant="secondary">
            {label}
          </Badge>
        ))}
      </View>
    </Marquee>
  );
}
function MarqueeLogoWallVersion() {
  const second = [...MARQUEE_BRANDS.slice(4), ...MARQUEE_BRANDS.slice(0, 4)];
  return (
    <View className="flex-1 justify-center gap-8 px-0 py-4">
      <View className="gap-2 px-5">
        <Text size="sm" muted>
          Trusted by
        </Text>
        <Text size="xl" weight="semibold">
          Teams that ship on mobile
        </Text>
      </View>

      <Marquee.Group className="px-5">
        <Marquee spacing={12} speed={28} className="h-11 w-full">
          <View className="flex-row gap-3">
            {MARQUEE_BRANDS.map((brand) => (
              <BrandMark key={brand.name} name={brand.name} path={brand.path} />
            ))}
          </View>
        </Marquee>
        <Marquee spacing={12} speed={28} reverse className="h-11 w-full">
          <View className="flex-row gap-3">
            {second.map((brand) => (
              <BrandMark key={brand.name} name={brand.name} path={brand.path} />
            ))}
          </View>
        </Marquee>
      </Marquee.Group>
    </View>
  );
}
const MARQUEE_POSTS = [
  {
    id: "a",
    author: "Priya Raman",
    handle: "@priya",
    body: "Shipped the redesign behind a flag this morning. Rollout at 10% and the crash rate has not moved.",
    replies: "24",
  },
  {
    id: "b",
    author: "Tom Whitfield",
    handle: "@tomw",
    body: "Spent the afternoon deleting a caching layer nobody could explain. Response times went down.",
    replies: "61",
  },
  {
    id: "c",
    author: "Ana Beltrán",
    handle: "@anab",
    body: "The list virtualisation finally holds sixty frames on the cheap Android test device.",
    replies: "12",
  },
  {
    id: "d",
    author: "Kofi Mensah",
    handle: "@kofi",
    body: "Reminder that a loading state showing invented numbers is worse than one showing nothing.",
    replies: "38",
  },
];
function MarqueeFeedVersion() {
  const [playing, setPlaying] = useState(true);
  return (
    <View className="flex-1 gap-4 py-4">
      <View className="flex-row items-center justify-between px-5">
        <View>
          <Text size="xl" weight="semibold">
            What people are saying
          </Text>
          <Text size="sm" muted>
            Hold a card to stop the feed
          </Text>
        </View>
        <Switch value={playing} onValueChange={setPlaying} />
      </View>

      <Marquee
        direction="vertical"
        spacing={12}
        speed={22}
        playing={playing}
        showPauseControl={false}
        className="w-full flex-1"
      >
        <View className="gap-3 px-5">
          {MARQUEE_POSTS.map((post) => (
            <Pressable
              key={post.id}
              className="w-72"
              onPressIn={() => setPlaying(false)}
              onPressOut={() => setPlaying(true)}
            >
              <Post variant="compact" className="w-full">
                <Post.Header>
                  <Post.Author
                    name={post.author}
                    handle={post.handle}
                    fallback={post.author.slice(0, 1)}
                    timestamp="2h"
                  />
                </Post.Header>
                <Post.Body numberOfLines={3}>{post.body}</Post.Body>
                <Post.Footer>
                  <Post.Stat icon={MessageCircleIcon} value={post.replies} />
                </Post.Footer>
              </Post>
            </Pressable>
          ))}
        </View>
      </Marquee>
    </View>
  );
}
function MarqueeTwoRowDemo() {
  return (
    <Marquee.Group className="w-full">
      <Marquee spacing={12} speed={35}>
        <View className="flex-row gap-3">
          {MARQUEE_STACK.map((label) => (
            <Chip key={label}>{label}</Chip>
          ))}
        </View>
      </Marquee>
      <Marquee spacing={12} speed={35} reverse>
        <View className="flex-row gap-3">
          {MARQUEE_RELEASES.map((label) => (
            <Chip key={label} variant="outline">
              {label}
            </Chip>
          ))}
        </View>
      </Marquee>
    </Marquee.Group>
  );
}
function MarqueeVerticalDemo() {
  return (
    <Marquee
      direction="vertical"
      spacing={12}
      speed={30}
      className="h-40 w-full"
    >
      <View className="gap-3">
        {MARQUEE_RELEASES.map((label) => (
          <Surface key={label} className="w-full rounded-xl px-4 py-3">
            <Text weight="medium">{label}</Text>
          </Surface>
        ))}
      </View>
    </Marquee>
  );
}
function MarqueePlayingDemo() {
  const [playing, setPlaying] = useState(true);
  return (
    <View className="w-full gap-4">
      <Marquee
        spacing={12}
        speed={40}
        playing={playing}
        showPauseControl={false}
      >
        <View className="flex-row gap-3">
          {MARQUEE_STACK.map((label) => (
            <Badge key={label} variant="secondary">
              {label}
            </Badge>
          ))}
        </View>
      </Marquee>
      <View className="flex-row items-center justify-between">
        <Text size="sm" muted>
          Playing
        </Text>
        <Switch value={playing} onValueChange={setPlaying} />
      </View>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "marquee",
  name: "Marquee",
  summary: "Content that travels across its container on a loop",
  demos: [
    { label: "A strip of badges", render: () => <MarqueeStripDemo /> },
    { label: "Two rows, opposite ways", render: () => <MarqueeTwoRowDemo /> },
    { label: "Vertical", render: () => <MarqueeVerticalDemo /> },
    { label: "Holding it still", render: () => <MarqueePlayingDemo /> },
    {
      label: "A wall of logos",
      id: "logos",
      fullPage: true,
      description:
        "Two rows of customer marks travelling against each other, at the width the section actually runs at.",
      render: () => <MarqueeLogoWallVersion />,
    },
    {
      label: "A feed that keeps moving",
      id: "feed",
      fullPage: true,
      description:
        "Cards on the vertical axis, where the container has to give the height. Hold one to stop the travel.",
      render: () => <MarqueeFeedVersion />,
    },
  ],
};
