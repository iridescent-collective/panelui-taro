import {
  AIInputRow,
  AIInputToolbar,
  AIInputSpacer,
  AIInputAction,
  AIInputPill,
  AIInputSubmit,
  AIInputRecording,
} from "./controls";
import { AIInputField } from "./field";
import { AIInputRoot } from "./root";
import { AIInputSheet, AIInputSheetScreen } from "./sheet";
import {
  AIInputSheetGroup,
  AIInputSheetRow,
  AIInputSheetToggle,
  AIInputSheetChoice,
} from "./sheet-rows";
import { AIInputVoiceMode } from "./voice";

export type { AIInputSize } from "./growth";
export type {
  AIInputStatus,
  AIInputProps,
  AIInputFieldProps,
  AIInputRowProps,
  AIInputToolbarProps,
  AIInputActionProps,
  AIInputPillProps,
  AIInputSubmitProps,
  AIInputRecordingProps,
  AIInputSheetScreenProps,
  AIInputSheetProps,
  AIInputSheetGroupProps,
  AIInputSheetRowProps,
  AIInputSheetToggleProps,
  AIInputSheetChoiceProps,
  AIInputVoiceModeProps,
} from "./types";
const Sheet = Object.assign(AIInputSheet, {
  Choice: AIInputSheetChoice,
  Group: AIInputSheetGroup,
  Row: AIInputSheetRow,
  Screen: AIInputSheetScreen,
  Toggle: AIInputSheetToggle,
});
export const AIInput = Object.assign(AIInputRoot, {
  Action: AIInputAction,
  Field: AIInputField,
  Pill: AIInputPill,
  Recording: AIInputRecording,
  Row: AIInputRow,
  Sheet,
  Spacer: AIInputSpacer,
  Submit: AIInputSubmit,
  Toolbar: AIInputToolbar,
  VoiceMode: AIInputVoiceMode,
});
