import type { ScrollView, Text, View } from "@tarojs/components";
import type { ComponentRef } from "react";

import type { InputHandle } from "../components/Input/types";

/** The Taro host instance forwarded by View-rooted components. */
export type ViewRef = ComponentRef<typeof View>;
/** The Taro host instance forwarded by the Text primitive. */
export type TextRef = ComponentRef<typeof Text>;
/** The existing Input/Textarea imperative adapter, not a native RN TextInput. */
export type TextInputRef = InputHandle;
/** The Taro ScrollView host instance; use scroll props or Taro APIs to scroll. */
export type ScrollViewRef = ComponentRef<typeof ScrollView>;
