import { Typography } from "panelui-taro/typography";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";

export const entry: ComponentEntry = {
  slug: "typography",
  name: "Typography",
  summary: "Semantic text presets",
  demos: [
    {
      label: "Types",
      render: () => (
        <View className="w-full gap-3">
          <Typography type="h1">Heading 1</Typography>
          <Typography type="h2">Heading 2</Typography>
          <Typography type="h3">Heading 3</Typography>
          <Typography type="h4">Heading 4</Typography>
          <Typography type="body">Body text</Typography>
          <Typography type="body-sm" muted>
            Small body text
          </Typography>
          <Typography.Code>npm i panelui-native</Typography.Code>
        </View>
      ),
    },
    {
      label: "Paragraphs",
      render: () => (
        <View className="w-full gap-3">
          <Typography.Paragraph type="lead">
            A lead paragraph: the sentence under a heading, set larger and
            quieter than the body it introduces.
          </Typography.Paragraph>
          <Typography.Paragraph>
            This is a default body paragraph. It uses the base font size and
            normal weight for comfortable reading.
          </Typography.Paragraph>
          <Typography.Paragraph type="body-sm" muted>
            A smaller paragraph, useful for captions, footnotes, or secondary
            descriptions.
          </Typography.Paragraph>
          <Typography.Paragraph type="small">
            Small: tight, medium weight, for meta lines.
          </Typography.Paragraph>
        </View>
      ),
    },
    {
      label: "Marks",
      render: () => (
        <View className="w-full gap-3">
          <Typography underline>Terms of service</Typography>
          <Typography italic>An aside, in passing.</Typography>
          <Typography strike muted>
            £24.00
          </Typography>
          <Typography weight="bold">Bolded body, without a heading.</Typography>

          <Typography italic strike muted>
            Withdrawn
          </Typography>
        </View>
      ),
    },
    {
      label: "Alignment and case",
      render: () => (
        <View className="w-full gap-3">
          <Typography align="left">Left</Typography>
          <Typography align="center">Centre</Typography>
          <Typography align="right">Right</Typography>
          <Typography type="body-xs" transform="uppercase" muted>
            Section label
          </Typography>
          <Typography transform="capitalize">a capitalised sentence</Typography>
        </View>
      ),
    },
    {
      label: "Quotes and lists",
      render: () => (
        <View className="w-full gap-5">
          <Typography.Blockquote>
            A component library is a set of decisions you only have to make
            once.
          </Typography.Blockquote>

          <Typography.List>
            <Typography.ListItem>Runs in Expo Go</Typography.ListItem>
            <Typography.ListItem>Animates on the UI thread</Typography.ListItem>
            <Typography.ListItem>
              Wraps to as many lines as it needs, with the marker staying put
            </Typography.ListItem>
          </Typography.List>

          <Typography.List ordered>
            <Typography.ListItem>Install the package</Typography.ListItem>
            <Typography.ListItem>Import the stylesheet</Typography.ListItem>
            <Typography.ListItem>
              Wrap the app in the provider
            </Typography.ListItem>
          </Typography.List>
        </View>
      ),
    },
  ],
};
