import {
  canvasToTempFilePath,
  chooseMedia,
  createSelectorQuery,
  getImageInfo,
} from "@tarojs/taro";
import type { Canvas, getCurrentInstance } from "@tarojs/taro";

import { weappNodeSelector } from "../../platform/node-selector";
import type { Size, SourceCrop } from "./math";
import type {
  AvatarCropOptions,
  AvatarCropperSource,
  PickAvatarImageOptions,
} from "./types";

export const hasAvatarCropperExport = true;
export const measureAvatarImage = async (source: AvatarCropperSource) => {
  const image = await getImageInfo({ src: source.uri });
  return {
    height: image.height,
    path: image.path || source.uri,
    width: image.width,
  };
};
export const pickAvatarImage = async ({
  from = "library",
  quality = 1,
}: PickAvatarImageOptions = {}): Promise<Required<AvatarCropperSource> | null> => {
  if (!Number.isFinite(quality) || quality < 0 || quality > 1) {
    throw new Error("pickAvatarImage: quality must be between zero and one.");
  }
  try {
    const result = await chooseMedia({
      count: 1,
      mediaType: ["image"],
      sizeType: quality === 1 ? ["original"] : ["compressed"],
      sourceType: [from === "camera" ? "camera" : "album"],
    });
    const [photo] = result.tempFiles;
    if (!photo) {
      return null;
    }
    const image = await getImageInfo({ src: photo.tempFilePath });
    return {
      height: image.height,
      uri: photo.tempFilePath,
      width: image.width,
    };
  } catch (error) {
    const message =
      error && typeof error === "object" && "errMsg" in error
        ? String(error.errMsg)
        : "";
    if (message.toLowerCase().includes("cancel")) {
      return null;
    }
    throw error;
  }
};
interface CropImage {
  src: string;
  onload: (() => void) | null;
  onerror: ((error: unknown) => void) | null;
}
export interface CropCanvasContext {
  fillStyle: string;
  clearRect: (x: number, y: number, width: number, height: number) => void;
  fillRect: (x: number, y: number, width: number, height: number) => void;
  translate: (x: number, y: number) => void;
  rotate: (angle: number) => void;
  scale: (x: number, y: number) => void;
  drawImage: (
    image: CropImage,
    x: number,
    y: number,
    width: number,
    height: number
  ) => void;
}
export interface CropCanvasNode {
  width: number;
  height: number;
  getContext: (kind: "2d") => CropCanvasContext;
  createImage: () => CropImage;
}
export const drawAvatarCrop = (
  context: CropCanvasContext,
  image: CropImage,
  rect: SourceCrop,
  source: Size,
  side: number,
  background: string
) => {
  context.clearRect(0, 0, side, side);
  if (background !== "transparent") {
    context.fillStyle = background;
    context.fillRect(0, 0, side, side);
  }
  const factor = side / rect.width;
  context.scale(factor, factor);
  context.translate(-rect.originX, -rect.originY);
  context.translate(rect.canvas.width / 2, rect.canvas.height / 2);
  context.rotate((rect.rotation * Math.PI) / 180);
  context.drawImage(
    image,
    -source.width / 2,
    -source.height / 2,
    source.width,
    source.height
  );
};
export const exportAvatarCrop = async (
  id: string,
  scope: ReturnType<typeof getCurrentInstance>["page"],
  source: AvatarCropperSource,
  rect: SourceCrop,
  sourceSize: Size,
  background: string,
  options: AvatarCropOptions = {}
) => {
  const {
    size = 1024,
    format = background === "transparent" ? "png" : "jpeg",
    compress = 0.9,
  } = options;
  if (
    !Number.isFinite(size) ||
    size < 1 ||
    size > 8192 ||
    !Number.isFinite(compress) ||
    compress < 0 ||
    compress > 1
  ) {
    throw new Error(
      "AvatarCropper.crop: size must be between 1 and 8192 and compress between zero and one."
    );
  }
  const side = Math.max(1, Math.floor(Math.min(size, rect.width)));
  const canvas = await new Promise<CropCanvasNode>((resolve, reject) => {
    const query = createSelectorQuery();
    if (scope) {
      query.in(scope);
    }
    query
      .select(weappNodeSelector(id))
      .fields({ node: true }, (result) => {
        const node: unknown =
          result && !Array.isArray(result) ? result.node : null;
        if (
          node &&
          typeof node === "object" &&
          "createImage" in node &&
          typeof node.createImage === "function" &&
          "getContext" in node &&
          typeof node.getContext === "function"
        ) {
          resolve(node as CropCanvasNode);
        } else {
          reject(
            new Error("AvatarCropper.crop: native Canvas 2D is unavailable.")
          );
        }
      })
      .exec();
  });
  canvas.width = side;
  canvas.height = side;
  const photo = await measureAvatarImage(source);
  const image = canvas.createImage();
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = reject;
    image.src = photo.path;
  });
  drawAvatarCrop(
    canvas.getContext("2d"),
    image,
    rect,
    sourceSize,
    side,
    background
  );
  const result = await canvasToTempFilePath(
    {
      canvas: canvas as unknown as Canvas,
      destHeight: side,
      destWidth: side,
      fileType: format === "jpeg" ? "jpg" : "png",
      quality: compress,
    },
    scope ?? undefined
  );
  return { height: side, uri: result.tempFilePath, width: side };
};
