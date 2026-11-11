import { View } from "@tarojs/components";
import { forwardRef, useMemo, useRef } from "react";
import type { ComponentRef } from "react";

import { SwipeGroupContext } from "./context";
import type { SwipeGroupMember, SwipeGroupValue } from "./context";
import type { SwipeGroupProps } from "./types";

export const SwipeGroup = forwardRef<
  ComponentRef<typeof View>,
  SwipeGroupProps
>(({ children, exclusive = true, ...props }, ref) => {
  const members = useRef(new Set<SwipeGroupMember>());
  const context = useMemo<SwipeGroupValue>(
    () => ({
      closeAll: () => {
        for (const member of members.current) {
          member.close();
        }
      },
      join: (member) => {
        members.current.add(member);
        return () => {
          members.current.delete(member);
        };
      },
      opened: (member) => {
        if (exclusive) {
          for (const other of members.current) {
            if (other !== member) {
              other.close();
            }
          }
        }
      },
    }),
    [exclusive]
  );
  return (
    <SwipeGroupContext.Provider value={context}>
      <View {...props} ref={ref}>
        {children}
      </View>
    </SwipeGroupContext.Provider>
  );
});
SwipeGroup.displayName = "Swipe.Group";
