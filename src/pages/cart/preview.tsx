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
    <Box className="sticky bottom-0 bg-surface border-t border-divider shadow-[0_-4px_20px_rgba(0,0,0,0.08)] safe-area-bottom">
      <Box flex className="p-4 gap-4 items-center">
        <Box
          flex
          flexDirection="column"
          justifyContent="space-between"
          className="min-w-[120px] flex-none"
        >
          <Text className="text-gray-500" size="small">
            {quantity} sản phẩm
          </Text>
          <Text.Title size="large" className="font-bold text-primary">
            <DisplayPrice>{totalPrice}</DisplayPrice>
          </Text.Title>
        </Box>
        <Button
          type="highlight"
          variant="primary"
          disabled={!quantity}
          fullWidth
          onClick={() => pay(totalPrice)}
          className="rounded-full h-12 text-base font-bold shadow-md"
        >
          <Box className="flex items-center justify-center gap-2">
            <Text className="text-white font-bold">Đặt hàng</Text>
            <Icon icon="zi-arrow-right" size={18} className="text-white" />
          </Box>
        </Button>
      </Box>
    </Box>
  );
};
