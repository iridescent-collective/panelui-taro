import { Image, View } from "@tarojs/components";
import { useEffect, useRef, useState } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useSourceSpring } from "../../hooks/use-source-spring";
import { useTimingNumber } from "../../hooks/use-timing-number";
import {
  CameraSwitchIcon,
  FlashIcon,
  FlashOffIcon,
  TimerIcon,
  ImageIcon,
  IconColorProvider,
} from "../../icons";
import { selectionTick } from "../../lib/haptics";
import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { CanvasGraphics } from "../../primitives/canvas-graphics";
import { Circle } from "../../primitives/static-svg";
import { useThemeToken } from "../../theme/use-theme";
import { Text } from "../primitives/Text";
import {
  flashIn,
  formatDuration,
  nextFlash,
  nextTimer,
  recordingProgress,
} from "./camera-model";
import { useCameraContext, useCameraChrome } from "./context";
import type {
  CameraHeaderProps,
  CameraFooterProps,
  CameraControlsProps,
  CameraButtonProps,
  CameraFlashProps,
  CameraTimerProps,
  CameraDurationProps,
  CameraModesProps,
  CameraLibraryProps,
  CameraFlipProps,
  CameraShutterProps,
} from "./types";

export { CameraZoom } from "./zoom";

export const CameraHeader = ({ className, ...props }: CameraHeaderProps) => {
  useCameraContext();
  const chrome = useCameraChrome();
  const layout = useElementLayout(true, props.children, props.id);
  useEffect(() => {
    chrome.setHeader(layout.layout?.height ?? 0);
    return () => chrome.setHeader(0);
  }, [layout.layout?.height, chrome.setHeader]);
  return (
    <View
      {...props}
      id={layout.id}
      className={cn(
        "relative z-10 flex flex-row items-center justify-between px-[32px] pt-[16px]",
        className
      )}
    />
  );
};
export const CameraFooter = ({ className, ...props }: CameraFooterProps) => {
  useCameraContext();
  const chrome = useCameraChrome();
  const layout = useElementLayout(true, props.children, props.id);
  useEffect(() => {
    chrome.setFooter(layout.layout?.height ?? 0);
    return () => chrome.setFooter(0);
  }, [layout.layout?.height, chrome.setFooter]);
  return (
    <View
      {...props}
      id={layout.id}
      className={cn(
        "relative z-10 mt-auto flex flex-col items-center gap-[32px] px-[48px] pb-[32px]",
        className
      )}
    />
  );
};
export const CameraControls = ({
  className,
  ...props
}: CameraControlsProps) => {
  useCameraContext();
  return (
    <View
      {...props}
      className={cn(
        "flex w-full flex-row items-center justify-between",
        className
      )}
    />
  );
};
export const CameraButton = ({
  className,
  active = false,
  children,
  ...props
}: CameraButtonProps) => {
  useCameraContext();
  return (
    <AnimatedPressable
      {...props}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!props.disabled, selected: active }}
      hitSlop={6}
      pressScale={0.92}
      className={cn(
        "flex h-[80px] min-w-[80px] flex-row items-center justify-center gap-[8px] rounded-full px-[20px]",
        active ? "bg-white" : "bg-black/40",
        props.disabled ? "opacity-40" : "opacity-100",
        className
      )}
    >
      <IconColorProvider color={active ? "#000000" : "#ffffff"}>
        {children}
      </IconColorProvider>
    </AnimatedPressable>
  );
};
export const CameraFlash = ({
  labels,
  accessibilityLabel = "Flash",
  ...props
}: CameraFlashProps) => {
  const camera = useCameraContext();
  const shown = flashIn(camera.mode, camera.flash);
  const label = { auto: "Auto", off: "Off", on: "On", ...labels }[shown];
  return (
    <CameraButton
      {...props}
      active={shown === "on"}
      accessibilityLabel={`${accessibilityLabel}: ${label}`}
      onPress={() => {
        camera.setFlash(nextFlash(camera.mode, camera.flash));
        if (camera.haptics) {
          void selectionTick();
        }
      }}
    >
      {shown === "off" ? <FlashOffIcon size={20} /> : <FlashIcon size={20} />}
      {shown === "auto" ? (
        <Text size="xs" weight="semibold" className="text-white">
          {label}
        </Text>
      ) : null}
    </CameraButton>
  );
};
export const CameraTimer = ({
  offLabel = "Off",
  accessibilityLabel = "Timer",
  ...props
}: CameraTimerProps) => {
  const camera = useCameraContext();
  const active = camera.timer > 0;
  return (
    <CameraButton
      {...props}
      active={active}
      disabled={
        props.disabled || camera.mode === "video" || camera.countdown !== null
      }
      accessibilityLabel={`${accessibilityLabel}: ${active ? `${camera.timer} seconds` : offLabel}`}
      onPress={() => camera.setTimer(nextTimer(camera.timer))}
    >
      <TimerIcon size={20} />
      {active ? (
        <Text className="text-black" size="xs" weight="semibold">
          {camera.timer}s
        </Text>
      ) : null}
    </CameraButton>
  );
};
const useElapsed = (since: number | null) => {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (since === null) {
      return;
    }
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(timer);
  }, [since]);
  return since === null ? 0 : now - since;
};
export const CameraDuration = ({
  always = false,
  className,
  ...props
}: CameraDurationProps) => {
  const camera = useCameraContext();
  const elapsed = useElapsed(camera.recordingSince);
  if (!always && camera.mode !== "video" && !camera.recording) {
    return null;
  }
  return (
    <View
      {...props}
      className={cn(
        "flex h-[64px] flex-row items-center gap-[12px] rounded-full bg-black/40 px-[24px]",
        camera.recording && "bg-[var(--panel-destructive)]",
        className
      )}
      aria-label={
        camera.recording
          ? `Recording, ${formatDuration(elapsed)}`
          : formatDuration(elapsed)
      }
    >
      {camera.recording ? (
        <View aria-hidden className="h-[16px] w-[16px] rounded-full bg-white" />
      ) : null}
      <Text size="sm" weight="semibold" className="text-white tabular-nums">
        {formatDuration(elapsed)}
      </Text>
    </View>
  );
};
const MODE_SPRING = { damping: 22, stiffness: 260, mass: 0.8 };

export const CameraModes = ({
  labels,
  className,
  ...props
}: CameraModesProps) => {
  const camera = useCameraContext();
  const reduced = usePanelReducedMotion();
  const placed = useRef(false);
  const names = { video: "Video", photo: "Photo", ...labels };
  const content = JSON.stringify([names.video, names.photo]);
  const track = useElementLayout(true, content, props.id, false);
  const video = useElementLayout(true, content, undefined, false);
  const photo = useElementLayout(true, content, undefined, false);
  const tabs = { video, photo };
  const target = tabs[camera.mode].layout;
  const measured = !!(track.layout && target);
  const still = reduced || !placed.current;
  const x = useSourceSpring(
    target && track.layout ? target.left - track.layout.left : 0,
    MODE_SPRING,
    still
  );
  const width = useSourceSpring(target?.width ?? 0, MODE_SPRING, still);
  useEffect(() => {
    if (measured) {
      placed.current = true;
    }
  }, [measured]);
  return (
    <View
      {...props}
      id={track.id}
      role="tablist"
      aria-role="tablist"
      className={cn(
        "relative flex flex-row items-center rounded-full bg-black/40 p-[8px]",
        className
      )}
    >
      <View
        aria-hidden
        className="absolute top-[8px] bottom-[8px] left-0 rounded-full bg-white"
        style={{
          opacity: measured ? 1 : 0,
          pointerEvents: "none",
          transform: `translateX(${x * 2}rpx)`,
          width: `${width * 2}rpx`,
        }}
      />
      {(["video", "photo"] as const).map((mode) => {
        const selected = camera.mode === mode;
        const disabled = camera.recording || camera.capturing;
        return (
          <AnimatedPressable
            key={mode}
            id={tabs[mode].id}
            pressScale={1}
            accessibilityRole="tab"
            accessibilityLabel={names[mode]}
            accessibilityState={{ selected, disabled }}
            disabled={disabled}
            onPress={() => {
              if (!selected) {
                camera.setMode(mode);
              }
            }}
            className="flex h-[64px] items-center justify-center rounded-full px-[32px]"
          >
            <Text
              size="xs"
              weight="semibold"
              className={cn(
                "tracking-widest uppercase",
                selected ? "text-black" : "text-white"
              )}
            >
              {names[mode]}
            </Text>
          </AnimatedPressable>
        );
      })}
    </View>
  );
};
export const CameraLibrary = ({
  source,
  accessibilityLabel = "Photos",
  className,
  ...props
}: CameraLibraryProps) => {
  useCameraContext();
  return (
    <CameraButton
      {...props}
      accessibilityLabel={accessibilityLabel}
      className={cn(
        "h-[96px] w-[96px] overflow-hidden border-[4px] border-solid border-white/80 bg-white/15",
        className
      )}
    >
      {source ? (
        <Image
          src={typeof source === "string" ? source : source.uri}
          mode="aspectFill"
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <ImageIcon size={22} />
      )}
    </CameraButton>
  );
};
export const CameraFlip = ({
  className,
  accessibilityLabel = "Switch camera",
  ...props
}: CameraFlipProps) => {
  const camera = useCameraContext();
  return (
    <CameraButton
      {...props}
      disabled={props.disabled || camera.recording}
      accessibilityLabel={`${accessibilityLabel}: ${camera.facing === "back" ? "Back camera" : "Front camera"}`}
      onPress={camera.flip}
      className={cn("h-[96px] w-[96px] px-0", className)}
    >
      <CameraSwitchIcon size={24} />
    </CameraButton>
  );
};
export const CameraShutter = ({
  holdToRecord = true,
  onPress,
  accessibilityLabel,
  className,
  style,
  ...props
}: CameraShutterProps) => {
  const camera = useCameraContext();
  const reduced = usePanelReducedMotion();
  const color = useThemeToken("destructive");
  const [pressed, setPressed] = useState(false);
  const stop = useTimingNumber(camera.recording ? 1 : 0, 220, reduced);
  const press = useTimingNumber(pressed ? 1 : 0, pressed ? 90 : 160, reduced);
  const discSize = 62 + (28 - 62) * stop;
  const discRadius = discSize / 2 + (8 - discSize / 2) * stop;
  const elapsed = useElapsed(camera.recordingSince);
  const hold = useRef<ReturnType<typeof setTimeout> | undefined>();
  const holding = useRef(false);
  const released = useRef(false);
  const suppress = useRef(false);
  const latest = useRef(camera);
  latest.current = camera;
  useEffect(() => () => clearTimeout(hold.current), []);
  useEffect(() => {
    if (camera.recording && released.current && holding.current) {
      holding.current = false;
      camera.stopRecording();
    }
  }, [camera.recording]);
  const finish = () => {
    setPressed(false);
    clearTimeout(hold.current);
    released.current = true;
    if (holding.current) {
      suppress.current = true;
      if (latest.current.recording) {
        holding.current = false;
        latest.current.stopRecording();
      }
    }
  };
  const disabled = props.disabled || !camera.ready || camera.capturing;
  const label =
    accessibilityLabel ??
    (camera.countdown === null
      ? camera.recording
        ? "Stop recording"
        : camera.mode === "video"
          ? "Record video"
          : "Take photo"
      : "Cancel timer");
  const progress = recordingProgress(elapsed, camera.maxDuration);
  return (
    <AnimatedPressable
      {...props}
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      pressScale={1}
      onTouchStart={() => {
        setPressed(true);
        released.current = false;
        if (
          holdToRecord &&
          !onPress &&
          camera.mode === "video" &&
          !camera.recording
        ) {
          hold.current = setTimeout(() => {
            holding.current = true;
            suppress.current = true;
            void latest.current.startRecording();
          }, 300);
        }
      }}
      onTouchEnd={finish}
      onTouchCancel={finish}
      onPress={() => {
        if (suppress.current) {
          suppress.current = false;
          return;
        }
        (onPress ?? camera.press)();
      }}
      className={cn(
        "relative flex h-[156px] w-[156px] items-center justify-center",
        className
      )}
      style={mergeStyle({ opacity: disabled ? 0.6 : 1 }, style)}
    >
      <View
        aria-hidden
        className="absolute inset-0 rounded-full border-[8px] border-solid border-white"
        style={{ pointerEvents: "none" }}
      />
      {camera.maxDuration ? (
        <View className="absolute inset-0">
          <CanvasGraphics width={78} height={78} viewBox="0 0 78 78">
            <Circle
              cx={39}
              cy={39}
              r={37}
              fill="none"
              stroke={color}
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 37}
              strokeDashoffset={(1 - progress) * 2 * Math.PI * 37}
              transform="rotate(-90 39 39)"
            />
          </CanvasGraphics>
        </View>
      ) : null}
      <View
        style={{
          borderRadius: `${discRadius * 2}rpx`,
          height: `${discSize * 2}rpx`,
          width: `${discSize * 2}rpx`,
          transform: `scale(${1 - press * 0.08})`,
          pointerEvents: "none",
        }}
        className={
          camera.mode === "video" ? "bg-[var(--panel-destructive)]" : "bg-white"
        }
      />
    </AnimatedPressable>
  );
};
