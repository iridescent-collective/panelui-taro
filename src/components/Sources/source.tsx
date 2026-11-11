import { useMemo } from "react";

import { LinkIcon } from "../../icons";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Text } from "../primitives/Text";
import type { SourcesSourceProps } from "./types";
import { sourcesVariants } from "./variants";

const HOST_PATTERN = /^[a-z][a-z0-9+.-]*:\/\/[^/?#]+/iu;
const WWW_PATTERN = /^www\./iu;
const HTTP_PATTERN = /^https?:\/\/[^\s/]+(?:[/?#]|$)/iu;
export const sourceHost = (href?: string) => {
  const authority = href?.match(HOST_PATTERN)?.[0];
  return authority
    ?.slice(authority.indexOf("://") + 3)
    .replace(WWW_PATTERN, "");
};
export const SourcesSource = ({
  className,
  href,
  title,
  icon,
  children,
  onPress,
  onClick,
  onLinkPress,
  ...props
}: SourcesSourceProps) => {
  const { source, sourceTitle, sourceHost: hostClass } = sourcesVariants();
  const host = useMemo(() => sourceHost(href), [href]);
  return (
    <AnimatedPressable
      {...props}
      accessibilityRole="link"
      accessibilityLabel={title ?? host ?? href}
      className={cn(source(), className)}
      onClick={(event) => {
        (onClick ?? onPress)?.(event);
        if (href && HTTP_PATTERN.test(href)) {
          onLinkPress?.(href);
        }
      }}
    >
      {children ?? (
        <>
          {icon ?? <LinkIcon size={14} />}
          <Text numberOfLines={1} className={sourceTitle()}>
            {title ?? host ?? href}
          </Text>
          {title && host ? (
            <Text numberOfLines={1} className={hostClass()}>
              {host}
            </Text>
          ) : null}
        </>
      )}
    </AnimatedPressable>
  );
};
