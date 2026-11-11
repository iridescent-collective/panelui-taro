import { ScrollView, View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef, ReactNode } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useTimingNumber } from "../../hooks/use-timing-number";
import { ImageIcon, PlusIcon, RotateCcwIcon, XIcon } from "../../icons";
import { withColorAlpha } from "../../lib/color";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { CanvasGraphics } from "../../primitives/canvas-graphics";
import { Circle } from "../../primitives/static-svg";
import { useThemeToken } from "../../theme/use-theme";
import { ImageViewer } from "../ImageViewer";
import { Text } from "../primitives/Text";
import { SourceChooser } from "./chooser";
import { useFileUpload } from "./context";
import { isActive } from "./core";
import { describeFileStatus, KindIcon } from "./rows";
import type { FileUploadFile, FileUploadGridProps } from "./types";

const tileStyle = (size: number, radius: number) => ({
  borderRadius: `${radius * 2}rpx`,
  height: `${size * 2}rpx`,
  width: `${size * 2}rpx`,
});

const ProgressRing = ({ progress }: { progress: number }) => {
  const radius = 16.5;
  const circumference = 2 * Math.PI * radius;
  const target = Number.isFinite(progress)
    ? Math.max(0, Math.min(1, progress))
    : 0;
  const safe = useTimingNumber(target, 180, usePanelReducedMotion());
  return (
    <View className="-rotate-90">
      <CanvasGraphics width={36} height={36} viewBox="0 0 36 36">
        <Circle
          cx={18}
          cy={18}
          r={radius}
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={3}
          fill="none"
        />
        <Circle
          cx={18}
          cy={18}
          r={radius}
          stroke="#fff"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - safe)}
          fill="none"
        />
      </CanvasGraphics>
    </View>
  );
};

const TileState = ({
  file,
  radius,
}: {
  file: FileUploadFile;
  radius: number;
}) => {
  const { retry, disabled, hasUpload } = useFileUpload();
  const moving = isActive(file.status) || file.status === "queued";
  const failed = file.status === "error" || file.status === "canceled";
  if (!moving && !failed) {
    return null;
  }
  let state: ReactNode = null;
  if (file.status === "uploading") {
    state = <ProgressRing progress={file.progress ?? 0} />;
  } else if (file.status === "queued" || file.status === "processing") {
    state = (
      <Text className="text-[24px] font-medium text-white">
        {file.status === "queued" ? "Waiting" : "Processing"}
      </Text>
    );
  } else if (hasUpload) {
    state = (
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={`Retry ${file.name}`}
        style={{ pointerEvents: "auto" }}
        disabled={disabled}
        onPress={() => retry(file.id)}
        hoverClass="panelui-upload-retry-pressed"
        className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white/20"
      >
        <RotateCcwIcon size={18} color="#fff" />
      </AnimatedPressable>
    );
  }
  return (
    <View
      style={{ borderRadius: `${radius * 2}rpx`, pointerEvents: "none" }}
      className="absolute inset-0 flex items-center justify-center bg-black/45"
    >
      {state}
    </View>
  );
};

const TilePreview = ({
  file,
  radius,
  moving,
}: {
  file: FileUploadFile;
  radius: number;
  moving: boolean;
}) => {
  const muted = useThemeToken("muted-foreground");
  const corner = { borderRadius: `${radius * 2}rpx` };
  if (file.kind === "image") {
    return (
      <View
        style={corner}
        className="h-full w-full overflow-hidden bg-[var(--panel-muted)]"
      >
        <ImageViewer.Trigger
          source={{ uri: file.uri }}
          width={file.width}
          height={file.height}
          alt={file.name}
          radius={radius}
          disabled={moving}
          className="h-full w-full"
        />
      </View>
    );
  }
  return (
    <View
      style={corner}
      className="flex h-full w-full flex-col items-center justify-center gap-[12px] border border-[var(--panel-border)] bg-[var(--panel-muted)] px-[16px]"
    >
      <KindIcon kind={file.kind} size={22} color={muted} />
      <Text
        numberOfLines={1}
        className="text-[24px] text-[var(--panel-muted-foreground)]"
      >
        {file.name}
      </Text>
    </View>
  );
};

const GridTile = ({
  file,
  size,
  cover,
  radius,
}: {
  file: FileUploadFile;
  size: number;
  cover: boolean;
  radius: number;
}) => {
  const { remove, cancel, disabled } = useFileUpload();
  const foreground = useThemeToken("foreground");
  const background = useThemeToken("background");
  const moving = isActive(file.status) || file.status === "queued";
  const dismiss = () => {
    if (moving) {
      cancel(file.id);
    } else {
      remove(file.id);
    }
  };
  return (
    <View
      style={tileStyle(size, radius)}
      className={cn("relative shrink-0", disabled && "opacity-50")}
      aria-label={`${file.name}, ${describeFileStatus(file)}`}
    >
      <TilePreview file={file} radius={radius} moving={moving} />
      <TileState file={file} radius={radius} />
      {cover && (
        <View
          className="absolute bottom-[12px] left-[12px] rounded-full px-[16px] py-[4px]"
          style={{ backgroundColor: withColorAlpha(background, 0.9) }}
        >
          <Text className="text-[22px] font-semibold text-[var(--panel-foreground)]">
            Cover
          </Text>
        </View>
      )}
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={
          moving ? `Cancel upload of ${file.name}` : `Remove ${file.name}`
        }
        disabled={disabled}
        hitSlop={8}
        onPress={dismiss}
        hoverClass="panelui-upload-muted-pressed"
        className="absolute top-[12px] right-[12px] flex h-[48px] w-[48px] items-center justify-center rounded-full border border-[var(--panel-border)] bg-[var(--panel-background)]"
      >
        <XIcon size={12} color={foreground} strokeWidth={2.5} />
      </AnimatedPressable>
    </View>
  );
};

const AddTile = ({
  size,
  radius,
  label,
}: {
  size: number;
  radius: number;
  label: string;
}) => {
  const { files, maxFiles, multiple } = useFileUpload();
  const background = useThemeToken("background");
  const accessibilityLabel =
    maxFiles === undefined ? label : `${label}, ${files.length} of ${maxFiles}`;
  return (
    <SourceChooser>
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={{
          ...tileStyle(size, radius),
        }}
        hoverClass="panelui-upload-muted-pressed"
        className="flex shrink-0 flex-col items-center justify-center gap-[8px] border-[4px] border-dashed border-[var(--panel-border)] bg-[var(--panel-muted-opacity-40)]"
      >
        <View className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[var(--panel-foreground)]">
          <PlusIcon size={16} strokeWidth={2.5} color={background} />
        </View>
        {size >= 84 && (
          <Text
            numberOfLines={1}
            className="text-[24px] font-medium text-[var(--panel-foreground)]"
          >
            {label}
          </Text>
        )}
        {maxFiles !== undefined && multiple && (
          <Text className="text-[22px] text-[var(--panel-muted-foreground)]">
            {files.length}/{maxFiles}
          </Text>
        )}
      </AnimatedPressable>
    </SourceChooser>
  );
};

const EmptyTile = ({ size, radius }: { size: number; radius: number }) => {
  const muted = useThemeToken("muted-foreground");
  return (
    <View
      aria-hidden
      style={tileStyle(size, radius)}
      className="flex shrink-0 items-center justify-center border border-dashed border-[var(--panel-border)]"
    >
      <View className="opacity-50">
        <ImageIcon size={18} color={muted} />
      </View>
    </View>
  );
};

const useGridLayout = ({
  horizontal,
  tileSize,
  columns,
  gap,
  hideAdd,
  placeholders,
  addLabel,
  id,
}: Required<
  Pick<
    FileUploadGridProps,
    "horizontal" | "tileSize" | "columns" | "gap" | "hideAdd" | "placeholders"
  >
> &
  Pick<FileUploadGridProps, "addLabel" | "id">) => {
  const { files, maxFiles, multiple, canAddMore } = useFileUpload();
  const measured = useElementLayout(!horizontal, files.length, id, false);
  const count = Math.max(1, Math.floor(Number.isFinite(columns) ? columns : 3));
  let size = 0;
  if (horizontal) {
    size = tileSize;
  } else if (measured.layout) {
    size = Math.max(
      0,
      Math.floor((measured.layout.width - gap * (count - 1)) / count)
    );
  }
  const showAdd = !hideAdd && canAddMore;
  const slotCount =
    placeholders && maxFiles !== undefined
      ? Math.max(0, maxFiles - files.length - (showAdd ? 1 : 0))
      : 0;
  const filled = files.length + (showAdd ? 1 : 0);
  const rowRemainder = filled % count === 0 ? 0 : count - (filled % count);
  return {
    files,
    id: measured.id,
    label: addLabel ?? (multiple ? "Add photos" : "Add photo"),
    showAdd,
    size,
    visibleSlots: horizontal ? slotCount : Math.min(slotCount, rowRemainder),
  };
};

export const FileUploadGrid = forwardRef<
  ComponentRef<typeof View>,
  FileUploadGridProps
>(
  (
    {
      className,
      columns = 3,
      horizontal = false,
      tileSize = 88,
      gap = 8,
      radius = 12,
      cover = false,
      placeholders = false,
      addLabel,
      hideAdd = false,
      id,
      ...props
    },
    ref
  ) => {
    const model = useGridLayout({
      addLabel,
      columns,
      gap,
      hideAdd,
      horizontal,
      id,
      placeholders,
      tileSize,
    });
    const body = (
      <View
        className={cn("flex flex-row", !horizontal && "flex-wrap")}
        style={{ gap: `${gap * 2}rpx` }}
      >
        {model.size > 0 && (
          <>
            {model.showAdd && (
              <AddTile size={model.size} radius={radius} label={model.label} />
            )}
            {model.files.map((file, index) => (
              <GridTile
                key={file.id}
                file={file}
                size={model.size}
                cover={cover && index === 0}
                radius={radius}
              />
            ))}
            {Array.from({ length: model.visibleSlots }, (_, index) => (
              <EmptyTile
                key={`slot-${index}`}
                size={model.size}
                radius={radius}
              />
            ))}
          </>
        )}
      </View>
    );
    return (
      <View {...props} id={model.id} ref={ref} className={className}>
        <ImageViewer>
          {horizontal ? (
            <ScrollView scrollX showScrollbar={false}>
              {body}
            </ScrollView>
          ) : (
            body
          )}
        </ImageViewer>
      </View>
    );
  }
);
