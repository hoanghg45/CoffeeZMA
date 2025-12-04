import { DisplayPrice } from "components/display/price";
import React, { FC } from "react";
import { useRecoilValue } from "recoil";
import { totalPriceState, totalQuantityState } from "state";
import pay from "utils/product";
import { Box, Button, Text, Icon } from "zmp-ui";

export const CartPreview: FC = () => {
  const quantity = useRecoilValue(totalQuantityState);
  const totalPrice = useRecoilValue(totalPriceState);

  return (
    <Box className="sticky bottom-0 bg-surface border-t border-divider shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] space-y-4">
      {/* Subtotal Row */}
      <Box className="flex justify-between items-center px-1">
        <Text size="large" className="font-bold text-gray-800">Tổng cộng</Text>
        <Text size="xLarge" className="font-bold text-gray-900">
          <DisplayPrice>{totalPrice}</DisplayPrice>
        </Text>
      </Box>

      {/* Checkout Button */}
      <Button
        type="highlight"
        variant="primary"
        disabled={!quantity}
        fullWidth
        onClick={() => pay(totalPrice)}
        className="rounded-full h-12 text-base font-bold shadow-md"
      >
        <Box className="flex items-center justify-center gap-2">
          <Text className="text-white font-bold">Đặt hàng ({quantity})</Text>
          <Icon icon="zi-arrow-right" size={18} className="text-white" />
        </Box>
      </Button>
    </Box>
  );
};
