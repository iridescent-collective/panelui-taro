import type {
  FileUploadFile,
  FileUploadKind,
  FileUploadRejection,
  FileUploadRules,
  FileUploadStatus,
} from "./types";

export const isActive = (status: FileUploadStatus): boolean =>
  status === "uploading" || status === "processing";
export const extensionOf = (name: string): string => {
  const dot = name.lastIndexOf(".");
  return dot > 0 && dot < name.length - 1
    ? name.slice(dot + 1).toLowerCase()
    : "";
};
const EXTENSION_TYPES: Record<string, string> = {
  csv: "text/csv",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  gif: "image/gif",
  heic: "image/heic",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  json: "application/json",
  mov: "video/quicktime",
  mp3: "audio/mpeg",
  mp4: "video/mp4",
  pdf: "application/pdf",
  png: "image/png",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  txt: "text/plain",
  webp: "image/webp",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  zip: "application/zip",
};
export const mimeOf = (file: {
  name: string;
  mimeType?: string;
}): string | undefined =>
  file.mimeType ?? EXTENSION_TYPES[extensionOf(file.name)];
export const kindOf = (file: {
  name: string;
  mimeType?: string;
}): FileUploadKind => {
  const mime = mimeOf(file) ?? "";
  if (mime.startsWith("image/")) {
    return "image";
  }
  if (mime.startsWith("video/")) {
    return "video";
  }
  return "document";
};
export const matchesAccept = (
  file: {
    name: string;
    mimeType?: string;
  },
  accept: readonly string[] | undefined
): boolean => {
  if (!accept || accept.length === 0) {
    return true;
  }
  const mime = (mimeOf(file) ?? "").toLowerCase();
  const ext = extensionOf(file.name);
  return accept.some((raw) => {
    const pattern = raw.trim().toLowerCase();
    if (pattern === "*" || pattern === "*/*") {
      return true;
    }
    if (pattern.startsWith(".")) {
      return pattern.slice(1) === ext;
    }
    if (pattern.endsWith("/*")) {
      return mime.startsWith(pattern.slice(0, -1));
    }
    return pattern === mime;
  });
};
export const pickerTypes = (
  accept: readonly string[] | undefined
): string[] => {
  if (!accept || accept.length === 0) {
    return ["*/*"];
  }
  const types = new Set<string>();
  for (const raw of accept) {
    const pattern = raw.trim().toLowerCase();
    if (pattern.startsWith(".")) {
      const type = EXTENSION_TYPES[pattern.slice(1)];
      if (!type) {
        return ["*/*"];
      }
      types.add(type);
    } else {
      types.add(pattern);
    }
  }
  return [...types];
};
export const libraryMediaTypes = (
  accept: readonly string[] | undefined
): ("images" | "videos")[] => {
  if (!accept || accept.length === 0) {
    return ["images", "videos"];
  }
  const families = new Set<string>();
  for (const raw of accept) {
    const pattern = raw.trim().toLowerCase();
    if (pattern === "*" || pattern === "*/*") {
      return ["images", "videos"];
    }
    const mime = pattern.startsWith(".")
      ? EXTENSION_TYPES[pattern.slice(1)]
      : pattern;
    if (mime?.startsWith("image/")) {
      families.add("images");
    }
    if (mime?.startsWith("video/")) {
      families.add("videos");
    }
  }
  return (["images", "videos"] as const).filter((family) =>
    families.has(family)
  );
};

const UNITS = ["B", "KB", "MB", "GB", "TB"];
export const formatFileSize = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "";
  }
  if (bytes < 1000) {
    return `${Math.round(bytes)} B`;
  }
  let value = bytes;
  let unit = 0;
  while (value >= 1000 && unit < UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const rounded = value < 10 ? Math.round(value * 10) / 10 : Math.round(value);
  return `${rounded} ${UNITS[unit]}`;
};
const PATTERN_NAMES: Record<string, string> = {
  "application/pdf": "PDF",
  "application/zip": "ZIP",
  "audio/*": "audio",
  "image/*": "images",
  "image/gif": "GIF",
  "image/heic": "HEIC",
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WebP",
  "text/*": "text files",
  "text/csv": "CSV",
  "text/plain": "TXT",
  "video/*": "videos",
  "video/mp4": "MP4",
};
const extensionFromMime = (mime: string): string => {
  const entry = Object.entries(EXTENSION_TYPES).find(
    ([, type]) => type === mime
  );
  return entry ? entry[0].toUpperCase() : "";
};
export const describeAccept = (
  accept: readonly string[] | undefined
): string => {
  if (!accept || accept.length === 0) {
    return "";
  }
  const names: string[] = [];
  for (const raw of accept) {
    const pattern = raw.trim().toLowerCase();
    const name = pattern.startsWith(".")
      ? pattern.slice(1).toUpperCase()
      : (PATTERN_NAMES[pattern] ?? extensionFromMime(pattern));
    if (name && !names.includes(name)) {
      names.push(name);
    }
  }
  if (names.length <= 1) {
    return names[0] ?? "";
  }
  return `${names.slice(0, -1).join(", ")} or ${names.at(-1)}`;
};
export const describeRules = ({
  accept,
  maxSize,
  maxFiles,
}: FileUploadRules): string => {
  const parts: string[] = [];
  const types = describeAccept(accept);
  if (types) {
    parts.push(types.charAt(0).toUpperCase() + types.slice(1));
  }
  if (maxSize) {
    parts.push(`up to ${formatFileSize(maxSize)}`);
  }
  if (maxFiles && maxFiles > 1) {
    parts.push(`${maxFiles} files max`);
  }
  return parts.join(" · ");
};
const articleFor = (names: string): string => {
  const singular = names
    .replace(/\bimages\b/u, "image")
    .replace(/\bvideos\b/u, "video")
    .replace(/\btext files\b/u, "text file");
  const first = singular.trim().charAt(0).toLowerCase();
  const vowel =
    "aefhilmnorsx".includes(first) && /^[A-Z]{2,}/u.test(singular)
      ? true
      : "aeiou".includes(first);
  return `${vowel ? "an" : "a"} ${singular}`;
};
export const partitionFiles = (
  candidates: readonly FileUploadFile[],
  current: number,
  rules: FileUploadRules
): {
  accepted: FileUploadFile[];
  rejected: FileUploadRejection[];
} => {
  const accepted: FileUploadFile[] = [];
  const rejected: FileUploadRejection[] = [];
  const typeNames = describeAccept(rules.accept);
  for (const file of candidates) {
    const summary = {
      mimeType: file.mimeType,
      name: file.name,
      size: file.size,
      uri: file.uri,
    };
    if (!matchesAccept(file, rules.accept)) {
      rejected.push({
        file: summary,
        message: typeNames
          ? `${file.name} isn't ${articleFor(typeNames)}.`
          : `${file.name} can't be added.`,
        reason: "type",
      });
      continue;
    }
    if (
      rules.maxSize !== undefined &&
      file.size !== undefined &&
      file.size > rules.maxSize
    ) {
      rejected.push({
        file: summary,
        message: `${file.name} is ${formatFileSize(file.size)}. The limit is ${formatFileSize(rules.maxSize)}.`,
        reason: "size",
      });
      continue;
    }
    if (
      rules.minSize !== undefined &&
      file.size !== undefined &&
      file.size < rules.minSize
    ) {
      rejected.push({
        file: summary,
        message: `${file.name} is smaller than ${formatFileSize(rules.minSize)}.`,
        reason: "size",
      });
      continue;
    }
    const custom = rules.validate?.(file);
    if (custom) {
      rejected.push({ file: summary, message: custom, reason: "custom" });
      continue;
    }
    if (
      rules.maxFiles !== undefined &&
      current + accepted.length >= rules.maxFiles
    ) {
      rejected.push({
        file: summary,
        message: `Only ${rules.maxFiles} ${rules.maxFiles === 1 ? "file" : "files"} can be added.`,
        reason: "count",
      });
      continue;
    }
    accepted.push(file);
  }
  return { accepted, rejected };
};
export const nextToStart = (
  files: readonly FileUploadFile[],
  concurrency: number
): string[] => {
  const limit = Math.max(1, Math.floor(concurrency));
  const busy = files.filter((file) => isActive(file.status)).length;
  const free = limit - busy;
  if (free <= 0) {
    return [];
  }
  return files
    .filter((file) => file.status === "queued")
    .slice(0, free)
    .map((file) => file.id);
};
export const fitWithin = (
  size: {
    width: number;
    height: number;
  },
  box: {
    maxWidth?: number;
    maxHeight?: number;
  }
): {
  width: number;
  height: number;
} | null => {
  const scale = Math.min(
    box.maxWidth ? box.maxWidth / size.width : Infinity,
    box.maxHeight ? box.maxHeight / size.height : Infinity,
    1
  );
  if (scale >= 1) {
    return null;
  }
  return {
    height: Math.round(size.height * scale),
    width: Math.round(size.width * scale),
  };
};
export const truncateMiddle = (name: string, max: number): string => {
  if (name.length <= max || max < 8) {
    return name;
  }
  const ext = extensionOf(name);
  const tail = Math.min(
    name.length - 1,
    Math.max(ext.length + 5, Math.floor(max / 3))
  );
  const head = max - tail - 1;
  return `${name.slice(0, head)}…${name.slice(name.length - tail)}`;
};
let counter = 0;
export const createFileId = (): string => {
  counter += 1;
  return `file-${Date.now().toString(36)}-${counter.toString(36)}`;
};
