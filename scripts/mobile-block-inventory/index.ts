import type {
  InventoryBlock,
  InventorySample,
  InventorySource,
  InventoryVariant,
} from "./type";

const FLIGHT_STRING =
  /self\.__next_f\.push\(\[1,(?<payload>"(?:[^"\\]|\\[\s\S])*")\]\)/gu;
const BLOCKS_KEY = /(?<!\\)"blocksData"\s*:\s*/gu;
const SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const PAGE_PATH =
  /^src\/registry\/(?<framework>base|radix)\/blocks\/(?<category>[a-z0-9-]+)\/(?<section>[a-z0-9-]+)\/(?<slug>[a-z0-9-]+)\/page\.tsx$/u;
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readJsonValue = (text: string, start: number): unknown => {
  if (text[start] !== "[") {
    throw new Error("blocksData must be a complete JSON array");
  }
  let depth = 0;
  let quoted = false;
  let escaped = false;
  for (let cursor = start; cursor < text.length; cursor += 1) {
    const char = text[cursor];
    if (quoted) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        quoted = false;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
    } else if (char === "[" || char === "{") {
      depth += 1;
    } else if (char === "]" || char === "}") {
      depth -= 1;
      if (depth === 0) {
        return JSON.parse(text.slice(start, cursor + 1));
      }
    }
  }
  throw new Error("Incomplete blocksData payload");
};

const parseBlockRow = (
  row: unknown,
  reference: string
): InventoryBlock | null => {
  if (!record(row) || !record(row.block)) {
    throw new Error("Invalid block metadata");
  }
  const { block } = row;
  if (block.section !== reference) {
    return null;
  }
  if (
    typeof block.slug !== "string" ||
    !SEGMENT.test(block.slug) ||
    typeof block.title !== "string" ||
    !Array.isArray(block.files)
  ) {
    throw new Error("Invalid block identity");
  }
  let preview: string | undefined;
  for (const file of block.files) {
    if (!record(file) || typeof file.path !== "string") {
      continue;
    }
    const parts = PAGE_PATH.exec(file.path)?.groups;
    if (!parts) {
      continue;
    }
    if (
      parts.category !== block.category ||
      parts.section !== reference ||
      parts.slug !== block.slug
    ) {
      throw new Error("Registry page does not match block identity");
    }
    preview = `https://shadcnstudio.com/preview/blocks/${parts.framework}/${parts.category}/${parts.section}/${parts.slug}`;
    break;
  }
  if (!preview) {
    throw new Error(`No valid public registry page for ${block.slug}`);
  }
  return {
    description: typeof block.description === "string" ? block.description : "",
    preview,
    slug: block.slug,
    title: block.title,
  };
};

export const extractBlocksData = (
  html: string,
  reference: string
): InventoryBlock[] => {
  if (!SEGMENT.test(reference)) {
    throw new Error("Invalid reference identifier");
  }
  const chunks = [...html.matchAll(FLIGHT_STRING)].map(
    (match) => JSON.parse(match.groups?.payload ?? "") as string
  );
  const flight = chunks.join("");
  const blocks: InventoryBlock[] = [];
  for (const match of flight.matchAll(BLOCKS_KEY)) {
    const rows = readJsonValue(flight, match.index + match[0].length);
    if (!Array.isArray(rows)) {
      throw new TypeError("Invalid blocksData collection");
    }
    for (const row of rows) {
      const block = parseBlockRow(row, reference);
      if (block) {
        blocks.push(block);
      }
    }
  }
  if (blocks.length === 0) {
    throw new Error("No complete matching blocksData catalogue found");
  }
  return blocks;
};

const normalizePreview = (value: string): string => {
  const url = new URL(value);
  if (
    url.protocol !== "https:" ||
    url.hostname !== "shadcnstudio.com" ||
    !url.pathname.startsWith("/preview/blocks/")
  ) {
    throw new Error("Invalid public preview URL");
  }
  return `${url.origin}${url.pathname.replace(/\/$/u, "")}`;
};

export const buildInventory = (
  sources: InventorySource[],
  samples: InventorySample[]
) => {
  if (new Set(sources.map((source) => source.id)).size !== sources.length) {
    throw new Error("Duplicate source identifiers");
  }
  const variants = new Map<string, InventoryVariant>();
  const previewKeys = new Map<string, string>();
  for (const source of sources) {
    if (source.error) {
      continue;
    }
    for (const block of source.blocks) {
      const key = `${source.id}/${block.slug}`;
      const preview = normalizePreview(block.preview);
      const entry = variants.get(key) ?? {
        previews: [],
        reference: source.id,
        sampleIds: [],
        slug: block.slug,
        status: "pending" as const,
        title: block.title,
      };
      if (!entry.previews.includes(preview)) {
        entry.previews.push(preview);
      }
      variants.set(key, entry);
      previewKeys.set(`${source.id}/${preview}`, key);
    }
  }
  const unassignedSamples: InventorySample[] = [];
  const unlistedSamples: InventorySample[] = [];
  for (const sample of samples) {
    if (!sample.preview) {
      unassignedSamples.push(sample);
      continue;
    }
    let preview: string;
    try {
      preview = normalizePreview(sample.preview);
    } catch {
      unassignedSamples.push(sample);
      continue;
    }
    const key = previewKeys.get(`${sample.reference}/${preview}`);
    const entry = key ? variants.get(key) : undefined;
    if (!entry) {
      unlistedSamples.push(sample);
      continue;
    }
    entry.sampleIds.push(sample.id);
    entry.status = "mapped";
  }
  const rows = [...variants.values()];
  rows.sort((a, b) =>
    `${a.reference}/${a.slug}`.localeCompare(`${b.reference}/${b.slug}`, "en")
  );
  const unresolved = sources.filter((source) => Boolean(source.error));
  const mapped = rows.filter((row) => row.status === "mapped").length;
  const sourceRows = sources.map((source) => {
    const entries = rows.filter((row) => row.reference === source.id);
    return {
      error: source.error,
      fetchedAt: source.fetchedAt,
      id: source.id,
      mapped: entries.filter((row) => row.status === "mapped").length,
      observed: entries.length,
      pending: source.error
        ? null
        : entries.filter((row) => row.status === "pending").length,
      sha256: source.sha256,
      source: source.source,
      status: source.error ? "unresolved" : "catalogued",
      title: source.title,
    };
  });
  return {
    sources: sourceRows,
    summary: {
      cataloguedSources: sources.length - unresolved.length,
      mapped,
      observed: rows.length,
      remaining: unresolved.length ? null : rows.length - mapped,
      samples: samples.length,
      sourceCount: sources.length,
      total: unresolved.length ? null : rows.length,
      unassignedSamples: unassignedSamples.length,
      unlistedSamples: unlistedSamples.length,
      unresolvedSources: unresolved.length,
    },
    unassignedSamples,
    unlistedSamples,
    variants: rows,
  };
};
