import { ElasticTextarea } from "components/elastic-textarea";
import React, { FC, Suspense, useMemo } from "react";
import { Box, Text } from "zmp-ui";
import { Home, Clock, User, ChevronRight, FileText, AlertCircle, MapPin, Truck } from "lucide-react";
import { RequestPersonPickerPhone } from "./person-picker";
import { TimePicker } from "./time-picker";
import { useRecoilState, useRecoilValueLoadable, useSetRecoilState, useRecoilValue } from "recoil";
import {
  orderNoteState,
  calculatedDeliveryFeeState,
  selectedStoreState,
  phoneState,
  requestPhoneTriesState,
  selectedAddressState,
  selectedDeliveryTimeState
} from "state";
import { AddressPicker } from "components/address-picker";
import { BranchPicker } from "components/branch-picker";
import { VoucherPicker } from "components/voucher-picker";
import { validateCheckoutFields } from "utils/checkout-validation";
import { ShippingServicePicker } from "./shipping-picker";

export const Delivery: FC = () => {
  const [note, setNote] = useRecoilState(orderNoteState);

  // Use Loadables to prevent component suspension at top level
  const deliveryFeeLoadable = useRecoilValueLoadable(calculatedDeliveryFeeState);
  const selectedStoreLoadable = useRecoilValueLoadable(selectedStoreState);
  const phoneLoadable = useRecoilValueLoadable(phoneState);
  const retry = useSetRecoilState(requestPhoneTriesState);

  // Required fields for validation
  const selectedAddress = useRecoilValue(selectedAddressState);
  const deliveryTime = useRecoilValue(selectedDeliveryTimeState);

  const deliveryFee = deliveryFeeLoadable.state === 'hasValue' ? deliveryFeeLoadable.contents : 0;
  const isFeeLoading = deliveryFeeLoadable.state === 'loading';

  const selectedStore = selectedStoreLoadable.state === 'hasValue' ? selectedStoreLoadable.contents : null;
  const phone = phoneLoadable.state === 'hasValue' ? phoneLoadable.contents : false;

  // Validate fields to show visual indicators
  const validation = useMemo(() => {
    return validateCheckoutFields(
      selectedAddress,
      phone,
      selectedStore,
      deliveryTime
    );
  }, [selectedAddress, phone, selectedStore, deliveryTime]);

  // Handle click for phone request - only clickable when phone is not available
  const handlePersonPickerClick = () => {
    if (phoneLoadable.state !== 'hasValue' || !phoneLoadable.contents) {
      retry((r) => r + 1);
    }
  };

  return (
    <Box className="space-y-4 px-4 pt-2">
      {/* Delivery Information */}
      <Box className="bg-surface rounded-md p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
        {/* Address Selection */}
        <Suspense fallback={<Box className="p-4 flex justify-center"><Text className="text-gray-400">Đang tải địa chỉ...</Text></Box>}>
          <Box className="flex items-center space-x-3">
            <Box className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
              <MapPin className="text-yellow-600" size={20} />
            </Box>
            <Box flex className="flex-1 items-center justify-between">
              <Box className="flex-1">
                <AddressPicker hideIcon hideChevron />
                {validation.missingFields.address && (
                  <Box className="flex items-center gap-1.5 mt-2">
                    <AlertCircle size={13} className="text-red-500 flex-shrink-0" />
                    <Text size="xSmall" className="text-red-500">Vui lòng chọn địa chỉ giao hàng</Text>
                  </Box>
                )}
              </Box>
              <ChevronRight className="text-gray-400" size={20} />
            </Box>
          </Box>
        </Suspense>


        {/* Branch Selection (Source) */}
        <Box className="flex items-start space-x-3">
          <Box className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mt-1">
            <Home className="text-yellow-600" size={20} />
          </Box>
          <Box className="flex-1">
            <Text size="xSmall" className="text-gray-500 mb-1">Giao từ cửa hàng</Text>
            <Suspense fallback={<Box className="p-2"><Text className="text-gray-400 text-sm">Đang tải cửa hàng...</Text></Box>}>
              <BranchPicker />
            </Suspense>
            {validation.missingFields.store && (
              <Box className="flex items-center gap-1.5 mt-2">
                <AlertCircle size={13} className="text-red-500 flex-shrink-0" />
                <Text size="xSmall" className="text-red-500">Vui lòng chọn cửa hàng</Text>
              </Box>
            )}
          </Box>
        </Box>

        {/* Shipping Service Selection */}
        <Box className="flex items-start space-x-3 pt-2 border-t border-gray-100">
          <Box className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mt-1">
            <Truck className="text-yellow-600" size={20} />
          </Box>
          <Box className="flex-1">
            <Text size="xSmall" className="text-gray-500 mb-2">Hình thức giao hàng</Text>
            <ShippingServicePicker />
          </Box>
        </Box>

      </Box>

      {/* Time & Details - Common for both */}
      <Box className="bg-surface rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <Box className="flex items-center space-x-3">
          <Box className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
            <Clock className="text-yellow-600" size={20} />
          </Box>
          <Box flex className="flex-1 items-center justify-between">
            <Box className="flex-1 space-y-[2px]">
              <Text size="small" className="font-bold text-gray-800">Thời gian nhận</Text>
              <TimePicker />
              {validation.missingFields.time && (
                <Box className="flex items-center gap-1.5 mt-2">
                  <AlertCircle size={13} className="text-red-500 flex-shrink-0" />
                  <Text size="xSmall" className="text-red-500">Vui lòng chọn thời gian nhận hàng</Text>
                </Box>
              )}
            </Box>
            <ChevronRight className="text-gray-400" size={20} />
          </Box>
        </Box>
      </Box>

      {/* Recipient & Note */}
      <Box className="bg-surface rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
        <Box className="flex items-center space-x-3">
          <Box className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
            <User className="text-yellow-600" size={20} />
          </Box>
          <Box
            flex
            className="flex-1 items-center justify-between"
            onClick={handlePersonPickerClick}
            style={{ cursor: phoneLoadable.state !== 'hasValue' || !phoneLoadable.contents ? 'pointer' : 'default' }}
          >
            <Box className="flex-1">
              <Suspense fallback={<Text className="text-gray-400">Đang tải thông tin...</Text>}>
                <RequestPersonPickerPhone />
              </Suspense>
              {validation.missingFields.phone && (
                <Box className="flex items-center gap-1.5 mt-2">
                  <AlertCircle size={13} className="text-red-500 flex-shrink-0" />
                  <Text size="xSmall" className="text-red-500">Vui lòng cung cấp số điện thoại</Text>
                </Box>
              )}
            </Box>
            <ChevronRight className="text-gray-400" size={20} />
          </Box>
        </Box>

        <Box className="flex items-start space-x-3">
          <Box className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mt-2">
            <FileText className="text-yellow-600" size={20} />
          </Box>
          <Box flex className="flex-1">
            <ElasticTextarea
              placeholder="Thêm ghi chú..."
              className="border-none px-0 w-full focus:outline-none bg-transparent text-gray-700 text-sm placeholder:text-gray-400"
              maxRows={4}
              value={note}
              onChange={(e) => setNote(e.currentTarget.value)}
            />
          </Box>
        </Box>
      </Box>

      {/* Voucher Selection */}
      <VoucherPicker />
    </Box>
  );
};
