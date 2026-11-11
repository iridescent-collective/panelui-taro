import { ActivityBlock } from "@/blocks/activity";
import { DocsShell } from "@/components/docs/DocsShell";
export default function Page() {
  return (
    <DocsShell section="blocks" slug="activity">
      <ActivityBlock />
    </DocsShell>
  );
}
