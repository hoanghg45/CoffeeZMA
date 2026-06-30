"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
function collectSourceFiles(dir, files = []) {
    for (const entry of (0, node_fs_1.readdirSync)(dir)) {
        const fullPath = (0, node_path_1.join)(dir, entry);
        const stat = (0, node_fs_1.statSync)(fullPath);
        if (stat.isDirectory()) {
            if (entry === "__tests__" || entry === "node_modules")
                continue;
            collectSourceFiles(fullPath, files);
        }
        else if (/\.(ts|tsx)$/.test(entry) && !entry.endsWith(".test.ts")) {
            files.push(fullPath);
        }
    }
    return files;
}
(0, vitest_1.describe)("@muoi/core — no zmp imports", () => {
    (0, vitest_1.it)("does not import zmp-* packages in any source file", () => {
        const srcDir = (0, node_path_1.join)(import.meta.dirname, "..");
        const files = collectSourceFiles(srcDir);
        const zmpPattern = /from\s+['"]zmp-/;
        for (const file of files) {
            const content = (0, node_fs_1.readFileSync)(file, "utf-8");
            (0, vitest_1.expect)(content, file).not.toMatch(zmpPattern);
        }
    });
    (0, vitest_1.it)("does not list zmp-* in package dependencies", () => {
        const pkg = JSON.parse((0, node_fs_1.readFileSync)((0, node_path_1.join)(import.meta.dirname, "../../package.json"), "utf-8"));
        const deps = {
            ...pkg.dependencies,
            ...pkg.devDependencies,
            ...pkg.peerDependencies,
        };
        for (const name of Object.keys(deps ?? {})) {
            (0, vitest_1.expect)(name).not.toMatch(/^zmp-/);
        }
    });
});
