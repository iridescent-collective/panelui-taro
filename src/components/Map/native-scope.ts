import { document } from "@tarojs/runtime";
import type { createMapContext } from "@tarojs/taro";

type NativeMapScope = Parameters<typeof createMapContext>[1];
export const nativeMapScopeId = (nativeId: string) => `${nativeId}-scope`;
export const resolveNativeMapScope = (
  nativeId: string,
  fallback: NativeMapScope
): NativeMapScope =>
  document.querySelector(`#${nativeMapScopeId(nativeId)}`)?.ctx ?? fallback;
