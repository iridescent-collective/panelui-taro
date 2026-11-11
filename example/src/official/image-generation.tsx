import { Avatar } from "panelui-taro/avatar";
import { Button } from "panelui-taro/button";
import {
  ImageGeneration,
  type ImageGenerationStatus,
} from "panelui-taro/image-generation";
import { Item } from "panelui-taro/item";
import { Message } from "panelui-taro/message";
import { MessageScroller } from "panelui-taro/message-scroller";
import { Response } from "panelui-taro/response";
import { useEffect, useState } from "react";

import { Image, View } from "../runtime/native";
import { ComponentEntry } from "../types";
const IMAGE_STEPS: ImageGenerationStatus[] = [
  "queued",
  "generating",
  "refining",
  "complete",
];
const MOUNTAIN = "https://picsum.photos/seed/panelui-mountain/512/512";
function ImageGenerationDemo() {
  const [at, setAt] = useState(0);
  useEffect(() => {
    const timer = setInterval(
      () => setAt((step) => (step + 1) % IMAGE_STEPS.length),
      1800
    );
    return () => clearInterval(timer);
  }, []);
  return (
    <ImageGeneration
      status={IMAGE_STEPS[at]}
      prompt="a quiet mountain landscape at sunset"
      resolution="1024 × 1024"
    >
      <Image
        source={{ uri: MOUNTAIN }}
        style={{ width: "100%", height: "100%" }}
      />
    </ImageGeneration>
  );
}
function ImageGenerationStepDemo({
  status,
}: {
  status: ImageGenerationStatus;
}) {
  return (
    <ImageGeneration status={status} resolution="">
      <Image
        source={{ uri: MOUNTAIN }}
        style={{ width: "100%", height: "100%" }}
      />
    </ImageGeneration>
  );
}
const CHAT_STEPS: ImageGenerationStatus[] = [
  "queued",
  "generating",
  "refining",
  "complete",
];
function ImageGenerationChatVersion() {
  const [at, setAt] = useState(0);
  const status = CHAT_STEPS[at];
  const done = status === "complete";
  useEffect(() => {
    if (at >= CHAT_STEPS.length - 1) return;
    const timer = setTimeout(() => setAt((step) => step + 1), 1800);
    return () => clearTimeout(timer);
  }, [at]);
  return (
    <MessageScroller className="flex-1">
      <MessageScroller.Viewport>
        <MessageScroller.Content className="gap-4 px-5 py-6">
          <MessageScroller.Item messageId="ask">
            <Message align="end">
              <Message.Content>
                <Message.Bubble>
                  <Message.BubbleContent>
                    Draw me a quiet mountain landscape at sunset.
                  </Message.BubbleContent>
                </Message.Bubble>
              </Message.Content>
            </Message>
          </MessageScroller.Item>

          <MessageScroller.Item messageId="image">
            <Message align="start">
              <Message.Avatar>
                <Avatar size="sm" fallback="AI" />
              </Message.Avatar>
              <Message.Content>
                <ImageGeneration
                  status={status}
                  prompt="a quiet mountain landscape at sunset"
                  resolution="1024 × 1024"
                >
                  <Image
                    source={{ uri: MOUNTAIN }}
                    style={{ width: "100%", height: "100%" }}
                  />
                </ImageGeneration>
              </Message.Content>
            </Message>
          </MessageScroller.Item>

          {done ? (
            <MessageScroller.Item messageId="reply">
              <Response>
                Here it is — late light on the far ridge, and the valley already
                in shadow. Say the word and I will try a wider crop.
              </Response>
            </MessageScroller.Item>
          ) : null}

          <MessageScroller.Item messageId="again">
            <Button variant="secondary" onPress={() => setAt(0)}>
              Ask again
            </Button>
          </MessageScroller.Item>
        </MessageScroller.Content>
      </MessageScroller.Viewport>
    </MessageScroller>
  );
}
function ImageGenerationRetryDemo() {
  const [retried, setRetried] = useState(false);
  return retried ? (
    <ImageGenerationDemo />
  ) : (
    <ImageGeneration
      status="error"
      prompt="a quiet mountain landscape at sunset"
      onRetry={() => setRetried(true)}
    />
  );
}
export const entry: ComponentEntry = {
  slug: "image-generation",
  name: "ImageGeneration",
  summary: "The place an image will be, while it is being made",
  demos: [
    { label: "Through the work", render: () => <ImageGenerationDemo /> },
    {
      label: "Waiting to generate",
      render: () => <ImageGenerationStepDemo status="queued" />,
    },
    {
      label: "Creating",
      render: () => <ImageGenerationStepDemo status="generating" />,
    },
    {
      label: "Refining",
      render: () => <ImageGenerationStepDemo status="refining" />,
    },
    {
      label: "Ready",
      render: () => <ImageGenerationStepDemo status="complete" />,
    },
    {
      label: "Wider than a thumbnail",
      render: () => (
        <ImageGeneration
          size="fluid"
          status="generating"
          aspectRatio={16 / 9}
        />
      ),
    },
    {
      label: "When it fails",
      render: () => <ImageGenerationRetryDemo />,
    },
    {
      label: "A light that pulses",
      render: () => (
        <ImageGeneration status="generating" animation="pulse" resolution="" />
      ),
    },
    {
      label: "A light that scans",
      render: () => (
        <ImageGeneration status="generating" animation="scan" resolution="" />
      ),
    },
    {
      label: "The field alone",
      render: () => (
        <View className="bg-muted h-32 w-full overflow-hidden rounded-xl">
          <ImageGeneration.Field />
        </View>
      ),
    },
    {
      label: "In a conversation",
      id: "in-a-conversation",
      fullPage: true,
      description:
        "The box is the right shape from the moment the request goes in, so the reply under it never moves.",
      render: () => <ImageGenerationChatVersion />,
    },
  ],
};
