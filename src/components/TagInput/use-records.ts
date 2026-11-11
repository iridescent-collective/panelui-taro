import { useEffect, useLayoutEffect, useState } from "react";

export interface TagRecord {
  key: string;
  tag: string;
  index: number;
  expires: number | null;
}
const activeRecords = (tags: string[]): TagRecord[] =>
  tags.map((tag, index) => ({
    expires: null,
    index,
    key: `${tag}-${index}`,
    tag,
  }));
export const useTagRecords = (tags: string[], reduced: boolean) => {
  const [records, setRecords] = useState(() => activeRecords(tags));
  const key = JSON.stringify(tags);
  useLayoutEffect(() => {
    const next = activeRecords(JSON.parse(key) as string[]);
    setRecords((current) => {
      const retained = reduced
        ? []
        : current
            .filter(
              (record) => !next.some((active) => active.key === record.key)
            )
            .map((record) => ({
              ...record,
              expires: record.expires ?? Date.now() + 120,
            }));
      return [...next, ...retained];
    });
  }, [key, reduced]);
  useEffect(() => {
    const deadlines = records.flatMap((record) =>
      record.expires === null ? [] : [record.expires]
    );
    if (deadlines.length === 0) {
      return;
    }
    const timer = setTimeout(
      () =>
        setRecords((current) =>
          current.filter(
            (record) => record.expires === null || record.expires > Date.now()
          )
        ),
      Math.max(0, Math.min(...deadlines) - Date.now())
    );
    return () => clearTimeout(timer);
  }, [records]);
  return records;
};
