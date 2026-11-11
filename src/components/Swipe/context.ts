import { createContext, useCallback, useContext } from "react";

export interface SwipeGroupMember {
  close: () => void;
}
export interface SwipeGroupValue {
  join: (member: SwipeGroupMember) => () => void;
  opened: (member: SwipeGroupMember) => void;
  closeAll: () => void;
}
export const SwipeContext = createContext<{ close: () => void } | null>(null);
export const SwipeGroupContext = createContext<SwipeGroupValue | null>(null);
export const useSwipeGroup = () => {
  const group = useContext(SwipeGroupContext);
  const closeAll = useCallback(() => group?.closeAll(), [group]);
  return { closeAll };
};
