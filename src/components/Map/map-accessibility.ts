import type { AnimatedPressableProps } from "../../primitives/animated-pressable";

type AccessibilityState = NonNullable<
  AnimatedPressableProps["accessibilityState"]
>;
export interface MapFeatureAccessibility {
  label: string;
  hint?: string;
  state?: AccessibilityState;
}
export type MapFeatureAccessibilityDescription = MapFeatureAccessibility & {
  feature: unknown;
};
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;
export const describeMapFeatures = (
  data: unknown,
  describe: (feature: unknown, index: number) => MapFeatureAccessibility
): MapFeatureAccessibilityDescription[] => {
  const record = isRecord(data) ? data : null;
  let features: unknown[] = [];
  if (record?.type === "FeatureCollection" && Array.isArray(record.features)) {
    ({ features } = record);
  } else if (record?.type === "Feature") {
    features = [data];
  }
  return features.map((feature, index) => ({
    feature,
    ...describe(feature, index),
  }));
};
