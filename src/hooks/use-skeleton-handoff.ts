import type { ObservableNumber } from "../primitives/observable-number";
import {
  useSkeletonHandoffModel as useInternalHandoff,
  SKELETON_FADE,
} from "../primitives/skeleton-handoff";

export { SKELETON_FADE };
export interface UseSkeletonHandoffResult {
  mounted: boolean;
  opacity: ObservableNumber;
}
export const useSkeletonHandoff = (
  loading: boolean,
  duration = SKELETON_FADE
): UseSkeletonHandoffResult => {
  const { mounted, opacity } = useInternalHandoff(loading, duration);
  return { mounted, opacity };
};
