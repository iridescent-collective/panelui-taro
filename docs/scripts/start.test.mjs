import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import test from "node:test";
import { fileURLToPath } from "node:url";

test(
  "standalone start respects an explicitly configured deployment host",
  { timeout: 30_000 },
  async (context) => {
    const reservation = createServer();
    reservation.listen(0, "127.0.0.1");
    await once(reservation, "listening");
    const address = reservation.address();
    assert.ok(address && typeof address !== "string");
    const { port } = address;
    const released = once(reservation, "close");
    reservation.close();
    await released;
    const child = spawn(
      process.execPath,
      [fileURLToPath(new URL("start.mjs", import.meta.url))],
      {
        env: { ...process.env, HOSTNAME: "0.0.0.0", PORT: String(port) },
        stdio: ["ignore", "pipe", "pipe"],
      }
    );
    context.after(async () => {
      if (child.exitCode !== null) {
        return;
      }
      const closed = once(child, "close");
      child.kill();
      await closed;
    });
    let output = "";
    const ready = Promise.withResolvers();
    {
      const { resolve, reject } = ready;
      child.on("error", reject);
      child.on("exit", (code) =>
        reject(new Error(`Server exited ${code}: ${output}`))
      );
      child.stderr.on("data", (data) => {
        output += data;
      });
      child.stdout.on("data", (data) => {
        output += data;
        if (output.includes("Ready in")) {
          resolve();
        }
      });
    }
    await ready.promise;
    assert.ok(output.includes(`http://0.0.0.0:${port}`), output);
  }
);
