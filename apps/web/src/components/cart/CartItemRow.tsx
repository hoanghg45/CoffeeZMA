import { calcFinalPrice } from "@muoi/core";
import type { CartItem } from "@muoi/core";
import { DisplayPrice } from "../DisplayPrice";
import { Minus, Plus, Trash2 } from "lucide-react";

export function CartItemRow({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}: {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}) {
  const unitPrice = calcFinalPrice(item.product, item.options);

  return (
    <div className="flex gap-3 p-3 bg-white rounded-xl border border-black/5">
      <img
        src={item.product.image}
        alt={item.product.name}
        className="w-16 h-16 rounded-lg object-cover bg-skeleton shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{item.product.name}</p>
        <p className="text-xs text-primary font-semibold mt-0.5">
          <DisplayPrice value={unitPrice} />
        </p>
        <div className="flex items-center justify-between mt-2">
          <div className="inline-flex items-center border rounded-full text-sm">
            <button type="button" className="w-8 h-8" onClick={onDecrease}>
              <Minus size={14} className="mx-auto" />
            </button>
            <span className="w-6 text-center">{item.quantity}</span>
            <button type="button" className="w-8 h-8" onClick={onIncrease}>
              <Plus size={14} className="mx-auto" />
            </button>
          </div>
          <button
            type="button"
            className="text-red-500 p-1"
            onClick={onRemove}
            aria-label="Xoá"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
