import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useMemo,
} from "react";
import type { ReactNode, CSSProperties } from "react";

import { textChildren } from "../primitives/Text";
import type { TableColumn, TableSize, TableSection } from "./types";

export const TableContext = createContext<{
  size: TableSize;
  striped: boolean;
  columns?: TableColumn[];
}>({ size: "default", striped: false });
const TableColumnContext = createContext(-1);
export const TableRowContext = createContext<{
  section: TableSection;
  index: number;
  last: boolean;
}>({ index: 0, last: false, section: "body" });
export const useColumn = (
  own: TableColumn
): Required<Pick<TableColumn, "align">> & TableColumn => {
  const { columns } = useContext(TableContext);
  const index = useContext(TableColumnContext);
  const column = index >= 0 ? columns?.[index] : undefined;
  return {
    align: own.align ?? column?.align ?? "start",
    flex: own.flex ?? column?.flex,
    width: own.width ?? column?.width,
  };
};
export const useRowCells = (children: ReactNode, enabled: boolean): ReactNode =>
  useMemo(() => {
    const cells = textChildren(children);
    return enabled
      ? Children.map(cells, (child, index) =>
          isValidElement(child) ? (
            <TableColumnContext.Provider value={index}>
              {child}
            </TableColumnContext.Provider>
          ) : (
            child
          )
        )
      : cells;
  }, [children, enabled]);
export const useSectionRows = (
  children: ReactNode,
  section: TableSection
): ReactNode =>
  useMemo(() => {
    const rows = Children.toArray(children).filter((child) =>
      isValidElement(child)
    );
    return rows.map((child, index) => (
      <TableRowContext.Provider
        key={isValidElement(child) ? (child.key ?? index) : index}
        value={{ index, last: index === rows.length - 1, section }}
      >
        {child}
      </TableRowContext.Provider>
    ));
  }, [children, section]);
export const columnStyle = ({ flex, width }: TableColumn): CSSProperties =>
  width === undefined
    ? { flex: flex ?? 1, minWidth: 0 }
    : { flexGrow: 0, flexShrink: 0, width: `${width * 2}rpx` };
export const alignment = {
  center: "justify-center",
  end: "justify-end",
  start: "justify-start",
};
