import { View } from "@tarojs/components";

import { cn } from "../../lib/utils";
import { PanelsideContext } from "./context";
import type { PanelsideProps } from "./types";
import { usePanelsideModel } from "./use-model";

export const PanelsideRoot = (props: PanelsideProps) => {
  const model = usePanelsideModel(props);
  const { docked } = model.context;
  return (
    <PanelsideContext.Provider value={model.context}>
      <View
        id={model.id}
        className={cn(
          "relative flex min-h-0 flex-1 flex-col overflow-hidden",
          docked && "flex-row",
          props.className
        )}
        catchMove={model.pan.active}
        onTouchStart={model.pan.onTouchStart}
        onTouchMove={model.pan.onTouchMove}
        onTouchEnd={model.pan.onTouchEnd}
        onTouchCancel={model.pan.onTouchCancel}
      >
        <View
          className={cn(
            "relative flex min-h-0 flex-1 flex-col",
            docked && "flex-row"
          )}
        >
          {props.children}
        </View>
      </View>
    </PanelsideContext.Provider>
  );
};
