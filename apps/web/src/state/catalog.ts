import { atom, selector } from "recoil";
import {
  fetchBanners,
  fetchCategories,
  fetchProductsWithVariants,
} from "../services/catalog";
import { fetchBranches } from "../services/catalog";

export const categoriesState = selector({
  key: "web/categories",
  get: () => fetchCategories(),
});

export const productsState = selector({
  key: "web/products",
  get: () => fetchProductsWithVariants(),
});

export const bannersState = selector({
  key: "web/banners",
  get: () => fetchBanners(),
});

export const branchesState = selector({
  key: "web/branches",
  get: () => fetchBranches(),
});

export const selectedCategoryIdState = atom<string | null>({
  key: "web/selectedCategoryId",
  default: null,
});
