import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import {
  HeartIcon,
  BookmarkIcon,
  EllipsisIcon,
} from "panelui-taro/icons";
import { Post } from "panelui-taro/post";
import type { PostVariant, PostVote } from "panelui-taro/post";
import { Text } from "panelui-taro/primitives/text";
import { useState } from "react";

const VARIANTS: PostVariant[] = ["feed", "vote", "compact", "media"];
export const PostShowcase = () => {
  const [variant, setVariant] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [vote, setVote] = useState<PostVote>(null);
  const [action, setAction] = useState("No action");
  let voteScore = 12;
  if (vote === "up") {
    voteScore += 1;
  } else if (vote === "down") {
    voteScore -= 1;
  }
  const selectedVariant = VARIANTS[variant];
  const media = (
    <Post.Media
      source="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800"
      alt="Learning desk"
      onPress={() => setAction("Opened image")}
    />
  );
  return (
    <View className="flex flex-col gap-[24px]">
      <Post variant={selectedVariant} onPress={() => setAction("Opened post")}>
        {selectedVariant === "media" ? media : null}
        <Post.Header>
          <Post.Author
            name="Learning parent"
            handle="@parent"
            fallback="LP"
            verified
            timestamp="3m ago"
          />
          <Post.Action>
            <EllipsisIcon size={18} />
          </Post.Action>
        </Post.Header>
        <Post.Title>Learning together</Post.Title>
        <Post.Body
          onTagPress={(tag) => setAction(`Tag ${tag}`)}
          onMentionPress={(person) => setAction(`Mention ${person}`)}
        >
          A new reading milestone with @family. #Learning
        </Post.Body>
        {selectedVariant === "media" ? null : media}
        <Post.Footer>
          <Post.Votes score={voteScore} vote={vote} onVote={setVote} />
          <Post.Stat
            icon={HeartIcon}
            active={liked}
            tone="like"
            value={215 + (liked ? 1 : 0)}
            onPress={() => setLiked(!liked)}
          />
          <Post.Stat
            icon={BookmarkIcon}
            active={saved}
            tone="save"
            value="Save"
            align="end"
            onPress={() => setSaved(!saved)}
          />
        </Post.Footer>
      </Post>
      <Text size="xs">
        {JSON.stringify({
          action,
          liked,
          saved,
          variant: VARIANTS[variant],
          vote,
        })}
      </Text>
      <Button onPress={() => setVariant((variant + 1) % VARIANTS.length)}>
        Next post variant
      </Button>
    </View>
  );
};
