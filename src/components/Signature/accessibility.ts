export type SignatureChangeKind = "draw" | "undo" | "redo" | "clear";

export interface SignatureAccessibilityAction {
  name: string;
  label: string;
}

export const signatureAccessibilityValue = (strokeCount: number) => ({
  text:
    strokeCount === 0
      ? "Empty signature"
      : `Signed, ${strokeCount} ${strokeCount === 1 ? "stroke" : "strokes"}`,
});

export const signatureAccessibilityActions = (
  strokeCount: number,
  undoneCount: number,
  alternative: boolean,
  disabled: boolean
): SignatureAccessibilityAction[] => {
  if (disabled) {
    return [];
  }

  const actions: SignatureAccessibilityAction[] = [];
  if (strokeCount > 0) {
    actions.push(
      { label: "Undo last stroke", name: "signature-undo" },
      { label: "Clear signature", name: "signature-clear" }
    );
  }
  if (undoneCount > 0) {
    actions.push({ label: "Redo last stroke", name: "signature-redo" });
  }
  if (alternative) {
    actions.push({
      label: "Use another signature method",
      name: "signature-alternative",
    });
  }
  return actions;
};

export const signatureAnnouncement = (
  previousCount: number,
  strokeCount: number,
  change: SignatureChangeKind
): string | null => {
  if (previousCount === strokeCount) {
    return null;
  }
  if (change === "clear") {
    return "Signature cleared. Signature is empty.";
  }
  if (strokeCount === 0) {
    return "Signature is empty.";
  }
  if (previousCount === 0) {
    return "Signature started.";
  }
  return null;
};
