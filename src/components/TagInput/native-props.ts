import type { TagInputProps } from "./types";

export const nativeTagProps = (props: TagInputProps) => {
  const {
    className: _className,
    containerClassName: _containerClassName,
    variant: _variant,
    size: _size = "md",
    label: _label,
    description: _description,
    errorMessage: _errorMessage,
    isRequired: _isRequired,
    disabled: _disabled = false,
    readOnly: _readOnly = false,
    max: _max,
    clearable: _clearable = false,
    showCount: _showCount = false,
    placeholder: _placeholder,
    accessibilityLabel: _accessibilityLabel,
    value: _value,
    defaultValue: _defaultValue,
    onValueChange: _onValueChange,
    inputValue: _inputValue,
    onInputValueChange: _onInputValueChange,
    allowOverflow: _allowOverflow,
    allowDuplicates: _allowDuplicates,
    delimiters: _delimiters,
    blurBehavior: _blurBehavior,
    validate: _validate,
    onReject: _onReject,
    chipVariant: _chipVariant,
    renderTag: _renderTag,
    haptics: _haptics,
    onKeyPress: _onKeyPress,
    onSubmitEditing: _onSubmitEditing,
    autoFocus: _autoFocus,
    maxLength: _maxLength,
    focus: _focus,
    onInput: _onInput,
    onConfirm: _onConfirm,
    onFocus: _onFocus,
    onBlur: _onBlur,
    keyboardType: _keyboardType,
    returnKeyType: _returnKeyType,
    secureTextEntry: _secureTextEntry,
    placeholderTextColor: _placeholderTextColor,
    autoCapitalize: _autoCapitalize,
    autoCorrect: _autoCorrect,
    autoComplete: _autoComplete,
    ...native
  } = props;
  let type = native.type ?? "text";
  if (!native.type) {
    if (
      props.keyboardType === "numeric" ||
      props.keyboardType === "decimal-pad"
    ) {
      type = "digit";
    }
    if (
      props.keyboardType === "number-pad" ||
      props.keyboardType === "phone-pad"
    ) {
      type = "number";
    }
  }
  return {
    ...native,
    confirmType: props.returnKeyType ?? native.confirmType ?? "done",
    password: props.secureTextEntry ?? native.password,
    type,
  };
};
