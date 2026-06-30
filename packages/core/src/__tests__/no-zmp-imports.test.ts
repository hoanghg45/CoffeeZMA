import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

function collectSourceFiles(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (entry === "__tests__" || entry === "node_modules") continue;
      collectSourceFiles(fullPath, files);
    } else if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith(".test.ts")) {
      files.push(fullPath);
    }
  }
  return files;
}

describe("@muoi/core — no zmp imports", () => {
  it("does not import zmp-* packages in any source file", () => {
    const srcDir = join(import.meta.dirname, "..");
    const files = collectSourceFiles(srcDir);
    const zmpPattern = /from\s+['"]zmp-/;

    for (const file of files) {
      const content = readFileSync(file, "utf-8");
      expect(content, file).not.toMatch(zmpPattern);
    }
  });

  it("does not list zmp-* in package dependencies", () => {
    const pkg = JSON.parse(
      readFileSync(join(import.meta.dirname, "../../package.json"), "utf-8"),
    );
    const deps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.peerDependencies,
    };
    for (const name of Object.keys(deps ?? {})) {
      expect(name).not.toMatch(/^zmp-/);
    }
  });
});
