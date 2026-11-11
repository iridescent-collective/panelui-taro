import { Avatar } from "panelui-taro/avatar";
import { Badge } from "panelui-taro/badge";
import { Button } from "panelui-taro/button";
import { Chip } from "panelui-taro/chip";
import { Dialog } from "panelui-taro/dialog";
import {
  BookmarkIcon,
  CheckIcon,
  RotateCcwIcon,
  RotateCwIcon,
  TrashIcon,
  XIcon,
} from "panelui-taro/icons";
import { Text } from "panelui-taro/primitives/text";
import {
  StackCard,
  useStackCard,
  type StackCardDirection,
  type StackCardHandle,
} from "panelui-taro/stack-card";
import { useRef, useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
const CANDIDATES = [
  {
    name: "Amara Okafor",
    role: "Senior Platform Engineer",
    where: "Lisbon · Remote",
    years: "8 years",
    note: "Ran the migration off a monolith at a payments company. Writes the runbook before the code.",
    tags: ["Go", "Kubernetes", "Postgres"],
  },
  {
    name: "Tomás Herrera",
    role: "Design Engineer",
    where: "Mexico City · Hybrid",
    years: "5 years",
    note: "Built and still maintains a component library used by four product teams. Prototypes in the real codebase.",
    tags: ["React Native", "Figma", "Motion"],
  },
  {
    name: "Wen Li",
    role: "Staff Data Engineer",
    where: "Singapore · Remote",
    years: "11 years",
    note: "Took a nightly batch pipeline to streaming without a cutover weekend. Teaches the query planner for fun.",
    tags: ["Spark", "dbt", "Airflow"],
  },
  {
    name: "Priya Raghunathan",
    role: "Security Engineer",
    where: "Bengaluru · On-site",
    years: "6 years",
    note: "Found and fixed an auth bypass in a product she had joined two weeks earlier. Writes excellent post-mortems.",
    tags: ["AppSec", "Threat modelling", "Rust"],
  },
  {
    name: "Jonas Berg",
    role: "Mobile Engineer",
    where: "Oslo · Remote",
    years: "9 years",
    note: "Shipped an offline-first field app used on boats with no signal. Profiles before he optimises.",
    tags: ["Swift", "Kotlin", "Offline sync"],
  },
];
function DeckProgress() {
  const { index, count, remaining } = useStackCard();
  return (
    <View className="flex-row items-center justify-between pt-4">
      <Text size="sm" muted>
        {remaining > 0 ? `${remaining} of ${count} left` : "All reviewed"}
      </Text>
      <Text size="sm" weight="medium">
        {index} decided
      </Text>
    </View>
  );
}
function StackCardHiringVersion() {
  const [decisions, setDecisions] = useState<Record<number, string>>({});
  const shortlist = Object.keys(decisions)
    .map(Number)
    .sort((a, b) => a - b)
    .map((at) => decisions[at])
    .filter((name): name is string => Boolean(name));
  return (
    <View className="flex-1 justify-center px-5 py-4">
      <StackCard
        className="flex-1"
        style={{ maxHeight: "1120rpx" }}
        directions={["left", "right"]}
        directionLabels={{ left: "Pass", right: "Shortlist" }}
        onSwipe={(direction, index) => {
          const candidate = CANDIDATES[index];
          setDecisions((current) => {
            const next = { ...current };
            if (direction === "right" && candidate)
              next[index] = candidate.name;
            else delete next[index];
            return next;
          });
        }}
      >
        <StackCard.Stamp direction="right" color="success">
          Shortlist
        </StackCard.Stamp>
        <StackCard.Stamp direction="left" color="destructive">
          Pass
        </StackCard.Stamp>

        {CANDIDATES.map((candidate) => (
          <StackCard.Card key={candidate.name} className="justify-between p-6">
            <View className="gap-4">
              <View className="flex-row items-start justify-between gap-3">
                <Avatar size="lg" fallback={initials(candidate.name)} />
                <Badge variant="secondary">{candidate.years}</Badge>
              </View>
              <View className="gap-1">
                <Text size="2xl" weight="semibold">
                  {candidate.name}
                </Text>
                <Text size="sm" muted>
                  {candidate.role}
                </Text>
                <Text size="sm" muted>
                  {candidate.where}
                </Text>
              </View>
            </View>

            <Text size="sm">{candidate.note}</Text>

            <View className="gap-3">
              <View className="border-border border-t" />
              <View className="flex-row flex-wrap gap-2">
                {candidate.tags.map((tag) => (
                  <Chip key={tag} size="sm">
                    {tag}
                  </Chip>
                ))}
              </View>
            </View>
          </StackCard.Card>
        ))}

        <StackCard.Empty>
          <Text size="lg" weight="semibold">
            {shortlist.length} shortlisted
          </Text>
          <Text size="sm" muted className="text-center">
            {shortlist.length > 0
              ? shortlist.join(", ")
              : "Nobody made it through."}
          </Text>
        </StackCard.Empty>

        <StackCard.Actions>
          <StackCard.Action
            action="left"
            color="destructive"
            icon={<XIcon />}
            label="Pass"
          />
          <StackCard.Action action="undo" size="sm" icon={<RotateCcwIcon />} />
          <StackCard.Action
            action="right"
            color="success"
            icon={<CheckIcon />}
            label="Shortlist"
          />
        </StackCard.Actions>
        <DeckProgress />
      </StackCard>
    </View>
  );
}
const CARDS_TO_LEARN = [
  {
    term: "Yoga",
    gloss: "The layout engine React Native measures every view with.",
  },
  {
    term: "Worklet",
    gloss: "A function compiled to run on the UI thread instead of the JS one.",
  },
  {
    term: "Shared value",
    gloss:
      "A box both threads can read, and the only safe way to pass a number between them.",
  },
  {
    term: "Hermes",
    gloss:
      "The JavaScript engine React Native ships with, which runs bytecode rather than source.",
  },
  {
    term: "Fabric",
    gloss:
      "The renderer that lets the UI thread lay out and draw without waiting on JavaScript.",
  },
];
function StackCardFlashcardsVersion() {
  return (
    <View className="flex-1 justify-center px-5 py-4">
      <StackCard
        className="flex-1"
        style={{ maxHeight: "1120rpx" }}
        layout="flat"
        directions={["up", "down"]}
        directionLabels={{ up: "Knew it", down: "Show me again" }}
      >
        <StackCard.Stamp direction="up" color="success">
          Knew it
        </StackCard.Stamp>
        <StackCard.Stamp direction="down" color="warning">
          Again
        </StackCard.Stamp>

        {CARDS_TO_LEARN.map((card) => (
          <StackCard.Card
            key={card.term}
            className="items-center justify-center gap-4 p-8"
          >
            <Text
              size="xs"
              weight="medium"
              muted
              className="tracking-widest uppercase"
            >
              Term
            </Text>
            <Text size="3xl" weight="semibold" className="text-center">
              {card.term}
            </Text>
            <View className="border-border w-12 border-t" />
            <Text size="sm" muted className="text-center">
              {card.gloss}
            </Text>
          </StackCard.Card>
        ))}

        <StackCard.Empty>
          <Text size="lg" weight="semibold">
            Deck finished
          </Text>
        </StackCard.Empty>

        <StackCard.Actions>
          <StackCard.Action
            action="down"
            color="warning"
            icon={<RotateCwIcon />}
            label="Again"
          />
          <StackCard.Action
            action="up"
            color="success"
            icon={<CheckIcon />}
            label="Knew it"
          />
        </StackCard.Actions>
      </StackCard>
    </View>
  );
}
const PLACES = [
  {
    name: "Cova do Vapor",
    kind: "Beach bar",
    detail: "Sand, a generator and one very good grill.",
    price: "€€",
  },
  {
    name: "Sé Velha",
    kind: "Cathedral",
    detail: "Romanesque, fortified, and colder inside than you expect.",
    price: "Free",
  },
  {
    name: "Mercado 31",
    kind: "Market",
    detail: "Twelve stalls, four of them worth the queue.",
    price: "€",
  },
  {
    name: "Miradouro da Graça",
    kind: "Viewpoint",
    detail: "Go at seven, not at sunset, when everyone else does.",
    price: "Free",
  },
  {
    name: "Livraria Simão",
    kind: "Bookshop",
    detail: "Four square metres. One customer at a time, by arrangement.",
    price: "€€",
  },
];
function StackCardFanVersion() {
  return (
    <View className="flex-1 justify-center px-5 py-4">
      <StackCard
        className="flex-1"
        style={{ maxHeight: "1120rpx" }}
        layout="fan"
        depth={3}
      >
        <StackCard.Stamp direction="right" color="primary">
          Save
        </StackCard.Stamp>
        <StackCard.Stamp direction="left" color="default">
          Skip
        </StackCard.Stamp>

        {PLACES.map((place) => (
          <StackCard.Card key={place.name} className="justify-between p-6">
            <View className="flex-row items-start justify-between gap-3">
              <Badge variant="outline">{place.kind}</Badge>
              <Text size="sm" weight="medium" muted>
                {place.price}
              </Text>
            </View>
            <View className="gap-2">
              <Text size="2xl" weight="semibold">
                {place.name}
              </Text>
              <Text size="sm" muted>
                {place.detail}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <BookmarkIcon size={15} />
              <Text size="xs" muted>
                Throw it right to keep it
              </Text>
            </View>
          </StackCard.Card>
        ))}

        <StackCard.Empty>
          <Text size="sm" muted>
            That is the lot.
          </Text>
        </StackCard.Empty>
      </StackCard>
    </View>
  );
}
const INBOX = [
  {
    from: "Deploy bot",
    subject: "staging is green again",
    body: "The four failing checks were the flaky screenshot suite. Re-run passed on the same commit.",
  },
  {
    from: "Marta",
    subject: "invoice for March",
    body: "Attached. Same terms as last time — thirty days, and the reference goes in the description field.",
  },
  {
    from: "Security",
    subject: "dependency advisory",
    body: "One high-severity finding, transitive, no patch published yet. Watching it; no action needed today.",
  },
  {
    from: "Leah",
    subject: "Thursday moved to Friday",
    body: "The room was double booked. Same time, same agenda, one day later.",
  },
];
function StackCardTriageVersion() {
  return (
    <View className="flex-1 justify-center px-5 py-4">
      <StackCard
        className="flex-1"
        style={{ maxHeight: "1120rpx" }}
        directions={["left", "right", "up", "down"]}
        directionLabels={{
          left: "Archive",
          right: "Keep",
          up: "Pin",
          down: "Snooze",
        }}
      >
        <StackCard.Stamp direction="left" color="default">
          Archive
        </StackCard.Stamp>
        <StackCard.Stamp direction="right" color="success">
          Keep
        </StackCard.Stamp>
        <StackCard.Stamp direction="up" color="primary">
          Pin
        </StackCard.Stamp>
        <StackCard.Stamp direction="down" color="warning">
          Snooze
        </StackCard.Stamp>

        {INBOX.map((mail) => (
          <StackCard.Card key={mail.subject} className="justify-between p-6">
            <View className="gap-3">
              <View className="flex-row items-center gap-3">
                <Avatar size="sm" fallback={initials(mail.from)} />
                <Text size="sm" weight="medium">
                  {mail.from}
                </Text>
              </View>
              <Text size="xl" weight="semibold">
                {mail.subject}
              </Text>
              <Text size="sm" muted>
                {mail.body}
              </Text>
            </View>
            <View className="gap-3">
              <View className="border-border border-t" />
              <Text size="xs" muted>
                Left archives · right keeps · up pins · down snoozes
              </Text>
            </View>
          </StackCard.Card>
        ))}

        <StackCard.Empty>
          <Text size="lg" weight="semibold">
            Inbox clear
          </Text>
        </StackCard.Empty>
      </StackCard>
    </View>
  );
}
const SUBSCRIPTIONS = [
  {
    name: "Cloud storage",
    cost: "$14 / month",
    since: "Since March 2023",
    use: "Last opened 4 months ago",
  },
  {
    name: "Design tool",
    cost: "$22 / month",
    since: "Since August 2021",
    use: "Opened yesterday",
  },
  {
    name: "Stock photos",
    cost: "$39 / month",
    since: "Since January 2024",
    use: "Never opened",
  },
  {
    name: "Analytics",
    cost: "$60 / month",
    since: "Since June 2022",
    use: "Opened last week",
  },
];
function StackCardConfirmVersion() {
  const deck = useRef<StackCardHandle>(null);
  const [index, setIndex] = useState(0);
  const [pending, setPending] = useState<number | null>(null);
  const [cancelled, setCancelled] = useState<string[]>([]);
  const thrown = useRef<StackCardDirection | null>(null);
  const confirmed = useRef(false);
  return (
    <View className="flex-1 justify-center px-5 py-4">
      <StackCard
        ref={deck}
        className="flex-1"
        style={{ maxHeight: "1120rpx" }}
        index={index}
        directionLabels={{ left: "Cancel it", right: "Keep it" }}
        onSwipe={(direction, at) => {
          thrown.current = direction;
          if (direction === "left" && !confirmed.current) setPending(at);
        }}
        onIndexChange={(next) => {
          if (thrown.current === "left" && !confirmed.current) return;
          confirmed.current = false;
          setIndex(next);
        }}
      >
        <StackCard.Stamp direction="left" color="destructive">
          Cancel
        </StackCard.Stamp>
        <StackCard.Stamp direction="right" color="success">
          Keep
        </StackCard.Stamp>

        {SUBSCRIPTIONS.map((item) => (
          <StackCard.Card key={item.name} className="justify-between p-6">
            <View className="gap-1">
              <Text size="2xl" weight="semibold">
                {item.name}
              </Text>
              <Text size="sm" muted>
                {item.since}
              </Text>
            </View>
            <Text size="3xl" weight="bold">
              {item.cost}
            </Text>
            <View className="gap-3">
              <View className="border-border border-t" />
              <Text size="sm" muted>
                {item.use}
              </Text>
            </View>
          </StackCard.Card>
        ))}

        <StackCard.Empty>
          <Text size="lg" weight="semibold">
            {cancelled.length} cancelled
          </Text>
          <Text size="sm" muted className="text-center">
            {cancelled.length > 0
              ? cancelled.join(", ")
              : "You kept all of them."}
          </Text>
        </StackCard.Empty>

        <StackCard.Actions>
          <StackCard.Action
            action="left"
            color="destructive"
            icon={<TrashIcon />}
            label="Cancel it"
          />
          <StackCard.Action
            action="right"
            color="success"
            icon={<CheckIcon />}
            label="Keep it"
          />
        </StackCard.Actions>
      </StackCard>

      <Dialog
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
      >
        <Dialog.Content>
          <Dialog.Title>
            Cancel{" "}
            {pending === null ? "" : (SUBSCRIPTIONS[pending]?.name ?? "")}?
          </Dialog.Title>
          <Dialog.Description>
            It stays active until the end of the current period, and the card is
            charged nothing after that.
          </Dialog.Description>
          <Dialog.Footer>
            <Button variant="outline" onPress={() => setPending(null)}>
              Keep it
            </Button>
            <Button
              variant="destructive"
              onPress={() => {
                const name =
                  pending === null ? null : SUBSCRIPTIONS[pending]?.name;
                if (name) setCancelled((current) => [...current, name]);
                setPending(null);
                confirmed.current = true;
                deck.current?.swipe("left");
              }}
            >
              Cancel it
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </View>
  );
}
function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("");
}
const ARRANGEMENTS = [
  { layout: "stack", note: "Each card behind sits lower and smaller" },
  { layout: "fan", note: "Each card behind turns out to one side" },
  { layout: "flat", note: "Nothing behind until the top card goes" },
] as const;
function DealAgain() {
  const { reset } = useStackCard();
  return (
    <Button variant="outline" size="sm" onPress={reset}>
      Deal again
    </Button>
  );
}
function StackCardArrangementVersion() {
  return (
    <View className="flex-1 gap-4 px-6 pt-2 pb-10">
      {ARRANGEMENTS.map(({ layout, note }) => (
        <View key={layout} className="flex-1 gap-4 pb-6">
          <View className="flex-row items-baseline justify-between gap-3">
            <Text weight="semibold" className="capitalize">
              {layout}
            </Text>
            <Text size="xs" muted>
              {note}
            </Text>
          </View>
          <StackCard className="mx-3 flex-1" layout={layout}>
            {PLACES.map((place) => (
              <StackCard.Card
                key={place.name}
                className="justify-center gap-1 px-5"
              >
                <Text size="xs" muted className="tracking-wider uppercase">
                  {place.kind}
                </Text>
                <Text size="lg" weight="semibold">
                  {place.name}
                </Text>
                <Text size="sm" muted numberOfLines={1}>
                  {place.detail}
                </Text>
              </StackCard.Card>
            ))}
            <StackCard.Empty>
              <DealAgain />
            </StackCard.Empty>
          </StackCard>
        </View>
      ))}
    </View>
  );
}
function StackCardHandleDemo() {
  const deck = useRef<StackCardHandle>(null);
  return (
    <View className="w-full gap-3">
      <StackCard
        ref={deck}
        className="mb-7"
        style={{ height: "280rpx" }}
        disabled
      >
        {PLACES.map((place) => (
          <StackCard.Card key={place.name} className="justify-center gap-1 p-4">
            <Text weight="semibold">{place.name}</Text>
            <Text size="sm" muted>
              {place.kind}
            </Text>
          </StackCard.Card>
        ))}
        <StackCard.Empty>
          <Text size="sm" muted>
            Nothing left — put them back.
          </Text>
        </StackCard.Empty>
      </StackCard>
      <View className="flex-row gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onPress={() => deck.current?.swipe("left")}
        >
          Send left
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onPress={() => deck.current?.undo()}
        >
          Undo
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onPress={() => deck.current?.reset()}
        >
          Reset
        </Button>
      </View>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "stack-card",
  name: "StackCard",
  summary: "A pile of cards, taken one at a time by throwing the top one off",
  demos: [
    {
      label: "A hiring queue",
      id: "hiring",
      fullPage: true,
      description:
        "The case the component exists for: one decision per card, and the card is gone once it is made. Stamps name the two answers, the buttons make them reachable without a gesture, and undo takes the last one back.",
      render: () => <StackCardHiringVersion />,
    },
    {
      label: "Flashcards",
      id: "flashcards",
      fullPage: true,
      description:
        'Up and down instead of left and right, and `layout="flat"` so there is no pile behind the card — a term on its own, with nothing peeking out from under it.',
      render: () => <StackCardFlashcardsVersion />,
    },
    {
      label: "A hand of cards",
      id: "fan",
      fullPage: true,
      description:
        '`layout="fan"` turns each card behind the top one alternately, three deep. For a set worth showing off rather than a queue worth clearing.',
      render: () => <StackCardFanVersion />,
    },
    {
      label: "Four ways out",
      id: "triage",
      fullPage: true,
      description:
        "An inbox where a card can go four ways, each with its own stamp. A diagonal throw goes where it was thrown hardest rather than to whichever direction is checked first.",
      render: () => <StackCardTriageVersion />,
    },
    {
      label: "Asking before it goes",
      id: "confirm",
      fullPage: true,
      description:
        "A controlled deck. Cancelling a subscription opens a dialog and the deck waits: the card comes back until the dialog confirms it, and then it goes.",
      render: () => <StackCardConfirmVersion />,
    },
    {
      label: "How the pile is arranged",
      id: "arranged",
      fullPage: true,
      description:
        "The three `layout` values on decks of the same five cards, so the cards behind the top one are the only difference. Throw a card on each to see how the pile follows it.",
      render: () => <StackCardArrangementVersion />,
    },
    { label: "Driven from outside", render: () => <StackCardHandleDemo /> },
  ],
};
