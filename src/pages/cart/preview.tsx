import { DisplayPrice } from "components/display/price";
import React, { FC, useState } from "react";
import { useRecoilValue, useRecoilValueLoadable, useRecoilState } from "recoil";
import {
  totalPriceState,
  totalQuantityState,
  priceBreakdownState,
  calculatedDeliveryFeeState,
  customerProfileState,
  loyaltyPromptState,
  selectedAddressState,
  selectedStoreState,
  phoneState,
  selectedDeliveryTimeState,
  cartState
} from "state";
import pay from "utils/product";
import { Box, Button, Text, useSnackbar, useNavigate } from "zmp-ui";
import { ArrowRight, ChevronRight } from "lucide-react";
import { LoyaltyOptinSheet } from "components/loyalty/loyalty-optin-sheet";
import { validateCheckoutFields, getFirstValidationError } from "utils/checkout-validation";

export const CartPreview: FC = () => {
  const quantity = useRecoilValue(totalQuantityState);
  const [cart, setCart] = useRecoilState(cartState);
  const totalPriceLoadable = useRecoilValueLoadable(totalPriceState);
  const deliveryFeeLoadable = useRecoilValueLoadable(calculatedDeliveryFeeState);
  const breakdownLoadable = useRecoilValueLoadable(priceBreakdownState);
  const customerProfileLoadable = useRecoilValueLoadable(customerProfileState);

  // Required checkout fields
  const selectedAddress = useRecoilValue(selectedAddressState);
  const selectedStoreLoadable = useRecoilValueLoadable(selectedStoreState);
  const phoneLoadable = useRecoilValueLoadable(phoneState);
  const deliveryTime = useRecoilValue(selectedDeliveryTimeState);

  const [loyaltyDismissed] = useRecoilState(loyaltyPromptState);

  const [loyaltySheetVisible, setLoyaltySheetVisible] = useState(false);
  // Track created Order ID to prevent duplicates if user changes payment method
  const [createdOrderId, setCreatedOrderId] = useState<string | undefined>(undefined);
  const { openSnackbar } = useSnackbar();
  const navigate = useNavigate();


  const isLoading =
    totalPriceLoadable.state === "loading" ||
    deliveryFeeLoadable.state === "loading" ||
    breakdownLoadable.state === "loading" ||
    customerProfileLoadable.state === "loading" ||
    selectedStoreLoadable.state === "loading" ||
    phoneLoadable.state === "loading";

  const totalPrice = totalPriceLoadable.state === "hasValue" ? totalPriceLoadable.contents : 0;
  const deliveryFee = deliveryFeeLoadable.state === "hasValue" ? deliveryFeeLoadable.contents : 0;
  const breakdown = breakdownLoadable.state === "hasValue" ? breakdownLoadable.contents : { subtotal: 0, discount: 0 };
  const customerProfile = customerProfileLoadable.state === "hasValue" ? customerProfileLoadable.contents : null;
  const selectedStore = selectedStoreLoadable.state === "hasValue" ? selectedStoreLoadable.contents : null;
  const phone = phoneLoadable.state === "hasValue" ? phoneLoadable.contents : false;

  // Validate checkout fields
  const validation = validateCheckoutFields(
    selectedAddress,
    phone,
    selectedStore,
    deliveryTime
  );

  const handleCheckout = async () => {
    // Prevent checkout if delivery info has error
    if (deliveryFeeLoadable.state === "hasError") {
      openSnackbar({
        type: "error",
        text: (deliveryFeeLoadable as any).error?.message || "Vui lòng chọn phương thức giao hàng phù hợp",
        duration: 3000,
      });
      return;
    }

    // Validate required fields first
    if (!validation.isValid) {
      const errorMessage = getFirstValidationError(validation);
      openSnackbar({
        type: "error",
        text: errorMessage || "Vui lòng điền đầy đủ thông tin trước khi đặt hàng",
        duration: 3000,
      });

      // Scroll to the first missing field provided by validation
      // Mapping validation keys to identifying DOM Ids
      if (validation.missingFields.address) {
        document.getElementById("checkout-address-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (validation.missingFields.store) {
        document.getElementById("checkout-store-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (validation.missingFields.time) {
        document.getElementById("checkout-time-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (validation.missingFields.phone) {
        document.getElementById("checkout-phone-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      return;
    }

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
      // Try payment anyway (optional fallback)
      processPayment();
      return;
    }

    // Check Loyalty - only if we have a valid customer profile
    if (customerProfile && !customerProfile.isLoyaltyMember && !loyaltyDismissed) {
      setLoyaltySheetVisible(true);
      return;
    }

    // Proceed to payment
    processPayment();
  };

  const processPayment = async () => {
    try {
      const result = await pay(totalPrice, cart, {
        customerInfo: {
          id: customerProfile?.id ?? "",
          name: customerProfile?.name ?? "Khách lẻ",
          phone: typeof phone === 'string' ? phone : "",
          address: typeof selectedAddress === 'string' ? selectedAddress : (selectedAddress?.address ?? "")
        },
        fees: {
          subtotal: breakdown.subtotal,
          shipping: deliveryFee,
          discount: breakdown.discount,
          total: totalPrice
        },
        branchId: selectedStore ? String(selectedStore.id) : undefined,
        note: "", // We will add Note input later if needed
        deliveryLat: typeof selectedAddress === 'object' ? selectedAddress?.lat : undefined,
        deliveryLng: typeof selectedAddress === 'object' ? selectedAddress?.long : undefined
      }, createdOrderId);
      console.log("Payment flow finished. Result:", result);

      if ((result as any).backendOrderId) {
        setCreatedOrderId((result as any).backendOrderId);
      }

      // Note: Do NOT clear cart or navigate here.
      // Payment flow is async. Success is handled via OpenApp event -> /result page.
    } catch (error) {
      console.error("Payment failed", error);
      openSnackbar({
        type: "error",
        text: "Thanh toán thất bại hoặc đã hủy. Vui lòng thử lại.",
        duration: 3000,
      });
    }
  };

  const handleLoyaltyContinue = () => {
    setLoyaltySheetVisible(false);
    processPayment();
  };

  const [expanded, setExpanded] = useState(false);

  return (
    <Box className="sticky bottom-0 bg-surface border-t border-divider shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-10">
      {/* Expandable Breakdown Details */}
      {expanded && (
        <Box className="px-5 pt-4 space-y-3 bg-surface border-b border-gray-50 pb-4 animate-fadeIn">
          {/* Subtotal Row */}
          <Box className="flex justify-between items-center text-sm">
            <Text className="text-gray-500">Tạm tính</Text>
            <Text className="font-medium text-gray-900">
              <DisplayPrice>{breakdown.subtotal}</DisplayPrice>
            </Text>
          </Box>

          {/* Delivery Fee Row */}
          <Box className="flex justify-between items-center text-sm">
            <Text className="text-gray-500">Phí giao hàng</Text>
            {deliveryFeeLoadable.state === "hasError" ? (
              <Text className="font-medium text-red-500 text-xs text-right max-w-[60%]">
                {(deliveryFeeLoadable as any).error?.message || "Khoảng cách quá xa"}
              </Text>
            ) : (
              <Text className="font-medium text-gray-900">
                {deliveryFeeLoadable.state === "loading" ? "..." : <DisplayPrice>{deliveryFee}</DisplayPrice>}
              </Text>
            )}
          </Box>

          {/* Discount Row */}
          {breakdown.discount > 0 && (
            <Box className="flex justify-between items-center text-sm">
              <Text className="text-gray-500">Giảm giá</Text>
              <Text className="font-medium text-green-600">
                -<DisplayPrice>{breakdown.discount}</DisplayPrice>
              </Text>
            </Box>
          )}
        </Box>
      )}

      {/* Main Compact Bar */}
      <Box className="flex items-center gap-4 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-surface">
        {/* Total Price Section - Clickable to toggle details */}
        <Box
          className="flex-none flex flex-col cursor-pointer active:opacity-70 transition-opacity min-w-[30%]"
          onClick={() => setExpanded(!expanded)}
        >
          <Box className="flex items-center gap-1 mb-0.5">
            <Text size="xSmall" className="text-gray-500 font-medium">Tổng cộng</Text>
            <ChevronRight
              size={14}
              className={`text-gray-400 transition-transform duration-200 ${expanded ? '-rotate-90' : '-rotate(0)'}`}
              style={{ transform: expanded ? "rotate(-90deg)" : "rotate(-90deg) translateX(2px)" }}
            />
          </Box>
          <Text size="xLarge" className="font-bold text-primary leading-tight">
            {isLoading ? "..." : (deliveryFeeLoadable.state === "hasError" ? "Tạm tính" : <DisplayPrice>{totalPrice}</DisplayPrice>)}
          </Text>
        </Box>

        {/* Checkout Button - Prominent & Full Height */}
        <Button
          type="highlight"
          variant="primary"
          disabled={!quantity || isLoading || deliveryFeeLoadable.state === "hasError"}
          fullWidth
          onClick={handleCheckout}
          className="rounded-full h-12 text-base font-bold shadow-md flex-1 m-0"
        >
          <Box className="flex items-center justify-center gap-2">
            <Text className="text-white font-bold">Đặt hàng ({quantity})</Text>
            <ArrowRight size={18} className="text-white" />
          </Box>
        </Button>
      </Box>

      <LoyaltyOptinSheet
        visible={loyaltySheetVisible}
        onClose={() => setLoyaltySheetVisible(false)}
        onContinue={handleLoyaltyContinue}
        customerId={customerProfile?.id ?? ""}
      />
    </Box>
  );
};
