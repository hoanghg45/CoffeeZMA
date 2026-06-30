import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../api", () => ({
  apiGet: vi.fn(),
}));

import { apiGet } from "../api";
import { fetchProducts } from "../catalog";

describe("catalog mappers", () => {
  beforeEach(() => {
    vi.mocked(apiGet).mockReset();
  });

  it("maps localhost:3000 product shape to @muoi/core Product", async () => {
    vi.mocked(apiGet).mockResolvedValue([
      {
        id: "prod-1",
        name: "Cà Phê Muối",
        image: "https://example.com/a.webp",
        base_price: "43000.00",
        category_ids: ["cat-signature"],
      },
    ]);

    const products = await fetchProducts();
    expect(products[0]).toMatchObject({
      id: "prod-1",
      name: "Cà Phê Muối",
      price: 43000,
      categoryId: ["cat-signature"],
    });
  });
});
