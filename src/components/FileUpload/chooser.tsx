import { Children, cloneElement, useEffect, useRef } from "react";
import type { ReactElement } from "react";

import { CameraIcon, FolderIcon, ImageIcon } from "../../icons";
import type { AnimatedPressableProps } from "../../primitives/animated-pressable";
import { useThemeToken } from "../../theme/use-theme";
import { Menu } from "../Menu";
import { useFileUpload } from "./context";
import type { FileUploadTriggerProps } from "./types";

const SOURCE_ICONS = {
  camera: CameraIcon,
  files: FolderIcon,
  library: ImageIcon,
};
export const SourceChooser = ({
  children,
}: {
  children: ReactElement<AnimatedPressableProps>;
}) => {
  const { sources, sourceLabels, pick, canAddMore } = useFileUpload();
  const color = useThemeToken("foreground");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>();
  useEffect(() => () => clearTimeout(timer.current), []);
  if (sources.length <= 1) {
    const [source] = sources;
    const press: AnimatedPressableProps["onClick"] = (event) => {
      (children.props.onClick ?? children.props.onPress)?.(event);
      if (source && canAddMore) {
        void pick(source);
      }
    };
    return cloneElement(children, { onClick: press, onPress: press });
  }
  if (!canAddMore) {
    return children;
  }
  return (
    <Menu presentation="bottom-sheet">
      <Menu.Trigger>{children}</Menu.Trigger>
      <Menu.Content>
        {sources.map((source) => {
          const Icon = SOURCE_ICONS[source];
          return (
            <Menu.Item
              key={source}
              icon={<Icon color={color} size={18} />}
              onSelect={() => {
                clearTimeout(timer.current);
                timer.current = setTimeout(() => {
                  void pick(source);
                }, 320);
              }}
            >
              {sourceLabels[source]}
            </Menu.Item>
          );
        })}
      </Menu.Content>
    </Menu>
  );
};
export const FileUploadTrigger = ({ children }: FileUploadTriggerProps) => {
  const { disabled, canAddMore } = useFileUpload();
  const child = Children.only(children) as ReactElement<AnimatedPressableProps>;
  return (
    <SourceChooser>
      {disabled || !canAddMore
        ? cloneElement(child, { disabled: true })
        : child}
    </SourceChooser>
  );
};
