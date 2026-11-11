import { onAppHide, offAppHide, onAppShow, offAppShow } from "@tarojs/taro";
import { useEffect, useState } from "react";

import { createObservableNumber } from "../../primitives/observable-number";

export const useLiveClock = (
  running: boolean,
  paused: boolean,
  data: unknown
) => {
  const [now] = useState(() => createObservableNumber(Date.now()));
  const [foreground, setForeground] = useState(true);
  useEffect(() => {
    const hide = () => setForeground(false);
    const show = () => {
      setForeground(true);
      if (!paused) {
        now.value = Date.now();
      }
    };
    onAppHide(hide);
    onAppShow(show);
    return () => {
      offAppHide(hide);
      offAppShow(show);
    };
  }, [now, paused]);
  useEffect(() => {
    if (!paused) {
      now.value = Date.now();
    }
    if (!running || !foreground) {
      return;
    }
    const timer = setInterval(() => {
      now.value = Date.now();
    }, 16);
    return () => clearInterval(timer);
  }, [now, running, paused, foreground, data]);
  return now;
};
