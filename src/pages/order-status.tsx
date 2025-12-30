import React, { FC, useEffect, useState } from "react";
import { Page, Header, Box, Text } from "zmp-ui";
import { openPhone } from "zmp-sdk";
import { useSearchParams } from "react-router-dom";
import { getOrderDetail } from "services/order";
import { Order, OrderStatus } from "types/order";
import { CheckCircle2, Clock, Truck, ChefHat, MapPin, Phone, User, Package } from "lucide-react";

const STEPS = [
    { status: "PENDING", label: "Đơn hàng đã đặt", icon: Clock },
    { status: "CONFIRMED", label: "Đã xác nhận", icon: CheckCircle2 },
    { status: "PREPARING", label: "Đang chuẩn bị", icon: ChefHat },
    { status: "DELIVERING", label: "Đang giao hàng", icon: Truck },
    { status: "COMPLETED", label: "Hoàn thành", icon: Package },
];

const OrderStatusPage: FC = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get("id");
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (orderId) {
            getOrderDetail(orderId).then((data) => {
                setOrder(data);
                setLoading(false);
            });
        }
    }, [orderId]);

    if (loading) return <Box className="p-4 text-center mt-10">Đang tải...</Box>;
    if (!order) return <Box className="p-4 text-center mt-10">Không tìm thấy đơn hàng</Box>;

    const currentStepIndex = STEPS.findIndex(s => s.status === order.status);
    const isCancelled = order.status === "CANCELLED" || order.status === "RETURNED";

    return (
        <Page className="bg-gray-100 min-h-screen pb-20">
            <Header title={`Đơn hàng #${order.id}`} showBackIcon={true} />

            {/* Tracking Section */}
            <Box className="bg-white m-4 p-4 rounded-xl shadow-sm">
                <Text.Title size="small" className="mb-4">Trạng thái đơn hàng</Text.Title>

                {isCancelled ? (
                    <Box className="flex items-center text-red-500 gap-2 p-2 bg-red-50 rounded-lg">
                        <CheckCircle2 />
                        <Text className="font-bold">Đơn hàng đã bị hủy</Text>
                    </Box>
                ) : (
                    <Box className="space-y-6 relative">
                        {/* Connecting Line */}
                        <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-gray-100 -z-0" />

                        {STEPS.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = index <= currentStepIndex;
                            const isCurrent = index === currentStepIndex;

                            // Skip steps if order is already past them but not strictly (simplified logic)
                            // Better logic: Show all steps, highlight active

                            return (
                                <Box key={step.status} flex alignItems="flex-start" className="relative z-10">
                                    <Box
                                        className={`
                      w-8 h-8 rounded-full flex items-center justify-center mr-3
                      ${isActive ? "bg-primary text-white" : "bg-gray-200 text-gray-400"}
                      ${isCurrent ? "ring-4 ring-yellow-100" : ""}
                    `}
                                    >
                                        <Icon size={16} />
                                    </Box>
                                    <Box>
                                        <Text className={`font-medium ${isActive ? "text-gray-900" : "text-gray-400"}`}>
                                            {step.label}
                                        </Text>
                                        {isCurrent && (
                                            <Text size="xSmall" className="text-gray-500 mt-1">
                                                {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        )}
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                )}
            </Box>

            {/* Driver Info (if Delivering) */}
            {order.status === "DELIVERING" && order.driverName && (
                <Box className="bg-white m-4 p-4 rounded-xl shadow-sm">
                    <Text.Title size="small" className="mb-4">Tài xế giao hàng</Text.Title>
                    <Box flex alignItems="center" className="gap-3">
                        <Box className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <User />
                        </Box>
                        <Box className="flex-1">
                            <Text className="font-bold">{order.driverName}</Text>
                            <Text size="small" className="text-gray-500">{order.driverPhone}</Text>
                        </Box>
                        <Box
                            className="bg-green-500 text-white p-2 rounded-full"
                            onClick={() => openPhone({ phoneNumber: order.driverPhone || "" })}
                        >
                            <Phone size={20} />
                        </Box>
                    </Box>
                </Box>
            )}

            {/* Order Details */}
            <Box className="bg-white m-4 p-4 rounded-xl shadow-sm space-y-4">
                <Text.Title size="small">Chi tiết đơn hàng</Text.Title>

                {/* Items */}
                <Box className="space-y-3">
                    {order.items.map((item) => (
                        <Box key={item.id} flex className="gap-3">
                            <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 rounded-lg object-cover bg-gray-50"
                            />
                            <Box className="flex-1">
                                <Text className="font-medium line-clamp-1">{item.name}</Text>
                                {item.options && (
                                    <Text size="xSmall" className="text-gray-500">
                                        {item.options.join(", ")}
                                    </Text>
                                )}
                                <Box flex justifyContent="space-between" className="mt-1">
                                    <Text size="small" className="text-gray-600">x{item.quantity}</Text>
                                    <Text size="small" className="font-medium">{item.price.toLocaleString()}đ</Text>
                                </Box>
                            </Box>
                        </Box>
                    ))}
                </Box>

                <div className="h-[1px] bg-gray-100" />

                {/* Summary */}
                <Box className="space-y-2">
                    <Box flex justifyContent="space-between">
                        <Text size="small" className="text-gray-500">Phí giao hàng</Text>
                        <Text size="small">15.000đ</Text>
                    </Box>
                    <Box flex justifyContent="space-between">
                        <Text size="small" className="text-gray-500">Giảm giá</Text>
                        <Text size="small">-0đ</Text>
                    </Box>
                    <div className="h-[1px] bg-gray-100 border-dashed" />
                    <Box flex justifyContent="space-between" alignItems="center">
                        <Text className="font-bold">Tổng cộng</Text>
                        <Text.Title size="large" className="text-primary">
                            {order.total.toLocaleString()}đ
                        </Text.Title>
                    </Box>
                </Box>
            </Box>

            {/* Address */}
            <Box className="bg-white m-4 p-4 rounded-xl shadow-sm">
                <Box flex className="gap-3">
                    <MapPin className="text-yellow-500 shrink-0" />
                    <Box>
                        <Text className="font-bold">Địa chỉ nhận hàng</Text>
                        <Text size="small" className="text-gray-600 mt-1">
                            {order.deliveryAddress}
                        </Text>
                    </Box>
                </Box>
            </Box>

        </Page>
    );
};

export default OrderStatusPage;
