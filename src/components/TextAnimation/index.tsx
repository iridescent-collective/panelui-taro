import { TextAnimationCounting } from "./counting";
import { TextAnimationRoot } from "./root";
import { TextAnimationRotating } from "./rotating";
import { TextAnimationScrolling } from "./scrolling";
import { TextAnimationSliding } from "./sliding";
import { TextAnimationTyping } from "./typing";

export type {
  TextAnimationProps,
  TextAnimationTypingProps,
  TextAnimationRotatingProps,
  TextAnimationCountingProps,
  TextAnimationSlidingProps,
  TextAnimationScrollingProps,
} from "./types";
export const TextAnimation = Object.assign(TextAnimationRoot, {
  Counting: TextAnimationCounting,
  Rotating: TextAnimationRotating,
  Scrolling: TextAnimationScrolling,
  Sliding: TextAnimationSliding,
  Typing: TextAnimationTyping,
});
