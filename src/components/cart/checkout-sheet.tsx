import React, { FC, useState } from "react";
import { Box, Text, Button } from "zmp-ui";
import { X, ShoppingCart, ArrowRight } from "lucide-react";
import { Sheet } from "components/fullscreen-sheet";
import { useRecoilState, useRecoilValue } from "recoil";
import {
    checkoutSheetVisibleState,
    cartState,
    totalPriceState,
    deliveryFeeState,
    appliedVoucherState,
} from "state";
import { CheckoutItem } from "./checkout-item";
import { VoucherSection } from "./voucher-section";
import { CutlerySection } from "./cutlery-section";
import { DisplayPrice } from "components/display/price";
import { ProductPicker } from "components/product/picker";
import { CartItem } from "types/cart";
import { createPortal } from "react-dom";
import pay from "utils/product";

export const CheckoutSheet: FC = () => {
    const [visible, setVisible] = useRecoilState(checkoutSheetVisibleState);
    const cart = useRecoilValue(cartState);
    const totalPrice = useRecoilValue(totalPriceState);
    const deliveryFee = useRecoilValue(deliveryFeeState);
    const appliedVoucher = useRecoilValue(appliedVoucherState);
    const [editingItem, setEditingItem] = useState<CartItem | undefined>();

    const discount = appliedVoucher === "WELCOME" ? totalPrice * 0.5 : 0;
    const finalTotal = totalPrice - discount + deliveryFee;

    const handleClose = () => {
        setVisible(false);
    };

    const handleCheckout = () => {
        pay(finalTotal);
        setVisible(false);
    };

    return (
        <>
            {createPortal(
                <Sheet
                    visible={visible}
                    onClose={handleClose}
                    autoHeight={false}
                    style={{ height: "85vh", maxHeight: "85vh" }}
                    mask
                    handler
                    swipeToClose
                >
                    <Box className="flex flex-col h-full bg-white rounded-t-3xl overflow-hidden">
                        {/* Header */}
                        <Box className="flex-none px-4 py-4 pb-3 border-b border-gray-100 relative">
                            <Text.Title size="large" className="text-center font-bold">
                                Cart
                            </Text.Title>
                            <button
                                onClick={handleClose}
                                className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 active:bg-gray-200 transition-colors"
                            >
                                <X size={20} className="text-gray-700" />
                            </button>
                        </Box>

                        {/* Scrollable Content */}
                        <Box className="flex-1 overflow-y-auto">
                            {cart.length > 0 ? (
                                <Box className="px-4 py-4">
                                    {/* Cart Items */}
                                    <Box className="divide-y divide-gray-100">
                                        {cart.map((item, index) => (
                                            <CheckoutItem
                                                key={`${item.product.id}-${index}`}
                                                item={item}
                                                onEdit={() => setEditingItem(item)}
                                            />
                                        ))}
                                    </Box>

                                    {/* Voucher Section */}
                                    <Box className="mt-4">
                                        <VoucherSection />
                                    </Box>

                                    {/* Cutlery Section */}
                                    <Box className="mt-3">
                                        <CutlerySection />
                                    </Box>

                                    {/* Price Breakdown */}
                                    <Box className="mt-6 space-y-3 pb-4">
                                        <Box className="flex justify-between items-center">
                                            <Text size="small" className="text-gray-600">
                                                Delivery Fee
                                            </Text>
                                            <Text size="small" className="text-green-600 font-medium">
                                                {deliveryFee === 0 ? "0 QR" : <DisplayPrice>{deliveryFee}</DisplayPrice>}
                                            </Text>
                                        </Box>
                                        {discount > 0 && (
                                            <Box className="flex justify-between items-center">
                                                <Text size="small" className="text-gray-600">
                                                    Discount (WELCOME)
                                                </Text>
                                                <Text size="small" className="text-green-600 font-medium">
                                                    -<DisplayPrice>{discount}</DisplayPrice>
                                                </Text>
                                            </Box>
                                        )}
                                        <Box className="flex justify-between items-center pt-3 border-t border-gray-200">
                                            <Text size="normal" className="font-bold text-gray-900">
                                                Total
                                            </Text>
                                            <Text size="large" className="font-bold text-primary">
                                                <DisplayPrice>{finalTotal}</DisplayPrice>
                                            </Text>
                                        </Box>
                                    </Box>
                                </Box>
                            ) : (
                                <Box className="flex flex-col items-center justify-center h-full px-4 py-4 pb-20">
                                    <Box className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <ShoppingCart size={40} className="text-gray-400" />
                                    </Box>
                                    <Text size="normal" className="font-semibold text-gray-900 mb-2">
                                        Your cart is empty
                                    </Text>
                                    <Text size="small" className="text-gray-500 text-center">
                                        Add items to get started
                                    </Text>
                                </Box>
                            )}
                        </Box>

                        {/* Fixed Footer - Checkout Button */}
                        {cart.length > 0 && (
                            <Box className="flex-none p-4 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
                                <Button
                                    type="highlight"
                                    fullWidth
                                    onClick={handleCheckout}
                                    className="rounded-full h-14 text-base font-bold shadow-lg"
                                    style={{
                                        backgroundColor: "#D32F2F",
                                        color: "white",
                                    }}
                                >
                                    <Box className="flex items-center justify-center gap-2">
                                        <Text className="text-white font-bold">Go to Checkout</Text>
                                        <ArrowRight size={20} className="text-white" />
                                    </Box>
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Sheet>,
                document.body
            )}

            {/* Product Picker for Editing */}
            <ProductPicker product={editingItem?.product} selected={editingItem}>
                {() => null}
            </ProductPicker>
        </>
    );
};
