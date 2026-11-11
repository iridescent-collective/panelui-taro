import { BRAND_GLYPHS } from "./brand-data";
import { useResolvedIconColor } from "./context";
import { Drawing } from "./Drawing";
import type { BadgeCheckIconProps, IconProps } from "./types";

export const GoogleIcon = ({
  size = 18,
  ...props
}: Omit<IconProps, "color">) => (
  <Drawing
    {...props}
    glyph={BRAND_GLYPHS.GoogleIcon}
    color="none"
    strokeWidth={0}
    size={size}
  />
);
export const FacebookIcon = ({
  size = 18,
  ...props
}: Omit<IconProps, "color">) => (
  <Drawing
    {...props}
    glyph={BRAND_GLYPHS.FacebookIcon}
    color="none"
    strokeWidth={0}
    size={size}
  />
);
export const AppleIcon = ({ size = 18, color, ...props }: IconProps) => {
  const resolved = useResolvedIconColor(color, "#000000");
  return (
    <Drawing
      {...props}
      glyph={BRAND_GLYPHS.AppleIcon}
      color={resolved}
      strokeWidth={0}
      size={size}
    />
  );
};
export const BadgeCheckIcon = ({
  size = 16,
  color,
  checkColor = "#ffffff",
  ...props
}: BadgeCheckIconProps) => {
  const resolved = useResolvedIconColor(color, "#737373");
  const glyph = BRAND_GLYPHS.BadgeCheckIcon.map(
    ([tag, attrs]) =>
      [
        tag,
        {
          ...attrs,
          fill: "fill" in attrs ? resolved : "none",
          stroke: "stroke" in attrs ? checkColor : "none",
        },
      ] as const
  );
  return (
    <Drawing
      {...props}
      glyph={glyph}
      color={resolved}
      strokeWidth={2.5}
      size={size}
    />
  );
};
