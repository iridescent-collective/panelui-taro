import {
  BookmarkIcon,
  EllipsisIcon,
  EyeIcon,
  HeartIcon,
  MaximizeIcon,
  MessageCircleIcon,
  RepeatIcon,
  ShareNodesIcon,
} from "panelui-taro/icons";
import { ImageViewer } from "panelui-taro/image-viewer";
import { Post, type PostVote } from "panelui-taro/post";
import { useState } from "react";

import { demoAction } from "../runtime/demo-action";
import { ScrollView, View } from "../runtime/native";
import { ComponentEntry } from "../types";
const AVATARS = [
  "https://i.pravatar.cc/150?img=12",
  "https://i.pravatar.cc/150?img=32",
  "https://i.pravatar.cc/150?img=47",
];
const POST_PHOTOS = {
  savings:
    "https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?w=900&q=60",
  workshop:
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=900&q=60",
  coast:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=60",
};
function FeedPostDemo() {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <Post variant="feed" className="w-full">
      <Post.Header>
        <Post.Author
          name="Dwayne F. White"
          verified
          timestamp="Posted 3m ago"
          avatar={{ uri: AVATARS[0] }}
        />
        <Post.Action>
          <EllipsisIcon size={18} />
        </Post.Action>
      </Post.Header>

      <Post.Body onTagPress={(tag) => demoAction(`#${tag}`)()}>
        {
          "I've been working hard to pay off my credit card debt, and I'm wondering what strategies you've all found most effective? #FinancialFreedom #DebtSnowball"
        }
      </Post.Body>

      <Post.Media
        source={{ uri: POST_PHOTOS.savings }}
        alt="A coin going into a piggy bank beside stacks of change"
        overlay={
          <View className="absolute end-3 top-3 h-8 w-8 items-center justify-center rounded-lg bg-black/45">
            <MaximizeIcon size={16} color="#ffffff" />
          </View>
        }
      />

      <Post.Footer>
        <Post.Stat icon={EyeIcon} value="5,874" />
        <Post.Stat
          icon={HeartIcon}
          tone="like"
          active={liked}
          value={liked ? 216 : 215}
          onPress={() => setLiked((on) => !on)}
        />
        <Post.Stat
          icon={MessageCircleIcon}
          value="11"
          onPress={demoAction("Post Stat selected")}
        />
        <Post.Stat
          icon={BookmarkIcon}
          tone="save"
          align="end"
          active={saved}
          value={saved ? "Saved" : "Save"}
          onPress={() => setSaved((on) => !on)}
        />
      </Post.Footer>
    </Post>
  );
}
function VotePostDemo() {
  const [vote, setVote] = useState<PostVote>(null);
  const base = 1240;
  const score = base + (vote === "up" ? 1 : vote === "down" ? -1 : 0);
  return (
    <Post variant="vote" className="w-full">
      <Post.Header>
        <Post.Community
          name="r/reactnative"
          avatar={{ uri: AVATARS[1] }}
          meta="5h ago"
        />
        <Post.Action>
          <EllipsisIcon size={18} />
        </Post.Action>
      </Post.Header>

      <Post.Title>Reanimated 4 shipped — what actually changed?</Post.Title>
      <Post.Body numberOfLines={3}>
        The worklet runtime is the headline, but the part that matters day to
        day is that layout animations finally compose with shared values.
      </Post.Body>

      <Post.Footer>
        <Post.Votes
          score={score.toLocaleString()}
          vote={vote}
          onVote={setVote}
        />
        <Post.Stat
          icon={MessageCircleIcon}
          value="184"
          onPress={demoAction("Post Stat selected")}
        />
        <Post.Stat
          icon={ShareNodesIcon}
          value="Share"
          align="end"
          onPress={demoAction("Post Stat selected")}
        />
      </Post.Footer>
    </Post>
  );
}
function CompactPostDemo() {
  const [liked, setLiked] = useState(true);
  const [reposted, setReposted] = useState(false);
  return (
    <Post variant="compact" className="w-full">
      <Post.Header>
        <Post.Author
          name="Ada Okonkwo"
          handle="@ada"
          timestamp="12m"
          avatar={{ uri: AVATARS[2] }}
        />
        <Post.Action>
          <EllipsisIcon size={16} />
        </Post.Action>
      </Post.Header>

      <Post.Body onMentionPress={(handle) => demoAction(`@${handle}`)()}>
        Spent the morning deleting a caching layer nobody had touched in a year.
        Fastest the app has ever been. cc @dwayne
      </Post.Body>

      <Post.Footer>
        <Post.Stat
          icon={MessageCircleIcon}
          value="8"
          onPress={demoAction("Post Stat selected")}
        />
        <Post.Stat
          icon={RepeatIcon}
          tone="repost"
          active={reposted}
          value={reposted ? 41 : 40}
          onPress={() => setReposted((on) => !on)}
        />
        <Post.Stat
          icon={HeartIcon}
          tone="like"
          active={liked}
          value={liked ? 312 : 311}
          onPress={() => setLiked((on) => !on)}
        />
        <Post.Stat icon={EyeIcon} value="9.1k" align="end" />
      </Post.Footer>
    </Post>
  );
}
function MediaPostDemo() {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <Post variant="media" className="w-full">
      <Post.Media
        source={{ uri: POST_PHOTOS.coast }}
        aspectRatio={4 / 3}
        alt="A coastline at dusk"
      />
      <Post.Header>
        <Post.Author
          name="Marta Lindqvist"
          verified
          timestamp="Yesterday"
          avatar={{ uri: AVATARS[1] }}
        />
      </Post.Header>

      <Post.Body onTagPress={(tag) => demoAction(`#${tag}`)()}>
        Four hours of walking for eleven minutes of light. #goldenhour
      </Post.Body>

      <Post.Footer>
        <Post.Stat
          icon={HeartIcon}
          tone="like"
          active={liked}
          value={liked ? "2,041" : "2,040"}
          onPress={() => setLiked((on) => !on)}
        />
        <Post.Stat
          icon={MessageCircleIcon}
          value="63"
          onPress={demoAction("Post Stat selected")}
        />
        <Post.Stat
          icon={BookmarkIcon}
          tone="save"
          align="end"
          active={saved}
          onPress={() => setSaved((on) => !on)}
        />
      </Post.Footer>
    </Post>
  );
}
function postPhoto(id: string) {
  const url = (width: number) => ({
    uri: `https://images.unsplash.com/photo-${id}?w=${width}&q=70`,
  });
  return { source: url(800), fullSource: url(1600) };
}
const HIKE_PHOTOS = [
  {
    id: "1506905925346-21bda4d32df4",
    alt: "Mountain peaks above a sea of cloud at sunrise",
    caption: "Twenty to six, from the top of the pass.",
  },
  {
    id: "1469474968028-56623f02e42e",
    alt: "A hiker standing on a boulder above a misty valley",
    caption: "Tom, refusing to come down off that rock.",
  },
  {
    id: "1501785888041-af3ef285b470",
    alt: "A rowing boat on a turquoise lake under limestone peaks",
    caption: "The lake at the bottom of the descent.",
  },
  {
    id: "1519681393784-d120267933ba",
    alt: "The Milky Way over snowy mountains",
    caption: "The one clear night.",
  },
];
function SinglePhotoPost() {
  const [liked, setLiked] = useState(false);
  const photo = postPhoto("1500530855697-b586d89ba3ee");
  return (
    <Post variant="feed" className="w-full">
      <Post.Header>
        <Post.Author
          name="Priya Raman"
          handle="@priyaroams"
          timestamp="2h ago"
          avatar={{ uri: AVATARS[2] }}
        />
        <Post.Action>
          <EllipsisIcon size={18} />
        </Post.Action>
      </Post.Header>

      <Post.Body>
        Four hundred kilometres and one petrol station. #roadtrip
      </Post.Body>

      <ImageViewer>
        <ImageViewer.Trigger
          {...photo}
          alt="An empty road running between red rock formations"
          radius={12}
          className="mx-4 rounded-xl"
        >
          <Post.Media source={photo.source} className="mx-0" />
        </ImageViewer.Trigger>
      </ImageViewer>

      <Post.Footer>
        <Post.Stat
          icon={HeartIcon}
          tone="like"
          active={liked}
          value={liked ? 489 : 488}
          onPress={() => setLiked((on) => !on)}
        />
        <Post.Stat
          icon={MessageCircleIcon}
          value="32"
          onPress={demoAction("Post Stat selected")}
        />
        <Post.Stat
          icon={ShareNodesIcon}
          value="Share"
          align="end"
          onPress={demoAction("Post Stat selected")}
        />
      </Post.Footer>
    </Post>
  );
}
function PhotoGridPost() {
  const [liked, setLiked] = useState(true);
  const [saved, setSaved] = useState(false);
  return (
    <Post variant="feed" className="w-full">
      <Post.Header>
        <Post.Author
          name="Jonas Reuter"
          verified
          timestamp="Yesterday"
          avatar={{ uri: AVATARS[0] }}
        />
        <Post.Action>
          <EllipsisIcon size={18} />
        </Post.Action>
      </Post.Header>

      <Post.Body>
        Three days over the pass. Fog for most of it, then this. #hiking
        #nofilter
      </Post.Body>

      <ImageViewer>
        <View className="mx-4 gap-1">
          {[HIKE_PHOTOS.slice(0, 2), HIKE_PHOTOS.slice(2)].map(
            (row, rowIndex) => (
              <View key={rowIndex} className="flex-row gap-1">
                {row.map((entry) => (
                  <ImageViewer.Trigger
                    key={entry.id}
                    {...postPhoto(entry.id)}
                    alt={entry.alt}
                    caption={entry.caption}
                    radius={8}
                    className="bg-muted aspect-square flex-1 rounded-lg"
                  />
                ))}
              </View>
            )
          )}
        </View>
      </ImageViewer>

      <Post.Footer>
        <Post.Stat
          icon={HeartIcon}
          tone="like"
          active={liked}
          value={liked ? "1,204" : "1,203"}
          onPress={() => setLiked((on) => !on)}
        />
        <Post.Stat
          icon={MessageCircleIcon}
          value="87"
          onPress={demoAction("Post Stat selected")}
        />
        <Post.Stat
          icon={BookmarkIcon}
          tone="save"
          align="end"
          active={saved}
          onPress={() => setSaved((on) => !on)}
        />
      </Post.Footer>
    </Post>
  );
}
function MediaFirstPhotoPost() {
  const [liked, setLiked] = useState(false);
  const photo = postPhoto("1493246507139-91e8fad9978e");
  return (
    <Post variant="media" className="w-full">
      <ImageViewer>
        <ImageViewer.Trigger
          {...photo}
          alt="Red peaks reflected in a still lake at dusk"
          caption="Eleven minutes of light, and we nearly left at ten."
        >
          <Post.Media source={photo.source} aspectRatio={4 / 5} />
        </ImageViewer.Trigger>
      </ImageViewer>
      <Post.Header>
        <Post.Author
          name="Marta Lindqvist"
          verified
          timestamp="3d ago"
          avatar={{ uri: AVATARS[1] }}
        />
      </Post.Header>

      <Post.Body>
        Four hours of walking for eleven minutes of light. #goldenhour
      </Post.Body>

      <Post.Footer>
        <Post.Stat
          icon={HeartIcon}
          tone="like"
          active={liked}
          value={liked ? "2,041" : "2,040"}
          onPress={() => setLiked((on) => !on)}
        />
        <Post.Stat
          icon={MessageCircleIcon}
          value="63"
          onPress={demoAction("Post Stat selected")}
        />
      </Post.Footer>
    </Post>
  );
}
function PostPhotosVersion() {
  return (
    <ScrollView
      contentContainerClassName="gap-4 px-4 pb-12 pt-1"
      showsVerticalScrollIndicator={false}
    >
      <SinglePhotoPost />
      <CompactPostDemo />
      <PhotoGridPost />
      <MediaFirstPhotoPost />
    </ScrollView>
  );
}
function PostFeedDemo() {
  return (
    <ScrollView
      contentContainerClassName="gap-4 px-4 pb-12 pt-1"
      showsVerticalScrollIndicator={false}
    >
      <FeedPostDemo />
      <VotePostDemo />
      <CompactPostDemo />
      <MediaPostDemo />
    </ScrollView>
  );
}
export const entry: ComponentEntry = {
  slug: "post",
  name: "Post",
  summary:
    "A card carrying something somebody said, and what everyone did about it",
  demos: [
    { label: "Feed card", render: () => <FeedPostDemo /> },
    { label: "Vote post", render: () => <VotePostDemo /> },
    { label: "Compact", render: () => <CompactPostDemo /> },
    { label: "Media first", render: () => <MediaPostDemo /> },
    {
      label: "A feed",
      id: "feed",
      description:
        "All four in a scroll, which is where a card is really judged.",
      fullPage: true,
      render: () => <PostFeedDemo />,
    },
    {
      label: "Photos that open",
      id: "photos",
      description:
        "A feed whose photos open full screen over a blur. The grid of four is one gallery, so swipe between them once one is open.",
      fullPage: true,
      render: () => <PostPhotosVersion />,
    },
  ],
};
