import { ElasticTextarea } from "components/elastic-textarea";
import React, { FC, Suspense } from "react";
import { Box, Icon, Text } from "zmp-ui";
import { RequestPersonPickerPhone } from "./person-picker";
import { RequestStorePickerLocation, StorePicker } from "./store-picker";
import { TimePicker } from "./time-picker";
import { useRecoilState } from "recoil";
import { orderNoteState } from "state";

export const Delivery: FC = () => {
  const [note, setNote] = useRecoilState(orderNoteState);

  return (
    <Box className="space-y-4 px-4 pt-2">
      {/* Delivery Method Card */}
      <Box className="bg-surface rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <Box className="flex items-center space-x-3 mb-3">
          <Box className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
            <Icon icon="zi-location" className="text-primary" size={20} />
          </Box>
          <Text.Title size="small" className="font-bold text-gray-800">Giao tới</Text.Title>
        </Box>

        <Box className="pl-0">
          <Suspense fallback={<RequestStorePickerLocation />}>
            <StorePicker />
          </Suspense>
        </Box>

        <Box className="h-[1px] bg-divider my-3" />

        <Box className="flex items-center space-x-3">
          <Box className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
            <Icon icon="zi-clock-1" className="text-orange-600" size={20} />
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

      {/* Order Details Card */}
      <Box className="bg-surface rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
        {/* Recipient */}
        <Box className="flex items-center space-x-3">
          <Box className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Icon icon="zi-user" className="text-blue-600" size={20} />
          </Box>
          <Box flex className="flex-1 border-b border-divider pb-4">
            <RequestPersonPickerPhone />
          </Box>
        </Box>

        {/* Note */}
        <Box className="flex items-start space-x-3">
          <Box className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mt-1">
            <Icon icon="zi-note" className="text-green-600" size={20} />
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
    </Box>
  );
};
