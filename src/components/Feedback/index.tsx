import {
  FeedbackTrigger,
  FeedbackClose,
  FeedbackCancel,
  FeedbackSubmit,
} from "./actions";
import { FeedbackContent } from "./content";
import { FeedbackField } from "./field";
import { FeedbackPanel, FeedbackTitle, FeedbackFooter } from "./parts";
import { FeedbackRoot } from "./root";

export type {
  FeedbackProps,
  FeedbackTriggerProps,
  FeedbackContentProps,
  FeedbackPanelProps,
  FeedbackCloseProps,
  FeedbackFieldProps,
  FeedbackFooterProps,
  FeedbackActionProps,
  FeedbackSubmitProps,
} from "./types";
export const Feedback = Object.assign(FeedbackRoot, {
  Cancel: FeedbackCancel,
  Close: FeedbackClose,
  Content: FeedbackContent,
  Field: FeedbackField,
  Footer: FeedbackFooter,
  Panel: FeedbackPanel,
  Submit: FeedbackSubmit,
  Title: FeedbackTitle,
  Trigger: FeedbackTrigger,
});
