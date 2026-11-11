import { Avatar } from "panelui-taro/avatar";
import { CheckIcon, PlusIcon } from "panelui-taro/icons";
import { Item } from "panelui-taro/item";
import { Text } from "panelui-taro/primitives/text";
import { SearchBar } from "panelui-taro/search-bar";
import { useState } from "react";

import { useSafeAreaInsets } from "../runtime/native";
import { ScrollView, View } from "../runtime/native";
import { ComponentEntry } from "../types";
const PRODUCTS = [
  "Wireless keyboard",
  "Mechanical keyboard",
  "Laptop stand",
  "USB-C hub",
  "Desk mat",
  "Monitor arm",
];
function SearchBarFilterDemo() {
  const [query, setQuery] = useState("");
  const results = PRODUCTS.filter((item) =>
    item.toLowerCase().includes(query.trim().toLowerCase())
  );
  return (
    <View className="w-full gap-4">
      <SearchBar
        placeholder="Search products"
        value={query}
        onChangeText={setQuery}
      />
      {results.length === 0 ? (
        <Text size="sm" muted>
          Nothing matches “{query}”.
        </Text>
      ) : (
        results.map((item) => (
          <Text key={item} size="sm">
            {item}
          </Text>
        ))
      )}
    </View>
  );
}
function SearchBarCancelDemo() {
  const [query, setQuery] = useState("");
  const [cancelled, setCancelled] = useState(false);
  return (
    <View className="w-full gap-3">
      <SearchBar
        variant="filled"
        shape="pill"
        cancel="focus"
        placeholder="Search messages"
        value={query}
        onChangeText={(next) => {
          setQuery(next);
          setCancelled(false);
        }}
        onCancel={() => setCancelled(true)}
      />
      <Text size="sm" muted>
        {cancelled ? "Search cancelled." : "Tap the field to bring Cancel out."}
      </Text>
    </View>
  );
}
function SearchBarDebounceDemo() {
  const [query, setQuery] = useState("");
  const [ran, setRan] = useState("");
  const [pending, setPending] = useState(false);
  return (
    <View className="w-full gap-3">
      <SearchBar
        placeholder="Search the catalogue"
        debounce={400}
        loading={pending}
        value={query}
        onChangeText={(next) => {
          setQuery(next);
          setPending(next.length > 0 && next !== ran);
        }}
        onDebouncedChange={(next) => {
          setRan(next);
          setPending(false);
        }}
      />
      <Text size="sm" muted>
        {ran
          ? `Searched for “${ran}”.`
          : "The search runs 400ms after you stop typing."}
      </Text>
    </View>
  );
}
const COMPANIES = [
  { name: "Claude", domain: "claude.ai" },
  { name: "Codex", domain: "openai.com" },
  { name: "Lovable", domain: "lovable.dev" },
  { name: "Cursor", domain: "cursor.com" },
  { name: "Replit", domain: "replit.com" },
  { name: "Vercel", domain: "vercel.com" },
  { name: "Linear", domain: "linear.app" },
  { name: "Figma", domain: "figma.com" },
];
function AddButton({
  name,
  onAdd,
}: {
  name: string;
  onAdd: (name: string) => void;
}) {
  return (
    <SearchBar.Action
      accessibilityLabel={`Add ${name}`}
      onPress={() => onAdd(name)}
    >
      <PlusIcon size={18} />
    </SearchBar.Action>
  );
}
function CompanyMark({ name, domain }: { name: string; domain: string }) {
  return (
    <Avatar
      size="sm"
      fallback={name.slice(0, 1)}
      source={{
        uri: `https://www.google.com/s2/favicons?sz=128&domain=${domain}`,
      }}
    />
  );
}
function SearchBarPanelDemo() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [ran, setRan] = useState("");
  const [pending, setPending] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const trimmed = ran.trim().toLowerCase();
  const results = COMPANIES.filter((company) =>
    company.name.toLowerCase().includes(trimmed)
  );
  const add = (name: string) => {
    setPicked((current) =>
      current.includes(name) ? current : [...current, name]
    );
  };
  return (
    <View
      className="flex-1 justify-end gap-4 px-5 pt-4"
      style={{ paddingBottom: insets.bottom + 24 }}
    >
      <ScrollView
        contentContainerClassName="gap-2"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text size="sm" muted>
          {picked.length ? "Your stack" : "Nothing added yet. Search below."}
        </Text>
        {picked.map((name) => {
          const company = COMPANIES.find((item) => item.name === name);
          return (
            <View key={name} className="flex-row items-center gap-3 py-1.5">
              <CompanyMark
                name={name}
                domain={company?.domain ?? "example.com"}
              />
              <Text className="flex-1">{name}</Text>
            </View>
          );
        })}
      </ScrollView>

      <SearchBar
        avoidKeyboard
        variant="filled"
        placeholder="Search or enter company"
        debounce={400}
        loading={pending}
        value={query}
        onChangeText={(next) => {
          setQuery(next);
          setPending(next.length > 0 && next !== ran);
        }}
        onDebouncedChange={(next) => {
          setRan(next);
          setPending(false);
        }}
      >
        {query.length === 0 ? (
          <SearchBar.Section label="Suggested">
            {COMPANIES.slice(0, 4).map((company) => (
              <SearchBar.Item
                key={company.name}
                leading={
                  <CompanyMark name={company.name} domain={company.domain} />
                }
                trailing={<AddButton name={company.name} onAdd={add} />}
                selected={picked.includes(company.name)}
                onPress={() => add(company.name)}
              >
                {company.name}
              </SearchBar.Item>
            ))}
          </SearchBar.Section>
        ) : pending ? (
          <SearchBar.Status loading>Searching …</SearchBar.Status>
        ) : results.length > 0 ? (
          <SearchBar.Section label="Results">
            {results.map((company) => (
              <SearchBar.Item
                key={company.name}
                leading={
                  <CompanyMark name={company.name} domain={company.domain} />
                }
                trailing={<AddButton name={company.name} onAdd={add} />}
                selected={picked.includes(company.name)}
                onPress={() => add(company.name)}
              >
                {company.name}
              </SearchBar.Item>
            ))}
          </SearchBar.Section>
        ) : (
          <SearchBar.Status>No companies found</SearchBar.Status>
        )}
      </SearchBar>
    </View>
  );
}
function SearchBarTapToAddDemo() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const trimmed = query.trim().toLowerCase();
  const results = COMPANIES.filter((company) =>
    company.name.toLowerCase().includes(trimmed)
  );
  const toggle = (name: string) => {
    setPicked((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name]
    );
  };
  return (
    <View
      className="flex-1 justify-end gap-4 px-5 pt-4"
      style={{ paddingBottom: insets.bottom + 24 }}
    >
      <ScrollView
        contentContainerClassName="gap-2"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text size="sm" muted>
          {picked.length ? "Your stack" : "Tap a result to add it."}
        </Text>
        {picked.map((name) => {
          const company = COMPANIES.find((item) => item.name === name);
          return (
            <View key={name} className="flex-row items-center gap-3 py-1.5">
              <CompanyMark
                name={name}
                domain={company?.domain ?? "example.com"}
              />
              <Text className="flex-1">{name}</Text>
            </View>
          );
        })}
      </ScrollView>

      <SearchBar
        avoidKeyboard
        variant="filled"
        placeholder="Search or enter company"
        panelMaxHeight={248}
        value={query}
        onChangeText={setQuery}
      >
        {results.length > 0 ? (
          <SearchBar.Section
            label={query.length === 0 ? "Suggested" : "Results"}
          >
            {results.map((company) => (
              <SearchBar.Item
                key={company.name}
                leading={
                  <CompanyMark name={company.name} domain={company.domain} />
                }
                trailing={
                  picked.includes(company.name) ? (
                    <CheckIcon size={18} />
                  ) : undefined
                }
                selected={picked.includes(company.name)}
                onPress={() => toggle(company.name)}
              >
                {company.name}
              </SearchBar.Item>
            ))}
          </SearchBar.Section>
        ) : (
          <SearchBar.Status>No companies found</SearchBar.Status>
        )}
      </SearchBar>
    </View>
  );
}
function SearchBarTokensDemo() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const trimmed = query.trim().toLowerCase();
  const results = COMPANIES.filter(
    (company) =>
      !picked.includes(company.name) &&
      company.name.toLowerCase().includes(trimmed)
  );
  const add = (name: string) => {
    setPicked((current) =>
      current.includes(name) ? current : [...current, name]
    );
    setQuery("");
  };
  const remove = (name: string) => {
    setPicked((current) => current.filter((item) => item !== name));
  };
  return (
    <View
      className="flex-1 justify-end gap-4 px-5 pt-4"
      style={{ paddingBottom: insets.bottom + 24 }}
    >
      <View className="flex-1 justify-end">
        <Text size="sm" muted>
          {picked.length
            ? `${picked.length} in this comparison`
            : "Pick a few companies to compare."}
        </Text>
      </View>

      <SearchBar
        avoidKeyboard
        variant="filled"
        placeholder={picked.length ? "Add another" : "Search or enter company"}
        value={query}
        onChangeText={setQuery}
        onRemoveLastToken={() => setPicked((current) => current.slice(0, -1))}
        tokens={picked.map((name) => {
          const company = COMPANIES.find((item) => item.name === name);
          return (
            <SearchBar.Token
              key={name}
              leading={
                <Avatar
                  size="sm"
                  className="h-5 w-5"
                  fallback={name.slice(0, 1)}
                  source={{
                    uri: `https://www.google.com/s2/favicons?sz=128&domain=${company?.domain ?? "example.com"}`,
                  }}
                />
              }
              onRemove={() => remove(name)}
            >
              {name}
            </SearchBar.Token>
          );
        })}
      >
        {results.length > 0 ? (
          <SearchBar.Section
            label={query.length === 0 ? "Suggested" : "Results"}
          >
            {results.map((company) => (
              <SearchBar.Item
                key={company.name}
                leading={
                  <CompanyMark name={company.name} domain={company.domain} />
                }
                onPress={() => add(company.name)}
              >
                {company.name}
              </SearchBar.Item>
            ))}
          </SearchBar.Section>
        ) : (
          <SearchBar.Status>
            {picked.length === COMPANIES.length
              ? "That is all of them"
              : "No companies found"}
          </SearchBar.Status>
        )}
      </SearchBar>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "search-bar",
  name: "SearchBar",
  summary:
    "Search field with a clear button, a Cancel button and a panel of results",
  demos: [
    {
      label: "Above the keyboard",
      id: "above-the-keyboard",
      fullPage: true,
      description:
        "The field lifts clear of the keyboard on focus and the results open upward out of it.",
      render: () => <SearchBarPanelDemo />,
    },
    {
      label: "Tap to add",
      id: "tap-to-add",
      fullPage: true,
      description:
        "No button on the row: the row is the button, and a tick marks what is already in the stack.",
      render: () => <SearchBarTapToAddDemo />,
    },
    {
      label: "Names in the field",
      id: "tokens-in-the-field",
      fullPage: true,
      description:
        "Picks become chips inside the field, before the caret. Backspace on an empty field takes the last one back off.",
      render: () => <SearchBarTokensDemo />,
    },
    { label: "Filtering a list", render: () => <SearchBarFilterDemo /> },
    { label: "Cancel on focus", render: () => <SearchBarCancelDemo /> },
    { label: "Debounced query", render: () => <SearchBarDebounceDemo /> },
    {
      label: "Sizes and shapes",
      render: () => (
        <View className="w-full gap-5">
          <SearchBar size="sm" placeholder="Small" />
          <SearchBar size="md" variant="filled" placeholder="Medium, filled" />
          <SearchBar size="lg" shape="pill" placeholder="Large, pill" />
          <SearchBar
            placeholder="Disabled"
            defaultValue="Last query"
            disabled
          />
        </View>
      ),
    },
  ],
};
