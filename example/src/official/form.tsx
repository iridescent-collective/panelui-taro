import { Button } from "panelui-taro/button";
import { Card } from "panelui-taro/card";
import { Checkbox } from "panelui-taro/checkbox";
import { Field } from "panelui-taro/field";
import { Form, useForm } from "panelui-taro/form";
import { Input } from "panelui-taro/input";
import { Separator } from "panelui-taro/separator";
import { Switch } from "panelui-taro/switch";
import { useToast } from "panelui-taro/toast";
import { useState } from "react";

import { useSafeAreaInsets } from "../runtime/native";
import { ScrollView, View } from "../runtime/native";
import { ComponentEntry } from "../types";
function FormDemo() {
  const { toast } = useToast();
  const form = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async (values) => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast.show({ variant: "success", label: `Signed in as ${values.email}` });
      form.reset();
    },
  });
  return (
    <Form form={form}>
      <View className="w-full gap-4">
        <Form.Field
          name="email"
          validate={(value: unknown) =>
            String(value).includes("@") ? undefined : "Enter a valid email"
          }
        >
          {(field) => (
            <Input
              label="Email"
              placeholder="you@example.com"
              value={typeof field.value === "string" ? field.value : ""}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              errorMessage={field.error}
            />
          )}
        </Form.Field>
        <Form.Field
          name="password"
          validate={(value: unknown) =>
            String(value).length >= 8 ? undefined : "At least 8 characters"
          }
        >
          {(field) => (
            <Input
              label="Password"
              secureTextEntry
              placeholder="••••••••"
              value={typeof field.value === "string" ? field.value : ""}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              errorMessage={field.error}
            />
          )}
        </Form.Field>
        <Button loading={form.isSubmitting} onPress={form.handleSubmit}>
          Sign in
        </Button>
      </View>
    </Form>
  );
}
function SignUpFormVersion() {
  const insets = useSafeAreaInsets();
  const { toast } = useToast();
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptedTerms: false,
    },
    validate: (values) =>
      values.password !== values.confirmPassword
        ? { confirmPassword: "Passwords must match" }
        : {},
    onSubmit: async (values) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.show({ variant: "success", label: `Welcome, ${values.name}` });
      form.reset();
    },
  });
  return (
    <ScrollView
      contentContainerClassName="gap-4 px-5 pt-4"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Form form={form}>
        <Card className="w-full">
          <Card.Header>
            <Card.Title>Create an account</Card.Title>
            <Card.Description>It takes less than a minute.</Card.Description>
          </Card.Header>
          <Card.Content className="gap-4">
            <Form.Field
              name="name"
              validate={(value: unknown) => (value ? undefined : "Required")}
            >
              {(field) => (
                <Input
                  label="Full name"
                  isRequired
                  value={typeof field.value === "string" ? field.value : ""}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  errorMessage={field.error}
                />
              )}
            </Form.Field>
            <Form.Field
              name="email"
              validate={(value: unknown) =>
                String(value).includes("@") ? undefined : "Enter a valid email"
              }
            >
              {(field) => (
                <Input
                  label="Email"
                  isRequired
                  placeholder="you@example.com"
                  value={typeof field.value === "string" ? field.value : ""}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  errorMessage={field.error}
                />
              )}
            </Form.Field>
            <Form.Field
              name="password"
              validate={(value: unknown) =>
                String(value).length >= 8 ? undefined : "At least 8 characters"
              }
            >
              {(field) => (
                <Input
                  label="Password"
                  isRequired
                  secureTextEntry
                  value={typeof field.value === "string" ? field.value : ""}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  errorMessage={field.error}
                />
              )}
            </Form.Field>
            <Form.Field name="confirmPassword">
              {(field) => (
                <Input
                  label="Confirm password"
                  isRequired
                  secureTextEntry
                  value={typeof field.value === "string" ? field.value : ""}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  errorMessage={field.error}
                />
              )}
            </Form.Field>
            <Form.Field
              name="acceptedTerms"
              validate={(value: unknown) =>
                value ? undefined : "Required to continue"
              }
            >
              {(field) => (
                <Field invalid={!!field.error}>
                  <Checkbox
                    checked={Boolean(field.value)}
                    onCheckedChange={field.onChange}
                    label="I accept the terms"
                  />
                  <Field.Error>{field.error}</Field.Error>
                </Field>
              )}
            </Form.Field>
          </Card.Content>
          <Card.Footer>
            <Button
              fullWidth
              loading={form.isSubmitting}
              onPress={form.handleSubmit}
            >
              Create account
            </Button>
          </Card.Footer>
        </Card>
      </Form>
    </ScrollView>
  );
}
function PreferencesVersion() {
  const insets = useSafeAreaInsets();
  const [marketing, setMarketing] = useState(true);
  const [product, setProduct] = useState(true);
  const [thirdParty, setThirdParty] = useState(false);
  const [publicProfile, setPublicProfile] = useState(false);
  return (
    <ScrollView
      contentContainerClassName="gap-4 px-5 pt-4"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      showsVerticalScrollIndicator={false}
    >
      <Card className="w-full">
        <Card.Header>
          <Card.Title>Preferences</Card.Title>
          <Card.Description>Manage what you hear from us.</Card.Description>
        </Card.Header>
        <Card.Content className="gap-5">
          <Field.Set>
            <Field.Legend>Emails</Field.Legend>
            <Field orientation="horizontal">
              <Field.Content>
                <Field.Title>Marketing</Field.Title>
                <Field.Description>Offers and announcements.</Field.Description>
              </Field.Content>
              <Switch value={marketing} onValueChange={setMarketing} />
            </Field>
            <Field orientation="horizontal">
              <Field.Content>
                <Field.Title>Product updates</Field.Title>
                <Field.Description>
                  New features and releases.
                </Field.Description>
              </Field.Content>
              <Switch value={product} onValueChange={setProduct} />
            </Field>
            <Field orientation="horizontal">
              <Field.Content>
                <Field.Title>Third-party offers</Field.Title>
                <Field.Description>
                  From partners we work with.
                </Field.Description>
              </Field.Content>
              <Switch value={thirdParty} onValueChange={setThirdParty} />
            </Field>
          </Field.Set>

          <Field.Separator>Profile</Field.Separator>

          <Field orientation="horizontal">
            <Field.Content>
              <Field.Title>Public profile</Field.Title>
              <Field.Description>
                Anyone can see your activity.
              </Field.Description>
            </Field.Content>
            <Switch value={publicProfile} onValueChange={setPublicProfile} />
          </Field>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}
export const entry: ComponentEntry = {
  slug: "form",
  name: "Form",
  summary: "Form state with no form library underneath",
  demos: [
    { label: "Sign in", render: () => <FormDemo /> },
    {
      label: "Sign up form",
      id: "sign-up-form",
      fullPage: true,
      description:
        "Cross-field validation, a checkbox with its own change prop, and a submit that waits on every field.",
      render: () => <SignUpFormVersion />,
    },
    {
      label: "Preferences",
      id: "preferences",
      fullPage: true,
      description:
        "The layout kit grouping switches, with no form hook involved.",
      render: () => <PreferencesVersion />,
    },
  ],
};
