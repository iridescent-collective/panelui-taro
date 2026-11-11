import {
  createSelectorQuery,
  getCurrentInstance,
  getWindowInfo,
} from "@tarojs/taro";
import { useCallback, useEffect, useRef, useState } from "react";

export const useSectionNavigation = (
  id: string,
  sections: readonly { id: string }[],
  sectionHeight: number
) => {
  const [scope] = useState(() => getCurrentInstance().page);
  const current = useRef({ mounted: true, revision: 0 });
  useEffect(() => {
    current.current.mounted = true;
    return () => {
      current.current.mounted = false;
      current.current.revision += 1;
    };
  }, []);
  return useCallback(
    (value: string) => {
      const index = sections.findIndex((section) => section.id === value);
      if (index === -1) {
        return;
      }
      current.current.revision += 1;
      const { revision } = current.current;
      const query = createSelectorQuery();
      if (scope) {
        query.in(scope);
      }
      query
        .select(`#${id}, .panelui-theme >>> #${id}`)
        .fields({ node: true }, (result) => {
          if (
            !current.current.mounted ||
            revision !== current.current.revision
          ) {
            return;
          }
          const node = result?.node;
          if (node && typeof node.scrollTo === "function") {
            node.scrollTo({
              animated: true,
              duration: 300,
              top: (index * sectionHeight * getWindowInfo().windowWidth) / 375,
            });
          }
        })
        .exec();
    },
    [id, scope, sectionHeight, sections]
  );
};
