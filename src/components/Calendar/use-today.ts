import { onAppShow, offAppShow } from "@tarojs/taro";
import { useEffect, useState } from "react";

import { startOfDay } from "../../lib/date";

export const useToday = () => {
  const [today, setToday] = useState(() => startOfDay(new Date()));
  useEffect(() => {
    const refresh = () => {
      const now = startOfDay(new Date());
      setToday((current) =>
        current.getTime() === now.getTime() ? current : now
      );
    };
    onAppShow(refresh);
    return () => offAppShow(refresh);
  }, []);
  return today;
};
