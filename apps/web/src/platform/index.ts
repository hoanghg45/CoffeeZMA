import type { PlatformAdapter } from "@muoi/core";
import { webPlatformAdapter } from "./web.adapter";

let activePlatform: PlatformAdapter = webPlatformAdapter;

export function getPlatform(): PlatformAdapter {
  return activePlatform;
}

export function setPlatform(adapter: PlatformAdapter): void {
  activePlatform = adapter;
}

export { webPlatformAdapter };
