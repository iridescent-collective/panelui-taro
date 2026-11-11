import { Switch as NativeSwitch } from "@tarojs/components";
import { nextTick } from "@tarojs/taro";
import { useEffect, useRef, useState } from "react";

export const NativeSwitchControl = ({
  value,
  disabled,
  label,
  onValueChange,
  labelledBy,
}: {
  value: boolean;
  disabled?: boolean;
  label?: string;
  onValueChange?: (value: boolean) => void;
  labelledBy?: string;
}) => {
  const latest = useRef(value);
  latest.current = value;
  const mounted = useRef(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  return (
    <NativeSwitch
      key={revision}
      checked={value}
      disabled={disabled}
      aria-label={label}
      aria-labelledby={labelledBy}
      type="switch"
      onChange={
        disabled
          ? undefined
          : (event) => {
              const proposed = event.detail.value;
              onValueChange?.(proposed);
              nextTick(() => {
                if (mounted.current && latest.current !== proposed) {
                  setRevision((previous) => previous + 1);
                }
              });
            }
      }
    />
  );
};
