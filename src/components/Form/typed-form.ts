export const bindFormRuntime = <Root, Field, UseForm, UseField>(
  root: Root,
  field: Field,
  useForm: UseForm,
  useField: UseField
) =>
  Object.assign(root as object, { Field: field, useField, useForm }) as Root & {
    Field: Field;
    useForm: UseForm;
    useField: UseField;
  };
