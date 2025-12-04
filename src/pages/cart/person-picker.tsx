import React, { FC } from "react";
import {
  useRecoilValue,
  useRecoilValueLoadable,
} from "recoil";
import { phoneState, userState } from "state";
import { Box, Text } from "zmp-ui";

export const PersonPicker: FC = () => {
  const user = useRecoilValueLoadable(userState);
  const phone = useRecoilValue(phoneState);

  return (
    <Box className="flex-1 space-y-[2px]">
      <Text size="small" className="font-medium text-sm text-gray-800">
        {user.state === "hasValue" ? `${user.contents.name} - ${phone}` : phone}
      </Text>
      <Text size="xSmall" className="text-gray-500">
        Người nhận
      </Text>
    </Box>
  );
};

export const RequestPersonPickerPhone: FC = () => {
  const phone = useRecoilValueLoadable(phoneState);

  if (phone.state === "hasValue" && phone.contents) {
    return <PersonPicker />;
  }

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
