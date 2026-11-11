import { useEffect, useRef, useState } from "react";

export const useReasoningTiming = (
  isStreaming: boolean,
  open: boolean,
  optedOut: boolean,
  setOpen: (open: boolean) => void
) => {
  const [measured, setMeasured] = useState<number>();
  const everStreamed = useRef(isStreaming);
  const startedAt = useRef<number | null>(null);
  const [autoClosed, setAutoClosed] = useState(false);
  useEffect(() => {
    if (isStreaming) {
      everStreamed.current = true;
      startedAt.current ??= Date.now();
      return;
    }
    if (startedAt.current !== null) {
      setMeasured(
        Math.max(1, Math.round((Date.now() - startedAt.current) / 1000))
      );
      startedAt.current = null;
    }
  }, [isStreaming]);
  useEffect(() => {
    if (isStreaming && !open && !optedOut) {
      setOpen(true);
    }
  }, [isStreaming, open, optedOut, setOpen]);
  useEffect(() => {
    if (!everStreamed.current || isStreaming || !open || autoClosed) {
      return;
    }
    const timer = setTimeout(() => {
      setOpen(false);
      setAutoClosed(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [isStreaming, open, autoClosed, setOpen]);
  return measured;
};
