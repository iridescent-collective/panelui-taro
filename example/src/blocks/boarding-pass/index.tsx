import { BoardingPassBlock } from "@/blocks/boarding-pass";
import { DocsShell } from "@/components/docs/DocsShell";
export default function Page() {
  return (
    <DocsShell section="blocks" slug="boarding-pass">
      <BoardingPassBlock />
    </DocsShell>
  );
}
