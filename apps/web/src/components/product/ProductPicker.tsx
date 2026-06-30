import { useEffect, useState, type ReactNode } from "react";
import { useSetRecoilState } from "recoil";
import type { Product } from "@muoi/core";
import type { SelectedOptions } from "@muoi/core";
import { calcFinalPrice, isIdentical } from "@muoi/core";
import { cartState, mergeCartItem } from "../../state/cart";
import { Sheet, SheetCloseButton } from "../Sheet";
import {
  MultipleOptionPicker,
  QuantityPicker,
  SingleOptionPicker,
} from "./OptionPickers";
import { DisplayPrice } from "../DisplayPrice";

function getDefaultOptions(product?: Product): SelectedOptions {
  if (product?.variants) {
    return product.variants.reduce<SelectedOptions>((options, variant) => {
      options[variant.id] = variant.default ?? (variant.type === "multiple" ? [] : "");
      return options;
    }, {});
  }
  return {};
}

export function ProductPicker({
  product,
  selected,
  children,
}: {
  product?: Product;
  selected?: { options: SelectedOptions; quantity: number };
  children: (methods: { open: () => void; close: () => void }) => ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<SelectedOptions>(
    selected ? selected.options : getDefaultOptions(product),
  );
  const [quantity, setQuantity] = useState(1);
  const setCart = useSetRecoilState(cartState);

  useEffect(() => {
    if (selected) {
      setOptions(selected.options);
      setQuantity(selected.quantity);
    } else if (product) {
      setOptions(getDefaultOptions(product));
      setQuantity(1);
    }
  }, [selected, product]);

  const addToCart = () => {
    if (!product) return;
    setCart((cart) =>
      mergeCartItem(
        cart,
        { product, options, quantity },
        selected?.options,
      ),
    );
    setVisible(false);
  };

  const linePrice = product
    ? calcFinalPrice(product, options) * quantity
    : 0;

  return (
    <>
      {children({
        open: () => setVisible(true),
        close: () => setVisible(false),
      })}
      <Sheet visible={visible} onClose={() => setVisible(false)}>
        {product && (
          <div className="flex flex-col max-h-[85vh]">
            <SheetCloseButton onClose={() => setVisible(false)} />
            <div className="flex-1 overflow-y-auto">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4 space-y-4">
                <div>
                  <h2 className="text-lg font-bold">{product.name}</h2>
                  <p className="text-primary font-semibold">
                    <DisplayPrice value={calcFinalPrice(product, options)} />
                  </p>
                  {product.description && (
                    <p
                      className="text-sm text-gray-500 mt-2 line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                  )}
                </div>
                {product.variants?.map((variant) =>
                  variant.type === "single" ? (
                    <SingleOptionPicker
                      key={variant.id}
                      variant={variant}
                      value={(options[variant.id] as string) || ""}
                      onChange={(selectedOption) =>
                        setOptions((prev) => ({
                          ...prev,
                          [variant.id]: selectedOption,
                        }))
                      }
                    />
                  ) : (
                    <MultipleOptionPicker
                      key={variant.id}
                      variant={variant}
                      value={(options[variant.id] as string[]) || []}
                      onChange={(selectedOption) =>
                        setOptions((prev) => ({
                          ...prev,
                          [variant.id]: selectedOption,
                        }))
                      }
                    />
                  ),
                )}
              </div>
            </div>
            <div className="p-4 border-t flex items-center gap-4 safe-area-bottom">
              <QuantityPicker value={quantity} onChange={setQuantity} />
              <button
                type="button"
                disabled={quantity <= 0}
                onClick={addToCart}
                className="flex-1 h-12 rounded-full bg-primary text-white font-semibold disabled:opacity-50"
              >
                {selected
                  ? quantity > 0
                    ? "Cập nhật"
                    : "Xoá"
                  : `Thêm • ${linePrice.toLocaleString("vi-VN")}đ`}
              </button>
            </div>
          </div>
        )}
      </Sheet>
    </>
  );
}

export { isIdentical };
