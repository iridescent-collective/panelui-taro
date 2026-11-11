import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { Text } from "../primitives/Text";
import { STATUS_STYLE } from "./constants";
import type { SupportTicketProps } from "./types";
import { supportVariants } from "./variants";

export const SupportTicket = forwardRef<
  ComponentRef<typeof View>,
  SupportTicketProps
>(({ className, reference, subject, status = "open", ...props }, ref) => {
  const { ticket, badge } = supportVariants();
  const tone = STATUS_STYLE[status];
  return (
    <View
      ref={ref}
      aria-label={[subject, reference, tone.label].filter(Boolean).join(", ")}
      className={ticket({ className })}
      {...props}
    >
      <View className="flex shrink grow flex-col gap-[4px]">
        {subject ? (
          <Text size="xs" weight="medium" numberOfLines={1}>
            {subject}
          </Text>
        ) : null}
        {reference ? (
          <Text size="xs" muted numberOfLines={1}>
            {reference}
          </Text>
        ) : null}
      </View>
      <View className={badge({ className: tone.className })}>
        <Text size="xs" weight="medium" className={tone.textClassName}>
          {tone.label}
        </Text>
      </View>
    </View>
  );
});
SupportTicket.displayName = "Support.Ticket";
