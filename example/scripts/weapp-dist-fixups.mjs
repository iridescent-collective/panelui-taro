import fs from "node:fs";
import path from "node:path";

const dist = path.resolve(
  import.meta.dirname,
  "..",
  process.env.TARO_OUTPUT_ROOT || "dist"
);
if (!fs.existsSync(dist)) {
  process.exit(0);
}
const walk = (dir, out = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
      continue;
    }
    if (entry.name.endsWith(".map")) {
      fs.unlinkSync(full);
      continue;
    }
    if (entry.name === "index.wxml") {
      out.push(full);
    }
  }
  return out;
};
for (const wxml of walk(dist)) {
  const wxss = wxml.replace(/\.wxml$/u, ".wxss");
  if (!fs.existsSync(wxss)) {
    fs.writeFileSync(wxss, "/* taro: styles in app-origin.wxss */\n");
  }
}
