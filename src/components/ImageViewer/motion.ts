import { startSourceSpring, stepSourceSpring } from "../../lib/source-spring";
import type {
  SourceSpringConfig,
  SourceSpringModel,
} from "../../lib/source-spring";
import { createObservableValue } from "../../primitives/observable-value";
import type { ViewerFrame } from "./types";

type Key = keyof ViewerFrame;
interface Spring {
  kind: "spring";
  model: SourceSpringModel;
  done?: () => void;
}
interface Timing {
  kind: "timing";
  from: number;
  target: number;
  start: number;
  duration: number;
  done?: () => void;
}
interface Decay {
  kind: "decay";
  speed: number;
  low: number;
  high: number;
}
type Motion = Spring | Timing | Decay;
export class ViewerMotion {
  signal = createObservableValue<ViewerFrame>({
    chrome: 0,
    dragX: 0,
    dragY: 0,
    fade: 1,
    pagerX: 0,
    scale: 1,
    shrink: 1,
    t: 0,
    tx: 0,
    ty: 0,
  });
  private animations = new Map<Key, Motion>();
  private timer: ReturnType<typeof setTimeout> | null = null;
  private last = 0;
  set = (values: Partial<ViewerFrame>) => {
    for (const key of Object.keys(values) as Key[]) {
      this.animations.delete(key);
    }
    this.signal.value = { ...this.signal.value, ...values };
  };
  spring = (
    key: Key,
    target: number,
    config: SourceSpringConfig,
    done?: () => void
  ) => {
    const old = this.animations.get(key);
    this.animations.set(key, {
      done,
      kind: "spring",
      model: startSourceSpring(
        this.signal.value[key],
        target,
        old?.kind === "spring" ? old.model.velocity : (config.velocity ?? 0),
        config
      ),
    });
    this.schedule();
  };
  timing = (
    key: Key,
    target: number,
    duration: number,
    done?: () => void,
    delay = 0
  ) => {
    this.animations.set(key, {
      done,
      duration,
      from: this.signal.value[key],
      kind: "timing",
      start: Date.now() + delay,
      target,
    });
    this.schedule();
  };
  decay = (key: Key, speed: number, low: number, high: number) => {
    this.animations.set(key, { high, kind: "decay", low, speed });
    this.schedule();
  };
  stop = () => {
    this.animations.clear();
    if (this.timer !== null) {
      clearTimeout(this.timer);
    }
    this.timer = null;
  };
  private schedule() {
    if (this.timer !== null) {
      return;
    }
    this.last = Date.now();
    this.timer = setTimeout(this.draw, 16);
  }
  private draw = () => {
    this.timer = null;
    const now = Date.now();
    const elapsed = Math.min(64, now - this.last);
    this.last = now;
    const frame = { ...this.signal.value };
    const finished: (() => void)[] = [];
    for (const [key, animation] of this.animations) {
      let done = false;
      if (animation.kind === "spring") {
        done = stepSourceSpring(animation.model, elapsed);
        frame[key] = animation.model.position;
      } else if (animation.kind === "timing") {
        const t = Math.max(
          0,
          Math.min(1, (now - animation.start) / animation.duration)
        );
        const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
        frame[key] =
          animation.from + (animation.target - animation.from) * eased;
        done = t >= 1;
      } else {
        animation.speed *= 0.998 ** elapsed;
        const next = frame[key] + (animation.speed * elapsed) / 1000;
        frame[key] = Math.min(animation.high, Math.max(animation.low, next));
        done = next !== frame[key] || Math.abs(animation.speed) < 1;
      }
      if (done) {
        this.animations.delete(key);
        if (animation.kind !== "decay" && animation.done) {
          finished.push(animation.done);
        }
      }
    }
    this.signal.value = frame;
    for (const done of finished) {
      done();
    }
    if (this.animations.size) {
      this.timer = setTimeout(this.draw, 16);
    }
  };
}
