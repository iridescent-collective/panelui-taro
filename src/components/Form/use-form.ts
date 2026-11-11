import { useCallback, useMemo, useReducer, useRef } from "react";

export type FieldErrors<T> = Partial<Record<keyof T, string>>;
export type FieldTouched<T> = Partial<Record<keyof T, boolean>>;
export type Validator<T extends object, K extends keyof T> = (
  value: T[K],
  values: T
) => string | undefined | Promise<string | undefined>;
export interface FieldState<V> {
  value: V;
  error?: string;
  touched: boolean;
}
export interface UseFormOptions<T extends object> {
  defaultValues: T;
  validate?: (values: T) => FieldErrors<T> | Promise<FieldErrors<T>>;
  onSubmit: (values: T) => void | Promise<void>;
}
export interface FormApi<T extends object> {
  values: T;
  errors: FieldErrors<T>;
  touched: FieldTouched<T>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  setFieldValue: <K extends keyof T>(name: K, value: T[K]) => void;
  setFieldTouched: <K extends keyof T>(name: K, touched?: boolean) => void;
  setFieldError: <K extends keyof T>(
    name: K,
    error: string | undefined
  ) => void;
  getValue: <K extends keyof T>(name: K) => T[K];
  watch: <K extends keyof T>(name: K) => T[K];
  getFieldState: <K extends keyof T>(name: K) => FieldState<T[K]>;
  registerValidator: <K extends keyof T>(
    name: K,
    validator?: Validator<T, K>
  ) => void;
  validateField: <K extends keyof T>(name: K) => Promise<boolean>;
  handleSubmit: () => Promise<void>;
  reset: (values?: T) => void;
}
interface State<T> {
  values: T;
  errors: FieldErrors<T>;
  touched: FieldTouched<T>;
  isSubmitting: boolean;
}
type Action<T> =
  | {
      type: "SET_VALUE";
      name: keyof T;
      value: unknown;
    }
  | {
      type: "SET_TOUCHED";
      name: keyof T;
      touched: boolean;
    }
  | {
      type: "SET_ERROR";
      name: keyof T;
      error: string | undefined;
    }
  | {
      type: "SET_ERRORS";
      errors: FieldErrors<T>;
    }
  | {
      type: "TOUCH_ALL";
      names: (keyof T)[];
    }
  | {
      type: "SUBMIT_START";
    }
  | {
      type: "SUBMIT_END";
    }
  | {
      type: "RESET";
      values: T;
    };
const reducer = <T extends object>(
  state: State<T>,
  action: Action<T>
): State<T> => {
  switch (action.type) {
    case "SET_VALUE": {
      return {
        ...state,
        errors: { ...state.errors, [action.name]: undefined },
        values: { ...state.values, [action.name]: action.value } as T,
      };
    }
    case "SET_TOUCHED": {
      return {
        ...state,
        touched: { ...state.touched, [action.name]: action.touched },
      };
    }
    case "SET_ERROR": {
      return {
        ...state,
        errors: { ...state.errors, [action.name]: action.error },
      };
    }
    case "SET_ERRORS": {
      return { ...state, errors: { ...state.errors, ...action.errors } };
    }
    case "TOUCH_ALL": {
      const touched = { ...state.touched };
      for (const name of action.names) {
        touched[name] = true;
      }
      return { ...state, touched };
    }
    case "SUBMIT_START": {
      return { ...state, isSubmitting: true };
    }
    case "SUBMIT_END": {
      return { ...state, isSubmitting: false };
    }
    case "RESET": {
      return {
        errors: {},
        isSubmitting: false,
        touched: {},
        values: action.values,
      };
    }
    default: {
      return state;
    }
  }
};
const VALIDATOR_THREW = "This field could not be validated.";
const runValidator = async <T extends object>(
  name: keyof T,
  validator: (
    value: unknown,
    values: T
  ) => string | undefined | Promise<string | undefined>,
  values: T
): Promise<string | undefined> => {
  try {
    return await validator(values[name], values);
  } catch {
    return VALIDATOR_THREW;
  }
};
export const useForm = <T extends object>({
  defaultValues,
  validate,
  onSubmit,
}: UseFormOptions<T>): FormApi<T> => {
  const defaultsRef = useRef(defaultValues);
  const validatorsRef = useRef(
    new Map<
      keyof T,
      (
        value: unknown,
        values: T
      ) => string | undefined | Promise<string | undefined>
    >()
  );
  const validationOwnersRef = useRef<Partial<Record<keyof T, symbol>>>({});
  const submissionLockedRef = useRef(false);
  const [state, dispatch] = useReducer(reducer<T>, {
    errors: {},
    isSubmitting: false,
    touched: {},
    values: defaultValues,
  });
  const valuesRef = useRef(state.values);
  valuesRef.current = state.values;
  const claimFieldValidation = useCallback(<K extends keyof T>(name: K) => {
    const owner = Symbol("panelui-field-validation");
    validationOwnersRef.current[name] = owner;
    return owner;
  }, []);
  const setFieldValue = useCallback(
    <K extends keyof T>(name: K, value: T[K]) => {
      claimFieldValidation(name);
      valuesRef.current = { ...valuesRef.current, [name]: value } as T;
      dispatch({ name, type: "SET_VALUE", value });
    },
    [claimFieldValidation]
  );
  const setFieldTouched = useCallback(
    <K extends keyof T>(name: K, touched = true) => {
      dispatch({ name, touched, type: "SET_TOUCHED" });
    },
    []
  );
  const setFieldError = useCallback(
    <K extends keyof T>(name: K, error: string | undefined) => {
      claimFieldValidation(name);
      dispatch({ error, name, type: "SET_ERROR" });
    },
    [claimFieldValidation]
  );
  const registerValidator = useCallback(
    <K extends keyof T>(name: K, validator?: Validator<T, K>) => {
      claimFieldValidation(name);
      if (validator) {
        validatorsRef.current.set(name, (value, values) =>
          validator(value as T[K], values)
        );
      } else {
        validatorsRef.current.delete(name);
      }
    },
    [claimFieldValidation]
  );
  const getFieldState = useCallback(
    <K extends keyof T>(name: K): FieldState<T[K]> => ({
      error: state.errors[name],
      touched: !!state.touched[name],
      value: state.values[name],
    }),
    [state.values, state.errors, state.touched]
  );
  const getValue = useCallback(
    <K extends keyof T>(name: K): T[K] => valuesRef.current[name],
    []
  );
  const watch = useCallback(
    <K extends keyof T>(name: K): T[K] => state.values[name],
    [state.values]
  );
  const validateField = useCallback(
    async <K extends keyof T>(name: K) => {
      const validator = validatorsRef.current.get(name);
      if (!validator) {
        return true;
      }
      const owner = claimFieldValidation(name);
      const values = valuesRef.current;
      const error = await runValidator(name, validator, values);
      if (validationOwnersRef.current[name] === owner) {
        dispatch({ error, name, type: "SET_ERROR" });
      }
      return !error;
    },
    [claimFieldValidation]
  );
  const handleSubmit = useCallback(async () => {
    if (submissionLockedRef.current) {
      return;
    }
    submissionLockedRef.current = true;
    try {
      const values = valuesRef.current;
      const names = [
        ...new Set([...Object.keys(values), ...validatorsRef.current.keys()]),
      ] as (keyof T)[];
      const validationOwners = new Map(
        names.map((name) => [name, claimFieldValidation(name)] as const)
      );
      dispatch({ names, type: "TOUCH_ALL" });
      const fieldErrorEntries = await Promise.all(
        names.map(async (name) => {
          const validator = validatorsRef.current.get(name);
          const error = validator
            ? await runValidator(name, validator, values)
            : undefined;
          return [name, error] as const;
        })
      );
      let formErrors: FieldErrors<T> = {};
      let formValidateThrew = false;
      if (validate) {
        try {
          formErrors = await validate(values);
        } catch {
          formValidateThrew = true;
        }
      }
      const cleared = Object.fromEntries(
        names.map((name) => [name, undefined])
      );
      const nextErrors: FieldErrors<T> = {
        ...cleared,
        ...Object.fromEntries(
          fieldErrorEntries.filter(([, error]) => error !== undefined)
        ),
        ...formErrors,
      };
      const ownedErrors = Object.fromEntries(
        names
          .filter(
            (name) =>
              validationOwnersRef.current[name] === validationOwners.get(name)
          )
          .map((name) => [name, nextErrors[name]])
      ) as FieldErrors<T>;
      dispatch({ errors: ownedErrors, type: "SET_ERRORS" });
      if (formValidateThrew || Object.values(nextErrors).some(Boolean)) {
        return;
      }
      dispatch({ type: "SUBMIT_START" });
      try {
        await onSubmit(values);
      } finally {
        dispatch({ type: "SUBMIT_END" });
      }
    } finally {
      submissionLockedRef.current = false;
    }
  }, [claimFieldValidation, validate, onSubmit]);
  const reset = useCallback((values: T = defaultsRef.current) => {
    validationOwnersRef.current = {};
    valuesRef.current = values;
    dispatch({ type: "RESET", values });
  }, []);
  const isDirty = useMemo(
    () => JSON.stringify(state.values) !== JSON.stringify(defaultsRef.current),
    [state.values]
  );
  const isValid = useMemo(
    () => Object.values(state.errors).every((error) => !error),
    [state.errors]
  );
  return {
    errors: state.errors,
    getFieldState,
    getValue,
    handleSubmit,
    isDirty,
    isSubmitting: state.isSubmitting,
    isValid,
    registerValidator,
    reset,
    setFieldError,
    setFieldTouched,
    setFieldValue,
    touched: state.touched,
    validateField,
    values: state.values,
    watch,
  };
};
