import { Portal } from "../../primitives/portal";
import { TourContext } from "./context";
import { TourOverlay } from "./overlay";
import { TourStep } from "./step";
import type { TourProps } from "./types";
import { useTourModel } from "./use-model";

export type {
  TourProps,
  TourStepProps,
  TourLabels,
  TourShape,
  TourPlacement,
} from "./types";
const TourRoot = (props: TourProps) => {
  const {
    children,
    padding = 8,
    radius = 12,
    shape = "rect",
    placement = "auto",
    dismissible = true,
    showProgress = true,
    showSkip = true,
    interactive = false,
    overlayColor = "rgba(0, 0, 0, 0.66)",
    cardClassName,
  } = props;
  const model = useTourModel(props);
  return (
    <TourContext.Provider value={model.context}>
      {children}
      {model.resolvedOpen && model.steps.length > 0 ? (
        <Portal>
          <TourOverlay
            active={model.active}
            index={model.index}
            total={model.steps.length}
            isFirst={model.isFirst}
            isLast={model.isLast}
            padding={padding}
            radius={radius}
            shape={shape}
            placement={placement}
            dismissible={dismissible}
            showProgress={showProgress}
            showSkip={showSkip}
            interactive={interactive}
            overlayColor={overlayColor}
            words={model.words}
            cardClassName={cardClassName}
            onNext={model.next}
            onBack={model.back}
            onSkip={model.skip}
          />
        </Portal>
      ) : null}
    </TourContext.Provider>
  );
};
export const Tour = Object.assign(TourRoot, { Step: TourStep });
