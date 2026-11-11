import { BottomSheet } from "panelui-taro/bottom-sheet";
import { Button } from "panelui-taro/button";
import { Card } from "panelui-taro/card";
import { Frame } from "panelui-taro/frame";
import { Input } from "panelui-taro/input";
import { Item } from "panelui-taro/item";
import { Text } from "panelui-taro/primitives/text";
import { Progress } from "panelui-taro/progress";
import {
  Questionnaire,
  type QuestionnaireAnswers,
} from "panelui-taro/questionnaire";
import { useState } from "react";

import { ScrollView, View } from "../runtime/native";
import { ComponentEntry } from "../types";
const PROTOTYPE_QUESTIONS = [
  { name: "direction", required: true },
  { name: "detail" },
] as const;
function QuestionnaireDemo() {
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({});
  return (
    <View className="w-full gap-4">
      <Questionnaire
        items={PROTOTYPE_QUESTIONS}
        onAnswersChange={setAnswers}
        onSubmit={(final) => setAnswers(final)}
      >
        <Questionnaire.Title>Prototype</Questionnaire.Title>
        <Questionnaire.Progress />
        <Questionnaire.Item name="direction" required>
          <Questionnaire.Question>
            What should we build next?
          </Questionnaire.Question>
          <Questionnaire.Description>
            Choose the direction you want to see first.
          </Questionnaire.Description>
          <Questionnaire.Choices>
            <Questionnaire.Choice
              value="delegation"
              label="Delegation"
              description="Show how work moves to a specialist."
            />
            <Questionnaire.Choice
              value="prompts"
              label="Question prompts"
              description="Show choices while the interface waits."
            />
            <Questionnaire.Choice value="both" label="Both together" />
          </Questionnaire.Choices>
          <Questionnaire.Error />
        </Questionnaire.Item>
        <Questionnaire.Item name="detail">
          <Questionnaire.Question>How much detail?</Questionnaire.Question>
          <Questionnaire.Description>
            Leave it if you have not decided.
          </Questionnaire.Description>
          <Questionnaire.Choices>
            <Questionnaire.Choice value="focused" label="Focused" />
            <Questionnaire.Choice value="complete" label="The complete flow" />
          </Questionnaire.Choices>
        </Questionnaire.Item>
        <Questionnaire.Footer>
          <Questionnaire.Back />
          <Questionnaire.Spacer />
          <Questionnaire.Next />
          <Questionnaire.Submit />
        </Questionnaire.Footer>
      </Questionnaire>
      <Text size="sm" muted>
        {Object.keys(answers).length > 0
          ? JSON.stringify(answers)
          : "Every answer arrives under the question’s own name."}
      </Text>
    </View>
  );
}
function QuestionnaireMultipleDemo() {
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({});
  return (
    <View className="w-full gap-4">
      <Questionnaire onAnswersChange={setAnswers}>
        <Questionnaire.Progress />
        <Questionnaire.Item name="signals" required multiple>
          <Questionnaire.Question>
            What should every update include?
          </Questionnaire.Question>
          <Questionnaire.Description>
            Select all that apply.
          </Questionnaire.Description>
          <Questionnaire.Choices>
            <Questionnaire.Choice value="progress" label="Progress" />
            <Questionnaire.Choice value="decisions" label="Decisions" />
            <Questionnaire.Choice value="risks" label="Risks" />
          </Questionnaire.Choices>
          <Questionnaire.Error />
        </Questionnaire.Item>
        <Questionnaire.Footer>
          <Questionnaire.Spacer />
          <Questionnaire.Submit />
        </Questionnaire.Footer>
      </Questionnaire>
      <Text size="sm" muted>
        {Array.isArray(answers.signals) && answers.signals.length > 0
          ? answers.signals.join(", ")
          : "A question that takes several answers stores them as a list."}
      </Text>
    </View>
  );
}
function QuestionnaireFreeformDemo() {
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({});
  return (
    <View className="w-full gap-4">
      <Questionnaire onAnswersChange={setAnswers}>
        <Questionnaire.Progress />
        <Questionnaire.Item name="tool" required>
          <Questionnaire.Question>
            Where do you keep your notes?
          </Questionnaire.Question>
          <Questionnaire.Choices>
            <Questionnaire.Choice value="files" label="Plain files" />
            <Questionnaire.Choice value="issues" label="Issue tracker" />
            <Questionnaire.Input placeholder="Somewhere else…" />
          </Questionnaire.Choices>
          <Questionnaire.Error />
        </Questionnaire.Item>
        <Questionnaire.Footer>
          <Questionnaire.Spacer />
          <Questionnaire.Submit />
        </Questionnaire.Footer>
      </Questionnaire>
      <Text size="sm" muted>
        Picking a choice empties the field, and typing clears the choice — one
        answer to one question either way.
      </Text>
    </View>
  );
}
function QuestionnaireShortcutsDemo() {
  return (
    <View className="w-full gap-4">
      <Questionnaire shortcuts="letters">
        <Questionnaire.Progress />
        <Questionnaire.Item name="review" required>
          <Questionnaire.Question>
            What should be reviewed first?
          </Questionnaire.Question>
          <Questionnaire.Choices>
            <Questionnaire.Choice value="api" label="The public API" />
            <Questionnaire.Choice value="tests" label="Test coverage" />
            <Questionnaire.Choice value="perf" label="Performance" disabled />
            <Questionnaire.Choice value="docs" label="The documentation" />
          </Questionnaire.Choices>
        </Questionnaire.Item>
        <Questionnaire.Footer>
          <Questionnaire.Spacer />
          <Questionnaire.Submit />
        </Questionnaire.Footer>
      </Questionnaire>
      <Text size="sm" muted>
        Performance is disabled, so it takes no letter with it and the
        documentation is C.
      </Text>
    </View>
  );
}
function QuestionnaireNumbersDemo() {
  return (
    <View className="w-full gap-4">
      <Questionnaire items={PROTOTYPE_QUESTIONS}>
        <Questionnaire.Title>Prototype</Questionnaire.Title>
        <Questionnaire.Progress variant="numbers" />
        <Questionnaire.Item name="direction" required>
          <Questionnaire.Question>
            What should we build next?
          </Questionnaire.Question>
          <Questionnaire.Choices>
            <Questionnaire.Choice value="delegation" label="Delegation" />
            <Questionnaire.Choice value="prompts" label="Question prompts" />
          </Questionnaire.Choices>
          <Questionnaire.Error />
        </Questionnaire.Item>
        <Questionnaire.Item name="detail">
          <Questionnaire.Question>How much detail?</Questionnaire.Question>
          <Questionnaire.Choices>
            <Questionnaire.Choice value="focused" label="Focused" />
            <Questionnaire.Choice value="complete" label="The complete flow" />
          </Questionnaire.Choices>
        </Questionnaire.Item>
        <Questionnaire.Footer>
          <Questionnaire.Back />
          <Questionnaire.Spacer />
          <Questionnaire.Next />
          <Questionnaire.Submit />
        </Questionnaire.Footer>
      </Questionnaire>
      <Text size="sm" muted>
        A number says which question this is, which an arc cannot — worth it
        where somebody is going to be sent back to one of them.
      </Text>
    </View>
  );
}
function QuestionnaireBareDemo() {
  return (
    <View className="w-full">
      <Card>
        <Card.Content className="pt-6">
          <Questionnaire frame={false}>
            <Questionnaire.Title>Timing</Questionnaire.Title>
            <Questionnaire.Progress />
            <Questionnaire.Item name="timing" required>
              <Questionnaire.Question>
                When should this ship?
              </Questionnaire.Question>
              <Questionnaire.Choices>
                <Questionnaire.Choice value="week" label="This week" />
                <Questionnaire.Choice value="cycle" label="Next cycle" />
              </Questionnaire.Choices>
            </Questionnaire.Item>
            <Questionnaire.Footer>
              <Questionnaire.Spacer />
              <Questionnaire.Submit />
            </Questionnaire.Footer>
          </Questionnaire>
        </Card.Content>
      </Card>
    </View>
  );
}
const ONBOARDING_QUESTIONS = [
  { name: "role", required: true },
  { name: "size", required: true },
  { name: "stack", multiple: true },
  { name: "timeline" },
  { name: "contact", required: true },
] as const;
const ONBOARDING_LABELS: Record<string, string> = {
  role: "Role",
  size: "Team size",
  stack: "Stack",
  timeline: "Timeline",
  contact: "Best way to reach you",
};
function QuestionnaireOnboardingVersion() {
  const [done, setDone] = useState<QuestionnaireAnswers | null>(null);
  if (done) {
    return (
      <ScrollView contentContainerClassName="gap-4 p-4">
        <Text size="xl" weight="semibold">
          That is everything
        </Text>
        <Frame>
          <Frame.Header>
            <Frame.Title>Your answers</Frame.Title>
          </Frame.Header>
          <Frame.Panel>
            {Object.entries(done).map(([name, value]) => (
              <Frame.Row key={name}>
                <Frame.Content>
                  <Frame.Title>{ONBOARDING_LABELS[name] ?? name}</Frame.Title>
                  <Frame.Description>
                    {Array.isArray(value) ? value.join(", ") : value}
                  </Frame.Description>
                </Frame.Content>
              </Frame.Row>
            ))}
          </Frame.Panel>
        </Frame>
        <Button variant="outline" onPress={() => setDone(null)}>
          Start over
        </Button>
      </ScrollView>
    );
  }
  return (
    <ScrollView contentContainerClassName="gap-4 p-4">
      <Questionnaire items={ONBOARDING_QUESTIONS} onSubmit={setDone}>
        <Questionnaire.Title>Getting set up</Questionnaire.Title>
        <Questionnaire.Progress />

        <Questionnaire.Item name="role" required>
          <Questionnaire.Question>What do you do?</Questionnaire.Question>
          <Questionnaire.Choices>
            <Questionnaire.Choice value="engineer" label="Engineering" />
            <Questionnaire.Choice value="design" label="Design" />
            <Questionnaire.Choice value="product" label="Product" />
            <Questionnaire.Input placeholder="Something else…" />
          </Questionnaire.Choices>
          <Questionnaire.Error />
        </Questionnaire.Item>

        <Questionnaire.Item name="size" required>
          <Questionnaire.Question>How big is the team?</Questionnaire.Question>
          <Questionnaire.Choices>
            <Questionnaire.Choice value="solo" label="Just me" />
            <Questionnaire.Choice value="small" label="Two to ten" />
            <Questionnaire.Choice value="large" label="More than ten" />
          </Questionnaire.Choices>
          <Questionnaire.Error />
        </Questionnaire.Item>

        <Questionnaire.Item name="stack" multiple>
          <Questionnaire.Question>
            What are you building with?
          </Questionnaire.Question>
          <Questionnaire.Description>
            Select all that apply.
          </Questionnaire.Description>
          <Questionnaire.Choices>
            <Questionnaire.Choice value="expo" label="Expo" />
            <Questionnaire.Choice value="next" label="Next.js" />
            <Questionnaire.Choice value="native" label="Bare React Native" />
          </Questionnaire.Choices>
        </Questionnaire.Item>

        <Questionnaire.Item name="timeline">
          <Questionnaire.Question>
            When are you shipping?
          </Questionnaire.Question>
          <Questionnaire.Description>
            Leave it if it is not decided.
          </Questionnaire.Description>
          <Questionnaire.Choices>
            <Questionnaire.Choice value="month" label="Within a month" />
            <Questionnaire.Choice value="quarter" label="This quarter" />
          </Questionnaire.Choices>
        </Questionnaire.Item>

        <Questionnaire.Item name="contact" required>
          <Questionnaire.Question>
            Best way to reach you?
          </Questionnaire.Question>
          <Questionnaire.Choices>
            <Questionnaire.Choice value="email" label="Email" />
            <Questionnaire.Choice value="none" label="Do not contact me" />
          </Questionnaire.Choices>
          <Questionnaire.Error />
        </Questionnaire.Item>

        <Questionnaire.Footer>
          <Questionnaire.Back />
          <Questionnaire.Spacer />
          <Questionnaire.Next />
          <Questionnaire.Submit>Finish</Questionnaire.Submit>
        </Questionnaire.Footer>
      </Questionnaire>

      <Text size="sm" muted>
        Swipe across the questions, or use the buttons. The first, second and
        last are required; the stack takes several answers and the timeline is
        optional.
      </Text>
    </ScrollView>
  );
}
function QuestionnaireSheetVersion() {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<QuestionnaireAnswers | null>(null);
  return (
    <View className="flex-1 justify-center gap-4 p-4">
      <Button onPress={() => setOpen(true)}>Ask me two questions</Button>
      {answers ? (
        <Text size="sm" muted className="text-center">
          {JSON.stringify(answers)}
        </Text>
      ) : (
        <Text size="sm" muted className="text-center">
          The sheet owns being dismissed; the questionnaire owns the questions.
        </Text>
      )}

      <BottomSheet open={open} onOpenChange={setOpen}>
        <BottomSheet.Content showClose={false}>
          <Questionnaire
            frame={false}
            onSubmit={(final) => {
              setAnswers(final);
              setOpen(false);
            }}
          >
            <Questionnaire.Title>Feedback</Questionnaire.Title>
            <Questionnaire.Progress variant="pips" />
            <Questionnaire.Item name="mood" required>
              <Questionnaire.Question>How did that go?</Questionnaire.Question>
              <Questionnaire.Choices>
                <Questionnaire.Choice
                  value="good"
                  label="Better than expected"
                />
                <Questionnaire.Choice value="fine" label="About right" />
                <Questionnaire.Choice value="bad" label="Not well" />
              </Questionnaire.Choices>
              <Questionnaire.Error />
            </Questionnaire.Item>
            <Questionnaire.Item name="why">
              <Questionnaire.Question>Anything to add?</Questionnaire.Question>
              <Questionnaire.Choices>
                <Questionnaire.Input placeholder="In your own words…" />
              </Questionnaire.Choices>
            </Questionnaire.Item>
            <Questionnaire.Footer>
              <Questionnaire.Back />
              <Questionnaire.Spacer />
              <Questionnaire.Next />
              <Questionnaire.Submit>Send</Questionnaire.Submit>
            </Questionnaire.Footer>
          </Questionnaire>
        </BottomSheet.Content>
      </BottomSheet>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "questionnaire",
  name: "Questionnaire",
  summary: "One question at a time, with progress and a way back",
  demos: [
    { label: "One answer at a time", render: () => <QuestionnaireDemo /> },
    {
      label: "Selecting more than one",
      render: () => <QuestionnaireMultipleDemo />,
    },
    {
      label: "An answer that is not listed",
      render: () => <QuestionnaireFreeformDemo />,
    },
    {
      label: "A letter beside every answer",
      render: () => <QuestionnaireShortcutsDemo />,
    },
    {
      label: "Numbers instead of the ring",
      render: () => <QuestionnaireNumbersDemo />,
    },
    { label: "Without the frame", render: () => <QuestionnaireBareDemo /> },
    {
      label: "Getting set up",
      id: "onboarding",
      fullPage: true,
      description:
        "Five questions and the summary they add up to — required, optional, multi-answer and freeform in one flow.",
      render: () => <QuestionnaireOnboardingVersion />,
    },
    {
      label: "In a sheet",
      id: "sheet",
      fullPage: true,
      description:
        "Two questions in a bottom sheet, where the sheet owns dismissal and the questionnaire owns the questions.",
      render: () => <QuestionnaireSheetVersion />,
    },
  ],
};
