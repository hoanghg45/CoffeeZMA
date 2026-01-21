import React, { FC } from "react";
import { useRecoilValue } from "recoil";
import { totalQuantityState, subtotalState } from "state";
import { Box, Text, useNavigate } from "zmp-ui";
import { DisplayPrice } from "components/display/price";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { createPortal } from "react-dom";

export const CartFloat: FC = () => {
    const quantity = useRecoilValue(totalQuantityState);
    const subtotal = useRecoilValue(subtotalState);
    const navigate = useNavigate();

    if (quantity === 0) {
        return null;
    }

    // Use createPortal to ensure it stays on top of everything, including ZMP bottom tabs
    return createPortal(
        <Box
            className="fixed bottom-20 left-0 right-0 p-4 z-[20] bg-gradient-to-t from-white/90 to-transparent pt-6 pointer-events-none"
        >
            <Box
                className="bg-yellow-400 rounded-full h-12 shadow-lg flex items-center justify-between px-4 active:opacity-90 transition-opacity cursor-pointer pointer-events-auto"
                onClick={() => navigate("/cart")}
            >
                {/* Left: Icon & Count */}
                <Box className="flex items-center gap-3">
                    <div className="relative">
                        <ShoppingBag className="text-black" size={24} />
                        <div className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm border border-yellow-400">
                            {quantity}
                        </div>
                    </div>

                    <Box className="flex flex-col">
                        <Text size="normal" className="font-bold text-black leading-none">
                            <DisplayPrice>{subtotal}</DisplayPrice>
                        </Text>
                        {/* Optional sub-text if needed, otherwise just centered if single line */}
                    </Box>
                </Box>

                {/* Right: Action */}
                <Box className="flex items-center gap-1">
                    <Text size="normal" className="font-bold text-black">Thanh toán</Text>
                    <ChevronRight size={20} className="text-black" />
                </Box>
            </Box>
            {/* Safe area spacer */}
            <div className="h-[env(safe-area-inset-bottom)]" />
        </Box>,
        document.body
    );
};
