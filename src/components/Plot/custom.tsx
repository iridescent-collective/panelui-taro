import { View } from "@tarojs/components";
import {
  Children,
  Fragment,
  cloneElement,
  isValidElement,
  useContext,
  useState,
  useSyncExternalStore,
} from "react";
import type { CSSProperties, ReactElement, ReactNode } from "react";

import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { isStaticSvgNode } from "../../primitives/static-svg";
import { usePlot, usePlotDomain } from "./context";
import {
  createPlotLayerStore,
  PlotLayerRegistryContext as LayerRegistry,
  PlotLayerPathContext as LayerPath,
  PlotLayerAncestorsContext as Ancestors,
} from "./layer-store";
import type { PlotLayerStore } from "./layer-store";
import type { PlotGeometry, PlotLayerProps, PlotOverlayProps } from "./types";
import { usePlotGraphic } from "./use-graphic";

export const usePlotLayer = (node: ReactNode) => usePlotGraphic("series", node);
export const usePlotAnimatedLayer = (
  draw: (geometry: PlotGeometry) => ReactNode
) => {
  const ctx = usePlot("usePlotAnimatedLayer");
  usePlotDomain();
  useSyncExternalStore(
    ctx.reveal.subscribe,
    ctx.reveal.getSnapshot,
    ctx.reveal.getSnapshot
  );
  useSyncExternalStore(
    ctx.activeIndex.subscribe,
    ctx.activeIndex.getSnapshot,
    ctx.activeIndex.getSnapshot
  );
  usePlotLayer(draw(ctx));
};
const StaticMark = ({ node }: { node: ReactNode }) => {
  usePlotLayer(node);
  return null;
};
const isFullyStatic = (node: ReactNode): boolean => {
  if (!isValidElement(node)) {
    return (
      node === null ||
      node === undefined ||
      typeof node === "string" ||
      typeof node === "number"
    );
  }
  if (node.type !== Fragment && !isStaticSvgNode(node)) {
    return false;
  }
  return Children.toArray(
    (
      node.props as {
        children?: ReactNode;
      }
    ).children
  ).every(isFullyStatic);
};
const LayerChildren = ({ children }: { children: ReactNode }) => {
  const parents = useContext(Ancestors);
  const path = useContext(LayerPath);
  return (
    <>
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) {
          return null;
        }
        let content: ReactNode = child;
        if (child.type === Fragment) {
          content = (
            <LayerChildren>
              {(child.props as { children?: ReactNode }).children}
            </LayerChildren>
          );
        } else if (isFullyStatic(child)) {
          content = <StaticMark node={child} />;
        } else if (isStaticSvgNode(child)) {
          content = (
            <Ancestors.Provider value={[...parents, cloneElement(child, {})]}>
              <LayerChildren>
                {(child.props as { children?: ReactNode }).children}
              </LayerChildren>
            </Ancestors.Provider>
          );
        }
        return (
          <LayerPath.Provider key={child.key ?? index} value={[...path, index]}>
            {content}
          </LayerPath.Provider>
        );
      })}
    </>
  );
};
const LayerImage = ({ store }: { store: PlotLayerStore }) => {
  const nodes = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot
  );
  usePlotGraphic("series", nodes);
  return null;
};
export const PlotLayer = Object.assign(
  ({ children }: PlotLayerProps) => {
    const [store] = useState(createPlotLayerStore);
    return (
      <>
        <LayerImage store={store} />
        <LayerRegistry.Provider value={store}>
          <LayerPath.Provider value={[]}>
            <Ancestors.Provider value={[]}>
              <LayerChildren>{children}</LayerChildren>
            </Ancestors.Provider>
          </LayerPath.Provider>
        </LayerRegistry.Provider>
      </>
    );
  },
  { displayName: "Plot.Layer", layer: "series" }
);
const overlayChildren = (children: ReactNode): ReactNode =>
  Children.map(children, (child) => {
    if (!isValidElement(child)) {
      return child;
    }
    const element = child as ReactElement<{
      style?: CSSProperties | string;
      children?: ReactNode;
    }>;
    if (child.type === Fragment) {
      return cloneElement(element, {}, overlayChildren(element.props.children));
    }
    return cloneElement(element, {
      style: mergeStyle({ pointerEvents: "auto" }, element.props.style),
    });
  });
export const PlotOverlay = Object.assign(
  ({ children, className }: PlotOverlayProps) => (
    <View
      className={cn("absolute inset-0", className)}
      style={{ pointerEvents: "none" }}
    >
      {overlayChildren(children)}
    </View>
  ),
  { displayName: "Plot.Overlay", layer: "overlay" }
);
