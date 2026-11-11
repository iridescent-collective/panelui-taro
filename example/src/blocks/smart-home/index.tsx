import { SmartHomeBlock } from "@/blocks/smart-home";
import { DocsShell } from "@/components/docs/DocsShell";
export default function Page() {
  return (
    <DocsShell section="blocks" slug="smart-home">
      <SmartHomeBlock />
    </DocsShell>
  );
}
