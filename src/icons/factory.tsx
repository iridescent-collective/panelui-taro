import { useDirection } from "../hooks/use-direction";
import { useResolvedIconColor } from "./context";
import { Drawing } from "./Drawing";
import type { IconDefaults, IconGlyph, ToggleIconProps } from "./types";

export const createIcon = (glyph: IconGlyph, defaults: IconDefaults) => {
  const Icon = ({
    size = defaults.size,
    color,
    strokeWidth = defaults.strokeWidth ?? 2,
    filled,
    fill,
    ...props
  }: ToggleIconProps) => {
    const resolved = useResolvedIconColor(color, defaults.color);
    const dir = useDirection();
    const resolvedFill =
      defaults.fillable && filled ? resolved : (fill ?? "none");
    return (
      <Drawing
        {...props}
        glyph={glyph}
        color={resolved}
        strokeWidth={strokeWidth}
        size={size}
        fill={resolvedFill}
        mirrorable={defaults.flip}
        flip={Boolean(defaults.flip && dir === "rtl")}
      />
    );
  };
  return Icon;
};
