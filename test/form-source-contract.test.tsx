// @vitest-environment happy-dom

import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { createForm, useField, useForm } from "../src/components/Form";
import { Input } from "../src/components/Input";
import { deferred } from "./helpers/deferred";

interface ProfileValues {
  name: string;
  enabled: boolean;
}
const ProfileForm = createForm<ProfileValues>();
const Profile = () => {
  const form = ProfileForm.useForm({
    defaultValues: { enabled: false, name: "" },
    onSubmit: () => {},
  });
  return (
    <ProfileForm form={form}>
      <ProfileForm.Field
        name="name"
        validate={(value) => (value ? undefined : "必填")}
      >
        {(field) => (
          <Input
            label="姓名"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorMessage={field.error}
          />
        )}
      </ProfileForm.Field>
    </ProfileForm>
  );
};
it("typed factory binds interface keys and values to the existing runtime without separate state", async () => {
  render(<Profile />);
  fireEvent.input(screen.getByRole("textbox"), { target: { value: "小栗" } });
  expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("小栗");
  await act(async () => {
    fireEvent.blur(screen.getByRole("textbox"));
    await Promise.resolve();
  });
  expect(screen.queryByText("必填")).toBeNull();
});
it("change validation reads same-tick edits and reveals errors only after touch", async () => {
  const { result } = renderHook(() => {
    const form = useForm({ defaultValues: { name: "" }, onSubmit: () => {} });
    const field = useField(form, "name", {
      validate: (value) => (value.length < 2 ? "太短" : undefined),
      validateOn: "change",
    });
    return { field, form };
  });
  await act(() => result.current.field.onChange("栗"));
  expect(result.current.form.errors.name).toBe("太短");
  expect(result.current.field.error).toBeUndefined();
  await act(() => result.current.field.onBlur());
  expect(result.current.field.error).toBe("太短");
  await act(() => result.current.field.onChange("小栗"));
  expect(result.current.field.error).toBeUndefined();
  expect(result.current.form.isDirty).toBe(true);
  act(() => result.current.form.reset());
  expect(result.current.form.isDirty).toBe(false);
  expect(result.current.field.touched).toBe(false);
});
it("late validation cannot overwrite a newer edit or a manually assigned error", async () => {
  const delayed = deferred<string | undefined>();
  const { result } = renderHook(() =>
    useForm({ defaultValues: { name: "" }, onSubmit: () => {} })
  );
  act(() => result.current.registerValidator("name", () => delayed.promise));
  let pending: Promise<boolean> = Promise.resolve(false);
  act(() => {
    pending = result.current.validateField("name");
    result.current.setFieldValue("name", "新值");
    result.current.setFieldError("name", "手动错误");
  });
  await act(async () => {
    delayed.resolve("旧错误");
    await pending;
  });
  expect(result.current.errors.name).toBe("手动错误");
});
it("same-tick duplicate submits share one lock and validator failures prevent submission", async () => {
  const delayed = deferred<boolean>();
  const submit = vi.fn(async () => {
    await delayed.promise;
  });
  const { result } = renderHook(() =>
    useForm({ defaultValues: { name: "小栗" }, onSubmit: submit })
  );
  let first: Promise<void> = Promise.resolve();
  await act(async () => {
    first = result.current.handleSubmit();
    await result.current.handleSubmit();
    await Promise.resolve();
  });
  expect(submit).toHaveBeenCalledOnce();
  expect(result.current.isSubmitting).toBe(true);
  await act(async () => {
    delayed.resolve(true);
    await first;
  });
  expect(result.current.isSubmitting).toBe(false);
  act(() =>
    result.current.registerValidator("name", () => {
      throw new Error("bad rule");
    })
  );
  await act(() => result.current.handleSubmit());
  expect(submit).toHaveBeenCalledOnce();
  expect(result.current.errors.name).toBe("This field could not be validated.");
});
