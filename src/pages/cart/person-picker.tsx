import React, { FC } from "react";
import {
  useRecoilValue,
  useRecoilValueLoadable,
} from "recoil";
import { phoneState, userState } from "state";
import { Box, Text } from "zmp-ui";
import { formatPhoneNumber, getPhoneDisplayText } from "utils/phone";

export const PersonPicker: FC = () => {
  const user = useRecoilValueLoadable(userState);
  const phone = useRecoilValue(phoneState);

  // Format phone number for display
  const phoneDisplay = typeof phone === "string" 
    ? formatPhoneNumber(phone) 
    : getPhoneDisplayText(phone, "");

  return (
    <Box className="flex-1 space-y-[2px]">
      <Text size="small" className="font-medium text-sm text-gray-800">
        {user.state === "hasValue" && phoneDisplay
          ? `${user.contents.name} - ${phoneDisplay}`
          : phoneDisplay || user.state === "hasValue" 
            ? user.contents.name 
            : ""}
      </Text>
      <Text size="xSmall" className="text-gray-500">
        Người nhận
      </Text>
    </Box>
  );
};

export const RequestPersonPickerPhone: FC = () => {
  const phone = useRecoilValueLoadable(phoneState);

  // Show formatted phone number when available
  if (phone.state === "hasValue" && phone.contents) {
    return <PersonPicker />;
  }

  // Show loading state
  if (phone.state === "loading") {
    return (
      <Box className="flex-1 space-y-[2px]">
        <Text size="small" className="font-medium text-sm text-gray-400">
          Đang lấy số điện thoại...
        </Text>
        <Text size="xSmall" className="text-gray-400">
          Vui lòng chờ
        </Text>
      </Box>
    );
  }

  // Show request state
  return (
    <Box className="flex-1 space-y-[2px]">
      <Text size="small" className="font-bold text-sm text-gray-800">
        Chọn người nhận
      </Text>
      <Text size="xSmall" className="text-gray-500">
        Yêu cầu truy cập số điện thoại
      </Text>
    </Box>
  );
};
