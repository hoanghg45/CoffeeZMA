import type { Product } from "@muoi/core";
import { FinalPrice } from "./DisplayPrice";
import { ProductPicker } from "./product/ProductPicker";

export function ProductItem({ product }: { product: Product }) {
  return (
    <ProductPicker product={product}>
      {({ open }) => (
        <button
          type="button"
          onClick={open}
          className="w-full text-left space-y-3 p-3 bg-surface rounded-lg border border-black/5"
        >
          <div className="w-full aspect-square relative">
            <img
              loading="lazy"
              src={product.image}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover rounded-md bg-skeleton"
            />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-onSurface text-sm">{product.name}</p>
            <p className="text-xs text-onSurfaceVariant">
              <FinalPrice product={product} />
            </p>
          </div>
        </button>
      )}
    </ProductPicker>
  );
}
