import { DisplayPrice } from "components/display/price";
import React, { FC, useState } from "react";
import { useRecoilValue, useRecoilValueLoadable, useRecoilState } from "recoil";
import {
  totalPriceState,
  totalQuantityState,
  priceBreakdownState,
  calculatedDeliveryFeeState,
  customerProfileState,
  loyaltyPromptState
} from "state";
import pay from "utils/product";
import { Box, Button, Text, useSnackbar } from "zmp-ui";
import { ArrowRight } from "lucide-react";
import { LoyaltyOptinSheet } from "components/loyalty/loyalty-optin-sheet";

export const CartPreview: FC = () => {
  const quantity = useRecoilValue(totalQuantityState);
  const totalPriceLoadable = useRecoilValueLoadable(totalPriceState);
  const deliveryFeeLoadable = useRecoilValueLoadable(calculatedDeliveryFeeState);
  const breakdownLoadable = useRecoilValueLoadable(priceBreakdownState);
  const customerProfileLoadable = useRecoilValueLoadable(customerProfileState);

  const [loyaltyDismissed] = useRecoilState(loyaltyPromptState);

  const [loyaltySheetVisible, setLoyaltySheetVisible] = useState(false);
  const { openSnackbar } = useSnackbar();

  const isLoading =
    totalPriceLoadable.state === "loading" ||
    deliveryFeeLoadable.state === "loading" ||
    breakdownLoadable.state === "loading" ||
    customerProfileLoadable.state === "loading";

  const totalPrice = totalPriceLoadable.state === "hasValue" ? totalPriceLoadable.contents : 0;
  const deliveryFee = deliveryFeeLoadable.state === "hasValue" ? deliveryFeeLoadable.contents : 0;
  const breakdown = breakdownLoadable.state === "hasValue" ? breakdownLoadable.contents : { subtotal: 0, discount: 0 };
  const customerProfile = customerProfileLoadable.state === "hasValue" ? customerProfileLoadable.contents : null;

  const handleCheckout = async () => {
    // Check if still loading profile
    if (customerProfileLoadable.state === "loading") {
      openSnackbar({
        type: "loading",
        text: "Đang tải thông tin...",
        duration: 2000,
      });
      return;
    }

    // Check for errors in customer profile
    if (customerProfileLoadable.state === "hasError") {
      console.error("Customer profile error:", customerProfileLoadable.contents);
      openSnackbar({
        type: "error",
        text: "Không thể tải thông tin khách hàng",
        duration: 3000,
      });
      // Still proceed to payment without loyalty - don't block checkout
      pay(totalPrice);
      return;
    }

    // Check Loyalty - only if we have a valid customer profile
    if (customerProfile && !customerProfile.isLoyaltyMember && !loyaltyDismissed) {
      setLoyaltySheetVisible(true);
      return;
    }

    // Proceed to payment
    pay(totalPrice);
  };

  const handleLoyaltyContinue = () => {
    setLoyaltySheetVisible(false);
    // Proceed to pay after decision
    pay(totalPrice);
  };

  return (
    <Box className="sticky bottom-0 bg-surface border-t border-divider shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] space-y-4 z-10">
      {/* Subtotal Row */}
      <Box className="flex justify-between items-center px-1">
        <Text size="normal" className="text-gray-500">Tạm tính</Text>
        <Text size="normal" className="font-medium text-gray-900">
          <DisplayPrice>{breakdown.subtotal}</DisplayPrice>
        </Text>
      </Box>

      {/* Delivery Fee Row */}
      <Box className="flex justify-between items-center px-1">
        <Text size="normal" className="text-gray-500">Phí giao hàng</Text>
        <Text size="normal" className="font-medium text-gray-900">
          {deliveryFeeLoadable.state === "loading" ? "..." : <DisplayPrice>{deliveryFee}</DisplayPrice>}
        </Text>
      </Box>

      {/* Discount Row */}
      {breakdown.discount > 0 && (
        <Box className="flex justify-between items-center px-1">
          <Text size="normal" className="text-gray-500">Giảm giá</Text>
          <Text size="normal" className="font-medium text-green-600">
            -<DisplayPrice>{breakdown.discount}</DisplayPrice>
          </Text>
        </Box>
      )}

      {/* Total Row */}
      <Box className="flex justify-between items-center px-1">
        <Text size="large" className="font-bold text-gray-800">Tổng cộng</Text>
        <Text size="xLarge" className="font-bold text-gray-900">
          {isLoading ? (
            <Text className="text-gray-400">Đang tính...</Text>
          ) : (
            <DisplayPrice>{totalPrice}</DisplayPrice>
          )}
        </Text>
      </Box>

      {/* Checkout Button */}
      <Button
        type="highlight"
        variant="primary"
        disabled={!quantity || isLoading}
        fullWidth
        onClick={handleCheckout}
        className="rounded-full h-12 text-base font-bold shadow-md"
      >
        <Box className="flex items-center justify-center gap-2">
          <Text className="text-white font-bold">Đặt hàng ({quantity})</Text>
          <ArrowRight size={18} className="text-white" />
        </Box>
      </Button>

      <LoyaltyOptinSheet
        visible={loyaltySheetVisible}
        onClose={() => setLoyaltySheetVisible(false)}
        onContinue={handleLoyaltyContinue}
        customerId={customerProfile?.id ?? ""}
      />
    </Box>
  );
};
