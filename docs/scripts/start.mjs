import { cp } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const site = fileURLToPath(new URL("../", import.meta.url));
const app = path.join(site, ".next/standalone/docs");
await Promise.all([
  cp(path.join(site, "public"), path.join(app, "public"), { recursive: true }),
  cp(path.join(site, ".next/static"), path.join(app, ".next/static"), {
    recursive: true,
  }),
]);
process.env.PORT ??= "3100";
process.env.HOSTNAME ??= "127.0.0.1";
await import(pathToFileURL(path.join(app, "server.js")).href);
