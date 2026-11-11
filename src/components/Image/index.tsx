import { Image as NativeImage, View } from "@tarojs/components";
import { useState } from "react";
import type { ReactNode } from "react";

import { cn } from "../../lib/utils";
import { Button } from "../Button";
import { Skeleton } from "../Skeleton";
import { Typography } from "../Typography";
import type { ImageProps } from "./types";

export type { ImageProps } from "./types";

const ImageContent = ({
  source,
  containerClassName,
  placeholder,
  errorLabel = "图片加载失败",
  retryLabel = "重试",
  renderFallback,
  onRetry,
  onLoad,
  onError,
  ...props
}: ImageProps) => {
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [revision, setRevision] = useState(0);
  const retry = () => {
    setPhase("loading");
    setRevision((value) => value + 1);
    onRetry?.();
  };
  let content: ReactNode;
  if (phase === "error") {
    content = renderFallback ? (
      renderFallback(retry)
    ) : (
      <View className="flex flex-col items-center gap-[16px] py-[24px]">
        <Typography muted>{errorLabel}</Typography>
        <Button variant="outline" size="sm" onClick={retry}>
          {retryLabel}
        </Button>
      </View>
    );
  } else {
    content = (
      <>
        {phase === "loading"
          ? (placeholder ?? <Skeleton className="h-[160px] w-full" />)
          : null}
        <NativeImage
          {...props}
          key={revision}
          src={source}
          onLoad={(event) => {
            setPhase("ready");
            onLoad?.(event);
          }}
          onError={(event) => {
            setPhase("error");
            onError?.(event);
          }}
        />
      </>
    );
  }
  return (
    <View
      className={cn("relative min-w-0", containerClassName)}
      aria-busy={phase === "loading"}
    >
      {content}
    </View>
  );
};

export const Image = (props: ImageProps) => (
  <ImageContent key={props.source} {...props} />
);
