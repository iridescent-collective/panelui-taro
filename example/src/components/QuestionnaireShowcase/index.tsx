import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Text } from "panelui-taro/primitives/text";
import { Questionnaire } from "panelui-taro/questionnaire";
import type {
  QuestionnaireAnswers,
  QuestionnaireProgressVariant,
} from "panelui-taro/questionnaire";
import { useState } from "react";

const VARIANTS: QuestionnaireProgressVariant[] = [
  "ring",
  "pips",
  "numbers",
  "count",
];
export const QuestionnaireShowcase = () => {
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({});
  const [submitted, setSubmitted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [epoch, setEpoch] = useState(0);
  return (
    <View className="flex flex-col gap-[24px]">
      <Questionnaire
        key={epoch}
        answers={answers}
        onAnswersChange={setAnswers}
        onSubmit={() => setSubmitted(true)}
        shortcuts="letters"
      >
        <Questionnaire.Title>Learning preferences</Questionnaire.Title>
        <Questionnaire.Progress variant={VARIANTS[progress]} />
        <Questionnaire.Item name="subject" required>
          <Questionnaire.Question>What should we learn?</Questionnaire.Question>
          <Questionnaire.Description>
            Choose an answer or type your own.
          </Questionnaire.Description>
          <Questionnaire.Choices>
            <Questionnaire.Choice
              value="reading"
              label="Reading"
              description="Stories and imagination"
            />
            <Questionnaire.Choice value="science" label="Science" />
            <Questionnaire.Input placeholder="Another subject" />
          </Questionnaire.Choices>
          <Questionnaire.Error />
        </Questionnaire.Item>
        <Questionnaire.Item name="activities" multiple>
          <Questionnaire.Question>Which activities?</Questionnaire.Question>
          <Questionnaire.Choices>
            <Questionnaire.Choice value="music" label="Music" />
            <Questionnaire.Choice value="drawing" label="Drawing" />
            <Questionnaire.Input placeholder="Another activity" />
          </Questionnaire.Choices>
          <Questionnaire.Error />
        </Questionnaire.Item>
        <Questionnaire.Item name="time">
          <Questionnaire.Question>When do you prefer?</Questionnaire.Question>
          <Questionnaire.Choice value="morning" label="Morning" />
          <Questionnaire.Choice value="evening" label="Evening" />
        </Questionnaire.Item>
        <Questionnaire.Footer>
          <Questionnaire.Back />
          <Questionnaire.Skip />
          <Questionnaire.Spacer />
          <Questionnaire.Next />
          <Questionnaire.Submit />
        </Questionnaire.Footer>
      </Questionnaire>
      <Text size="xs" className="break-all">
        {JSON.stringify({ answers, progress: VARIANTS[progress], submitted })}
      </Text>
      <Button onPress={() => setProgress((progress + 1) % VARIANTS.length)}>
        Next progress style
      </Button>
      <Button
        onPress={() => {
          setAnswers({});
          setSubmitted(false);
          setEpoch(epoch + 1);
        }}
      >
        Reset questionnaire
      </Button>
    </View>
  );
};
