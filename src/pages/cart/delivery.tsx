import { ElasticTextarea } from "components/elastic-textarea";
import React, { FC, Suspense } from "react";
import { Box, Icon, Text } from "zmp-ui";
import { RequestPersonPickerPhone } from "./person-picker";
import { TimePicker } from "./time-picker";
import { useRecoilState, useRecoilValueLoadable, useSetRecoilState } from "recoil";
import {
  orderNoteState,
  calculatedDeliveryFeeState,
  selectedStoreState,
  phoneState,
  requestPhoneTriesState
} from "state";
import { AddressPicker } from "components/address-picker";
import { BranchPicker } from "components/branch-picker";
import { VoucherPicker } from "components/voucher-picker";

export const Delivery: FC = () => {
  const [note, setNote] = useRecoilState(orderNoteState);

  // Use Loadables to prevent component suspension at top level
  const deliveryFeeLoadable = useRecoilValueLoadable(calculatedDeliveryFeeState);
  const selectedStoreLoadable = useRecoilValueLoadable(selectedStoreState);
  const phoneLoadable = useRecoilValueLoadable(phoneState);
  const retry = useSetRecoilState(requestPhoneTriesState);

  const deliveryFee = deliveryFeeLoadable.state === 'hasValue' ? deliveryFeeLoadable.contents : 0;
  const isFeeLoading = deliveryFeeLoadable.state === 'loading';

  const selectedStore = selectedStoreLoadable.state === 'hasValue' ? selectedStoreLoadable.contents : null;

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
          <AddressPicker />
        </Suspense>

        {/* Branch Selection (Source) */}
        <Box className="flex items-start space-x-3">
          <Box className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mt-1">
            <Icon icon="zi-home" className="text-yellow-600" size={20} />
          </Box>
          <Box className="flex-1">
            <Text size="xSmall" className="text-gray-500 mb-1">Giao từ cửa hàng</Text>
            <Suspense fallback={<Box className="p-2"><Text className="text-gray-400 text-sm">Đang tải cửa hàng...</Text></Box>}>
              <BranchPicker />
            </Suspense>
          </Box>
        </Box>

      </Box>

      {/* Time & Details - Common for both */}
      <Box className="bg-surface rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <Box className="flex items-center space-x-3">
          <Box className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
            <Icon icon="zi-clock-1" className="text-yellow-600" size={20} />
          </Box>
          <Box flex className="flex-1 items-center justify-between">
            <Box className="flex-1 space-y-[2px]">
              <Text size="small" className="font-bold text-gray-800">Thời gian nhận</Text>
              <TimePicker />
            </Box>
            <Icon icon="zi-chevron-right" className="text-gray-400" size={20} />
          </Box>
        </Box>
      </Box>

      {/* Recipient & Note */}
      <Box className="bg-surface rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
        <Box className="flex items-center space-x-3">
          <Box className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
            <Icon icon="zi-user" className="text-yellow-600" size={20} />
          </Box>
          <Box
            flex
            className="flex-1 items-center justify-between"
            onClick={handlePersonPickerClick}
            style={{ cursor: phoneLoadable.state !== 'hasValue' || !phoneLoadable.contents ? 'pointer' : 'default' }}
          >
            <Suspense fallback={<Text className="text-gray-400">Đang tải thông tin...</Text>}>
              <RequestPersonPickerPhone />
            </Suspense>
            <Icon icon="zi-chevron-right" className="text-gray-400" size={20} />
          </Box>
        </Box>

        <Box className="flex items-start space-x-3">
          <Box className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mt-2">
            <Icon icon="zi-note" className="text-yellow-600" size={20} />
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
