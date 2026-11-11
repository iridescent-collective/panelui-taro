import { useEffect } from "react";
import { vi } from "vitest";

export * from "../../../test/taro-api";
export const setNavigationBarColor = vi.fn(async () => ({}));
export const setNavigationBarTitle = vi.fn(async () => ({}));
export const setBackgroundColor = vi.fn(async () => ({}));
export const setBackgroundTextStyle = vi.fn(async () => ({}));
export const setStorageSync = vi.fn();
export const getStorageSync = vi.fn(() => "");
export const useDidShow = (callback: () => void) =>
  useEffect(callback, [callback]);
export const redirectTo = vi.fn(async () => ({}));
export const navigateTo = vi.fn(async () => ({}));
export const navigateBack = vi.fn(async () => ({}));
export const getSystemInfoSync = () => ({
  safeArea: { bottom: 780 },
  screenHeight: 800,
});

export const createInnerAudioContext = vi.fn(() => ({
  currentTime: 0,
  destroy: vi.fn(),
  duration: 0,
  offEnded: vi.fn(),
  offPause: vi.fn(),
  offPlay: vi.fn(),
  offTimeUpdate: vi.fn(),
  onEnded: vi.fn(),
  onPause: vi.fn(),
  onPlay: vi.fn(),
  onTimeUpdate: vi.fn(),
  pause: vi.fn(),
  paused: true,
  play: vi.fn(),
  seek: vi.fn(),
  src: "",
}));

export const showToast = vi.fn(async () => ({}));

export const useDidHide = vi.fn();
