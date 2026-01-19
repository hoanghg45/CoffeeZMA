import React, { FC } from "react";
import { Box } from "zmp-ui";
import { useRecoilState } from "recoil";
import { shippingServiceState } from "state";
import { Leaf, Zap } from "lucide-react";

export const ShippingServicePicker: FC = () => {
    const [serviceId, setServiceId] = useRecoilState(shippingServiceState);

    return (
        <Box className="flex bg-gray-100 p-1 rounded-xl relative h-12">
            <div
                className={`flex-1 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${serviceId === "SGN-ECO"
                        ? "bg-white text-green-700 shadow-sm"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                onClick={() => setServiceId("SGN-ECO")}
            >
                <Leaf size={16} className="mr-1.5" />
                Tiết kiệm
            </div>

            <div
                className={`flex-1 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${serviceId === "SGN-BIKE"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                onClick={() => setServiceId("SGN-BIKE")}
            >
                <Zap size={16} className="mr-1.5 fill-current" />
                Hỏa tốc
            </div>
        </Box>
    );
};
