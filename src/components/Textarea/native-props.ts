import { extractNativeInputProps } from "../Input/native-props";
import type { TextareaProps } from "./types";

export const extractNativeTextareaProps = (props: TextareaProps) => {
  const {
    rows: _rows,
    maxRows: _maxRows,
    autoGrow: _autoGrow,
    showCount: _showCount,
    onContentSizeChange: _onSize,
    onLineChange: _onLine,
    ...fieldProps
  } = props;
  return extractNativeInputProps(fieldProps);
};
