import { Badge } from "panelui-taro/badge";
import { Frame } from "panelui-taro/frame";
import { Pagination } from "panelui-taro/pagination";
import { Text } from "panelui-taro/primitives/text";
import { ScrollFade } from "panelui-taro/scroll-fade";
import { Table } from "panelui-taro/table";
import { useMemo, useState } from "react";

import { ScrollView, View } from "../runtime/native";
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
function ColumnsTableDemo() {
  return (
    <Table variant="outline" columns={INVOICE_COLUMNS} className="w-full">
      <Table.Header>
        <Table.Row>
          <Table.Head>Invoice</Table.Head>
          <Table.Head>Method</Table.Head>
          <Table.Head>Amount</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {INVOICES.map((invoice) => (
          <Table.Row key={invoice.id}>
            <Table.Cell>{invoice.id}</Table.Cell>
            <Table.Cell>{invoice.method}</Table.Cell>
            <Table.Cell>{invoiceAmount(invoice.amount)}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}
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
function TableDemo({
  variant,
  striped,
  caption,
}: {
  variant?: "default" | "outline";
  striped?: boolean;
  caption?: string;
}) {
  return (
    <Table variant={variant} striped={striped} className="w-full">
      <Table.Header>
        <Table.Row>
          <Table.Head flex={2}>Invoice</Table.Head>
          <Table.Head>Method</Table.Head>
          <Table.Head align="end">Amount</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {INVOICES.map((invoice) => (
          <Table.Row key={invoice.id}>
            <Table.Cell flex={2}>{invoice.id}</Table.Cell>
            <Table.Cell>{invoice.method}</Table.Cell>
            <Table.Cell align="end">{invoiceAmount(invoice.amount)}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
      <Table.Footer>
        <Table.Row>
          <Table.Cell flex={2} labelClassName="font-medium">
            Total
          </Table.Cell>
          <Table.Cell />
          <Table.Cell align="end" labelClassName="font-medium">
            {invoiceAmount(INVOICES.reduce((sum, i) => sum + i.amount, 0))}
          </Table.Cell>
        </Table.Row>
      </Table.Footer>
      {caption ? (
        <Table.Caption className="px-4 py-3">{caption}</Table.Caption>
      ) : null}
    </Table>
  );
}
function FramedTableDemo() {
  return (
    <Table.Frame
      className="w-full"
      title="Five most recent invoices"
      action={<Badge variant="outline">Q3</Badge>}
    >
      <Table.Header>
        <Table.Row>
          <Table.Head flex={2}>Invoice</Table.Head>
          <Table.Head>Method</Table.Head>
          <Table.Head align="end">Amount</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {INVOICES.map((invoice) => (
          <Table.Row key={invoice.id}>
            <Table.Cell flex={2}>{invoice.id}</Table.Cell>
            <Table.Cell>{invoice.method}</Table.Cell>
            <Table.Cell align="end">{invoiceAmount(invoice.amount)}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
      <Table.Footer>
        <Table.Row>
          <Table.Cell flex={2} labelClassName="font-medium">
            Total
          </Table.Cell>
          <Table.Cell />
          <Table.Cell align="end" labelClassName="font-medium">
            {invoiceAmount(INVOICES.reduce((sum, i) => sum + i.amount, 0))}
          </Table.Cell>
        </Table.Row>
      </Table.Footer>
    </Table.Frame>
  );
}
function SortableTableDemo() {
  const [column, setColumn] = useState<"id" | "amount">("amount");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");
  const sortBy = (next: "id" | "amount") => {
    if (next === column) {
      setDirection((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }
    setColumn(next);
    setDirection("asc");
  };
  const rows = useMemo(() => {
    const sign = direction === "asc" ? 1 : -1;
    return [...INVOICES].sort((a, b) =>
      column === "amount"
        ? (a.amount - b.amount) * sign
        : a.id.localeCompare(b.id) * sign
    );
  }, [column, direction]);
  return (
    <Table variant="outline">
      <Table.Header>
        <Table.Row>
          <Table.Head
            flex={2}
            sortDirection={column === "id" ? direction : undefined}
            sortable
            onPress={() => sortBy("id")}
          >
            Invoice
          </Table.Head>
          <Table.Head
            align="end"
            sortDirection={column === "amount" ? direction : undefined}
            sortable
            onPress={() => sortBy("amount")}
          >
            Amount
          </Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {rows.map((invoice) => (
          <Table.Row key={invoice.id}>
            <Table.Cell flex={2}>{invoice.id}</Table.Cell>
            <Table.Cell align="end">{invoiceAmount(invoice.amount)}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}
function SelectableTableDemo() {
  const [picked, setPicked] = useState("INV-002");
  return (
    <View className="w-full gap-3">
      <Table variant="outline">
        <Table.Header>
          <Table.Row>
            <Table.Head flex={2}>Invoice</Table.Head>
            <Table.Head>Status</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {INVOICES.map((invoice) => (
            <Table.Row
              key={invoice.id}
              selected={picked === invoice.id}
              onPress={() => setPicked(invoice.id)}
            >
              <Table.Cell flex={2}>{invoice.id}</Table.Cell>
              <Table.Cell>
                <Badge
                  variant={
                    invoice.status === "Paid"
                      ? "success"
                      : invoice.status === "Pending"
                        ? "warning"
                        : "destructive"
                  }
                >
                  {invoice.status}
                </Badge>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <Text size="sm" muted>
        Selected {picked}
      </Text>
    </View>
  );
}
function WideTableDemo() {
  return (
    <ScrollFade size={24} className="w-full self-start">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Table variant="outline" size="sm" striped style={{ minWidth: 440 }}>
          <Table.Header>
            <Table.Row>
              <Table.Head width={86}>Invoice</Table.Head>
              <Table.Head width={100}>Customer</Table.Head>
              <Table.Head width={82}>Status</Table.Head>
              <Table.Head width={92} align="end">
                Amount
              </Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {INVOICES.slice(0, 4).map((invoice, index) => (
              <Table.Row key={invoice.id}>
                <Table.Cell width={86}>{invoice.id}</Table.Cell>
                <Table.Cell width={100}>
                  {["Acme", "Globex", "Initech", "Umbrella"][index]}
                </Table.Cell>
                <Table.Cell width={82}>{invoice.status}</Table.Cell>
                <Table.Cell width={92} align="end">
                  {invoiceAmount(invoice.amount)}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </ScrollView>
    </ScrollFade>
  );
}
export const entry: ComponentEntry = {
  slug: "table",
  name: "Table",
  summary: "Rows and columns that stay lined up",
  demos: [
    { label: "Basic", render: () => <TableDemo /> },
    { label: "Outline", render: () => <TableDemo variant="outline" /> },
    { label: "Striped", render: () => <TableDemo variant="outline" striped /> },
    { label: "Declared columns", render: () => <ColumnsTableDemo /> },
    { label: "Paged", render: () => <PaginatedTableDemo /> },
    { label: "In a frame", render: () => <FramedTableDemo /> },
    { label: "Sortable columns", render: () => <SortableTableDemo /> },
    { label: "Selectable rows", render: () => <SelectableTableDemo /> },
    { label: "Wider than the screen", render: () => <WideTableDemo /> },
    {
      label: "Empty",
      render: () => (
        <Table variant="outline">
          <Table.Header>
            <Table.Row>
              <Table.Head flex={2}>Invoice</Table.Head>
              <Table.Head align="end">Amount</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Empty>No invoices yet</Table.Empty>
        </Table>
      ),
    },
    {
      label: "With a caption",
      render: () => (
        <TableDemo variant="outline" caption="Five most recent invoices." />
      ),
    },
  ],
};
