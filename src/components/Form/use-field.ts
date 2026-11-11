import { useEffect, useRef } from "react";

import type { FormApi, Validator } from "./use-form";

export interface FormFieldRenderProps<V> {
  value: V;
  error?: string;
  touched: boolean;
  onChange: (value: V) => void;
  onBlur: () => void;
}
export interface UseFieldOptions<T extends object, K extends keyof T> {
  validate?: Validator<T, K>;
  validateOn?: "blur" | "change";
}
export const useField = <T extends object, K extends keyof T>(
  form: FormApi<T>,
  name: K,
  { validate, validateOn = "blur" }: UseFieldOptions<T, K> = {}
): FormFieldRenderProps<T[K]> => {
  const validateRef = useRef(validate);
  validateRef.current = validate;
  const { registerValidator } = form;
  const hasValidator = validate !== undefined;
  useEffect(() => {
    registerValidator(
      name,
      hasValidator
        ? (value, values) => validateRef.current?.(value, values)
        : undefined
    );
    return () => registerValidator(name);
  }, [registerValidator, name, hasValidator]);
  const { value, error, touched } = form.getFieldState(name);
  return {
    error: touched ? error : undefined,
    onBlur: async () => {
      form.setFieldTouched(name, true);
      if (validateOn === "blur") {
        await form.validateField(name);
      }
    },
    onChange: async (next: T[K]) => {
      form.setFieldValue(name, next);
      if (validateOn === "change") {
        await form.validateField(name);
      }
    },
    touched,
    value,
  };
};
