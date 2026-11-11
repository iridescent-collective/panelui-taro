import { WalletBlock } from "@/blocks/wallet";
import { DocsShell } from "@/components/docs/DocsShell";
export default function Page() {
  return (
    <DocsShell section="blocks" slug="wallet">
      <WalletBlock />
    </DocsShell>
  );
}
