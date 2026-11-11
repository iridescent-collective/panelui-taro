import { View } from "@tarojs/components";

import { compactNumber } from "../../lib/chart";
import type { SankeyLayout } from "./sankey-layout";
import type { SankeyLink } from "./types";

export const LinkAccessibilityData = ({
  disabled,
  layout,
  links,
  labelFor,
  labelForLink,
}: {
  disabled: boolean;
  layout: SankeyLayout;
  links: SankeyLink[];
  labelFor: (id: string) => string;
  labelForLink?: (link: SankeyLink, index: number) => string;
}) => {
  if (disabled || !layout.links.length) {
    return null;
  }
  return (
    <View
      style={{
        height: "2rpx",
        left: "-20000rpx",
        position: "absolute",
        width: "2rpx",
      }}
    >
      {layout.links.map((link) => {
        const datum = link.input >= 0 ? links[link.input] : undefined;
        const source = layout.nodes[link.source];
        const target = layout.nodes[link.target];
        if (!source || !target) {
          return null;
        }
        const label =
          (datum ? labelForLink?.(datum, link.input) : undefined) ??
          `${labelFor(source.id)} to ${labelFor(target.id)}, ${compactNumber(link.value)}`;
        return (
          <View
            key={`${source.id}-${target.id}-${link.index}`}
            role="text"
            aria-role="text"
            aria-label={label}
          />
        );
      })}
    </View>
  );
};
