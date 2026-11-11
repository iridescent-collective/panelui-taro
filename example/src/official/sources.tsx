import { Message } from "panelui-taro/message";
import { Sources } from "panelui-taro/sources";

import { ComponentEntry } from "../types";
const AI_SOURCES = [
  { url: "https://expo.dev/changelog/sdk-57", title: "Expo SDK 57" },
  {
    url: "https://reactnative.dev/blog/new-architecture",
    title: "The New Architecture",
  },
  {
    url: "https://docs.swmansion.com/react-native-reanimated/",
    title: undefined,
  },
];
function SourcesInTurnDemo() {
  return (
    <Message align="start">
      <Message.Content>
        <Message.Bubble>
          <Message.BubbleContent>
            SDK 57 ships the New Architecture by default, and Reanimated 4
            requires it.
          </Message.BubbleContent>
        </Message.Bubble>
        <Sources>
          <Sources.Trigger count={AI_SOURCES.length} />
          <Sources.Content>
            {AI_SOURCES.map((source) => (
              <Sources.Source
                key={source.url}
                href={source.url}
                title={source.title}
              />
            ))}
          </Sources.Content>
        </Sources>
      </Message.Content>
    </Message>
  );
}
export const entry: ComponentEntry = {
  slug: "sources",
  name: "Sources",
  summary: "Where an answer came from, folded under a count",
  demos: [
    { label: "Under a turn", render: () => <SourcesInTurnDemo /> },
    {
      label: "On its own",
      render: () => (
        <Sources defaultOpen>
          <Sources.Trigger count={AI_SOURCES.length} />
          <Sources.Content>
            {AI_SOURCES.map((source) => (
              <Sources.Source
                key={source.url}
                href={source.url}
                title={source.title}
              />
            ))}
          </Sources.Content>
        </Sources>
      ),
    },
  ],
};
