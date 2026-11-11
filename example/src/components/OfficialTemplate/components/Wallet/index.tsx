import { View } from "@tarojs/components";
import { AreaChart } from "panelui-taro/area-chart";
import { Button } from "panelui-taro/button";
import { AnimatedPressable } from "panelui-taro/primitives/animated-pressable";
import { Tabs } from "panelui-taro/tabs";
import { Plus, ArrowUpRight, Snowflake } from "lucide-react-taro";
import { useState } from "react";

import { CARDS, money } from "../../constant";
import { Glyph } from "../Glyph";
import { Section } from "../Section";
import { Text } from "../Text";

export const WalletScreen = () => {
  const [selected, setSelected] = useState(CARDS[0].id);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [frozen, setFrozen] = useState<Record<string, boolean>>({});
  const [period, setPeriod] = useState("Month");
  const [transactions, setTransactions] = useState([
    {
      amount: -3860,
      detail: "Groceries · Today, 12:40",
      id: 0,
      title: "Mercearia Luz",
    },
    {
      amount: 12_000,
      detail: "Paid you back · Today, 09:12",
      id: 1,
      title: "Tomás Ferreira",
    },
    {
      amount: -420,
      detail: "Coffee · Yesterday",
      id: 2,
      title: "Café Gaivota",
    },
  ]);
  const [status, setStatus] = useState("");
  const active = CARDS.find((card) => card.id === selected) ?? CARDS[0];
  const balance = balances[selected] ?? active.balance;
  const transact = (amount: number) => {
    if (frozen[selected] || balance + amount < 0) {
      return;
    }
    setBalances((current) => ({ ...current, [selected]: balance + amount }));
    setTransactions((current) => [
      {
        amount,
        detail: `${active.name} · Just now`,
        id: Math.max(...current.map((row) => row.id)) + 1,
        title: amount > 0 ? "Demo top up" : "Ines Moreau",
      },
      ...current,
    ]);
    setStatus(
      amount > 0
        ? "Demo balance topped up by €100.00"
        : "Demo payment of €25.00 recorded"
    );
  };
  const scale = { Month: 4, Week: 1, Year: 48 }[period] ?? 4;
  return (
    <View className="flex flex-col gap-[36px]">
      <View className="flex flex-col gap-[12px]">
        <Text muted>Total balance</Text>
        <Text className="text-[68px] leading-[1.1] font-semibold tracking-[-2px]">
          {money(
            CARDS.reduce(
              (sum, card) => sum + (balances[card.id] ?? card.balance),
              0
            )
          )}
        </Text>
        <Text className="text-[var(--panel-success)]">
          +€842.10 in this month
        </Text>
      </View>
      <View className="flex flex-col">
        {[...CARDS.filter((card) => card.id !== selected), active].map(
          (card) => {
            const front = card.id === selected;
            return (
              <AnimatedPressable
                key={card.id}
                accessibilityRole="button"
                accessibilityLabel={`Select ${card.name} card`}
                onPress={() => setSelected(card.id)}
                className={`relative overflow-hidden rounded-[36px] p-[32px] ${front ? "bg-[var(--panel-primary)]" : "-mb-[20px] bg-[var(--panel-muted)] pb-[44px]"}`}
              >
                <View className="flex flex-row justify-between">
                  <Text
                    weight="semibold"
                    className={
                      front ? "text-[var(--panel-primary-foreground)]" : ""
                    }
                  >
                    {card.name}
                  </Text>
                  <Text
                    className={
                      front ? "text-[var(--panel-primary-foreground)]" : ""
                    }
                  >
                    •••• {card.last4}
                  </Text>
                </View>
                {front ? (
                  <View className="mt-[52px] flex flex-col gap-[12px]">
                    <Text
                      size="sm"
                      className="text-[var(--panel-primary-foreground)]"
                    >
                      {frozen[selected] ? "Card frozen" : "Balance"}
                    </Text>
                    <Text className="text-[54px] font-semibold text-[var(--panel-primary-foreground)]">
                      {money(balance)}
                    </Text>
                    <Text
                      size="sm"
                      className="mt-[36px] text-[var(--panel-primary-foreground)]"
                    >
                      MAYA LINDQVIST · {card.expiry}
                    </Text>
                  </View>
                ) : null}
              </AnimatedPressable>
            );
          }
        )}
      </View>
      <View className="flex flex-row gap-[12px]">
        <Button
          className="flex-1"
          variant="secondary"
          disabled={frozen[selected]}
          onPress={() => transact(10_000)}
        >
          <Glyph icon={Plus} size={18} />
          Top up
        </Button>
        <Button
          className="flex-1"
          variant="secondary"
          disabled={frozen[selected] || balance < 2500}
          onPress={() => transact(-2500)}
        >
          <Glyph icon={ArrowUpRight} size={18} />
          Send
        </Button>
        <Button
          className="flex-1"
          variant="secondary"
          onPress={() => {
            setFrozen((current) => ({
              ...current,
              [selected]: !current[selected],
            }));
            setStatus("");
          }}
        >
          <Glyph icon={Snowflake} size={18} />
          {frozen[selected] ? "Unfreeze" : "Freeze"}
        </Button>
      </View>
      {status ? (
        <Text role="status" size="sm">
          {status}
        </Text>
      ) : null}
      <Tabs defaultValue={period} value={period} onValueChange={setPeriod}>
        <Tabs.List>
          {["Week", "Month", "Year"].map((value) => (
            <Tabs.Trigger key={value} value={value}>
              {value}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs>
      <Section title={`Spending · ${active.name}`} caption={period}>
        <AreaChart
          data={[46, 29, 53, 38, 64, 41, 73].map((amount, index) => ({
            amount: amount * scale * (CARDS.indexOf(active) + 1),
            date: `${index + 1}`,
          }))}
        >
          <AreaChart.Header
            value={money(34_400 * scale * (CARDS.indexOf(active) + 1))}
            caption={`Spent this ${period.toLowerCase()}`}
          />
          <AreaChart.Grid />
          <AreaChart.Area dataKey="amount" />
          <AreaChart.XAxis />
        </AreaChart>
      </Section>
      <Section title="Recent activity" caption="All cards">
        {transactions.map((row) => (
          <View
            key={row.id}
            className="flex flex-row items-center justify-between gap-[16px] border-b-[2px] border-solid border-[var(--panel-border)] pb-[24px]"
          >
            <View className="min-w-0 flex-1">
              <Text weight="medium">{row.title}</Text>
              <Text size="xs" muted>
                {row.detail}
              </Text>
            </View>
            <Text weight="semibold">
              {row.amount > 0 ? "+" : ""}
              {money(row.amount)}
            </Text>
          </View>
        ))}
      </Section>
    </View>
  );
};
