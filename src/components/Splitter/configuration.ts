import { useMemo } from "react";
import type { ReactElement } from "react";

import { normalizeConstraint, resolveLayout } from "./splitter-math";
import type { SplitterConstraintInput } from "./splitter-math";
import type { SplitterPanelProps, SplitterProps } from "./types";

export const useSplitterConfiguration = (
  panels: ReactElement<SplitterPanelProps>[],
  props: SplitterProps
) => {
  const constraintsKey = JSON.stringify(
    panels.map((panel) => ({
      collapsedSize: panel.props.collapsedSize,
      collapsible: panel.props.collapsible === true,
      maxSize: panel.props.maxSize,
      minSize: panel.props.minSize,
    }))
  );
  const constraints = useMemo(() => {
    const input: SplitterConstraintInput[] = JSON.parse(constraintsKey);
    return input.map((entry) => normalizeConstraint(entry));
  }, [constraintsKey]);
  const declared = props.layout ?? props.defaultLayout;
  const sizesKey = JSON.stringify(
    panels.map(
      (panel, index) => declared?.[index] ?? panel.props.defaultSize ?? null
    )
  );
  const initial = useMemo(() => {
    const sizes: (number | null)[] = JSON.parse(sizesKey);
    return resolveLayout(
      sizes.map((size) => size ?? undefined),
      constraints
    );
  }, [sizesKey, constraints]);
  return { constraints, initial };
};
