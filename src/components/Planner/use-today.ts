import { onAppShow, offAppShow, onAppHide, offAppHide } from "@tarojs/taro";
import { useEffect, useMemo, useState } from "react";

import { startOfDay } from "../../lib/date";
import { useThemeToken } from "../../theme/use-theme";
import { millisecondsUntilNextLocalDay } from "./planner-today";

export const useToday = () => {
  const [today, setToday] = useState(() => startOfDay(new Date()));
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const clear = () => {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    };
    const refresh = () => {
      const current = new Date();
      const now = startOfDay(current);
      setToday((previous) =>
        previous.getTime() === now.getTime() ? previous : now
      );
      clear();
      timer = setTimeout(refresh, millisecondsUntilNextLocalDay(current));
    };
    refresh();
    onAppShow(refresh);
    onAppHide(clear);
    return () => {
      clear();
      offAppShow(refresh);
      offAppHide(clear);
    };
  }, []);
  return today;
};
export const usePalette = () => {
  const one = useThemeToken("chart-1");
  const two = useThemeToken("chart-2");
  const three = useThemeToken("chart-3");
  const four = useThemeToken("chart-4");
  const five = useThemeToken("chart-5");
  return useMemo(
    () => [one, two, three, four, five],
    [one, two, three, four, five]
  );
};
