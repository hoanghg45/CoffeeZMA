import React, { FC } from "react";
import { Text, Box } from "zmp-ui";

export const TermsAndPolicies: FC = () => {
  return (
    <Box className="px-4 pt-4 pb-2">
      <Text className="text-gray-500 leading-relaxed" size="small">
        Bằng việc tiến hành thanh toán, bạn đồng ý với{" "}
        <Text className="text-primary underline" size="small">
          điều kiện và điều khoản sử dụng của Zalo Mini App.
      </Text>
      </Text>
    </Box>
  );
};