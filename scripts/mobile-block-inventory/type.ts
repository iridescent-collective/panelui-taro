export interface InventoryBlock {
  slug: string;
  title: string;
  description: string;
  preview: string;
}
export interface InventorySource {
  id: string;
  title: string;
  source: string;
  fetchedAt: string;
  sha256?: string;
  error?: string;
  blocks: InventoryBlock[];
}
export interface InventorySample {
  id: string;
  reference: string;
  preview?: string;
}
export interface InventoryVariant {
  reference: string;
  slug: string;
  title: string;
  previews: string[];
  sampleIds: string[];
  status: "mapped" | "pending";
}
