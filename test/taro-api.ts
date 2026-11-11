import { vi } from "vitest";

export const ENV_TYPE = { WEAPP: "WEAPP", WEB: "WEB" } as const;
export const getEnv = () => ENV_TYPE.WEAPP;

export const setClipboardData = vi.fn(
  (_options: { data: string; showToast?: boolean }) =>
    Promise.resolve({
      errMsg: "setClipboardData:ok",
    })
);

interface ThemeEvent {
  theme: string;
}
const themeListeners = new Set<(event: ThemeEvent) => void>();
export const getAppBaseInfo = () => ({ language: "zh_CN", theme: "light" });
export const onThemeChange = (listener: (event: ThemeEvent) => void) => {
  themeListeners.add(listener);
};
export const offThemeChange = (listener: (event: ThemeEvent) => void) => {
  themeListeners.delete(listener);
};
export const emitThemeChange = (theme: string) => {
  for (const listener of themeListeners) {
    listener({ theme });
  }
};

const resizeListeners = new Set<() => void>();
let measured = { height: 20, left: 4, top: 8, width: 40 };
let windowWidth = 375;
let queries = 0;
export const getWindowInfo = () => ({
  pixelRatio: 2,
  safeArea: {
    bottom: 633,
    height: 633,
    left: 0,
    right: windowWidth,
    top: 0,
    width: windowWidth,
  },
  screenHeight: 667,
  screenTop: 0,
  screenWidth: windowWidth,
  windowHeight: 667,
  windowWidth,
});
export const getDeviceInfo = () => ({ platform: "ios" });
const currentPage = {};
export const getCurrentInstance = () => ({ page: currentPage });
export const nextTick = (listener: () => void) => queueMicrotask(listener);
export const onWindowResize = (listener: () => void) =>
  resizeListeners.add(listener);
export const offWindowResize = (listener: () => void) =>
  resizeListeners.delete(listener);
const elementMeasurements = new Map<string, typeof measured | null>();
const elementComputedStyles = new Map<string, Record<string, string>>();
const elementCanvasNodes = new Map<string, unknown>();
const elementFieldResults = new Map<string, Record<string, unknown> | null>();
export const setElementFieldsResult = (
  id: string,
  result: Record<string, unknown> | null
) => elementFieldResults.set(`#${id}`, result);
export const setElementCanvasNode = (id: string, node: unknown) =>
  elementCanvasNodes.set(`#${id}`, node);
export const setElementComputedStyle = (
  id: string,
  values: Record<string, string>
) => elementComputedStyles.set(`#${id}`, values);
export const setElementMeasurement = (
  id: string,
  rect: typeof measured | null
) => elementMeasurements.set(`#${id}`, rect);
export const setDeepElementMeasurement = (
  id: string,
  rect: typeof measured | null
) => elementMeasurements.set(`.panelui-theme >>> #${id}`, rect);
export const resetElementMeasurements = () => {
  elementMeasurements.clear();
  elementComputedStyles.clear();
  elementCanvasNodes.clear();
  elementFieldResults.clear();
};
export const createSelectorQuery = () => {
  queries += 1;
  let selected = "";
  const listeners: (() => void)[] = [];
  const query = {
    boundingClientRect: (listener: (rect: typeof measured | null) => void) => {
      const selector = selected;
      listeners.push(() => {
        let result: typeof measured | null = null;
        for (const candidate of selector
          .split(",")
          .map((value) => value.trim())) {
          const canonical = candidate.match(/#[^\s,]+/u)?.[0] ?? candidate;
          const key = elementMeasurements.has(candidate)
            ? candidate
            : canonical;
          const found = elementMeasurements.has(key)
            ? elementMeasurements.get(key)
            : measured;
          if (found) {
            result = found;
            break;
          }
        }
        listener(result === null ? null : { ...(result ?? measured) });
      });
      return query;
    },
    exec: (complete?: () => void) =>
      queueMicrotask(() => {
        for (const listener of listeners) {
          listener();
        }
        complete?.();
      }),
    fields: (
      fields: { computedStyle?: string[]; node?: boolean; size?: boolean },
      listener: (result: Record<string, unknown> | null) => void
    ) => {
      const selector = selected.match(/#[^\s,]+/u)?.[0] ?? selected;
      listeners.push(() => {
        if (elementFieldResults.has(selector)) {
          listener(elementFieldResults.get(selector) ?? null);
          return;
        }
        const styles = elementComputedStyles.get(selector) ?? {};
        const values: Record<string, unknown> = {};
        for (const key of fields.computedStyle ?? []) {
          values[key] = styles[key] ?? "0px";
        }
        if (fields.node) {
          values.node = elementCanvasNodes.get(selector);
        }
        if (fields.size) {
          const rect = elementMeasurements.get(selector) ?? measured;
          values.width = rect.width;
          values.height = rect.height;
        }
        listener(values);
      });
      return query;
    },
    node: (listener: (result: { node: unknown }) => void) => {
      const selector = selected.match(/#[^\s,]+/u)?.[0] ?? selected;
      listeners.push(() =>
        listener({ node: elementCanvasNodes.get(selector) })
      );
      return query;
    },
    in: () => query,
    select: (selector: string) => {
      selected = selector;
      return query;
    },
  };
  return query;
};
export const setTestMeasurement = (width: number, viewport: number) => {
  measured = { ...measured, width };
  windowWidth = viewport;
};
export const emitTestResize = () => {
  for (const listener of resizeListeners) {
    listener();
  }
};
export const measurementStats = () => ({
  listeners: resizeListeners.size,
  queries,
});

const appShowListeners = new Set<() => void>();
export const onAppShow = (listener: () => void) =>
  appShowListeners.add(listener);
export const offAppShow = (listener: () => void) =>
  appShowListeners.delete(listener);
export const emitAppShow = () => {
  for (const listener of appShowListeners) {
    listener();
  }
};

const keyboardListeners = new Set<(event: { height: number }) => void>();
export const onKeyboardHeightChange = (
  listener: (event: { height: number }) => void
) => keyboardListeners.add(listener);
export const offKeyboardHeightChange = (
  listener: (event: { height: number }) => void
) => keyboardListeners.delete(listener);
export const emitKeyboardHeight = (height: number) => {
  for (const listener of keyboardListeners) {
    listener({ height });
  }
};
export const keyboardListenerCount = () => keyboardListeners.size;

export const showActionSheet = vi.fn((_options: { itemList: string[] }) =>
  Promise.resolve({ tapIndex: 0 })
);

export const vibrateShort = vi.fn(() =>
  Promise.resolve({ errMsg: "vibrateShort:ok" })
);

const appHideListeners = new Set<() => void>();
export const onAppHide = (listener: () => void) =>
  appHideListeners.add(listener);
export const offAppHide = (listener: () => void) =>
  appHideListeners.delete(listener);
export const emitAppHide = () => {
  for (const listener of appHideListeners) {
    listener();
  }
};
export const env = { USER_DATA_PATH: "wxfile://test-user" };
interface TestFileOptions {
  filePath?: string;
  data?: string | ArrayBuffer;
  encoding?: string;
  srcPath?: string;
  destPath?: string;
  success?: (result: { data: string }) => void;
  fail?: (result: { errMsg: string }) => void;
}
export const testFileSystem = {
  copyFile: vi.fn((options: TestFileOptions) =>
    options.success?.({ data: "" })
  ),
  readFile: vi.fn((options: TestFileOptions) =>
    options.success?.({ data: "dGVzdA==" })
  ),
  writeFile: vi.fn((options: TestFileOptions) =>
    options.success?.({ data: "" })
  ),
};
export const getFileSystemManager = () => testFileSystem;
export const canvasToTempFilePath = vi.fn(
  (_options: unknown, _scope?: unknown) =>
    Promise.resolve({ tempFilePath: "wxfile://signature-temp.png" })
);

export const loadFontFace = vi.fn(
  async (_options: {
    family: string;
    source: string;
    global?: boolean;
    desc?: { weight?: string; style?: string };
  }) => ({ errMsg: "loadFontFace:ok", status: "loaded" })
);

export const getSetting = vi.fn(async () => ({ authSetting: { "scope.camera": true, "scope.record": true } }));
export const authorize = vi.fn(async (_options: { scope: string }) => ({ errMsg: "authorize:ok" }));
export const openSetting = vi.fn(async () => ({ authSetting: { "scope.camera": true } }));
export const cameraContext = {
  takePhoto: vi.fn((options: { success: (result: { tempImagePath: string }) => void }) => options.success({ tempImagePath: "/tmp/photo.jpg" })),
  startRecord: vi.fn((options: { success?: (result: { errMsg: string }) => void }) => options.success?.({ errMsg: "startRecord:ok" })),
  stopRecord: vi.fn((options: { success: (result: { tempVideoPath: string }) => void }) => options.success({ tempVideoPath: "/tmp/video.mp4" })),
  setZoom: vi.fn(),
};
export const createCameraContext = vi.fn(() => cameraContext);

export const getImageInfo = vi.fn(async (_options: { src: string }) => ({ width: 100, height: 80, path: "/tmp/photo.jpg", type: "jpg", orientation: "up" }));

export const getSystemInfoSync = vi.fn(() => ({ ...getWindowInfo(), fontSizeSetting: 16 }));
