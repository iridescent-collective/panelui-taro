export const resolveOtpEditable = (
  editable: boolean | undefined,
  disabled: boolean | undefined
) => editable !== false && !disabled;
export const sanitizeOtp = (
  raw: string,
  length: number,
  type: "numeric" | "text"
) =>
  (type === "numeric" ? raw.replaceAll(/[^0-9]/gu, "") : raw).slice(0, length);
export const normalizeOtpLength = (length: number) =>
  Number.isFinite(length) ? Math.max(0, Math.floor(length)) : 6;
