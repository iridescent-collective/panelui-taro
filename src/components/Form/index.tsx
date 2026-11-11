import { createContext, useContext } from "react";
import type { ReactNode } from "react";

import { bindFormRuntime } from "./typed-form";
import { useField } from "./use-field";
import type { FormFieldRenderProps, UseFieldOptions } from "./use-field";
import { useForm } from "./use-form";
import type { FormApi, UseFormOptions } from "./use-form";

export { useForm } from "./use-form";
export { useField } from "./use-field";
export type {
  FormApi,
  FieldErrors,
  FieldTouched,
  FieldState,
  UseFormOptions,
  Validator,
} from "./use-form";
export type { FormFieldRenderProps, UseFieldOptions } from "./use-field";
const FormContext = createContext<unknown>(null);
export interface FormProps<T extends object = Record<string, unknown>> {
  form: FormApi<T>;
  children?: ReactNode;
}
export interface TypedFormProps<T extends object> {
  form: FormApi<T>;
  children?: ReactNode;
}
const FormRoot = <T extends object>({ form, children }: FormProps<T>) => (
  <FormContext.Provider value={form}>{children}</FormContext.Provider>
);
FormRoot.displayName = "Form";
export interface FormFieldProps {
  name: string;
  validate?: (
    value: unknown,
    values: Record<string, unknown>
  ) => string | undefined | Promise<string | undefined>;
  validateOn?: "blur" | "change";
  children: (field: FormFieldRenderProps<unknown>) => ReactNode;
}
export interface TypedFormFieldProps<
  T extends object,
  K extends keyof T,
> extends UseFieldOptions<T, K> {
  name: K;
  children: (field: FormFieldRenderProps<T[K]>) => ReactNode;
}
const FormField = ({
  name,
  validate,
  validateOn,
  children,
}: FormFieldProps) => {
  const form = useContext(FormContext);
  if (!form) {
    throw new Error("Form.Field must be rendered inside a <Form>.");
  }
  const field = useField(form as FormApi<Record<string, unknown>>, name, {
    validate,
    validateOn,
  });
  return <>{children(field)}</>;
};
FormField.displayName = "Form.Field";
export const Form = Object.assign(FormRoot, {
  Field: FormField,
});
export interface TypedForm<T extends object> {
  (props: TypedFormProps<T>): ReactNode;
  Field: <K extends keyof T>(props: TypedFormFieldProps<T, K>) => ReactNode;
  useForm: (options: UseFormOptions<T>) => FormApi<T>;
  useField: <K extends keyof T>(
    form: FormApi<T>,
    name: K,
    options?: UseFieldOptions<T, K>
  ) => FormFieldRenderProps<T[K]>;
}
export const createForm = <T extends object>(): TypedForm<T> =>
  bindFormRuntime(FormRoot, FormField, useForm, useField) as TypedForm<T>;
