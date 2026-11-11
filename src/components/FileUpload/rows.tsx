import { Image, ScrollView, View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import {
  CheckCircleIcon,
  FileIcon,
  ImageIcon,
  RotateCcwIcon,
  TrashIcon,
  VideoIcon,
  XIcon,
} from "../../icons";
import { cn } from "../../lib/utils";
import { useThemeToken } from "../../theme/use-theme";
import { Attachment } from "../Attachment";
import type { AttachmentState } from "../Attachment";
import { useFileUpload } from "./context";
import { extensionOf, formatFileSize, isActive, truncateMiddle } from "./core";
import type {
  FileUploadFile,
  FileUploadItemProps,
  FileUploadKind,
  FileUploadListProps,
  FileUploadStatus,
} from "./types";

const ATTACHMENT_STATE: Record<FileUploadStatus, AttachmentState> = {
  canceled: "idle",
  done: "done",
  error: "error",
  idle: "idle",
  processing: "processing",
  queued: "idle",
  uploading: "uploading",
};
export const describeFileStatus = (file: FileUploadFile): string => {
  const ext = extensionOf(file.name).toUpperCase();
  const size = file.size === undefined ? "" : formatFileSize(file.size);
  const percent = `${Math.round((file.progress ?? 0) * 100)}%`;
  switch (file.status) {
    case "queued": {
      return ["Waiting", size].filter(Boolean).join(" · ");
    }
    case "uploading": {
      return file.size === undefined
        ? `Uploading · ${percent}`
        : `${formatFileSize(file.size * (file.progress ?? 0))} of ${size} · ${percent}`;
    }
    case "processing": {
      return "Processing…";
    }
    case "done": {
      return [size, "Uploaded"].filter(Boolean).join(" · ");
    }
    case "error": {
      return file.error ?? "Upload failed";
    }
    case "canceled": {
      return ["Canceled", size].filter(Boolean).join(" · ");
    }
    default: {
      return [ext, size].filter(Boolean).join(" · ");
    }
  }
};
export const KindIcon = ({
  kind,
  size = 18,
  color,
}: {
  kind: FileUploadKind;
  size?: number;
  color?: string;
}) => {
  const icons = { document: FileIcon, image: ImageIcon, video: VideoIcon };
  const Icon = icons[kind];
  return <Icon size={size} color={color} />;
};
export const FileUploadItem = ({
  file,
  className,
  size = "default",
  nameLength = 36,
}: FileUploadItemProps) => {
  const { remove, cancel, retry, disabled, hasUpload } = useFileUpload();
  const muted = useThemeToken("muted-foreground");
  const success = useThemeToken("success");
  const moving = isActive(file.status) || file.status === "queued";
  const failed = file.status === "error" || file.status === "canceled";
  const status = describeFileStatus(file);
  return (
    <Attachment
      state={ATTACHMENT_STATE[file.status]}
      progress={file.status === "uploading" ? (file.progress ?? 0) : undefined}
      size={size}
      disabled={disabled}
      accessibilityLabel={`${file.name}, ${status}`}
      className={className}
    >
      {file.kind === "image" ? (
        <Attachment.Media variant="image">
          <Image src={file.uri} mode="aspectFill" className="h-full w-full" />
        </Attachment.Media>
      ) : (
        <Attachment.Media variant="icon">
          <KindIcon
            kind={file.kind}
            color={muted}
            size={size === "sm" ? 16 : 18}
          />
        </Attachment.Media>
      )}
      <Attachment.Content>
        <Attachment.Title numberOfLines={1}>
          {truncateMiddle(file.name, nameLength)}
        </Attachment.Title>
        <Attachment.Description numberOfLines={file.status === "error" ? 2 : 1}>
          {status}
        </Attachment.Description>
      </Attachment.Content>
      <Attachment.Actions>
        {file.status === "done" ? (
          <View aria-hidden>
            <CheckCircleIcon size={18} color={success} />
          </View>
        ) : null}
        {failed && hasUpload ? (
          <Attachment.Action
            accessibilityLabel={`Retry ${file.name}`}
            disabled={disabled}
            onPress={() => retry(file.id)}
          >
            <RotateCcwIcon size={16} color={muted} />
          </Attachment.Action>
        ) : null}
        <Attachment.Action
          accessibilityLabel={
            moving ? `Cancel upload of ${file.name}` : `Remove ${file.name}`
          }
          disabled={disabled}
          onPress={() => (moving ? cancel(file.id) : remove(file.id))}
        >
          {moving ? (
            <XIcon size={16} color={muted} />
          ) : (
            <TrashIcon size={16} color={muted} />
          )}
        </Attachment.Action>
      </Attachment.Actions>
    </Attachment>
  );
};
export const FileUploadList = forwardRef<
  ComponentRef<typeof View>,
  FileUploadListProps
>(
  (
    { className, horizontal = false, size, renderItem, empty, ...props },
    ref
  ) => {
    const { files } = useFileUpload();
    if (files.length === 0) {
      return empty ? <>{empty}</> : null;
    }
    const rows = files.map((file) =>
      renderItem ? (
        <View key={file.id}>{renderItem(file)}</View>
      ) : (
        <FileUploadItem
          key={file.id}
          file={file}
          size={size}
          className={horizontal ? "w-[576px] shrink-0" : undefined}
          nameLength={horizontal ? 16 : undefined}
        />
      )
    );
    return (
      <View
        {...props}
        ref={ref}
        aria-role={horizontal ? undefined : "list"}
        className={cn(!horizontal && "flex flex-col gap-[16px]", className)}
      >
        {horizontal ? (
          <ScrollView scrollX showScrollbar={false}>
            <View className="flex flex-row gap-[16px]">{rows}</View>
          </ScrollView>
        ) : (
          rows
        )}
      </View>
    );
  }
);
