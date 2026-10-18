import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const files = [
  "src/app/page.tsx",
  "src/app/submit/page.tsx",
  "src/app/submit/[slug]/page.tsx",
  "src/app/novel/[slug]/page.tsx",
  "src/app/not-found.tsx",
];

for (const relativePath of files) {
  test(`${relativePath} passes searchNovels to PageShell`, () => {
    const filePath = path.join(process.cwd(), relativePath);
    const source = readFileSync(filePath, "utf8");
    assert.match(source, /<PageShell[\s\S]*searchNovels=\{[^}]+\}/, `Expected ${relativePath} to pass searchNovels into PageShell`);
  });
}
