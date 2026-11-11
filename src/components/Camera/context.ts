import { createContext, createElement, useContext, useState } from "react";
import type { ReactNode } from "react";

import type { CameraProps, CameraState, CameraViewHandle } from "./types";

export interface CameraContextValue extends CameraState {
  props: CameraProps;
  id: string;
  haptics: boolean;
  paused: boolean;
  maxZoom: number;
  setReady: (ready: boolean) => void;
  initialize: (maxZoom: number) => void;
  error: (error: unknown) => void;
  view: CameraViewHandle;
}
export const CameraContext = createContext<CameraContextValue | null>(null);
export const useCameraContext = () => {
  const value = useContext(CameraContext);
  if (!value) {
    throw new Error("Camera parts must be used inside <Camera>.");
  }
  return value;
};
export const useCamera = (): CameraState => useCameraContext();

const CameraChromeContext = createContext<{
  header: number;
  footer: number;
  setHeader: (height: number) => void;
  setFooter: (height: number) => void;
} | null>(null);
export const CameraChromeProvider = ({
  children,
}: {
  children?: ReactNode;
}) => {
  const [header, setHeader] = useState(0);
  const [footer, setFooter] = useState(0);
  return createElement(
    CameraChromeContext.Provider,
    { value: { header, footer, setHeader, setFooter } },
    children
  );
};
export const useCameraChrome = () => {
  const chrome = useContext(CameraChromeContext);
  if (!chrome) throw new Error("Camera chrome must be used inside Camera");
  return chrome;
};
