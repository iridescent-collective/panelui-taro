import { View } from "@tarojs/components";
import { forwardRef, useMemo } from "react";
import type { ComponentRef } from "react";

import { textChildren } from "../primitives/Text";
import { TableCell, TableHead, TableCaption, TableEmpty } from "./cells";
import { TableContext } from "./context";
import { TableFrame } from "./frame";
import { TableHeader, TableBody, TableFooter, TableRow } from "./rows";
import type { TableProps } from "./types";
import { tableVariants } from "./variants";

export type {
  TableSortDirection,
  TableColumn,
  TableProps,
  TableHeaderProps,
  TableBodyProps,
  TableFooterProps,
  TableRowProps,
  TableHeadProps,
  TableCellProps,
  TableCaptionProps,
  TableEmptyProps,
  TableFrameProps,
} from "./types";
const TableRoot = forwardRef<ComponentRef<typeof View>, TableProps>(
  (
    {
      className,
      variant,
      size = "default",
      striped = false,
      columns,
      children,
      ...props
    },
    ref
  ) => {
    const context = useMemo(
      () => ({ columns, size, striped }),
      [size, striped, columns]
    );
    return (
      <TableContext.Provider value={context}>
        <View
          {...props}
          ref={ref}
          role="table"
          aria-role="table"
          className={tableVariants({ size, variant }).root({
            className: `flex flex-col ${className ?? ""}`,
          })}
        >
          {textChildren(children)}
        </View>
      </TableContext.Provider>
    );
  }
);
export const Table = Object.assign(TableRoot, {
  Body: TableBody,
  Caption: TableCaption,
  Cell: TableCell,
  Empty: TableEmpty,
  Footer: TableFooter,
  Frame: TableFrame,
  Head: TableHead,
  Header: TableHeader,
  Row: TableRow,
});
