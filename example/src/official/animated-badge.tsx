import { AnimatedBadge } from "panelui-taro/animated-badge";
import { Avatar } from "panelui-taro/avatar";
import { Button } from "panelui-taro/button";
import { Card } from "panelui-taro/card";
import {
  SparklesIcon,
  ClockIcon,
  ListChecksIcon,
  PackageIcon,
  PencilIcon,
} from "panelui-taro/icons";
import { Text } from "panelui-taro/primitives/text";
import { useEffect, useState, type ReactNode } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
const DEPLOY_STEPS = [
  { status: "neutral", label: "Queued" },
  { status: "loading", label: "Building" },
  { status: "loading", label: "Deploying" },
  { status: "success", label: "Live" },
] as const;
function AnimatedBadgeRunDemo() {
  const [step, setStep] = useState(0);
  const current = DEPLOY_STEPS[step]!;
  return (
    <View className="w-full items-center gap-4">
      <View className="w-full flex-row justify-center">
        <AnimatedBadge status={current.status}>{current.label}</AnimatedBadge>
      </View>
      <View className="flex-row gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={step === 0}
          onPress={() => setStep((current) => Math.max(0, current - 1))}
        >
          Back
        </Button>
        <Button
          size="sm"
          onPress={() =>
            setStep((current) => (current + 1) % DEPLOY_STEPS.length)
          }
        >
          {step === DEPLOY_STEPS.length - 1 ? "Start again" : "Next"}
        </Button>
      </View>
    </View>
  );
}
const STATUS_RUNS = [
  [
    { status: "neutral", label: "Idle" },
    { status: "loading", label: "Queued" },
    { status: "success", label: "Done" },
  ],
  [
    { status: "info", label: "Reviewing" },
    { status: "success", label: "Approved" },
    { status: "neutral", label: "Merged" },
  ],
  [
    { status: "success", label: "Passed" },
    { status: "warning", label: "Flaky" },
    { status: "loading", label: "Rerunning" },
  ],
  [
    { status: "warning", label: "Slow" },
    { status: "danger", label: "Timed out" },
    { status: "success", label: "Recovered" },
  ],
  [
    { status: "danger", label: "Failed" },
    { status: "loading", label: "Retrying" },
    { status: "success", label: "Fixed" },
  ],
  [
    { status: "loading", label: "Running" },
    { status: "info", label: "Reporting" },
    { status: "neutral", label: "Archived" },
  ],
] as const;
const STATUS_HOLD = 900;
function AnimatedBadgeStatusesDemo() {
  const [steps, setSteps] = useState(() => STATUS_RUNS.map(() => 0));
  useEffect(() => {
    let cursor = 0;
    const id = setInterval(() => {
      setSteps((current) =>
        current.map((step, index) => (index === cursor ? step + 1 : step))
      );
      cursor = (cursor + 1) % STATUS_RUNS.length;
    }, STATUS_HOLD);
    return () => clearInterval(id);
  }, []);
  return (
    <View className="flex-row flex-wrap items-center justify-center gap-2">
      {STATUS_RUNS.map((run, index) => {
        const step = run[steps[index]! % run.length]!;
        return (
          <AnimatedBadge key={index} status={step.status}>
            {step.label}
          </AnimatedBadge>
        );
      })}
    </View>
  );
}
function Sentence({ children }: { children: ReactNode }) {
  return (
    <View className="flex-row flex-wrap items-center gap-x-1.5 gap-y-2">
      {children}
    </View>
  );
}
function BadgeThen({
  mark,
  size = "xl",
  children,
}: {
  mark: string;
  size?: "base" | "lg" | "xl" | "2xl";
  children: ReactNode;
}) {
  return (
    <View className="flex-row items-center">
      {children}
      <Text size={size} muted>
        {mark}
      </Text>
    </View>
  );
}
function Words({
  children,
  size = "xl",
  muted = false,
  weight,
}: {
  children: string;
  size?: "base" | "lg" | "xl" | "2xl";
  muted?: boolean;
  weight?: "normal" | "medium" | "semibold";
}) {
  return (
    <>
      {children.split(" ").map((word, index) => (
        <Text key={index} size={size} muted={muted} weight={weight}>
          {word}
        </Text>
      ))}
    </>
  );
}
const GITHUB_AVATAR = "https://github.com/Khalidabdi1.png?size=200";
const DAYS = [
  { reviews: 3, issues: 2, releases: 1, due: "before Thursday" },
  { reviews: 5, issues: 7, releases: 2, due: "before Monday" },
  { reviews: 1, issues: 4, releases: 3, due: "until the next sprint" },
] as const;
const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`;
function AnimatedBadgeSentenceVersion() {
  const [index, setIndex] = useState(0);
  const day = DAYS[index]!;
  return (
    <View className="flex-1 justify-center gap-8 px-6">
      <Sentence>
        <Words muted>Morning,</Words>
        <Avatar
          size="sm"
          className="h-6 w-6"
          source={{ uri: GITHUB_AVATAR }}
          fallback="KA"
        />
        <Words weight="semibold">Khalid.</Words>
        <Words muted>Waiting on you:</Words>
        <BadgeThen mark=",">
          <AnimatedBadge
            size="sm"
            status="info"
            animateLayout={false}
            icon={<PencilIcon size={12} />}
          >
            {plural(day.reviews, "review")}
          </AnimatedBadge>
        </BadgeThen>
        <AnimatedBadge
          size="sm"
          status="warning"
          animateLayout={false}
          icon={<ListChecksIcon size={12} />}
        >
          {plural(day.issues, "issue")}
        </AnimatedBadge>
        <Words muted>and</Words>
        <BadgeThen mark=".">
          <AnimatedBadge
            size="sm"
            status="success"
            animateLayout={false}
            icon={<PackageIcon size={12} />}
          >
            {plural(day.releases, "release")}
          </AnimatedBadge>
        </BadgeThen>
        <Words muted>Nothing else is due</Words>
        <Words weight="semibold">{`${day.due}.`}</Words>
      </Sentence>

      <Button
        variant="outline"
        size="sm"
        className="self-start"
        onPress={() => setIndex((current) => (current + 1) % DAYS.length)}
      >
        Another day
      </Button>
    </View>
  );
}
const BUILD_WEEKS = [
  {
    average: "4m 12s",
    passed: "27 passed",
    flaky: "2 flaky",
    failed: "1 failed",
    slowest: "1m 48s",
  },
  {
    average: "3m 05s",
    passed: "29 passed",
    flaky: "1 flaky",
    failed: "0 failed",
    slowest: "1m 12s",
  },
] as const;
function AnimatedBadgeSummaryVersion() {
  const [index, setIndex] = useState(0);
  const week = BUILD_WEEKS[index]!;
  return (
    <View className="flex-1 justify-center gap-6 px-6">
      <Card>
        <Card.Content className="gap-5 p-5">
          <AnimatedBadge
            size="sm"
            status="neutral"
            animateLayout={false}
            icon={<SparklesIcon size={12} />}
          >
            Summary
          </AnimatedBadge>

          <Sentence>
            <Words size="lg" muted>
              The last thirty builds averaged
            </Words>
            <BadgeThen mark="." size="lg">
              <AnimatedBadge
                size="sm"
                status="info"
                animateLayout={false}
                icon={<ClockIcon size={12} />}
              >
                {week.average}
              </AnimatedBadge>
            </BadgeThen>
            <BadgeThen mark="," size="lg">
              <AnimatedBadge size="sm" status="success" animateLayout={false}>
                {week.passed}
              </AnimatedBadge>
            </BadgeThen>
            <AnimatedBadge size="sm" status="warning" animateLayout={false}>
              {week.flaky}
            </AnimatedBadge>
            <Words size="lg" muted>
              and
            </Words>
            <BadgeThen mark="." size="lg">
              <AnimatedBadge size="sm" status="danger" animateLayout={false}>
                {week.failed}
              </AnimatedBadge>
            </BadgeThen>
            <Words size="lg" muted>
              Bundling is still the slowest step, at
            </Words>
            <BadgeThen mark="." size="lg">
              <AnimatedBadge
                size="sm"
                status="neutral"
                animateLayout={false}
                icon={<PackageIcon size={12} />}
              >
                {week.slowest}
              </AnimatedBadge>
            </BadgeThen>
          </Sentence>
        </Card.Content>
      </Card>

      <Button
        variant="outline"
        size="sm"
        className="self-start"
        onPress={() =>
          setIndex((current) => (current + 1) % BUILD_WEEKS.length)
        }
      >
        Last week
      </Button>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "animated-badge",
  name: "AnimatedBadge",
  summary: "Status pill whose icon and label roll over when the status changes",
  demos: [
    {
      label: "A sentence with badges in it",
      id: "in-a-sentence",
      fullPage: true,
      description:
        "Badges set in a line of prose, carrying the figures the sentence is about.",
      render: () => <AnimatedBadgeSentenceVersion />,
    },
    {
      label: "A summary that rewrites itself",
      id: "in-a-summary",
      fullPage: true,
      description:
        "Every number in the paragraph is a badge, so a new report turns each one over where it stands.",
      render: () => <AnimatedBadgeSummaryVersion />,
    },
    { label: "A run of statuses", render: () => <AnimatedBadgeRunDemo /> },
    { label: "Every status", render: () => <AnimatedBadgeStatusesDemo /> },
    {
      label: "Sizes",
      render: () => (
        <View className="items-center gap-3">
          <AnimatedBadge size="sm" status="success">
            Passed
          </AnimatedBadge>
          <AnimatedBadge size="md" status="success">
            Passed
          </AnimatedBadge>
        </View>
      ),
    },
    {
      label: "Your own glyph",
      render: () => (
        <View className="items-center gap-3">
          <AnimatedBadge status="info" icon={<SparklesIcon size={14} />}>
            Suggested
          </AnimatedBadge>
          <AnimatedBadge status="warning" showIcon={false}>
            Draft
          </AnimatedBadge>
        </View>
      ),
    },
  ],
};
