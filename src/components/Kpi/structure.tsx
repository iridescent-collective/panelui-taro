import { View } from "@tarojs/components";
import { useContext } from "react";

import { cn } from "../../lib/utils";
import { Text } from "../primitives/Text";
import { KpiHeaderContext, KpiStatContext } from "./context";
import type {
  KpiActionsProps,
  KpiContentProps,
  KpiFooterProps,
  KpiHeaderProps,
  KpiIconProps,
  KpiSeparatorProps,
  KpiStatProps,
  KpiTitleProps,
  KpiValueProps,
} from "./types";
import { kpiVariants } from "./variants";

export const KpiHeader = ({
  className,
  children,
  ...props
}: KpiHeaderProps) => (
  <KpiHeaderContext.Provider value>
    <View className={kpiVariants().header({ className })} {...props}>
      {children}
    </View>
  </KpiHeaderContext.Provider>
);
export const KpiIcon = ({
  className,
  tone = "neutral",
  children,
  ...props
}: KpiIconProps) => (
  <View className={kpiVariants({ tone }).icon({ className })} {...props}>
    {children}
  </View>
);
export const KpiTitle = ({ className, children }: KpiTitleProps) => {
  const inHeader = useContext(KpiHeaderContext);
  return (
    <Text
      className={kpiVariants().title({
        className: cn(inHeader && "flex-1", className),
      })}
      numberOfLines={1}
    >
      {children}
    </Text>
  );
};
export const KpiStat = ({ className, children, ...props }: KpiStatProps) => (
  <KpiStatContext.Provider value>
    <View className={kpiVariants().stat({ className })} {...props}>
      {children}
    </View>
  </KpiStatContext.Provider>
);
export const KpiActions = ({
  className,
  children,
  ...props
}: KpiActionsProps) => (
  <View
    className={cn("flex flex-row items-center gap-[8px]", className)}
    {...props}
  >
    {children}
  </View>
);
export const KpiContent = ({
  className,
  layout = "below",
  children,
  ...props
}: KpiContentProps) => (
  <View className={kpiVariants({ layout }).content({ className })} {...props}>
    {children}
  </View>
);
export const KpiValue = ({ className, children }: KpiValueProps) => (
  <Text className={kpiVariants().value({ className })} numberOfLines={1}>
    {children}
  </Text>
);
export const KpiFooter = ({
  className,
  children,
  ...props
}: KpiFooterProps) => (
  <View className={kpiVariants().footer({ className })} {...props}>
    {children}
  </View>
);
export const KpiSeparator = ({ className, ...props }: KpiSeparatorProps) => (
  <View className={kpiVariants().separator({ className })} {...props} />
);
