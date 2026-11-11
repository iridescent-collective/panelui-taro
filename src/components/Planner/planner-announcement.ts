import { useCallback, useEffect, useRef } from "react";

interface PlannerMonthAnnouncementOptions {
  monthKey: number;
  monthLabel: string;
  announce: (label: string) => void;
}
export const usePlannerMonthAnnouncement = ({
  monthKey,
  monthLabel,
  announce,
}: PlannerMonthAnnouncementOptions): ((month: Date) => void) => {
  const pendingMonth = useRef<number | null>(null);
  const expectMonth = useCallback((month: Date) => {
    pendingMonth.current = month.getTime();
  }, []);
  useEffect(() => {
    const expected = pendingMonth.current;
    if (expected === null) {
      return;
    }
    pendingMonth.current = null;
    if (expected === monthKey) {
      announce(monthLabel);
    }
  });
  return expectMonth;
};
