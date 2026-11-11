import { View } from "@tarojs/components";
import { SearchBar } from "panelui-taro/search-bar";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

const CANDIDATES = [
  "Library",
  "Voice messages",
  "Location",
  "Schedule",
  "Notifications",
  "Devices",
  "Children",
  "Textbooks",
];
export const SearchBarShowcase = () => {
  const [query, setQuery] = useState("");
  const [settled, setSettled] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [tokens, setTokens] = useState<string[]>(["Library"]);
  const results = CANDIDATES.filter((value) =>
    value.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <View className="flex flex-col gap-[32px]">
      <Typography
        id="panel-search-result"
        className="block w-full max-w-full min-w-0 break-all whitespace-normal"
      >
        {JSON.stringify({ query, settled, submitted, tokens })}
      </Typography>
      <SearchBar
        id="panel-search-main"
        value={query}
        onChangeText={setQuery}
        onDebouncedChange={setSettled}
        onSubmit={setSubmitted}
        debounce={300}
        cancel="focus"
        shape="pill"
        panelPlacement="bottom"
        placeholder="Search library"
        tokens={tokens.map((value) => (
          <SearchBar.Token
            key={value}
            onRemove={() =>
              setTokens(tokens.filter((entry) => entry !== value))
            }
          >
            {value}
          </SearchBar.Token>
        ))}
        onRemoveLastToken={() => setTokens(tokens.slice(0, -1))}
      >
        <SearchBar.Section label="Results">
          {results.map((value) => (
            <SearchBar.Item
              key={value}
              id={`panel-search-item-${value.toLowerCase().replaceAll(" ", "-")}`}
              selected={tokens.includes(value)}
              description="Search result"
              trailing={
                <SearchBar.Action
                  onPress={() => {
                    if (!tokens.includes(value)) {
                      setTokens([...tokens, value]);
                    }
                  }}
                >
                  Add
                </SearchBar.Action>
              }
            >
              {value}
            </SearchBar.Item>
          ))}
          {results.length === 0 ? (
            <SearchBar.Status>No results</SearchBar.Status>
          ) : null}
        </SearchBar.Section>
      </SearchBar>
      <View className="h-[680px]" />
      <Typography>Top panel · keyboard avoidance</Typography>
      <SearchBar
        id="panel-search-lift"
        avoidKeyboard
        cancel="focus"
        placeholder="Search with keyboard"
      >
        <SearchBar.Section label="Suggested">
          <SearchBar.Item>Library</SearchBar.Item>
          <SearchBar.Item>Voice messages</SearchBar.Item>
        </SearchBar.Section>
      </SearchBar>
      <Typography>Filled · small</Typography>
      <SearchBar size="sm" variant="filled" placeholder="Small search" />
      <Typography>Large · loading</Typography>
      <SearchBar size="lg" loading placeholder="Searching" />
    </View>
  );
};
