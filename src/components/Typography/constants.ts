export const TYPOGRAPHY_TYPE = {
  blockquote: "text-[32px] leading-[1.5] font-normal italic",
  body: "text-[32px] leading-[1.5] font-normal",
  "body-sm": "text-[28px] leading-[1.428571] font-normal",
  "body-xs": "text-[24px] leading-[1.333333] font-normal",
  code: "font-mono text-[28px] leading-[1.428571]",
  h1: "text-[72px] leading-[1.111111] font-bold tracking-tight",
  h2: "text-[60px] leading-[1.2] font-semibold tracking-tight",
  h3: "text-[48px] leading-[1.333333] font-semibold tracking-tight",
  h4: "text-[40px] leading-[1.4] font-semibold",
  h5: "text-[36px] leading-[1.555556] font-semibold",
  h6: "text-[32px] leading-[1.5] font-semibold",
  large: "text-[36px] leading-[1.555556] font-semibold",
  lead: "text-[40px] leading-[1.4] font-normal text-[color:var(--panel-muted-foreground)]",
  small: "text-[28px] font-medium leading-[1.25]",
} as const;

export const TYPOGRAPHY_ALIGN = {
  center: "text-center",
  end: "text-end",
  left: "text-left",
  right: "text-right",
  start: "text-start",
} as const;
export const TYPOGRAPHY_TRANSFORM = {
  capitalize: "capitalize",
  lowercase: "lowercase",
  uppercase: "uppercase",
} as const;
export const HEADING_LEVEL = {
  h1: 1,
  h2: 2,
  h3: 3,
  h4: 4,
  h5: 5,
  h6: 6,
} as const;
