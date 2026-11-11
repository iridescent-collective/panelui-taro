import { getCurrentInstance } from "@tarojs/taro";
import { createContext } from "react";

import { BackHandlerStore } from "./back-handler-store";

const pages = new WeakMap<object, BackHandlerStore>();
const fallbackScope = {};
let nextOrder = 0;
export const reserveOverlayOrder = () => {
  nextOrder += 1;
  return nextOrder;
};
export const OverlayOrderContext = createContext<number | null>(null);
export const BackHandlerContext = createContext<BackHandlerStore | null>(null);
export const pageBackHandlerStore = () => {
  const page = getCurrentInstance().page ?? fallbackScope;
  let store = pages.get(page);
  if (!store) {
    store = new BackHandlerStore();
    pages.set(page, store);
  }
  return store;
};
