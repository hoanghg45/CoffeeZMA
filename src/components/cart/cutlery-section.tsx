import React, { FC } from "react";
import { Box, Text, Icon } from "zmp-ui";
import { useRecoilState } from "recoil";
import { cutleryCountState } from "state";

export const CutlerySection: FC = () => {
    const [cutleryCount, setCutleryCount] = useRecoilState(cutleryCountState);

    const handleEdit = () => {
        // Cycle through 0, 1, 2, 3, back to 0
        setCutleryCount((count) => (count + 1) % 4);
    };

    return (
        <Box className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
            <Box className="flex items-center gap-3">
                <Box className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                    <Icon icon="zi-more-grid" size={20} className="text-gray-700" />
                </Box>
                <Box>
                    <Text size="small" className="font-semibold text-gray-900">
                        Cutlery
                    </Text>
                    <Text size="xSmall" className="text-gray-500 mt-0.5">
                        You've selected the number of cutlery sets
                    </Text>
                </Box>
            </Box>
            <Box
                className="flex items-center gap-2 bg-black rounded-full px-4 py-2 cursor-pointer active:opacity-80 transition-opacity"
                onClick={handleEdit}
            >
                <Text size="small" className="text-white font-semibold">
                    {cutleryCount} sets
                </Text>
                <Icon icon="zi-edit" size={16} className="text-white" />
            </Box>
        </Box>
    );
};
