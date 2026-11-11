import { View } from "@tarojs/components";

import { RotateSquareIcon } from "../../icons";
import { Button } from "../Button";
import { useCropper } from "./context";
import type {
  AvatarCropperResetProps,
  AvatarCropperRotateProps,
} from "./types";

export const AvatarCropperRotate = ({
  direction = "clockwise",
  variant = "secondary",
  size = "icon",
  children,
  accessibilityLabel,
  ...props
}: AvatarCropperRotateProps) => {
  const { rotate } = useCropper("AvatarCropper.Rotate");
  const clockwise = direction === "clockwise";
  return (
    <Button
      {...props}
      variant={variant}
      size={size}
      accessibilityLabel={
        accessibilityLabel ??
        (clockwise ? "Rotate clockwise" : "Rotate counterclockwise")
      }
      onPress={() => rotate(clockwise ? 1 : -1)}
    >
      {children ?? (
        <View style={clockwise ? undefined : { transform: "scaleX(-1)" }}>
          <RotateSquareIcon size={20} />
        </View>
      )}
    </Button>
  );
};
AvatarCropperRotate.displayName = "AvatarCropper.Rotate";
export const AvatarCropperReset = ({
  variant = "ghost",
  size = "sm",
  children = "Reset",
  ...props
}: AvatarCropperResetProps) => {
  const { reset } = useCropper("AvatarCropper.Reset");
  return (
    <Button {...props} variant={variant} size={size} onPress={reset}>
      {children}
    </Button>
  );
};
AvatarCropperReset.displayName = "AvatarCropper.Reset";
