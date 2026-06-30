import { calcFinalPrice } from "@muoi/core";
import type { Product } from "@muoi/core";

export function DisplayPrice({ value }: { value: number }) {
  return <>{value.toLocaleString("vi-VN")}đ</>;
}

export function FinalPrice({ product }: { product: Product }) {
  return <DisplayPrice value={calcFinalPrice(product)} />;
}
