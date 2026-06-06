import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const standaloneDir = join(root, ".next", "standalone");

if (!existsSync(standaloneDir)) {
  throw new Error("Standalone build not found. Run `next build` first.");
}

const copies = [
  [join(root, "public"), join(standaloneDir, "public")],
  [join(root, ".next", "static"), join(standaloneDir, ".next", "static")],
];

for (const [from, to] of copies) {
  if (!existsSync(from)) {
    continue;
  }

  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true, force: true });
}
