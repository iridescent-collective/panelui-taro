import type { InputProps } from "./types";

export const extractNativeInputProps = (props: InputProps) => {
  const {
    className: _className,
    containerClassName: _containerClassName,
    visuallyHidden: _visuallyHidden,
    label: _label,
    description: _description,
    errorMessage: _errorMessage,
    isRequired: _isRequired,
    disabled: _disabled,
    editable: _editable,
    startContent: _startContent,
    endContent: _endContent,
    interactiveContent: _interactiveContent,
    variant: _variant,
    size: _size,
    avoidKeyboard: _avoidKeyboard,
    keyboardMode: _keyboardMode,
    keyboardOffset: _keyboardOffset,
    keyboardBottomInset: _keyboardBottomInset,
    autoFocus: _autoFocus,
    placeholderTextColor: _placeholderTextColor,
    secureTextEntry: _secureTextEntry,
    maxLength: _maxLength,
    keyboardType: _keyboardType,
    returnKeyType: _returnKeyType,
    accessibilityLabel: _accessibilityLabel,
    onChangeText: _onChangeText,
    defaultValue: _defaultValue,
    onFocus: _onFocus,
    onBlur: _onBlur,
    onInput: _onInput,
    onKeyboardHeightChange: _onKeyboardHeightChange,
    style: _style,
    multiline: _multiline,
    focus: _focus,
    value: _value,
    ...nativeProps
  } = props;
  return nativeProps;
};
