import { ScrollView, View } from "@tarojs/components";
import type { ReactNode } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { textChildren } from "../primitives/Text";

export const SectionProgressList = ({
  children,
  reduced,
}: {
  children: ReactNode;
  reduced: boolean;
}) => {
  const measured = useElementLayout(true, children, undefined, false);
  return (
    <View
      role="menu"
      aria-role="menu"
      className={reduced ? undefined : "panelui-sectionprogress-list"}
    >
      <ScrollView
        scrollY
        enhanced
        bounces={false}
        showScrollbar={false}
        style={{
          flexGrow: 0,
          height: measured.layout
            ? `${Math.min(260, measured.layout.height) * 2}rpx`
            : "auto",
          maxHeight: "520rpx",
        }}
      >
        <View id={measured.id} className="flex flex-col gap-[4px] p-[12px]">
          {textChildren(children)}
        </View>
      </ScrollView>
    </View>
  );
};
