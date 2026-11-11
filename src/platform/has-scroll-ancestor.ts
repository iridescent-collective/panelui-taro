import { document } from "@tarojs/runtime";

// Canvas raster layers can remain at pre-scroll screen coordinates in WebViews.
// Inspect Taro's logical tree, which also spans generated custom components.
export const hasScrollAncestor = (id: string): boolean => {
  let ancestor = document.getElementById(id)?.parentNode;
  while (ancestor) {
    if (ancestor.nodeName.toLowerCase() === "scroll-view") return true;
    ancestor = ancestor.parentNode;
  }
  return false;
};
