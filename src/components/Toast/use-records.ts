import { useEffect, useRef, useState } from "react";

import type { ToastItem } from "./toast-store";

export interface ToastRecord {
  item: ToastItem;
  departing: boolean;
  index: number;
  total: number;
  frontId: string;
  removedAt?: number;
}
export const useToastRecords = (
  items: readonly ToastItem[],
  reduced: boolean
) => {
  const [records, setRecords] = useState<ToastRecord[]>([]);
  const latest = useRef(records);
  latest.current = records;
  const duration = reduced ? 120 : 240;
  useEffect(() => {
    const now = Date.now();
    const visible = items.slice(-4);
    const frontId = visible.at(-1)?.id ?? "";
    const ids = new Set(visible.map((item) => item.id));
    const leaving = latest.current
      .filter(
        (record) =>
          !ids.has(record.item.id) && (record.removedAt ?? now) + duration > now
      )
      .map((record) => ({
        ...record,
        departing: true,
        removedAt: record.removedAt ?? now,
      }));
    const next = [
      ...leaving,
      ...visible.map((item, index) => ({
        departing: false,
        frontId,
        index,
        item,
        total: visible.length,
      })),
    ];
    latest.current = next;
    setRecords(next);
  }, [items, duration]);
  useEffect(() => {
    const deadlines = records.flatMap((record) =>
      record.removedAt === undefined ? [] : [record.removedAt + duration]
    );
    if (deadlines.length === 0) {
      return;
    }
    const timer = setTimeout(
      () => {
        setRecords((current) =>
          current.filter(
            (record) =>
              record.removedAt === undefined ||
              record.removedAt + duration > Date.now()
          )
        );
      },
      Math.max(0, Math.min(...deadlines) - Date.now())
    );
    return () => clearTimeout(timer);
  }, [records, duration]);
  return records;
};
