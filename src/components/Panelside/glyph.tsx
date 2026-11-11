import { useIconColor } from "../../icons/context";
import { Drawing } from "../../icons/Drawing";
import type { IconGlyph } from "../../icons/types";
import { GLYPH_STROKE, GLYPH_FALLBACK } from "./constants";

export const Glyph = ({
  icon,
  size = 20,
  color,
}: {
  icon: IconGlyph;
  size?: number;
  color?: string;
}) => {
  const inherited = useIconColor();
  return (
    <Drawing
      glyph={icon}
      size={size}
      color={color ?? inherited ?? GLYPH_FALLBACK}
      strokeWidth={GLYPH_STROKE}
    />
  );
};

export { default as Menu01Icon } from "@hugeicons/core-free-icons/Menu01Icon";
export { default as MoreHorizontalIcon } from "@hugeicons/core-free-icons/MoreHorizontalIcon";
export { default as Search01Icon } from "@hugeicons/core-free-icons/Search01Icon";
