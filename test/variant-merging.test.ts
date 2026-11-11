import { expect, it } from "vitest";

import { tv } from "../src/lib/variants";

it("merges escaped variant classes without losing size or color groups", () => {
  const variants = tv({
    base: "rounded-_bvar_p--panel-radius-lg_P_B text-_b32px_B",
    variants: { active: { true: "text-_bcolor_cvar_p--panel-primary_P_B" } },
  });
  expect(
    variants({ active: true, className: "rounded-none text-_b48px_B" })
  ).toBe("text-_bcolor_cvar_p--panel-primary_P_B rounded-none text-_b48px_B");
});

it("merges each slot and keeps variant metadata for composition", () => {
  const variants = tv({
    defaultVariants: { size: "lg" },
    slots: { base: "rounded-_b12px_B", label: "text-_b32px_B" },
    variants: { size: { lg: { label: "text-_b48px_B" } } },
  });
  const slots = variants();
  expect(slots.base({ className: "rounded-none" })).toBe("rounded-none");
  expect(slots.label()).toBe("text-_b48px_B");
  expect(variants.variantKeys).toEqual(["size"]);
});
