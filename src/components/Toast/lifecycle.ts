import { onAppHide, offAppHide, onAppShow, offAppShow } from "@tarojs/taro";

import { toastStore } from "./toast-store";

let viewports = 0;
const pause = () => toastStore.pauseTimers();
const resume = () => toastStore.resumeTimers();
export const acquireToastTimers = () => {
  viewports += 1;
  if (viewports === 1) {
    resume();
    onAppHide(pause);
    onAppShow(resume);
  }
  let released = false;
  return () => {
    if (released) {
      return;
    }
    released = true;
    viewports -= 1;
    if (viewports === 0) {
      offAppHide(pause);
      offAppShow(resume);
      pause();
    }
  };
};
