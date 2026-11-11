import { View } from "@tarojs/components";
import { cloneElement } from "react";
import type { ComponentProps, ReactElement } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { mergeStyle } from "../../lib/styles";

/** Keep navigation measurement out of ordinary upstream profile headers. */
export const PageHeaderNavigationLayout = ({
  children,
  fixed,
  placeholder,
  fallbackHeight,
}: {
  children: ReactElement<ComponentProps<typeof View>>;
  fixed: boolean;
  placeholder: boolean;
  fallbackHeight: number;
}) => {
  const { id, style } = children.props;
  const measurement = useElementLayout(fixed && placeholder, children, id);
  const measuredHeight = measurement.layout?.height;
  // Shared measurement units are 375-wide logical pixels; two rpx preserve the measured screen height.
  const height =
    measuredHeight && Number.isFinite(measuredHeight) && measuredHeight > 0
      ? `${measuredHeight * 2}rpx`
      : `${fallbackHeight}px`;
  return (
    <>
      {cloneElement(children, {
        id: measurement.id,
        style: fixed
          ? mergeStyle(
              { position: "fixed", top: 0, left: 0, right: 0, zIndex: 100 },
              style
            )
          : style,
      })}
      {fixed && placeholder ? (
        <View
          className="panel-page-header-placeholder w-full shrink-0"
          style={{ height }}
          aria-hidden
        />
      ) : null}
    </>
  );
};
