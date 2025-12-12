import React, { FC, useState, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { Box, Button, Input, Text } from "zmp-ui";
import { TicketPercent, Tag, ChevronRight, XCircle, CheckCircle2, Loader2, Lock } from "lucide-react";
import { Sheet } from "./fullscreen-sheet";
import { appliedVoucherState, voucherPickerVisibleState, cartState, subtotalState } from "../state";
import { getVouchersWithEligibility } from "../services/voucher";
import { VoucherWithEligibility } from "../types/voucher";
import { calcFinalPrice } from "../utils/product";

export const VoucherPicker: FC = () => {
    const [visible, setVisible] = useRecoilState(voucherPickerVisibleState);
    const [appliedVoucher, setAppliedVoucher] = useRecoilState(appliedVoucherState);
    const cart = useRecoilValue(cartState);
    const subtotal = useRecoilValue(subtotalState);
    const [inputCode, setInputCode] = useState("");
    const [vouchers, setVouchers] = useState<VoucherWithEligibility[]>([]);
    const [loading, setLoading] = useState(false);

    // Pre-calculate eligibility when sheet opens or cart changes
    useEffect(() => {
        if (visible && cart.length > 0) {
            setLoading(true);
            getVouchersWithEligibility(
                cart,
                subtotal,
                (item) => calcFinalPrice(item.product, item.options)
            )
                .then(setVouchers)
                .finally(() => setLoading(false));
        }
    }, [visible, cart, subtotal]);

    const handleApply = () => {
        if (inputCode.trim()) {
            setAppliedVoucher(inputCode.trim().toUpperCase());
            setVisible(false);
        }
    };

    const handleSelectVoucher = (voucher: VoucherWithEligibility) => {
        if (voucher.isEligible) {
            setAppliedVoucher(voucher.code);
            setVisible(false);
        }
    };

    const removeVoucher = (e: React.MouseEvent) => {
        e.stopPropagation();
        setAppliedVoucher(null);
        setInputCode("");
    };

    const formatDiscount = (v: VoucherWithEligibility): string => {
        if (v.discountType === 'PERCENT') {
            return `Giảm ${v.discountValue}%${v.maxDiscount ? ` (tối đa ${v.maxDiscount.toLocaleString('vi-VN')}đ)` : ''}`;
        }
        return `Giảm ${v.discountValue.toLocaleString('vi-VN')}đ`;
    };

    const formatCondition = (v: VoucherWithEligibility): string => {
        if (v.minOrderValue > 0) {
            return `Đơn từ ${v.minOrderValue.toLocaleString('vi-VN')}đ`;
        }
        return 'Không điều kiện';
    };

    return (
        <>
            <Box
                className="bg-surface rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] active:opacity-80 transition-all duration-200"
                onClick={() => setVisible(true)}
            >
                <Box className="flex items-center space-x-3">
                    <Box className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                        <TicketPercent className="text-yellow-600" size={20} />
                    </Box>
                    <Box flex className="flex-1 items-center justify-between min-w-0">
                        <Box className="flex-1">
                            <Text size="small" className="font-bold text-gray-800">Ưu đãi & Voucher</Text>
                            <Text size="xSmall" className={`truncate transition-colors duration-200 ${appliedVoucher ? "text-primary font-bold" : "text-gray-400"}`}>
                                {appliedVoucher ? `Đã dùng: ${appliedVoucher}` : "Chọn hoặc nhập mã"}
                            </Text>
                        </Box>
                        {appliedVoucher ? (
                            <Box onClick={removeVoucher} className="p-1">
                                <XCircle className="text-gray-400" size={20} />
                            </Box>
                        ) : (
                            <ChevronRight className="text-gray-400" size={20} />
                        )}
                    </Box>
                </Box>
            </Box>

            <Sheet
                visible={visible}
                onClose={() => setVisible(false)}
                mask
                swipeToClose
                height="auto"
            >
                <Box className="p-4 space-y-4 pb-8">
                    <Text.Title className="text-center mb-4">Mã ưu đãi</Text.Title>

                    {/* Input Area */}
                    <Box className="flex gap-3">
                        <Box className="flex-1 bg-gray-100 rounded-full px-1 py-1">
                            <Input
                                placeholder="Nhập mã voucher"
                                className="bg-transparent border-none w-full rounded-full pl-2 h-10 focus:outline-none p-0 text-base"
                                value={inputCode}
                                onChange={(e) => setInputCode(e.target.value)}
                                clearable
                            />
                        </Box>
                        <Button
                            className={`rounded-full px-6 transition-all duration-200 ${!inputCode.trim() ? "opacity-50" : ""}`}
                            onClick={handleApply}
                            disabled={!inputCode.trim()}
                        >
                            Áp dụng
                        </Button>
                    </Box>

                    <Box className="h-[1px] bg-gray-100 my-4" />

                    {/* Voucher List */}
                    <Box className="space-y-3">
                        <Text size="small" className="font-semibold text-gray-500">MÃ ĐANG CÓ</Text>

                        {loading ? (
                            <Box className="flex justify-center py-8">
                                <Loader2 className="animate-spin text-gray-400" size={24} />
                            </Box>
                        ) : cart.length === 0 ? (
                            <Text size="small" className="text-gray-400 text-center py-4">
                                Thêm sản phẩm để xem mã ưu đãi
                            </Text>
                        ) : vouchers.length === 0 ? (
                            <Text size="small" className="text-gray-400 text-center py-4">
                                Không có mã ưu đãi nào
                            </Text>
                        ) : (
                            vouchers.map((voucher) => {
                                const isApplied = appliedVoucher === voucher.code;

                                return (
                                    <Box
                                        key={voucher.code}
                                        className={`p-4 rounded-xl border flex items-center gap-3 transition-all duration-200 ${!voucher.isEligible
                                                ? "border-gray-100 bg-gray-50/80 cursor-not-allowed"
                                                : isApplied
                                                    ? "border-primary bg-primary/5 ring-1 ring-primary active:scale-[0.98]"
                                                    : "border-gray-100 bg-white shadow-sm active:scale-[0.98] cursor-pointer"
                                            }`}
                                        onClick={() => handleSelectVoucher(voucher)}
                                    >
                                        {/* Icon */}
                                        <Box className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${!voucher.isEligible
                                                ? "bg-gray-100 text-gray-400"
                                                : isApplied
                                                    ? "bg-primary text-white"
                                                    : "bg-yellow-100 text-yellow-600"
                                            }`}>
                                            {voucher.isEligible ? <Tag size={20} /> : <Lock size={18} />}
                                        </Box>

                                        {/* Content */}
                                        <Box className="flex-1 min-w-0">
                                            <Box className="flex items-center gap-2">
                                                <Text className={`font-bold text-base transition-colors duration-200 ${voucher.isEligible ? "text-gray-800" : "text-gray-400"
                                                    }`}>
                                                    {voucher.code}
                                                </Text>
                                                {voucher.isEligible && voucher.potentialDiscount > 0 && (
                                                    <Text size="xSmall" className="text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                                                        -{voucher.potentialDiscount.toLocaleString('vi-VN')}đ
                                                    </Text>
                                                )}
                                            </Box>
                                            <Text size="xSmall" className={`transition-colors duration-200 ${voucher.isEligible ? "text-gray-700" : "text-gray-400"
                                                }`}>
                                                {formatDiscount(voucher)}
                                            </Text>
                                            {voucher.isEligible ? (
                                                <Text size="xSmall" className="text-gray-500">
                                                    {formatCondition(voucher)}
                                                </Text>
                                            ) : (
                                                <Text size="xSmall" className="text-amber-600">
                                                    {voucher.reason}
                                                </Text>
                                            )}
                                        </Box>

                                        {/* Check icon */}
                                        {isApplied && voucher.isEligible && (
                                            <CheckCircle2 className="text-primary flex-shrink-0" size={24} />
                                        )}
                                    </Box>
                                );
                            })
                        )}
                    </Box>
                </Box>
            </Sheet>
        </>
    );
};
