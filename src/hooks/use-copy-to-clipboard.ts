import { setClipboardData } from "@tarojs/taro";
import { useCallback, useEffect, useRef, useState } from "react";

export interface UseCopyToClipboardOptions {
  timeout?: number;
  onCopy?: () => void;
}
export interface UseCopyToClipboardResult {
  copy: (value: string) => Promise<void>;
  copied: boolean;
}
export const useCopyToClipboard = ({
  timeout = 2000,
  onCopy,
}: UseCopyToClipboardOptions = {}): UseCopyToClipboardResult => {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(false);
  const generation = useRef(0);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      generation.current += 1;
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);
  const copy = useCallback(
    async (value: string) => {
      const owner = generation.current + 1;
      generation.current = owner;
      const options = { data: value, showToast: false };
      await setClipboardData(options);
      if (!mounted.current || generation.current !== owner) {
        return;
      }
      setCopied(true);
      onCopy?.();
      if (timer.current) {
        clearTimeout(timer.current);
      }
      if (timeout > 0) {
        timer.current = setTimeout(() => {
          timer.current = null;
          setCopied(false);
        }, timeout);
      }
    },
    [onCopy, timeout]
  );
  return { copied, copy };
};
