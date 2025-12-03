import { FinalPrice } from "components/display/final-price";
import { DisplaySelectedOptions } from "components/display/selected-options";
import { ListRenderer } from "components/list-renderer";
import { ProductPicker } from "components/product/picker";
import React, { FC, useState } from "react";
import { useRecoilValue } from "recoil";
import { cartState } from "state";
import { CartItem } from "types/cart";
import { Box, Text, Icon } from "zmp-ui";

export const CartItems: FC = () => {
  const cart = useRecoilValue(cartState);
  const [editingItem, setEditingItem] = useState<CartItem | undefined>();

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
                    className="w-20 h-20 rounded-xl object-cover shadow-sm border border-divider"
                    src={item.product.image}
                    alt={item.product.name}
                  />
                </Box>
              )}
              renderRight={(item) => (
                <Box flex className="space-x-3 w-full min-w-0">
                  <Box className="space-y-1.5 flex-1 min-w-0">
                    <Text size="normal" className="font-bold text-primary leading-snug">
                      {item.product.name}
                    </Text>
                    <Text className="text-gray-600 font-medium" size="small">
                      <FinalPrice options={item.options}>
                        {item.product}
                      </FinalPrice>
                    </Text>
                    <Text className="text-gray-500 leading-relaxed" size="xSmall">
                      <DisplaySelectedOptions options={item.options}>
                        {item.product}
                      </DisplaySelectedOptions>
                    </Text>
                  </Box>
                  <Box className="flex-shrink-0 flex items-center">
                    <Text className="text-primary font-bold" size="normal">
                      x{item.quantity}
                    </Text>
                  </Box>
                </Box>
              )}
              noDivider
              className="space-y-3"
              itemClassName="p-4 bg-surface rounded-xl border border-divider shadow-sm active:bg-surfaceVariant transition-colors duration-200"
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
