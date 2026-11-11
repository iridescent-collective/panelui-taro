import { Accordion } from "panelui-taro/accordion";
import { Item } from "panelui-taro/item";
import { Text } from "panelui-taro/primitives/text";
import { Textarea } from "panelui-taro/textarea";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
const FAQ_DATA = [
  {
    value: "shipping",
    question: "How long does shipping take?",
    answer: "Standard delivery arrives in three to five working days.",
  },
  {
    value: "returns",
    question: "What is your returns policy?",
    answer: "Send anything back within 30 days for a full refund.",
  },
  {
    value: "support",
    question: "How do I contact support?",
    answer: "Reply to your order email and a person will answer.",
  },
];
function AccordionDemo({
  variant,
  selectionMode = "single",
}: {
  variant: "default" | "surface" | "separated" | "bordered" | "ghost";
  selectionMode?: "single" | "multiple";
}) {
  return (
    <Accordion
      variant={variant}
      selectionMode={selectionMode}
      defaultValue={
        selectionMode === "multiple" ? ["shipping", "returns"] : "shipping"
      }
      className="w-full"
    >
      {FAQ_DATA.map((entry) => (
        <Accordion.Item key={entry.value} value={entry.value}>
          <Accordion.Trigger>
            <Accordion.Title>{entry.question}</Accordion.Title>
            <Accordion.Indicator />
          </Accordion.Trigger>
          <Accordion.Content>{entry.answer}</Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
function AccordionKeepMountedDemo() {
  return (
    <View className="w-full gap-3">
      <Accordion
        variant="surface"
        keepMounted
        defaultValue="note"
        className="w-full"
      >
        <Accordion.Item value="note">
          <Accordion.Trigger>
            <Accordion.Title>Delivery note</Accordion.Title>
            <Accordion.Indicator />
          </Accordion.Trigger>
          <Accordion.Content>
            <Textarea placeholder="Leave it with a neighbour…" />
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item value="gift">
          <Accordion.Trigger>
            <Accordion.Title>Gift message</Accordion.Title>
            <Accordion.Indicator />
          </Accordion.Trigger>
          <Accordion.Content>
            <Textarea placeholder="Happy birthday…" />
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>

      <Text size="xs" muted>
        Type into a field, collapse the section, then open it again.
      </Text>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "accordion",
  name: "Accordion",
  summary: "Collapsible sections, single or multiple",
  demos: [
    { label: "Default", render: () => <AccordionDemo variant="default" /> },
    { label: "Surface", render: () => <AccordionDemo variant="surface" /> },
    { label: "Separated", render: () => <AccordionDemo variant="separated" /> },
    { label: "Bordered", render: () => <AccordionDemo variant="bordered" /> },
    { label: "Ghost", render: () => <AccordionDemo variant="ghost" /> },
    {
      label: "Multiple open",
      render: () => (
        <AccordionDemo variant="surface" selectionMode="multiple" />
      ),
    },
    { label: "Keeps its state", render: () => <AccordionKeepMountedDemo /> },
  ],
};
