import { useMemo, useState, useRef, useEffect } from "react";

import { Text } from "../primitives/Text";
import { TypingCaret } from "./caret";
import { useShared, useStill } from "./context";
import type { TextAnimationTypingProps } from "./types";

export const TextAnimationTyping = ({
  className,
  text,
  duration,
  delay,
  hold = 1400,
  loop,
  caret = false,
  caretClassName,
  onDone,
  enabled,
  ...props
}: TextAnimationTypingProps) => {
  const step = useShared("duration", duration, 55);
  const wait = useShared("delay", delay, 0);
  const repeat = useShared("loop", loop, false);
  const still = useStill(useShared("enabled", enabled, true));
  const strings = useMemo(
    () => (typeof text === "string" ? [text] : text),
    [text]
  );
  const [shown, setShown] = useState(() => (still ? (strings[0] ?? "") : ""));
  const [typing, setTyping] = useState(false);
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    if (still) {
      setShown(strings[0] ?? "");
      setTyping(false);
      return;
    }
    let timer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;
    const sequence = {
      erase: (value: string, index: number) => {
        if (cancelled) {
          return;
        }
        let at = value.length;
        setTyping(true);
        const back = () => {
          timer = null;
          if (cancelled) {
            return;
          }
          setShown(value.slice(0, at));
          if (at > 0) {
            at -= 1;
            timer = setTimeout(back, step);
            return;
          }
          setTyping(false);
          sequence.run(index === strings.length - 1 ? 0 : index + 1);
        };
        back();
      },
      run: (index: number) => {
        const value = strings[index] ?? "";
        let at = 0;
        setTyping(true);
        const type = () => {
          timer = null;
          if (cancelled) {
            return;
          }
          setShown(value.slice(0, at));
          if (at < value.length) {
            at += 1;
            timer = setTimeout(type, step);
            return;
          }
          setTyping(false);
          const last = index === strings.length - 1;
          if (last && !repeat) {
            done.current?.();
            return;
          }
          timer = setTimeout(() => sequence.erase(value, index), hold);
        };
        type();
      },
    };
    timer = setTimeout(() => sequence.run(0), wait);
    return () => {
      cancelled = true;
      if (timer !== null) {
        clearTimeout(timer);
      }
    };
  }, [hold, repeat, step, still, strings, wait]);
  return (
    <Text className={className} {...props}>
      {shown}
      {caret ? (
        <TypingCaret
          blinking={!typing}
          still={still}
          className={caretClassName}
        />
      ) : null}
    </Text>
  );
};
TextAnimationTyping.displayName = "TextAnimation.Typing";
