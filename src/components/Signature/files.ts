import { env, getFileSystemManager } from "@tarojs/taro";

import type { SignatureSaveOptions } from "./types";

export const hasSignatureFileSystem =
  typeof getFileSystemManager === "function";
export const signatureFilePath = (options: SignatureSaveOptions) => {
  const format = options.format ?? "svg";
  if (format !== "svg" && format !== "png") {
    throw new Error("Signature: format must be svg or png");
  }
  const root = env.USER_DATA_PATH;
  if (!root) {
    throw new Error("Signature: WeChat user data directory is unavailable");
  }
  const base = (options.directory ?? root).replace(/\/$/u, "");
  if (base !== root && !base.startsWith(`${root}/`)) {
    throw new Error(
      "Signature: directory must be inside the WeChat user data directory"
    );
  }
  if (base.split("/").includes("..")) {
    throw new Error("Signature: directory traversal is not allowed");
  }
  const name = options.filename ?? `signature-${Date.now()}`;
  if (
    !name ||
    /[\\/]/u.test(name) ||
    [...name].some((character) => (character.codePointAt(0) ?? 0) < 32) ||
    name === "." ||
    name === ".."
  ) {
    throw new Error("Signature: filename must be a single valid file name");
  }
  return `${base}/${name}.${options.format ?? "svg"}`;
};
export const writeSignatureSvg = (uri: string, svg: string) =>
  new Promise<void>((resolve, reject) => {
    getFileSystemManager().writeFile({
      data: svg,
      encoding: "utf-8",
      fail: (error) => reject(new Error(error.errMsg)),
      filePath: uri,
      success: () => resolve(),
    });
  });
export const copySignaturePng = (from: string, to: string) =>
  new Promise<void>((resolve, reject) => {
    getFileSystemManager().copyFile({
      destPath: to,
      fail: (error) => reject(new Error(error.errMsg)),
      srcPath: from,
      success: () => resolve(),
    });
  });
export const signaturePngDataUrl = (uri: string) =>
  new Promise<string>((resolve, reject) => {
    getFileSystemManager().readFile({
      encoding: "base64",
      fail: (error) => reject(new Error(error.errMsg)),
      filePath: uri,
      success: (result) => {
        if (typeof result.data !== "string") {
          reject(new Error("Signature: expected base64 image data"));
          return;
        }
        resolve(`data:image/png;base64,${result.data}`);
      },
    });
  });
