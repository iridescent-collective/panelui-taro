import { AIInput } from "panelui-taro/ai-input";
import { Avatar } from "panelui-taro/avatar";
import { Badge } from "panelui-taro/badge";
import { Button } from "panelui-taro/button";
import {
  BugIcon,
  CardIcon,
  ChevronLeftIcon,
  HeadsetIcon,
  LockIcon,
  MailIcon,
  MessageCircleIcon,
  PaperclipIcon,
  SparklesIcon,
} from "panelui-taro/icons";
import { Message } from "panelui-taro/message";
import { MessageScroller } from "panelui-taro/message-scroller";
import { Text } from "panelui-taro/primitives/text";
import { Rating } from "panelui-taro/rating";
import { Response } from "panelui-taro/response";
import { Support } from "panelui-taro/support";
import { useState, type ReactNode } from "react";

import { useSafeAreaInsets } from "../runtime/native";
import { ScrollView, View } from "../runtime/native";
import { useRouter } from "../runtime/router";
import { ComponentEntry } from "../types";
const TEAM = [
  {
    name: "Khalid Abdi",
    uri: "https://github.com/Khalidabdi1.png",
    initials: "KA",
  },
  {
    name: "Kofi Boateng",
    uri: "https://i.pravatar.cc/150?img=12",
    initials: "KB",
  },
  {
    name: "Jess Ruiz",
    uri: "https://i.pravatar.cc/150?img=32",
    initials: "JR",
  },
];
function TeamFaces() {
  return (
    <Avatar.Group size="sm" max={3}>
      {TEAM.map((person) => (
        <Avatar
          key={person.name}
          source={{ uri: person.uri }}
          fallback={person.initials}
        />
      ))}
    </Avatar.Group>
  );
}
function Face({ person }: { person: (typeof TEAM)[number] | "assistant" }) {
  if (person === "assistant") {
    return (
      <Avatar size="sm" fallback="AI">
        <Avatar.Badge>
          <SparklesIcon size={10} />
        </Avatar.Badge>
      </Avatar>
    );
  }
  return (
    <Avatar size="sm" source={{ uri: person.uri }} fallback={person.initials} />
  );
}
function DemoBack({ onPress }: { onPress?: () => void }) {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      size="sm"
      onPress={onPress ?? (() => router.back())}
      accessibilityLabel="Go back"
      className="-ms-2 shrink-0"
    >
      <ChevronLeftIcon />
    </Button>
  );
}
function SupportHomeScreen({
  onAssistant,
  onTeam,
}: {
  onAssistant?: () => void;
  onTeam?: () => void;
}) {
  return (
    <Support availability="online">
      <Support.Header
        title="Support"
        description="We answer most things the same day"
      >
        <TeamFaces />
      </Support.Header>

      <Support.Status replyTime="Typically replies in under an hour" />

      <Support.Channels title="Get in touch">
        <Support.Channel
          icon={<SparklesIcon />}
          label="Ask the assistant"
          description="Answers most questions straight away"
          onPress={onAssistant}
        />
        <Support.Channel
          icon={<MessageCircleIcon />}
          label="Message the team"
          description="We pick these up through the day"
          detail="~1h"
          onPress={onTeam}
        />
        <Support.Channel
          icon={<MailIcon />}
          label="Email us"
          description="support@panelui.dev"
          detail="1 day"
        />
      </Support.Channels>

      <Support.Conversations title="Your requests">
        <Support.Conversation
          title="Refund for order #4821"
          preview="We've issued the refund — it should land in 3–5 days."
          status="solved"
          reference="#4821"
          timestamp="2h"
          unread
        />
        <Support.Conversation
          title="Can't add a second device"
          preview="Could you tell us which OS version it is running?"
          status="pending"
          reference="#4810"
          timestamp="Yesterday"
          updated
        />
      </Support.Conversations>
    </Support>
  );
}
function SupportTopicScreen({
  topic,
  onTopicChange,
  onContinue,
}: {
  topic: string | null;
  onTopicChange: (value: string) => void;
  onContinue?: () => void;
}) {
  return (
    <Support>
      <Support.Header
        title="What is it about?"
        description="Picking one gets you to the right team first time"
      />
      <Support.Topics value={topic} onValueChange={onTopicChange}>
        <Support.Topic
          value="billing"
          icon={<CardIcon />}
          label="Billing"
          description="Invoices, refunds and plans"
        />
        <Support.Topic
          value="account"
          icon={<LockIcon />}
          label="Account and sign-in"
          description="Passwords, devices and two-factor"
        />
        <Support.Topic
          value="bug"
          icon={<BugIcon />}
          label="Something is broken"
          description="Send us what you were doing at the time"
        />
      </Support.Topics>
      <Button disabled={!topic} onPress={onContinue}>
        Continue
      </Button>
    </Support>
  );
}
type Turn = {
  id: string;
  from: "them" | "me";
  body: string;
  at: string;
};
const THREAD: Turn[] = [
  {
    id: "1",
    from: "them",
    at: "09:12",
    body: "Thanks for getting in touch. I can see order #4821 — it was delivered on the 14th. What went wrong with it?",
  },
  {
    id: "2",
    from: "me",
    at: "09:14",
    body: "Two of the four cups arrived cracked.",
  },
  {
    id: "3",
    from: "them",
    at: "09:15",
    body: "Sorry about that. I've refunded those two to your card — £24.50. It usually shows in three to five days.",
  },
];
function SupportThreadScreen({
  agent,
  role,
  ticket,
  note,
  placeholder,
  onBack,
  children,
}: {
  agent: (typeof TEAM)[number] | "assistant";
  role: string;
  ticket?: boolean;
  note: string;
  placeholder: string;
  onBack?: () => void;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState("");
  const below = insets.bottom + 8;
  return (
    <View className="flex-1">
      <View
        className="border-border gap-3 border-b px-4 pb-3"
        style={{ paddingTop: insets.top + 8 }}
      >
        <View className="flex-row items-center gap-1">
          <DemoBack onPress={onBack} />
          <View className="shrink grow">
            <Support availability="online">
              <Support.Agent
                name={agent === "assistant" ? "Assistant" : agent.name}
                role={role}
                avatar={<Face person={agent} />}
              />
            </Support>
          </View>
        </View>
        {ticket ? (
          <Support.Ticket
            subject="Refund for order #4821"
            reference="#4821"
            status="open"
          />
        ) : null}
      </View>

      <MessageScroller autoScroll className="flex-1">
        <MessageScroller.Viewport>
          <MessageScroller.Content className="gap-3 px-4 py-4">
            {children}
          </MessageScroller.Content>
        </MessageScroller.Viewport>
      </MessageScroller>

      <View className="gap-2 px-4 pt-2" style={{ paddingBottom: below }}>
        <Support.Note>{note}</Support.Note>
        <AIInput
          value={draft}
          onValueChange={setDraft}
          onSubmit={() => setDraft("")}
          keyboardBottomInset={below}
        >
          <AIInput.Field placeholder={placeholder} />
          <AIInput.Toolbar>
            <AIInput.Action label="Attach" icon={<PaperclipIcon />} />
            <AIInput.Spacer />
            <AIInput.Submit />
          </AIInput.Toolbar>
        </AIInput>
      </View>
    </View>
  );
}
function HumanTurns() {
  const khalid = TEAM[0]!;
  return (
    <>
      <Support.Handoff icon={<HeadsetIcon />}>
        You were passed to Khalid, who can see everything you told the
        assistant.
      </Support.Handoff>
      {THREAD.map((turn) => (
        <Message key={turn.id} align={turn.from === "me" ? "end" : "start"}>
          {turn.from === "them" ? (
            <Message.Avatar>
              <Face person={khalid} />
            </Message.Avatar>
          ) : null}
          <Message.Content>
            <Message.Bubble>
              <Message.BubbleContent>{turn.body}</Message.BubbleContent>
            </Message.Bubble>
            <Message.Footer>{turn.at}</Message.Footer>
          </Message.Content>
        </Message>
      ))}
      <Support.Resolution>
        <Rating defaultValue={0} max={5} />
      </Support.Resolution>
    </>
  );
}
function SupportHomeVersion() {
  return (
    <ScrollView contentContainerClassName="p-4 pb-10">
      <SupportHomeScreen />
    </ScrollView>
  );
}
function SupportTopicsVersion() {
  const [topic, setTopic] = useState<string | null>("billing");
  return (
    <ScrollView contentContainerClassName="p-4 pb-10">
      <SupportTopicScreen topic={topic} onTopicChange={setTopic} />
    </ScrollView>
  );
}
function SupportThreadVersion() {
  return (
    <SupportThreadScreen
      agent={TEAM[0]!}
      role="Support"
      ticket
      note="Khalid typically replies in under an hour"
      placeholder="Write a reply"
    >
      <HumanTurns />
    </SupportThreadScreen>
  );
}
function SupportJourneyVersion() {
  const [step, setStep] = useState<"home" | "topic" | "assistant" | "human">(
    "home"
  );
  const [topic, setTopic] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  if (step === "home" || step === "topic") {
    return (
      <ScrollView
        contentContainerClassName="gap-4 px-4"
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View className="flex-row items-center gap-1">
          <DemoBack
            onPress={step === "topic" ? () => setStep("home") : undefined}
          />
          <Text size="xs" muted>
            {step === "home" ? "Step 1 of 4" : "Step 2 of 4"}
          </Text>
        </View>
        {step === "home" ? (
          <SupportHomeScreen
            onAssistant={() => setStep("topic")}
            onTeam={() => setStep("human")}
          />
        ) : (
          <SupportTopicScreen
            topic={topic}
            onTopicChange={setTopic}
            onContinue={() => setStep("assistant")}
          />
        )}
      </ScrollView>
    );
  }
  if (step === "assistant") {
    return (
      <SupportThreadScreen
        agent="assistant"
        role="Step 3 of 4"
        note="The assistant answers straight away"
        placeholder="Ask something else"
        onBack={() => setStep("topic")}
      >
        <Message align="end">
          <Message.Content>
            <Message.Bubble>
              <Message.BubbleContent>
                Two of the cups in order #4821 arrived cracked.
              </Message.BubbleContent>
            </Message.Bubble>
          </Message.Content>
        </Message>
        <Message>
          <Message.Avatar>
            <Face person="assistant" />
          </Message.Avatar>
          <Message.Content>
            <Message.Bubble>
              <Response>
                {
                  "Sorry about those. Damaged items are refunded rather than replaced, and you don't need to send them back.\n\nI can't issue the refund myself — a person has to approve it."
                }
              </Response>
            </Message.Bubble>
          </Message.Content>
        </Message>
        <Support.Replies>
          <Support.Reply
            label="Talk to a person"
            onPress={() => setStep("human")}
          />
          <Support.Reply
            label="That's all, thanks"
            onPress={() => setStep("home")}
          />
        </Support.Replies>
      </SupportThreadScreen>
    );
  }
  return (
    <SupportThreadScreen
      agent={TEAM[0]!}
      role="Step 4 of 4"
      ticket
      note="Khalid typically replies in under an hour"
      placeholder="Write a reply"
      onBack={() => setStep("assistant")}
    >
      <HumanTurns />
    </SupportThreadScreen>
  );
}
function SupportAwayDemo() {
  return (
    <View className="w-full gap-3">
      <Support availability="away">
        <Support.Status replyTime="Back tomorrow morning — leave a message and we'll reply first thing" />
      </Support>
      <Support availability="offline">
        <Support.Status />
      </Support>
      <Text size="xs" muted className="px-1">
        `availability` colours the dot and supplies the wording when `replyTime`
        says nothing.
      </Text>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "support",
  name: "Support",
  summary: "The screen a person arrives on when they need help",
  layout: "pager",
  demos: [
    {
      label: "The help screen",
      id: "home",
      fullPage: true,
      description:
        "Who is there, the ways to reach them, and what happened to the last thing you asked. The unread dot takes the accent colour; the one on a thread that merely moved stays grey.",
      render: () => <SupportHomeVersion />,
    },
    {
      label: "Picking a topic",
      id: "topics",
      fullPage: true,
      description:
        "A single-select list, for a desk that routes to different teams. It is a radio group, so a screen reader reads it as one.",
      render: () => <SupportTopicsVersion />,
    },
    {
      label: "Talking to somebody",
      id: "thread",
      fullPage: true,
      fullBleed: true,
      backSwipe: true,
      description:
        "The conversation itself: who is answering, what request it belongs to, the handoff that says you are no longer talking to a machine, and the wait time where somebody is deciding whether to type.",
      render: () => <SupportThreadVersion />,
    },
    {
      label: "The whole way through",
      id: "journey",
      fullPage: true,
      fullBleed: true,
      backSwipe: true,
      description:
        "Four steps, driven for real: the help screen, picking a topic, the assistant answering, and the handoff to a person who can. Press through it.",
      render: () => <SupportJourneyVersion />,
    },
    { label: "When nobody is there", render: () => <SupportAwayDemo /> },
  ],
};
