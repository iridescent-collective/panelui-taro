import { ComponentPage } from "@/components/docs/ComponentPage";
import { entry } from "@/official/loader";

export default function Page() {
  return <ComponentPage entry={entry} />;
}
