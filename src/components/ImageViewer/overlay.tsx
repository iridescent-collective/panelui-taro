import { View } from "@tarojs/components";
import { showActionSheet } from "@tarojs/taro";
import { useEffect, useRef } from "react";

import { ViewerBackdrop, ViewerChrome, ViewerPictures } from "./layers";
import { useViewerGestures } from "./use-gestures";
import { useViewerOverlayModel } from "./use-overlay-model";
import type { OverlayProps } from "./use-overlay-model";

export const ViewerOverlay = (props: OverlayProps) => {
  const model = useViewerOverlayModel(props);
  const gestures = useViewerGestures(model);
  const latest = useRef({ page: model.page, props });
  latest.current = { page: model.page, props };
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const menu = async () => {
    const { page } = model;
    const actions = [
      { index: page - 1, label: "Previous image" },
      { index: page + 1, label: "Next image" },
    ].filter((action) => action.index >= 0 && action.index < model.count);
    try {
      const result = await showActionSheet({
        itemList: [...actions.map((action) => action.label), props.closeLabel],
      });
      if (
        !mounted.current ||
        latest.current.page !== page ||
        !latest.current.props.open
      ) {
        return;
      }
      const action = actions[result.tapIndex];
      if (action) {
        latest.current.props.onIndexChange(action.index);
      } else if (result.tapIndex === actions.length) {
        latest.current.props.onRequestClose();
      }
    } catch {
      return false;
    }
  };
  if (!model.item) {
    return null;
  }
  return (
    <View
      className="fixed inset-0"
      aria-role="dialog"
      aria-label={model.item.alt}
    >
      <ViewerBackdrop model={model} />
      <View
        className="absolute inset-0"
        catchMove
        {...gestures}
        onLongPress={() => {
          gestures.onTouchCancel();
          void menu();
        }}
      >
        <ViewerPictures model={model} props={props} />
      </View>
      <ViewerChrome model={model} props={props} />
    </View>
  );
};
