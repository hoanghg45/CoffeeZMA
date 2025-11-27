import { FinalPrice } from "components/display/final-price";
import { Sheet } from "components/fullscreen-sheet";
import React, { FC, ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useSetRecoilState } from "recoil";
import { cartState } from "state";
import { SelectedOptions } from "types/cart";
import { Product } from "types/product";
import { calcFinalPrice, isIdentical } from "utils/product";
import { Box, Button, Text, Icon } from "zmp-ui";
import { MultipleOptionPicker } from "./multiple-option-picker";
import { QuantityPicker } from "./quantity-picker";
import { SingleOptionPicker } from "./single-option-picker";

export interface ProductPickerProps {
  product?: Product;
  selected?: {
    options: SelectedOptions;
    quantity: number;
  };
  children: (methods: { open: () => void; close: () => void }) => ReactNode;
}

function getDefaultOptions(product?: Product) {
  if (product && product.variants) {
    return product.variants.reduce(
      (options, variant) =>
        Object.assign(options, {
          [variant.id]: variant.default,
        }),
      {},
    );
  }
  return {};
}

export const ProductPicker: FC<ProductPickerProps> = ({
  children,
  product,
  selected,
}) => {
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
    }
  }, [selected]);

  const addToCart = () => {
    if (product) {
      setCart((cart) => {
        let res = [...cart];
        if (selected) {
          // updating an existing cart item, including quantity and size, or remove it if new quantity is 0
          const editing = cart.find(
            (item) =>
              item.product.id === product.id &&
              isIdentical(item.options, selected.options),
          )!;
          if (quantity === 0) {
            res.splice(cart.indexOf(editing), 1);
          } else {
            const existed = cart.find(
              (item, i) =>
                i !== cart.indexOf(editing) &&
                item.product.id === product.id &&
                isIdentical(item.options, options),
            )!;
            res.splice(cart.indexOf(editing), 1, {
              ...editing,
              options,
              quantity: existed ? existed.quantity + quantity : quantity,
            });
            if (existed) {
              res.splice(cart.indexOf(existed), 1);
            }
          }
        } else {
          // adding new item to cart, or merging if it already existed before
          const existed = cart.find(
            (item) =>
              item.product.id === product.id &&
              isIdentical(item.options, options),
          );
          if (existed) {
            res.splice(cart.indexOf(existed), 1, {
              ...existed,
              quantity: existed.quantity + quantity,
            });
          } else {
            res = res.concat({
              product,
              options,
              quantity,
            });
          }
        }
        return res;
      });
    }
    setVisible(false);
  };
  return (
    <>
      {children({
        open: () => setVisible(true),
        close: () => setVisible(false),
      })}
      {createPortal(
        <Sheet
          visible={visible}
          onClose={() => setVisible(false)}
          autoHeight={false}
          style={{ height: '85vh', maxHeight: '85vh' }}
          mask
          handler
          swipeToClose
        >
          {product && (
            <Box className="flex flex-col h-full bg-surface rounded-t-xl overflow-hidden relative">
              {/* Close Button - Absolute Top Right */}
              <div
                className="absolute top-3 right-3 z-50 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-sm cursor-pointer"
                onClick={() => setVisible(false)}
              >
                <Icon icon="zi-close" className="text-gray-600" size={24} />
              </div>

              {/* Scrollable Content Area */}
              <Box className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Product Image */}
                <Box className="w-full h-56 relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </Box>

                <Box p={4} className="space-y-5">
                  {/* Header Info */}
                  <Box>
                    <Text.Title size="large" className="font-bold text-primary mb-1">{product.name}</Text.Title>
                    <Text size="xLarge" className="font-bold text-primary">
                      <FinalPrice options={options}>{product}</FinalPrice>
                    </Text>
                    <Text size="small" className="text-gray-500 mt-2 leading-relaxed">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: product.description ?? "",
                        }}
                      ></div>
                    </Text>
                  </Box>

                  {/* Variants */}
                  <Box className="space-y-4">
                    {product.variants &&
                      product.variants.map((variant) =>
                        variant.type === "single" ? (
                          <SingleOptionPicker
                            key={variant.id}
                            variant={variant}
                            value={options[variant.id] as string}
                            onChange={(selectedOption) =>
                              setOptions((prevOptions) => ({
                                ...prevOptions,
                                [variant.id]: selectedOption,
                              }))
                            }
                          />
                        ) : (
                          <MultipleOptionPicker
                            key={variant.id}
                            product={product}
                            variant={variant}
                            value={options[variant.id] as string[]}
                            onChange={(selectedOption) =>
                              setOptions((prevOptions) => ({
                                ...prevOptions,
                                [variant.id]: selectedOption,
                              }))
                            }
                          />
                        ),
                      )}
                  </Box>
                </Box>
              </Box>

              {/* Sticky Footer Action Bar */}
              <Box className="flex-none p-4 bg-surface border-t border-divider shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-10 safe-area-bottom">
                <Box flex className="gap-4 items-center">
                  <Box className="flex-1">
                    <QuantityPicker value={quantity} onChange={setQuantity} />
                  </Box>
                  <Box className="flex-[2]">
                    {selected ? (
                      <Button
                        variant={quantity > 0 ? "primary" : "secondary"}
                        type={quantity > 0 ? "highlight" : "neutral"}
                        fullWidth
                        className="rounded-full h-12 text-base font-bold shadow-md"
                        onClick={addToCart}
                      >
                        {quantity > 0
                          ? selected
                            ? "Cập nhật"
                            : "Thêm • " + (Number(calcFinalPrice(product, options)) * quantity).toLocaleString() + "đ"
                          : "Xoá"}
                      </Button>
                    ) : (
                      <Button
                        disabled={!quantity}
                        variant="primary"
                        type="highlight"
                        fullWidth
                        className="rounded-full h-12 text-base font-bold shadow-md"
                        onClick={addToCart}
                      >
                        Thêm • {(Number(calcFinalPrice(product, options)) * quantity).toLocaleString()}đ
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </Sheet>,
        document.body,
      )}
    </>
  );
};
