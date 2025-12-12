import React, { FC } from "react";
import { useRecoilValue } from "recoil";
import { cartState } from "state";
import { Box, Text } from "zmp-ui";
import { ShoppingCart } from "lucide-react";

export const CartIcon: FC<{ active?: boolean }> = ({ active }) => {
  const cart = useRecoilValue(cartState);

  return (
    <Box className="relative">
      <ShoppingCart
        size={24}
        className={active ? "text-primary" : "text-gray-500"}
        fill={active ? "currentColor" : "none"}
      />
      {cart.length > 0 && (
        <Box className="absolute -right-2 -top-[2px] p-[2px] bg-background rounded-full">
          <Text
            className="w-4 h-4 bg-red-500 rounded-full text-white"
            size="xxxxSmall"
          >
            {cart.length > 9 ? "9+" : cart.length}
          </Text>
        </Box>
      )}
    </Box>
  );
};
