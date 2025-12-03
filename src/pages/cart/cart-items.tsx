import { FinalPrice } from "components/display/final-price";
import { DisplaySelectedOptions } from "components/display/selected-options";
import { ListRenderer } from "components/list-renderer";
import { ProductPicker } from "components/product/picker";
import React, { FC, useState } from "react";
import { useRecoilState } from "recoil";
import { cartState } from "state";
import { CartItem } from "types/cart";
import { Box, Text, Icon } from "zmp-ui";

export const CartItems: FC = () => {
  const [cart, setCart] = useRecoilState(cartState);
  const [editingItem, setEditingItem] = useState<CartItem | undefined>();

  const updateQuantity = (item: CartItem, quantity: number) => {
    if (quantity <= 0) {
      removeItem(item);
      return;
    }
    const newCart = cart.map((i) =>
      (i === item ? { ...i, quantity } : i)
    );
    setCart(newCart);
  };

  const removeItem = (item: CartItem) => {
    const newCart = cart.filter((i) => i !== item);
    setCart(newCart);
  };

  return (
    <Box className="py-4 px-4">
      {cart.length > 0 ? (
        <ProductPicker product={editingItem?.product} selected={editingItem}>
          {({ open }) => (
            <ListRenderer
              items={cart}
              limit={3}
              onClick={(item) => {
                setEditingItem(item);
                open();
              }}
              renderKey={({ product, options, quantity }) =>
                JSON.stringify({ product: product.id, options, quantity })
              }
              renderLeft={(item) => (
                <Box className="flex-shrink-0">
                  <img
                    className="w-16 h-16 rounded-lg object-cover shadow-sm"
                    src={item.product.image}
                    alt={item.product.name}
                  />
                </Box>
              )}
              renderRight={(item) => (
                <Box flex className="space-x-2 w-full min-w-0 items-center justify-between">
                  <Box className="space-y-0.5 flex-1 min-w-0">
                    <Text size="normal" className="font-bold text-gray-800 leading-tight truncate">
                      {item.product.name}
                    </Text>
                    <Text className="text-gray-600 font-medium" size="small">
                      <FinalPrice options={item.options}>
                        {item.product}
                      </FinalPrice>
                    </Text>
                    <Text className="text-gray-400 leading-none truncate" size="xxSmall">
                      <DisplaySelectedOptions options={item.options}>
                        {item.product}
                      </DisplaySelectedOptions>
                    </Text>
                  </Box>
                  <Box className="flex items-center bg-white rounded-full h-8 px-1 space-x-1 border border-gray-200 shadow-sm" onClick={(e) => e.stopPropagation()}>
                    <Box
                      className="w-7 h-7 flex items-center justify-center active:opacity-50 cursor-pointer"
                      onClick={() => updateQuantity(item, item.quantity - 1)}
                    >
                      {item.quantity === 1 ? (
                        <Icon icon="zi-close" size={14} className="text-red-500" />
                      ) : (
                        <div className="w-2.5 h-[1.5px] bg-gray-600" />
                      )}
                    </Box>
                    <Text size="small" className="font-bold text-gray-800 min-w-[16px] text-center">
                      {item.quantity}
                    </Text>
                    <Box
                      className="w-7 h-7 flex items-center justify-center active:opacity-50 cursor-pointer"
                      onClick={() => updateQuantity(item, item.quantity + 1)}
                    >
                      <Icon icon="zi-plus" size={14} className="text-primary" />
                    </Box>
                  </Box>
                </Box>
              )}
              noDivider
              className="space-y-3"
              itemClassName="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm active:scale-[0.99] transition-transform duration-200"
            />
          )}
        </ProductPicker>
      ) : (
        <Box className="flex flex-col items-center justify-center py-16 px-4">
          <Box className="w-24 h-24 bg-surfaceVariant rounded-full flex items-center justify-center mb-4">
            <Icon icon="zi-shopping-cart" size={40} className="text-gray-400" />
          </Box>
          <Text.Title size="small" className="text-gray-500 mb-2 text-center font-bold">
            Giỏ hàng trống
          </Text.Title>
          <Text size="small" className="text-gray-400 text-center">
            Thêm sản phẩm vào giỏ hàng để bắt đầu đặt hàng
          </Text>
        </Box>
      )}
    </Box>
  );
};
