import { useEffect, useState } from "react";

export const usePresence = (open: boolean, duration: number) => {
  const [retained, setRetained] = useState(open);
  useEffect(() => {
    if (open) {
      setRetained(true);
      return;
    }
    const timer = setTimeout(() => setRetained(false), duration);
    return () => clearTimeout(timer);
  }, [duration, open]);
  return open || retained;
};
