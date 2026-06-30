import type { Banner, Category, Product, Store, Variant } from "@muoi/core";
import { apiGet } from "./api";

/** Raw shapes from backend on localhost:3000 (may differ from @muoi/core types). */
interface ApiProductRow {
  id: string;
  name: string;
  image?: string;
  description?: string;
  price?: number | string;
  base_price?: number | string;
  promotional_price?: number | string | null;
  categoryId?: string[];
  category_id?: string;
  category_ids?: string[];
  variantId?: string[];
  variant_id?: string[];
  variants?: Variant[];
}

function mapProduct(row: ApiProductRow, allVariants: Variant[] = []): Product {
  let categoryId: string[] = [];
  if (Array.isArray(row.categoryId)) {
    categoryId = row.categoryId;
  } else if (Array.isArray(row.category_ids)) {
    categoryId = row.category_ids;
  } else if (row.category_id) {
    categoryId = [row.category_id];
  }

  const rawPrice =
    row.price ?? row.promotional_price ?? row.base_price ?? 0;

  const variantIds = row.variantId ?? row.variant_id ?? [];
  const variants =
    row.variants ??
    (variantIds.length > 0
      ? allVariants.filter((v) => variantIds.includes(v.id))
      : undefined);

  return {
    id: String(row.id),
    name: row.name,
    image: row.image ?? "",
    price: Number(rawPrice),
    categoryId,
    description: row.description,
    variants,
  };
}

function mapCategory(row: Category & Record<string, unknown>): Category {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon ?? "",
    image: row.image,
  };
}

function mapBanner(row: Banner & Record<string, unknown>): Banner {
  const imageUrl =
    row.imageUrl ??
    (typeof row.image_url === "string" ? row.image_url : "");

  return {
    id: row.id,
    imageUrl,
    title: row.title,
    link: row.link,
    displayOrder: Number(row.displayOrder ?? row.display_order ?? 0),
    isActive: Boolean(row.isActive ?? row.is_active ?? true),
  };
}

export async function fetchCategories(): Promise<Category[]> {
  const rows = await apiGet<(Category & Record<string, unknown>)[]>(
    "/api/categories",
  );
  return rows.map(mapCategory);
}

export async function fetchProducts(): Promise<Product[]> {
  const rows = await apiGet<ApiProductRow[]>("/api/products");
  return rows.map((row) => mapProduct(row));
}

export async function fetchVariants(): Promise<Variant[]> {
  return apiGet<Variant[]>("/api/variants");
}

/** Products merged with variants from GET /api/variants when needed. */
export async function fetchProductsWithVariants(): Promise<Product[]> {
  const [rows, variants] = await Promise.all([
    apiGet<ApiProductRow[]>("/api/products"),
    fetchVariants().catch(() => [] as Variant[]),
  ]);
  return rows.map((row) => mapProduct(row, variants));
}

export function mergeProductsWithVariants(
  products: Product[],
  variants: Variant[],
): Product[] {
  return products.map((product) => {
    if (product.variants?.length) return product;
    const variantIds =
      (product as Product & { variantId?: string[] }).variantId ?? [];
    if (variantIds.length === 0) return product;
    return {
      ...product,
      variants: variants.filter((v) => variantIds.includes(v.id)),
    };
  });
}

export async function fetchBanners(): Promise<Banner[]> {
  const rows = await apiGet<(Banner & Record<string, unknown>)[]>(
    "/api/banners",
  );
  return rows.map(mapBanner);
}

export async function fetchBranches(): Promise<Store[]> {
  return apiGet<Store[]>("/api/branches");
}
