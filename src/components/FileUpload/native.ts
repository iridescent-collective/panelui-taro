import {
  canvasToTempFilePath,
  chooseMedia,
  chooseMessageFile,
  compressImage,
  createOffscreenCanvas,
  cropImage,
  getFileInfo,
  getImageInfo,
} from "@tarojs/taro";
import type { Canvas } from "@tarojs/taro";

import {
  createFileId,
  fitWithin,
  kindOf,
  libraryMediaTypes,
  mimeOf,
} from "./core";
import type {
  FileUploadFile,
  FileUploadImageOptions,
  FileUploadSource,
} from "./types";

interface PickUploadFilesOptions {
  accept?: string[];
  multiple?: boolean;
  remaining?: number;
  image?: FileUploadImageOptions;
}

const MEDIA_LIMIT = 9;
const MESSAGE_LIMIT = 100;
const CROP_SCALES = [
  "1:1",
  "3:4",
  "4:3",
  "4:5",
  "5:4",
  "9:16",
  "16:9",
] as const;

export const hasFileUploadSource = (source: FileUploadSource): boolean =>
  typeof (source === "files" ? chooseMessageFile : chooseMedia) === "function";

const cropScale = (aspect: [number, number]): (typeof CROP_SCALES)[number] => {
  const [width, height] = aspect;
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    throw new Error(
      "FileUpload: crop ratio must contain two positive finite numbers."
    );
  }
  const result = CROP_SCALES.find((scale) => {
    const [x, y] = scale.split(":").map(Number);
    return Math.abs(width / height - x / y) < 1e-9;
  });
  if (!result) {
    throw new Error("FileUpload: this crop ratio is not supported by WeChat.");
  }
  return result;
};

const reportError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }
  if (error && typeof error === "object" && "errMsg" in error) {
    return new Error(String(error.errMsg));
  }
  return new Error(String(error));
};

const fileSize = async (filePath: string): Promise<number> => {
  const result = await getFileInfo({ filePath });
  if (!("size" in result) || !Number.isFinite(result.size) || result.size < 0) {
    throw new Error(
      "FileUpload: the prepared file size could not be measured."
    );
  }
  return result.size;
};

const jpegSource = async (
  uri: string,
  width: number,
  height: number
): Promise<string> => {
  if (typeof createOffscreenCanvas !== "function") {
    throw new TypeError(
      "FileUpload: JPEG compression needs WeChat 2D offscreen canvas support."
    );
  }
  const canvas = createOffscreenCanvas({ height, type: "2d", width });
  const context = canvas.getContext("2d");
  if (
    !context ||
    !("drawImage" in context) ||
    typeof context.drawImage !== "function"
  ) {
    throw new Error("FileUpload: this platform cannot prepare a JPEG image.");
  }
  const image = canvas.createImage();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () =>
      reject(new Error("FileUpload: the selected image could not be decoded."));
    image.src = uri;
  });
  context.drawImage(image, 0, 0, width, height);
  const result = await canvasToTempFilePath({
    canvas: canvas as unknown as Canvas,
    destHeight: height,
    destWidth: width,
    fileType: "jpg",
    height,
    quality: 1,
    width,
  });
  return result.tempFilePath;
};

const transformImage = async (
  file: FileUploadFile,
  source: string,
  measured: Awaited<ReturnType<typeof getImageInfo>>,
  target: ReturnType<typeof fitWithin>,
  quality: number
): Promise<FileUploadFile> => {
  let uri = source;
  if (typeof compressImage !== "function") {
    throw new TypeError(
      "FileUpload: image resize and compression are unavailable on this platform."
    );
  }
  const width = target?.width ?? measured.width;
  const height = target?.height ?? measured.height;
  const inputType = measured.type?.toLowerCase();
  if (inputType && inputType !== "jpg" && inputType !== "jpeg") {
    uri = await jpegSource(uri, width, height);
  }
  const compressed = await compressImage({
    quality: Math.round(quality * 100),
    src: uri,
    ...(target ? { compressedHeight: height, compressedWidth: width } : {}),
  });
  uri = compressed.tempFilePath;
  const output = await getImageInfo({ src: uri });
  if (target && (output.width > width || output.height > height)) {
    throw new Error(
      "FileUpload: this platform ignored the requested image resize."
    );
  }
  const outputType = output.type?.toLowerCase();
  if (outputType && outputType !== "jpg" && outputType !== "jpeg") {
    throw new Error(
      "FileUpload: this platform ignored the requested JPEG preparation."
    );
  }
  const size = await fileSize(uri);
  return {
    ...file,
    height: output.height,
    mimeType: "image/jpeg",
    name: `${file.name.replace(/\.[^.]+$/u, "")}.jpg`,
    size,
    uri,
    width: output.width,
  };
};

const prepareImage = async (
  file: FileUploadFile,
  options: FileUploadImageOptions | undefined,
  scale: (typeof CROP_SCALES)[number] | undefined
): Promise<FileUploadFile> => {
  if (file.kind !== "image") {
    return file;
  }
  let { uri } = file;
  if (scale) {
    const cropped = await cropImage({ cropScale: scale, src: uri });
    uri = cropped.tempFilePath;
  }
  const measured = await getImageInfo({ src: uri });
  const target = options ? fitWithin(measured, options) : null;
  const quality = options?.quality ?? 0.9;
  const transform =
    target !== null || (options?.quality !== undefined && quality < 1);
  if (transform) {
    return transformImage(file, uri, measured, target, quality);
  }
  const size = scale ? await fileSize(uri) : file.size;
  const inputType = measured.type?.toLowerCase();
  const suffix = inputType === "jpeg" ? "jpg" : inputType;
  const measuredFile = suffix
    ? {
        mimeType: suffix === "jpg" ? "image/jpeg" : `image/${suffix}`,
        name: `${file.name.replace(/\.[^.]+$/u, "")}.${suffix}`,
      }
    : {};
  return {
    ...file,
    ...measuredFile,
    height: measured.height,
    size,
    uri,
    width: measured.width,
  };
};

const validateOptions = ({ remaining, image }: PickUploadFilesOptions) => {
  if (
    remaining !== undefined &&
    (!Number.isFinite(remaining) || remaining < 0)
  ) {
    throw new Error(
      "FileUpload: remaining file count must be a finite non-negative number."
    );
  }
  for (const dimension of [image?.maxWidth, image?.maxHeight]) {
    if (
      dimension !== undefined &&
      (!Number.isFinite(dimension) || dimension < 1)
    ) {
      throw new Error(
        "FileUpload: image resize dimensions must be positive finite numbers."
      );
    }
  }
  const quality = image?.quality ?? 0.9;
  if (!Number.isFinite(quality) || quality < 0 || quality > 1) {
    throw new Error("FileUpload: image quality must be between zero and one.");
  }
  return quality;
};

const selectionCount = (
  many: boolean,
  remaining: number | undefined,
  limit: number
) => (many ? Math.max(1, Math.min(limit, Math.floor(remaining ?? limit))) : 1);

const messageFiles = async (
  many: boolean,
  remaining: number | undefined
): Promise<FileUploadFile[]> => {
  const result = await chooseMessageFile({
    count: selectionCount(many, remaining, MESSAGE_LIMIT),
    type: "all",
  });
  return result.tempFiles.map((asset) => ({
    id: createFileId(),
    kind: kindOf({ name: asset.name }),
    name: asset.name,
    size: asset.size,
    status: "idle",
    uri: asset.path,
  }));
};

const mediaFile = (
  asset: Awaited<ReturnType<typeof chooseMedia>>["tempFiles"][number],
  index: number
): FileUploadFile => {
  const video = asset.fileType === "video";
  let suffix =
    asset.tempFilePath
      .match(/\.[\w]+(?=\?|$)/u)?.[0]
      .slice(1)
      .toLowerCase() ?? "jpg";
  const inferred = mimeOf({ name: `file.${suffix}` });
  if (video && !inferred?.startsWith("video/")) {
    suffix = "mp4";
  }
  let mimeType = `image/${suffix}`;
  if (suffix === "jpg") {
    mimeType = "image/jpeg";
  }
  if (video) {
    mimeType = mimeOf({ name: `file.${suffix}` }) ?? "video/mp4";
  }
  const name = `${video ? "Video" : "Photo"} ${Date.now()}${index ? `-${index + 1}` : ""}.${suffix}`;
  return {
    height: asset.height,
    id: createFileId(),
    kind: video ? "video" : "image",
    mimeType,
    name,
    size: asset.size,
    status: "idle",
    uri: asset.tempFilePath,
    width: asset.width,
  };
};

const mediaFiles = async (
  source: "camera" | "library",
  options: PickUploadFilesOptions,
  quality: number,
  many: boolean
): Promise<FileUploadFile[]> => {
  const mediaType =
    source === "camera"
      ? ["image" as const]
      : libraryMediaTypes(options.accept).map((kind) =>
          kind === "images" ? ("image" as const) : ("video" as const)
        );
  if (mediaType.length === 0) {
    return [];
  }
  const scale =
    !many && options.image?.crop
      ? cropScale(options.image.crop.aspect)
      : undefined;
  const result = await chooseMedia({
    count: selectionCount(
      source !== "camera" && many,
      options.remaining,
      MEDIA_LIMIT
    ),
    mediaType,
    sizeType: quality === 1 ? ["original"] : ["compressed"],
    sourceType: [source === "camera" ? "camera" : "album"],
  });
  return Promise.all(
    result.tempFiles.map((asset, index) =>
      prepareImage(mediaFile(asset, index), options.image, scale)
    )
  );
};

export const pickUploadFiles = async (
  source: FileUploadSource,
  options: PickUploadFilesOptions = {}
): Promise<FileUploadFile[] | null> => {
  const quality = validateOptions(options);
  if (options.remaining === 0) {
    return [];
  }
  const many = Boolean(options.multiple) && options.remaining !== 1;
  try {
    if (!hasFileUploadSource(source)) {
      throw new Error(
        `FileUpload: the ${source} picker is unavailable on this platform.`
      );
    }
    if (source === "files") {
      return await messageFiles(many, options.remaining);
    }
    return await mediaFiles(source, options, quality, many);
  } catch (error) {
    const failure = reportError(error);
    if (/\bcancel(?:led|ed)?\b/iu.test(failure.message)) {
      return null;
    }
    throw failure;
  }
};
