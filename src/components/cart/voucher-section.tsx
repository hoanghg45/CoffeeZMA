import React, { FC } from "react";
import { Box, Text, Icon } from "zmp-ui";
import { useRecoilState } from "recoil";
import { appliedVoucherState } from "state";

export const VoucherSection: FC = () => {
    const [appliedVoucher, setAppliedVoucher] = useRecoilState(appliedVoucherState);

    return (
        <Box
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer active:bg-gray-100 transition-colors"
            onClick={() => {
                // Toggle voucher for demo - in real app, this would open a voucher picker
                setAppliedVoucher(appliedVoucher ? null : "WELCOME");
            }}
        >
            <Box className="flex items-center gap-3">
                <Box className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <Icon icon="zi-star" size={20} className="text-primary" />
                </Box>
                <Box>
                    <Text size="small" className="font-semibold text-gray-900">
                        Voucher Applied
                    </Text>
                    {appliedVoucher && (
                        <Text size="xSmall" className="text-green-600 font-medium mt-0.5">
                            {appliedVoucher}
                        </Text>
                    )}
                </Box>
            </Box>
            <Icon icon="zi-chevron-right" size={20} className="text-gray-400" />
        </Box>
    );
};
