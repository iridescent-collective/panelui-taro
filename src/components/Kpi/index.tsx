import { KpiProgressBar, KpiSparkline } from "./chart";
import { KpiGroup } from "./group";
import { KpiRoot } from "./root";
import {
  KpiActions,
  KpiContent,
  KpiFooter,
  KpiHeader,
  KpiIcon,
  KpiSeparator,
  KpiStat,
  KpiTitle,
  KpiValue,
} from "./structure";
import { KpiTrend } from "./trend";

export type {
  KpiTone,
  KpiGoodDirection,
  KpiProps,
  KpiHeaderProps,
  KpiIconProps,
  KpiTitleProps,
  KpiStatProps,
  KpiActionsProps,
  KpiContentProps,
  KpiValueProps,
  KpiTrendProps,
  KpiSparklineProps,
  KpiProgressProps,
  KpiFooterProps,
  KpiSeparatorProps,
  KpiGroupOrientation,
  KpiGroupProps,
} from "./types";
export const Kpi = Object.assign(KpiRoot, {
  Actions: KpiActions,
  Chart: KpiSparkline,
  Content: KpiContent,
  Footer: KpiFooter,
  Group: KpiGroup,
  Header: KpiHeader,
  Icon: KpiIcon,
  Progress: KpiProgressBar,
  Separator: KpiSeparator,
  Stat: KpiStat,
  Title: KpiTitle,
  Trend: KpiTrend,
  Value: KpiValue,
});
