import { View } from "@tarojs/components";
import { useContext } from "react";
import type { ComponentProps } from "react";

import { DirectionContext, deviceDirection } from "../../hooks/use-direction";
import type { DirectionValue } from "../../hooks/use-direction";
import { textChildren } from "../primitives/Text";

export { useDirection, useDirectionSign } from "../../hooks/use-direction";
export type { DirectionValue } from "../../hooks/use-direction";

export interface DirectionProps extends ComponentProps<typeof View> {
  dir?: DirectionValue;
}

export const Direction = ({
  dir,
  className,
  children,
  style,
  ...props
}: DirectionProps) => {
  const inherited = useContext(DirectionContext);
  const value = dir ?? inherited ?? deviceDirection();
  const directionStyle =
    typeof style === "string"
      ? `direction:${value};${style}`
      : { direction: value, ...style };
  return (
    <DirectionContext.Provider value={value}>
      <View {...props} className={className} style={directionStyle}>
        {textChildren(children)}
      </View>
    </DirectionContext.Provider>
  );
};
