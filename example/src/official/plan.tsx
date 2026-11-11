import { Badge } from "panelui-taro/badge";
import { Button } from "panelui-taro/button";
import { ListChecksIcon } from "panelui-taro/icons";
import { Item } from "panelui-taro/item";
import { Plan } from "panelui-taro/plan";
import { Progress } from "panelui-taro/progress";
import { Steps } from "panelui-taro/steps";
import { Task } from "panelui-taro/task";
import { useEffect, useState } from "react";

import { demoAction } from "../runtime/demo-action";
import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
const PLAN_STEPS = [
  { title: "Make the in-range test inclusive", meta: "utils/date.ts" },
  { title: "Round the band only where it stops", meta: "calendar/index.tsx" },
  { title: "Square the discs against the band", meta: undefined },
  { title: "Regenerate the docs page", meta: "scripts/gen.mjs" },
];
function PlanRailDemo() {
  return (
    <Plan>
      <Plan.Header>
        <Plan.Icon>
          <ListChecksIcon size={16} />
        </Plan.Icon>
        <Plan.Title>Fix the calendar range</Plan.Title>
        <Plan.Description>Four files, and no API change.</Plan.Description>
        <Plan.Action>
          <Plan.Progress />
          <Plan.Trigger />
        </Plan.Action>
      </Plan.Header>
      <Plan.Content>
        <Plan.Steps>
          {PLAN_STEPS.map((step, index) => (
            <Plan.Step
              key={step.title}
              status={index < 2 ? "done" : index === 2 ? "active" : "pending"}
              meta={step.meta}
            >
              {step.title}
            </Plan.Step>
          ))}
        </Plan.Steps>
      </Plan.Content>
      <Plan.Footer>
        <Button variant="outline" onPress={demoAction("Revise")}>
          Revise
        </Button>
        <Button onPress={demoAction("Approve")}>Approve</Button>
      </Plan.Footer>
    </Plan>
  );
}
function PlanStreamDemo() {
  const [streaming, setStreaming] = useState(false);
  const [reached, setReached] = useState(PLAN_STEPS.length);
  useEffect(() => {
    if (!streaming) return;
    const timers = PLAN_STEPS.map((_unused, index) =>
      setTimeout(() => setReached(index), 400 + index * 550)
    );
    const done = setTimeout(
      () => {
        setReached(PLAN_STEPS.length);
        setStreaming(false);
      },
      400 + PLAN_STEPS.length * 550
    );
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [streaming]);
  const start = () => {
    setReached(-1);
    setStreaming(true);
  };
  return (
    <View className="w-full gap-4">
      <Plan isStreaming={streaming}>
        <Plan.Header>
          <Plan.Icon>
            <ListChecksIcon size={16} />
          </Plan.Icon>
          <Plan.Title>Fix the calendar range</Plan.Title>
          <Plan.Description>Four files, and no API change.</Plan.Description>
          <Plan.Action>
            <Plan.Progress />
            <Plan.Trigger />
          </Plan.Action>
        </Plan.Header>
        <Plan.Content>
          <Plan.Steps>
            {PLAN_STEPS.map((step, index) => (
              <Plan.Step
                key={step.title}
                status={
                  index < reached
                    ? "done"
                    : index === reached
                      ? "active"
                      : "pending"
                }
                meta={step.meta}
              >
                {step.title}
              </Plan.Step>
            ))}
          </Plan.Steps>
        </Plan.Content>
        <Plan.Footer>
          <Button variant="outline" onPress={demoAction("Revise")}>
            Revise
          </Button>
          <Button onPress={demoAction("Approve")}>Approve</Button>
        </Plan.Footer>
      </Plan>
      <Button variant="outline" onPress={start} disabled={streaming}>
        {streaming ? "Writing…" : "Stream it in"}
      </Button>
    </View>
  );
}
function PlanWithTasksDemo() {
  return (
    <Plan>
      <Plan.Header>
        <Plan.Title>Fix the calendar range</Plan.Title>
        <Plan.Action>
          <Badge variant="secondary">2 of 3</Badge>
          <Plan.Trigger />
        </Plan.Action>
      </Plan.Header>
      <Plan.Content>
        <Task status="complete">
          <Task.Trigger title="Make the test inclusive" />
          <Task.Content>
            <Task.Item>
              Edited <Task.File>calendar/index.tsx</Task.File>
            </Task.Item>
          </Task.Content>
        </Task>
        <Task status="complete">
          <Task.Trigger title="Round only where it stops" />
          <Task.Content>
            <Task.Item>Four corners, from openStart and openEnd.</Task.Item>
          </Task.Content>
        </Task>
        <Task status="running">
          <Task.Trigger title="Regenerate the docs" />
          <Task.Content>
            <Task.Item>Running docs:generate…</Task.Item>
          </Task.Content>
        </Task>
      </Plan.Content>
    </Plan>
  );
}
export const entry: ComponentEntry = {
  slug: "plan",
  name: "Plan",
  summary: "What an agent intends to do, before it does it",
  demos: [
    { label: "A rail of steps", render: () => <PlanRailDemo /> },
    { label: "Streaming in", render: () => <PlanStreamDemo /> },
    { label: "Steps that are tasks", render: () => <PlanWithTasksDemo /> },
  ],
};
