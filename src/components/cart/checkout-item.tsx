import React, { FC } from "react";
import { Box, Text, Button, Icon } from "zmp-ui";
import { CartItem } from "types/cart";
import { FinalPrice } from "components/display/final-price";
import { useSetRecoilState } from "recoil";
import { cartState } from "state";

export interface CheckoutItemProps {
    item: CartItem;
    onEdit: () => void;
}

export const CheckoutItem: FC<CheckoutItemProps> = ({ item, onEdit }) => {
    const setCart = useSetRecoilState(cartState);

    const updateQuantity = (newQuantity: number) => {
        setCart((cart) => {
            if (newQuantity === 0) {
                return cart.filter((cartItem) => cartItem !== item);
            }
            return cart.map((cartItem) =>
                cartItem === item ? { ...cartItem, quantity: newQuantity } : cartItem
            );
        });
    };

    return (
        <Box className="flex gap-3 py-3">
            {/* Product Image */}
            <Box className="flex-none">
                <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-xl object-cover"
                />
            </Box>

            {/* Product Info */}
            <Box className="flex-1 flex flex-col justify-between">
                <Box>
                    <Text size="normal" className="font-semibold text-primary leading-snug">
                        {item.product.name}
                    </Text>
                    <Text size="xSmall" className="text-gray-500 mt-0.5">
                        Serve hot
                    </Text>
                    <Box
                        className="flex items-center gap-1 mt-1 cursor-pointer"
                        onClick={onEdit}
                    >
                        <Icon icon="zi-edit" size={14} className="text-gray-400" />
                        <Text size="xxxSmall" className="text-gray-400">
                            {item.quantity > 1 ? "Edit Special Request" : "Add Special Request"}
                        </Text>
                    </Box>
                </Box>

                <Box className="flex items-center justify-between mt-2">
                    <Text size="normal" className="font-bold text-primary">
                        <FinalPrice options={item.options}>{item.product}</FinalPrice>
                    </Text>

                    {/* Quantity Controls */}
                    <Box className="flex items-center gap-3">
                        <button
                            onClick={() => updateQuantity(item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200 transition-colors"
                        >
                            <div className="w-3 h-0.5 bg-gray-600" />
                        </button>
                        <Text size="normal" className="font-semibold min-w-[20px] text-center">
                            {item.quantity}
                        </Text>
                        <button
                            onClick={() => updateQuantity(item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200 transition-colors"
                        >
                            <Icon icon="zi-plus" size={16} className="text-gray-600" />
                        </button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};
