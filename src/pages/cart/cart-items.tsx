import { FinalPrice } from "components/display/final-price";
import { DisplaySelectedOptions } from "components/display/selected-options";
import { ListRenderer } from "components/list-renderer";
import { ProductPicker } from "components/product/picker";
import React, { FC, useState } from "react";
import { useRecoilValue } from "recoil";
import { cartState } from "state";
import { CartItem } from "types/cart";
import { Box, Text } from "zmp-ui";

export const CartItems: FC = () => {
  const cart = useRecoilValue(cartState);
  const [editingItem, setEditingItem] = useState<CartItem | undefined>();

  return (
    <Box className="py-3 px-4">
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
                <img
                  className="w-16 h-16 rounded-lg object-cover border border-divider"
                  src={item.product.image}
                />
              )}
              renderRight={(item) => (
                <Box flex className="space-x-1 w-full">
                  <Box className="space-y-1 flex-1">
                    <Text size="normal" className="font-medium text-onSurface">{item.product.name}</Text>
                    <Text className="text-onSurfaceVariant" size="xSmall">
                      <FinalPrice options={item.options}>
                        {item.product}
                      </FinalPrice>
                    </Text>
                    <Text className="text-outline" size="xxxSmall">
                      <DisplaySelectedOptions options={item.options}>
                        {item.product}
                      </DisplaySelectedOptions>
                    </Text>
                  </Box>
                  <Text className="text-primary font-medium" size="small">
                    x{item.quantity}
                  </Text>
                </Box>
              )}
              noDivider
              className="space-y-3"
              itemClassName="p-3 bg-surface rounded-lg border border-divider shadow-sm"
            />
          )}
        </ProductPicker>
      ) : (
        <Text
          className="bg-background rounded-xl py-8 px-4 text-center text-gray"
          size="xxSmall"
        >
          Không có sản phẩm trong giỏ hàng
        </Text>
      )}
    </Box>
  );
};
