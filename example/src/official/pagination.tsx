import { Pagination } from "panelui-taro/pagination";
import { Table } from "panelui-taro/table";
import { useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
const INVOICES = [
  { id: "INV-001", status: "Paid", method: "Card", amount: 250 },
  { id: "INV-002", status: "Pending", method: "Transfer", amount: 150 },
  { id: "INV-003", status: "Unpaid", method: "Card", amount: 350 },
  { id: "INV-004", status: "Paid", method: "Card", amount: 450 },
  { id: "INV-005", status: "Paid", method: "Transfer", amount: 550 },
];
const invoiceAmount = (value: number) => `$${value.toFixed(2)}`;
const INVOICE_COLUMNS = [{ flex: 2 }, {}, { align: "end" as const }];
function PaginatedTableDemo() {
  const [page, setPage] = useState(1);
  const pageSize = 2;
  const rows = INVOICES.slice((page - 1) * pageSize, page * pageSize);
  return (
    <View className="w-full gap-3">
      <Table variant="outline" columns={INVOICE_COLUMNS} className="w-full">
        <Table.Header>
          <Table.Row>
            <Table.Head>Invoice</Table.Head>
            <Table.Head>Method</Table.Head>
            <Table.Head>Amount</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((invoice) => (
            <Table.Row key={invoice.id}>
              <Table.Cell>{invoice.id}</Table.Cell>
              <Table.Cell>{invoice.method}</Table.Cell>
              <Table.Cell>{invoiceAmount(invoice.amount)}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>

      <Pagination
        count={Math.ceil(INVOICES.length / pageSize)}
        page={page}
        onPageChange={setPage}
        variant="compact"
        size="sm"
      >
        <Pagination.Status pageSize={pageSize} total={INVOICES.length} />
      </Pagination>
    </View>
  );
}
function PaginationDemo({
  count = 12,
  ...props
}: Partial<React.ComponentProps<typeof Pagination>>) {
  const [page, setPage] = useState(1);
  return (
    <Pagination count={count} page={page} onPageChange={setPage} {...props} />
  );
}
export const entry: ComponentEntry = {
  slug: "pagination",
  name: "Pagination",
  summary: "Moving through a result set one page at a time",
  demos: [
    { label: "Basic", render: () => <PaginationDemo /> },
    { label: "Compact", render: () => <PaginationDemo variant="compact" /> },
    { label: "Simple", render: () => <PaginationDemo variant="simple" /> },
    { label: "Small", render: () => <PaginationDemo size="sm" /> },
    {
      label: "A long set",
      render: () => <PaginationDemo count={240} />,
    },
    {
      label: "Wider run",
      render: () => (
        <PaginationDemo
          count={240}
          siblings={2}
          boundaries={1}
          size="sm"
          controls={false}
        />
      ),
    },
    {
      label: "Numbers only",
      render: () => <PaginationDemo controls={false} />,
    },
    {
      label: "With a status line",
      render: () => (
        <PaginationDemo count={12} variant="compact">
          <Pagination.Status pageSize={20} total={240} />
        </PaginationDemo>
      ),
    },
    { label: "Beside a table", render: () => <PaginatedTableDemo /> },
    {
      label: "Disabled",
      render: () => <PaginationDemo disabled />,
    },
  ],
};
