import React, { FC, useState } from "react";
import { useRecoilState } from "recoil";
import { Box, Button, Input, Text } from "zmp-ui";
import { TicketPercent, Tag, ChevronRight, XCircle, CheckCircle2 } from "lucide-react";
import { Sheet } from "./fullscreen-sheet";
import { appliedVoucherState, voucherPickerVisibleState } from "../state";

export const VoucherPicker: FC = () => {
    const [visible, setVisible] = useRecoilState(voucherPickerVisibleState);
    const [appliedVoucher, setAppliedVoucher] = useRecoilState(appliedVoucherState);
    const [inputCode, setInputCode] = useState("");

    const handleApply = () => {
        if (inputCode.trim()) {
            setAppliedVoucher(inputCode.trim().toUpperCase());
            setVisible(false);
        }
    };

    const removeVoucher = (e: React.MouseEvent) => {
        e.stopPropagation();
        setAppliedVoucher(null);
        setInputCode("");
    };

    // Mock available vouchers for demonstration and "wow" factor
    const availableVouchers = [
        { code: "WELCOME", title: "Giảm 50% đơn đầu", desc: "Giảm tối đa 50k cho khách mới" },
        { code: "COFFEE50", title: "Giảm 50k", desc: "Cho đơn hàng từ 200k" },
        { code: "FREESHIP", title: "Freeship Xtra", desc: "Giảm 15k phí ship" },
    ];

    return (
        <>
            <Box
                className="bg-surface rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] active:opacity-80"
                onClick={() => setVisible(true)}
            >
                <Box className="flex items-center space-x-3">
                    <Box className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                        <TicketPercent className="text-yellow-600" size={20} />
                    </Box>
                    <Box flex className="flex-1 items-center justify-between min-w-0">
                        <Box className="flex-1">
                            <Text size="small" className="font-bold text-gray-800">Ưu đãi & Voucher</Text>
                            <Text size="xSmall" className={`truncate ${appliedVoucher ? "text-primary font-bold" : "text-gray-400"}`}>
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
                            className={`rounded-full px-6 transition-opacity ${!inputCode.trim() ? "opacity-50" : ""}`}
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
                        {availableVouchers.map((voucher) => (
                            <Box
                                key={voucher.code}
                                className={`p-4 rounded-xl border flex items-center gap-3 transition-all active:scale-[0.98] ${appliedVoucher === voucher.code
                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                    : "border-gray-100 bg-white shadow-sm"
                                    }`}
                                onClick={() => {
                                    setAppliedVoucher(voucher.code);
                                    setVisible(false);
                                }}
                            >
                                <Box className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${appliedVoucher === voucher.code ? "bg-primary text-white" : "bg-yellow-100 text-yellow-600"
                                    }`}>
                                    <Tag size={20} />
                                </Box>
                                <Box className="flex-1">
                                    <Text className="font-bold text-gray-800 text-base">{voucher.code}</Text>
                                    <Text size="xSmall" className="text-gray-500">{voucher.title} • {voucher.desc}</Text>
                                </Box>
                                {appliedVoucher === voucher.code && (
                                    <CheckCircle2 className="text-primary" size={24} />
                                )}
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Sheet>
        </>
    );
};
