import { describe, it, expect } from "vitest";
import { webPlatformAdapter } from "../platform/web.adapter";

describe("webPlatformAdapter", () => {
  it("returns null for getUserInfo (guest mode)", async () => {
    expect(await webPlatformAdapter.getUserInfo()).toBeNull();
  });

  it("opens external links via window.open pattern", () => {
    const original = window.open;
    let calledUrl = "";
    window.open = (url) => {
      calledUrl = String(url);
      return null;
    };
    webPlatformAdapter.openExternal("https://example.com");
    window.open = original;
    expect(calledUrl).toBe("https://example.com");
  });

  it("getSafeAreaInsets returns zero on web", () => {
    expect(webPlatformAdapter.getSafeAreaInsets()).toEqual({ top: 0, bottom: 0 });
  });
});
